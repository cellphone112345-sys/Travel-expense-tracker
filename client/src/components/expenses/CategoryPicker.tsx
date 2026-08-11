import { useCategories } from "../../hooks/useCategories";

export function CategoryPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { data: categories } = useCategories();

  return (
    <select
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
    >
      <option value="" disabled>
        選擇分類
      </option>
      {categories?.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}
