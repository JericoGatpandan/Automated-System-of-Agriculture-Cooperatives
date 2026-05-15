import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";

const MUNICIPALITIES_URL =
  "https://psgc.cloud/api/v2/provinces/Camarines%20Sur/cities-municipalities";

const barangayCache = new Map<string, LocationOption[]>();
let municipalitiesCache: LocationOption[] | null = null;
let municipalitiesPromise: Promise<LocationOption[]> | null = null;

export interface LocationValue {
  municipalityCode: string;
  municipalityName: string;
  barangayCode: string;
  barangayName: string;
}

interface LocationOption {
  code: string;
  name: string;
}

interface LocationSelectorProps {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
  disabled?: boolean;
  layout?: "grid" | "stack";
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function sortByName(a: LocationOption, b: LocationOption) {
  return a.name.localeCompare(b.name);
}

async function fetchMunicipalities(): Promise<LocationOption[]> {
  if (municipalitiesCache) return municipalitiesCache;
  if (municipalitiesPromise) return municipalitiesPromise;

  municipalitiesPromise = fetch(MUNICIPALITIES_URL)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to load municipalities");
      }
      return res.json();
    })
    .then((payload) => {
      const list = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
      const sorted = list
        .map((item: any) => ({ code: String(item.code), name: String(item.name) }))
        .sort(sortByName);
      municipalitiesCache = sorted;
      return sorted;
    })
    .finally(() => {
      municipalitiesPromise = null;
    });

  return municipalitiesPromise;
}

async function fetchBarangays(code: string): Promise<LocationOption[]> {
  if (barangayCache.has(code)) return barangayCache.get(code) || [];

  const response = await fetch(
    `https://psgc.cloud/api/v2/cities-municipalities/${code}/barangays`,
  );
  if (!response.ok) {
    throw new Error("Failed to load barangays");
  }
  const payload = await response.json();
  const list = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
  const sorted = list
    .map((item: any) => ({ code: String(item.code), name: String(item.name) }))
    .sort(sortByName);
  barangayCache.set(code, sorted);
  return sorted;
}

export function LocationSelector({
  value,
  onChange,
  disabled,
  layout = "grid",
}: LocationSelectorProps) {
  const [municipalities, setMunicipalities] = useState<LocationOption[]>([]);
  const [barangays, setBarangays] = useState<LocationOption[]>([]);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);
  const [error, setError] = useState("");

  const wrapperClass = useMemo(() => {
    return layout === "stack" ? "grid gap-4" : "grid grid-cols-2 gap-4";
  }, [layout]);

  const safeUpdate = useCallback(
    (next: LocationValue) => {
      if (
        next.municipalityCode === value.municipalityCode &&
        next.municipalityName === value.municipalityName &&
        next.barangayCode === value.barangayCode &&
        next.barangayName === value.barangayName
      ) {
        return;
      }
      onChange(next);
    },
    [value, onChange]
  );

  // 1. Fetch municipalities on mount
  useEffect(() => {
    let active = true;
    setLoadingMunicipalities(true);
    fetchMunicipalities()
      .then((list) => {
        if (!active) return;
        setMunicipalities(list);
        setError("");
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load municipalities right now.");
      })
      .finally(() => {
        if (!active) return;
        setLoadingMunicipalities(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // 2. Fetch barangays when municipalityCode changes
  useEffect(() => {
    let active = true;

    if (!value.municipalityCode) {
      setBarangays([]);
      return;
    }

    setLoadingBarangays(true);
    fetchBarangays(value.municipalityCode)
      .then((list) => {
        if (!active) return;
        setBarangays(list);
        setError("");
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load barangays right now.");
      })
      .finally(() => {
        if (!active) return;
        setLoadingBarangays(false);
      });

    return () => {
      active = false;
    };
  }, [value.municipalityCode]);

  // 3. Auto-match municipality name to code if missing
  useEffect(() => {
    if (!municipalities.length) return;
    if (!value.municipalityCode && value.municipalityName) {
      const match = municipalities.find(
        (item) => normalize(item.name) === normalize(value.municipalityName),
      );
      if (match) {
        safeUpdate({
          ...value,
          municipalityCode: match.code,
          municipalityName: match.name,
        });
      }
    }
  }, [municipalities, value.municipalityCode, value.municipalityName, safeUpdate, value]);

  // 4. Auto-match barangay name to code if missing
  useEffect(() => {
    if (!barangays.length) return;
    if (!value.barangayCode && value.barangayName) {
      const match = barangays.find(
        (item) => normalize(item.name) === normalize(value.barangayName),
      );
      if (match) {
        safeUpdate({
          ...value,
          barangayCode: match.code,
          barangayName: match.name,
        });
      }
    }
  }, [barangays, value.barangayCode, value.barangayName, safeUpdate, value]);

  return (
    <div className={wrapperClass}>
      <div className="grid gap-2">
        <Label htmlFor="municipality">City / Municipality *</Label>
        <Select
          value={value.municipalityCode || ""}
          onValueChange={(code) => {
            const match = municipalities.find((item) => item.code === code);
            safeUpdate({
              ...value,
              municipalityCode: code,
              municipalityName: match?.name || "",
              barangayCode: "",
              barangayName: "",
            });
          }}
          disabled={disabled || loadingMunicipalities}
        >
          <SelectTrigger id="municipality">
            <SelectValue
              placeholder={
                loadingMunicipalities
                  ? "Loading municipalities..."
                  : "Select city or municipality"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {municipalities.map((item) => (
              <SelectItem key={item.code} value={item.code}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="barangay">
          Barangay
          {loadingBarangays && (
            <span className="ml-2 text-xs text-muted-foreground">
              Loading...
            </span>
          )}
        </Label>
        <Select
          value={value.barangayCode || ""}
          onValueChange={(code) => {
            const match = barangays.find((item) => item.code === code);
            safeUpdate({
              ...value,
              barangayCode: code,
              barangayName: match?.name || "",
            });
          }}
          disabled={
            disabled || loadingBarangays || !value.municipalityCode.length
          }
        >
          <SelectTrigger id="barangay">
            <SelectValue
              placeholder={
                value.municipalityCode
                  ? "Select barangay"
                  : "Select municipality first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {barangays.map((item) => (
              <SelectItem key={item.code} value={item.code}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <p className="col-span-full text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
