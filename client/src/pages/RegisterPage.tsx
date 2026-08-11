import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { CurrencySelect } from "../components/common/CurrencySelect";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [homeCurrency, setHomeCurrency] = useState("TWD");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password, name || undefined, homeCurrency);
      navigate("/trips");
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message === "EMAIL_TAKEN" ? "這個 Email 已經被註冊過了" : "註冊失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-bold text-brand">✈️ 旅遊記帳</h1>
        <p className="mb-6 text-center text-sm text-gray-500">建立新帳號</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="姓名（選填）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="密碼（至少 8 碼）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <div>
            <label className="mb-1 block text-xs text-gray-500">預設本國幣別</label>
            <CurrencySelect value={homeCurrency} onChange={setHomeCurrency} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "註冊中…" : "註冊"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          已經有帳號了？{" "}
          <Link to="/login" className="font-medium text-brand hover:underline">
            登入
          </Link>
        </p>
      </div>
    </div>
  );
}
