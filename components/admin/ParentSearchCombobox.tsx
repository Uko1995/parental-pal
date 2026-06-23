"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export interface ParentSearchOption {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  children?: Array<{
    name: string;
    age: number;
    gender: "male" | "female";
    class?: string;
    schoolName?: string;
    subjects?: string[];
  }>;
}

interface ParentSearchComboboxProps {
  value: ParentSearchOption | null;
  onSelect: (parent: ParentSearchOption | null) => void;
  disabled?: boolean;
  label?: string;
}

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export default function ParentSearchCombobox({
  value,
  onSelect,
  disabled = false,
  label = "Parent account",
}: ParentSearchComboboxProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<ParentSearchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (value) {
      setQuery(value.name ? `${value.name} (${value.email})` : value.email);
    } else {
      setQuery("");
    }
  }, [value]);

  const fetchParents = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setOptions([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/parents/search?q=${encodeURIComponent(trimmed)}&limit=8`,
      );
      if (requestId !== requestIdRef.current) return;

      if (!res.ok) {
        setOptions([]);
        setSearched(true);
        return;
      }

      const data = await res.json();
      setOptions(data.parents || []);
      setSearched(true);
      setActiveIndex(data.parents?.length ? 0 : -1);
    } catch {
      if (requestId === requestIdRef.current) {
        setOptions([]);
        setSearched(true);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const scheduleSearch = useCallback(
    (searchQuery: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        void fetchParents(searchQuery);
      }, DEBOUNCE_MS);
    },
    [fetchParents],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    onSelect(null);
    setQuery("");
    setOptions([]);
    setSearched(false);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleSelect = (parent: ParentSearchOption) => {
    onSelect(parent);
    setQuery(parent.name ? `${parent.name} (${parent.email})` : parent.email);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleInputChange = (nextQuery: string) => {
    setQuery(nextQuery);
    if (value) {
      onSelect(null);
    }
    setOpen(true);
    scheduleSearch(nextQuery);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) =>
        options.length ? Math.min(prev + 1, options.length - 1) : -1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (options.length ? Math.max(prev - 1, 0) : -1));
      return;
    }

    if (event.key === "Enter" && open && activeIndex >= 0 && options[activeIndex]) {
      event.preventDefault();
      handleSelect(options[activeIndex]);
    }
  };

  const showDropdown =
    open && !disabled && query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <div ref={containerRef} className="form-control w-full">
      <label className="label py-1" htmlFor={`${listboxId}-input`}>
        <span className="label-text font-medium">{label} *</span>
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={`${listboxId}-input`}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={`${listboxId}-listbox`}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          className="input input-bordered w-full pr-10"
          placeholder="Search by parent name or email"
          value={query}
          disabled={disabled}
          autoComplete="off"
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= MIN_QUERY_LENGTH) {
              setOpen(true);
              scheduleSearch(query);
            }
          }}
          onKeyDown={handleKeyDown}
        />

        {(value || query) && !disabled && (
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-circle absolute right-2 top-1/2 -translate-y-1/2"
            aria-label="Clear parent selection"
            onClick={handleClear}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}

        {showDropdown && (
          <ul
            id={`${listboxId}-listbox`}
            role="listbox"
            className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-base-300 bg-base-100 shadow-lg"
          >
            {loading && (
              <li className="px-4 py-3 text-sm text-base-content/60">
                Searching...
              </li>
            )}

            {!loading && options.length === 0 && searched && (
              <li className="px-4 py-3 text-sm text-base-content/60">
                No parents found — create in Dashboard → Parents.
              </li>
            )}

            {!loading &&
              options.map((parent, index) => (
                <li
                  key={parent._id}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={activeIndex === index}
                  className={`px-4 py-3 cursor-pointer border-b border-base-200 last:border-b-0 ${
                    activeIndex === index ? "bg-primary/10" : "hover:bg-base-200"
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(parent)}
                >
                  <p className="font-medium text-sm">{parent.name || "Unnamed parent"}</p>
                  <p className="text-xs text-base-content/70">{parent.email}</p>
                  {parent.phone && (
                    <p className="text-xs text-base-content/50">{parent.phone}</p>
                  )}
                </li>
              ))}
          </ul>
        )}
      </div>

      <label className="label py-1">
        <span className="label-text-alt text-base-content/60">
          Select a registered parent account. This applies to both booking and
          past session invoice tabs.
        </span>
      </label>
    </div>
  );
}
