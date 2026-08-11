import { useState } from "react";
import type { Trip } from "../../types";
import type { TripInput } from "../../api/endpoints";
import { majorToMinor, minorToMajor } from "../../utils/money";
import { CurrencySelect } from "../common/CurrencySelect";

interface Props {
  initial?: Trip;
  onSubmit: (data: TripInput) => Promise<void>;
  onCancel: () => void;
}

export function TripForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate.slice(0, 10) ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate.slice(0, 10) ?? "");
  const [baseCurrency, setBaseCurrency] = useState(initial?.baseCurrency ?? "JPY");
  const [homeCurrency, setHomeCurrency] = useState(initial?.homeCurrency ?? "TWD");
  const [totalBudget, setTotalBudget] = useState(
    initial?.totalBudget != null ? String(minorToMajor(initial.totalBudget, initial.homeCurrency)) : ""
  );
  const [dailyBudget, setDailyBudget] = useState(
    initial?.dailyBudget != null ? String(minorToMajor(initial.dailyBudget, initial.homeCurrency)) : ""
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        startDate,
        endDate,
        baseCurrency,
        homeCurrency,
        totalBudget: totalBudget ? majorToMinor(Number(totalBudget), homeCurrency) : null,
        dailyBudget: dailyBudget ? majorToMinor(Number(dailyBudget), homeCurrency) : null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs text-gray-500">旅程名稱</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例：日本東京行"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">開始日期</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">結束日期</label>
          <input
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">當地幣別</label>
          <CurrencySelect value={baseCurrency} onChange={setBaseCurrency} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">報表幣別（本國）</label>
          <CurrencySelect value={homeCurrency} onChange={setHomeCurrency} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">總預算（{homeCurrency}，選填）</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">每日預算（{homeCurrency}，選填）</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={dailyBudget}
            onChange={(e) => setDailyBudget(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-gray-600">
          取消
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "儲存中…" : "儲存"}
        </button>
      </div>
    </form>
  );
}
