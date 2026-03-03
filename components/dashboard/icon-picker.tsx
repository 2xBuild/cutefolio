"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { getIcon, getAllIcons } from "@/lib/icons";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Code } from "lucide-react";

const MAX_VISIBLE = 80;

interface IconPickerProps {
  value: string;
  onChange: (spec: string) => void;
  placeholder?: string;
}

export function IconPicker({ value, onChange, placeholder = "Pick icon…" }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const allIcons = useMemo(() => getAllIcons(), []);

  const filtered = useMemo(() => {
    if (!search.trim()) return allIcons.slice(0, MAX_VISIBLE);
    const q = search.toLowerCase();
    const matches: typeof allIcons = [];
    for (const entry of allIcons) {
      if (entry.label.toLowerCase().includes(q) || entry.spec.toLowerCase().includes(q)) {
        matches.push(entry);
        if (matches.length >= MAX_VISIBLE) break;
      }
    }
    return matches;
  }, [allIcons, search]);

  const ResolvedIcon = value ? getIcon(value) : undefined;

  const handleSelect = useCallback(
    (spec: string) => {
      onChange(spec);
      setOpen(false);
      setSearch("");
    },
    [onChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {ResolvedIcon ? (
            <ResolvedIcon className="size-4 shrink-0" />
          ) : (
            <Code className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className={value ? "" : "text-muted-foreground"}>
            {value || placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <div className="border-b border-border p-2">
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons…"
            className="h-8 text-xs"
          />
        </div>
        <div className="grid max-h-56 grid-cols-6 gap-0.5 overflow-y-auto p-2">
          {filtered.map((entry) => {
            const isSelected = entry.spec === value;
            return (
              <button
                key={entry.spec}
                type="button"
                title={entry.spec}
                onClick={() => handleSelect(entry.spec)}
                className={`flex items-center justify-center rounded-md p-2 transition-colors hover:bg-accent ${
                  isSelected ? "bg-accent ring-1 ring-ring" : ""
                }`}
              >
                <entry.Icon className="size-4" />
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-6 py-4 text-center text-xs text-muted-foreground">
              No icons found
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
