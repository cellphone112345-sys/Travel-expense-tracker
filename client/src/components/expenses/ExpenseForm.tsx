import { useState } from "react";
import type { Expense, PaymentMethod } from "../../types";
import type { ExpenseInput } from "../../api/endpoints";
import { CategoryPicker } from "./CategoryPicker";
import { CurrencyPicker } from "./CurrencyPicker";
import { minorToMajor } from "../../utils/money";

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "CASH", label: "現金" },
  { value: "CARD", label: "信用卡" },
  { value: "OTHER", label: "其他" },
];

interface Props {
  initial?: Expense;
  defaultCurrency: string;
  onSubmit: (data: ExpenseInput) => Promise<void>;
  onCancel: () => void;
}

export function ExpenseForm({ initial, defaultCurrency, onSubmit, onCancel }: Props) {
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [amount, setAmount] = useState(
    initial ? String(minorToMajor(initial.amountMinor, initial.currency)) : ""
  );
  const [currency, setCurrency] = useState(initial?.currency ?? defaultCurrency);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [merchant, setMerchant] = useState(initial?.merchant ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initial?.paymentMethod ?? "CARD");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        categoryId,
        amount: Number(amount),
        currency,
        description,
        date,
        merchant: merchant || null,
        paymentMethod,
        notes: notes || null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">金額</label>
          <input
            type="number"
            required
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">幣別</label>
          <CurrencyPicker value={currency} onChange={setCurrency} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">分類</label>
        <CategoryPicker value={categoryId} onChange={setCategoryId} />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">說明</label>
        <input
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="例：晚餐拉麵"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">日期</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">付款方式</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">商家（選填）</label>
        <input
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">備註（選填）</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-gray-600">
          取消
        </button>
        <button
          type="submit"
          disabled={submitting || !categoryId}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "儲存中…" : "儲存"}
        </button>
      </div>
    </form>
  );
}
