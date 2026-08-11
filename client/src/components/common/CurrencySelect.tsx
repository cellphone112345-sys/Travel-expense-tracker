import { useEffect, useRef, useState } from "react";
import { currencyLabel, searchCurrencies } from "../../utils/money";

interface Props {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
}

/**
 * Searchable currency picker. Type an ISO code (JPY), a Chinese currency
 * name (日圓), or a country name (日本) to filter — codes alone aren't
 * meaningful to most users, so every option is shown as "JPY（日圓）".
 */
export function CurrencySelect({ value, onChange, placeholder = "搜尋幣別或國家，例如「日本」" }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = searchCurrencies(query);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectCode(code: string) {
    onChange(code);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[highlight]) selectCode(results[highlight].code);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={open ? query : currencyLabel(value)}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlight(0);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onBlur={() => {
          // Option buttons call preventDefault() on mousedown, so a real selection
          // never reaches here — this only fires for Tab/click-away, where we want
          // the dropdown gone so it can't linger and cover fields/buttons below it.
          setOpen(false);
          setQuery("");
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      {open && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {results.length === 0 && <li className="px-3 py-2 text-sm text-gray-400">找不到符合的幣別</li>}
          {results.map((c, i) => (
            <li key={c.code}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectCode(c.code)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                  i === highlight ? "bg-brand/10" : "hover:bg-gray-50"
                } ${c.code === value ? "font-semibold text-brand" : "text-gray-700"}`}
              >
                <span>
                  {c.code}（{c.nameZh}）
                </span>
                <span className="text-xs text-gray-400">{c.countries[0]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
