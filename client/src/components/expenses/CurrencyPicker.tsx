import { CurrencySelect } from "../common/CurrencySelect";

export function CurrencyPicker({ value, onChange }: { value: string; onChange: (currency: string) => void }) {
  return <CurrencySelect value={value} onChange={onChange} />;
}
