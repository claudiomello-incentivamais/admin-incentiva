import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { fetchOperations, type Operation } from "@/lib/admin-data";

export type PeriodPreset = "mtd" | "7d" | "30d" | "90d";

type AdminFiltersContextValue = {
  selectedOperationId: string;
  selectedPeriod: PeriodPreset;
  operationOptions: OperationFilterOption[];
  selectedOperation: OperationFilterOption | null;
  selectedOperationRecord: Operation | null;
  setSelectedOperationId: (value: string) => void;
  setSelectedPeriod: (value: PeriodPreset) => void;
};

export type OperationFilterOption = {
  id: string;
  label: string;
  client: string;
};

const PERIOD_STORAGE_KEY = "admin-incentiva-period";
const OPERATION_STORAGE_KEY = "admin-incentiva-operation";

const periodOptions: Record<PeriodPreset, string> = {
  mtd: "Month to date",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
};

const AdminFiltersContext = createContext<AdminFiltersContextValue | null>(null);

export function AdminFiltersProvider({ children }: { children: ReactNode }) {
  const [selectedOperationId, setSelectedOperationId] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodPreset>("mtd");

  const operations = useMemo(() => fetchOperations(), []);
  const operationOptions = useMemo<OperationFilterOption[]>(
    () => [
      { id: "all", label: "Todas as operações", client: "Carteira consolidada" },
      ...operations.map((operation) => ({
        id: operation.id,
        label: operation.name,
        client: operation.client,
      })),
    ],
    [operations],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedOperation = window.localStorage.getItem(OPERATION_STORAGE_KEY);
    const savedPeriod = window.localStorage.getItem(PERIOD_STORAGE_KEY) as PeriodPreset | null;

    if (savedOperation && operationOptions.some((option) => option.id === savedOperation)) {
      setSelectedOperationId(savedOperation);
    }

    if (savedPeriod && savedPeriod in periodOptions) {
      setSelectedPeriod(savedPeriod);
    }
  }, [operationOptions]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(OPERATION_STORAGE_KEY, selectedOperationId);
  }, [selectedOperationId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PERIOD_STORAGE_KEY, selectedPeriod);
  }, [selectedPeriod]);

  const selectedOperation =
    operationOptions.find((option) => option.id === selectedOperationId) ?? operationOptions[0];

  const selectedOperationRecord =
    operations.find((operation) => operation.id === selectedOperationId) ?? null;

  return (
    <AdminFiltersContext.Provider
      value={{
        selectedOperationId,
        selectedPeriod,
        operationOptions,
        selectedOperation,
        selectedOperationRecord,
        setSelectedOperationId,
        setSelectedPeriod,
      }}
    >
      {children}
    </AdminFiltersContext.Provider>
  );
}

export function useAdminFilters() {
  const context = useContext(AdminFiltersContext);
  if (!context) {
    throw new Error("useAdminFilters must be used within AdminFiltersProvider");
  }
  return context;
}

export function formatPeriodLabel(value: PeriodPreset) {
  return periodOptions[value];
}
