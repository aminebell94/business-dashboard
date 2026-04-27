// components/orders/product-select.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

export type ProductOption = {
  id: string | number;
  name?: string;
  sku?: string;
  price?: number;
  // allow nested Strapi shapes
  attributes?: any;
};

type Props = {
  products: ProductOption[];
  value?: string | number;
  placeholder?: string;
  onChange: (id: string | number) => void;
  className?: string;
  maxHeightPx?: number;
};

export default function ProductSelect({
  products,
  value,
  onChange,
  placeholder = "Search product…",
  className = "",
  maxHeightPx = 240,
}: Props) {
  const normalize = (p: ProductOption) => ({
    id: p.id ?? p.attributes?.id,
    name: (p.name ?? p.attributes?.name ?? "Unnamed product") as string,
    sku: (p.sku ?? p.attributes?.sku ?? "") as string,
    price: (p.price ?? p.attributes?.price ?? 0) as number,
  });

  const normalized = products.map(normalize);

  // Selected product object
  const selected = normalized.find((p) => String(p.id) === String(value)) ?? null;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState<number>(0); // index in filtered
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const filtered = query.trim()
    ? normalized.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      )
    : normalized;

  // clamp highlight
  useEffect(() => {
    if (highlight >= filtered.length) setHighlight(Math.max(0, filtered.length - 1));
  }, [filtered.length, highlight]);

  function onSelect(productId: string | number) {
    onChange(productId);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(filtered.length - 1, h + 1));
      scrollIntoView(highlight + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.max(0, h - 1));
      scrollIntoView(highlight - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[highlight];
      if (item) onSelect(item.id);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  function scrollIntoView(index: number) {
    const list = listRef.current;
    if (!list) return;
    const item = list.querySelector<HTMLDivElement>(`[data-index="${index}"]`);
    if (item) item.scrollIntoView({ block: "nearest" });
  }

  // close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!listRef.current) return;
      if (
        !listRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          aria-expanded={open}
          aria-haspopup="listbox"
          placeholder={placeholder}
          className="w-full rounded border px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          value={open ? query : selected?.name ?? ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          aria-label="Clear"
          onClick={() => {
            onChange("");
            setQuery("");
            setOpen(false);
          }}
          className="px-2 py-1 rounded border bg-transparent text-sm text-muted-foreground hover:bg-muted/10"
        >
          ×
        </button>
      </div>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-activedescendant={filtered[highlight] ? `product-${filtered[highlight].id}` : undefined}
          className="mt-1 rounded border bg-popover shadow-lg z-50 overflow-auto"
          style={{ maxHeight: maxHeightPx }}
        >
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">No products found.</div>
          ) : (
            filtered.map((p, idx) => (
              <div
                key={p.id}
                data-index={idx}
                id={`product-${p.id}`}
                role="option"
                aria-selected={String(p.id) === String(value)}
                onMouseEnter={() => setHighlight(idx)}
                onMouseDown={(ev) => {
                  // use onMouseDown to select before blur
                  ev.preventDefault();
                  onSelect(p.id);
                }}
                className={`flex items-center justify-between gap-4 px-3 py-2 cursor-pointer ${
                  idx === highlight ? "bg-accent/40" : "hover:bg-accent/10"
                } ${String(p.id) === String(value) ? "font-semibold" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-foreground truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {p.sku ? `SKU: ${p.sku}` : ""}
                  </div>
                </div>

                <div className="ml-4 text-right">
                  <div className="text-sm font-medium">
                    {Number(p.price || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}€
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
