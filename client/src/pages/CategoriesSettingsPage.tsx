import { useState } from "react";
import { useCategories, useCreateCategory, useDeleteCategory } from "../hooks/useCategories";

const COLOR_OPTIONS = ["#f97316", "#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#6b7280", "#ef4444", "#06b6d4"];

export function CategoriesSettingsPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createCategory.mutateAsync({ name: name.trim(), color });
    setName("");
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await deleteCategory.mutateAsync(id);
    } catch {
      setError("這個分類已經有花費使用中，無法刪除");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-xl font-bold">分類管理</h1>

      <form onSubmit={handleCreate} className="flex items-end gap-2 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-gray-500">新增分類名稱</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：伴手禮"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-1">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full border-2 ${color === c ? "border-gray-800" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">
          新增
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isLoading && <p className="text-gray-500">載入中…</p>}
      <ul className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
        {categories?.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.name}
              {cat.isDefault && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">預設</span>}
            </div>
            {!cat.isDefault && (
              <button onClick={() => handleDelete(cat.id)} className="text-xs text-red-500 hover:underline">
                刪除
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
