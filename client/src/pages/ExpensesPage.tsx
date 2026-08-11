import { useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentTrip } from "../hooks/useCurrentTrip";
import { useTrip } from "../hooks/useTrips";
import { useCategories } from "../hooks/useCategories";
import { useCreateExpense, useDeleteExpense, useExpenses, useUpdateExpense } from "../hooks/useExpenses";
import { ExpenseForm } from "../components/expenses/ExpenseForm";
import { Modal } from "../components/common/Modal";
import type { Expense } from "../types";
import { formatMoney } from "../utils/money";

export function ExpensesPage() {
  const { currentTripId } = useCurrentTrip();
  const { data: trip } = useTrip(currentTripId ?? undefined);
  const { data: categories } = useCategories();
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const { data: expenses, isLoading } = useExpenses(currentTripId ?? undefined, {
    category: categoryFilter || undefined,
    search: search || undefined,
  });

  const createExpense = useCreateExpense(currentTripId ?? "");
  const updateExpense = useUpdateExpense(currentTripId ?? "");
  const deleteExpense = useDeleteExpense(currentTripId ?? "");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  if (!currentTripId || !trip) {
    return (
      <div className="mx-auto mt-16 max-w-sm text-center text-gray-500">
        <p className="mb-4">請先選擇或建立一趟旅程</p>
        <Link to="/trips" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">
          前往旅程列表
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">花費紀錄</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
        >
          + 新增花費
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">全部分類</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋說明或商家"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {isLoading && <p className="text-gray-500">載入中…</p>}
      {expenses && expenses.length === 0 && <p className="text-gray-400">還沒有符合條件的花費紀錄</p>}

      <ul className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
        {expenses?.map((exp) => (
          <li key={exp.id} className="flex items-center justify-between px-4 py-3">
            <button
              className="flex flex-1 items-center gap-3 text-left"
              onClick={() => {
                setEditing(exp);
                setShowForm(true);
              }}
            >
              <span className="h-8 w-8 shrink-0 rounded-full text-center leading-8" style={{ backgroundColor: exp.category.color + "22" }}>
                🏷️
              </span>
              <span className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-900">{exp.description}</div>
                <div className="text-xs text-gray-400">
                  {exp.date.slice(0, 10)} · {exp.category.name}
                  {exp.merchant ? ` · ${exp.merchant}` : ""}
                </div>
              </span>
              <span className="shrink-0 text-right text-sm font-semibold text-gray-900">
                {formatMoney(exp.amountMinor, exp.currency)}
                {exp.currency !== trip.homeCurrency && (
                  <div className="text-xs font-normal text-gray-400">
                    ≈ {formatMoney(exp.amountInHomeCurrencyMinor, trip.homeCurrency)}
                  </div>
                )}
              </span>
            </button>
            <button
              onClick={() => {
                if (confirm("確定要刪除這筆花費嗎？")) deleteExpense.mutate(exp.id);
              }}
              className="ml-3 text-xs text-red-500 hover:underline"
            >
              刪除
            </button>
          </li>
        ))}
      </ul>

      {showForm && (
        <Modal title={editing ? "編輯花費" : "新增花費"} onClose={() => setShowForm(false)}>
          <ExpenseForm
            initial={editing ?? undefined}
            defaultCurrency={trip.baseCurrency}
            onCancel={() => setShowForm(false)}
            onSubmit={async (data) => {
              if (editing) {
                await updateExpense.mutateAsync({ id: editing.id, data });
              } else {
                await createExpense.mutateAsync(data);
              }
              setShowForm(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
