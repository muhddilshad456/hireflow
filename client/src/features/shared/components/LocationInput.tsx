import { useEffect, useRef, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";

export type LocationSuggestion = {
  id: string;
  label: string;
  lat: number;
  lon: number;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: LocationSuggestion) => void;
  placeholder?: string;
  inputClassName?: string;
  wrapperClassName?: string;
};

export default function LocationInput({
  value,
  onChange,
  onSelect,
  placeholder = "City, country…",
  inputClassName = "",
  wrapperClassName = "relative",
}: Props) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const skipNextFetch = useRef(false);

  const debounced = useDebounce(value, 300);

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    if (debounced.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(debounced)}&limit=6&lang=en`,
      { signal: controller.signal },
    )
      .then((res) => res.json())
      .then((data) => {
        const items: LocationSuggestion[] = data.features.map((f: any) => {
          const p = f.properties;
          const parts = [p.name, p.city, p.state, p.country].filter(Boolean);
          return {
            id: `${p.osm_type}${p.osm_id}`,
            label: Array.from(new Set(parts)).join(", "),
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
          };
        });
        setSuggestions(items);
        setActiveIndex(-1);
        setOpen(items.length > 0);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debounced]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (s: LocationSuggestion) => {
    skipNextFetch.current = true;
    onChange(s.label);
    onSelect?.(s);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      e.stopPropagation(); // don't let it close the modal
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={wrapperClassName}>
      <input
        type="text"
        name="location"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        className={inputClassName}
      />

      {loading && (
        <svg
          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}

      {open && (
        <ul className="absolute left-0 right-0 top-full mt-1.5 z-20 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-xl">
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(s)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 ${
                i === activeIndex ? "bg-green-50 text-green-700" : ""
              }`}
            >
              <svg
                className="w-3.5 h-3.5 shrink-0 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate">{s.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
