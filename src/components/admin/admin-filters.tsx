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
export type AccessProfileId = "direcao" | "claw" | "sales" | "cliente";
export type VisibilityMode = "internal" | "client";

type AdminFiltersContextValue = {
  selectedOperationId: string;
  selectedPeriod: PeriodPreset;
  selectedAccessProfileId: AccessProfileId;
  selectedVisibilityMode: VisibilityMode;
  operationOptions: OperationFilterOption[];
  accessProfileOptions: AccessProfileOption[];
  selectedOperation: OperationFilterOption | null;
  selectedOperationRecord: Operation | null;
  selectedAccessProfile: AccessProfileOption;
  setSelectedOperationId: (value: string) => void;
  setSelectedPeriod: (value: PeriodPreset) => void;
  setSelectedAccessProfileId: (value: AccessProfileId) => void;
  setSelectedVisibilityMode: (value: VisibilityMode) => void;
};

export type OperationFilterOption = {
  id: string;
  label: string;
  client: string;
};

export type AccessProfileOption = {
  id: AccessProfileId;
  label: string;
  scope: string;
  description: string;
  defaultVisibility: VisibilityMode;
};

const PERIOD_STORAGE_KEY = "admin-incentiva-period";
const OPERATION_STORAGE_KEY = "admin-incentiva-operation";
const ACCESS_PROFILE_STORAGE_KEY = "admin-incentiva-access-profile";
const VISIBILITY_MODE_STORAGE_KEY = "admin-incentiva-visibility-mode";

const periodOptions: Record<PeriodPreset, string> = {
  mtd: "Month to date",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
};

const accessProfileOptions: AccessProfileOption[] = [
  {
    id: "direcao",
    label: "Direção",
    scope: "Carteira inteira, governança, suporte e publish",
    description: "Usa o admin completo como cockpit executivo.",
    defaultVisibility: "internal",
  },
  {
    id: "claw",
    label: "Claw/main",
    scope: "Leitura e edição estrutural do sistema",
    description: "Opera diagnóstico, integração e corte do painel.",
    defaultVisibility: "internal",
  },
  {
    id: "sales",
    label: "Sales Ops",
    scope: "Operações atribuídas e sua camada de execução",
    description: "Precisa alternar entre visão interna e leitura cliente-safe.",
    defaultVisibility: "internal",
  },
  {
    id: "cliente",
    label: "Cliente",
    scope: "Somente a própria operação e recortes homologados",
    description: "Entra no portal com visão privada e leitura limitada.",
    defaultVisibility: "client",
  },
];

const visibilityModeOptions: Record<VisibilityMode, string> = {
  internal: "Interno completo",
  client: "Cliente-safe",
};

const AdminFiltersContext = createContext<AdminFiltersContextValue | null>(null);

export function AdminFiltersProvider({ children }: { children: ReactNode }) {
  const [selectedOperationId, setSelectedOperationId] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodPreset>("mtd");
  const [selectedAccessProfileId, setSelectedAccessProfileId] = useState<AccessProfileId>("direcao");
  const [selectedVisibilityMode, setSelectedVisibilityMode] = useState<VisibilityMode>("internal");

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

    const savedAccessProfile = window.localStorage.getItem(
      ACCESS_PROFILE_STORAGE_KEY,
    ) as AccessProfileId | null;
    const savedVisibilityMode = window.localStorage.getItem(
      VISIBILITY_MODE_STORAGE_KEY,
    ) as VisibilityMode | null;

    if (savedAccessProfile && accessProfileOptions.some((option) => option.id === savedAccessProfile)) {
      setSelectedAccessProfileId(savedAccessProfile);
    }

    if (savedVisibilityMode && savedVisibilityMode in visibilityModeOptions) {
      setSelectedVisibilityMode(savedVisibilityMode);
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_PROFILE_STORAGE_KEY, selectedAccessProfileId);
  }, [selectedAccessProfileId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(VISIBILITY_MODE_STORAGE_KEY, selectedVisibilityMode);
  }, [selectedVisibilityMode]);

  const selectedOperation =
    operationOptions.find((option) => option.id === selectedOperationId) ?? operationOptions[0];

  const selectedOperationRecord =
    operations.find((operation) => operation.id === selectedOperationId) ?? null;

  const selectedAccessProfile =
    accessProfileOptions.find((option) => option.id === selectedAccessProfileId) ??
    accessProfileOptions[0];

  const handleAccessProfileChange = (value: AccessProfileId) => {
    const profile =
      accessProfileOptions.find((option) => option.id === value) ?? accessProfileOptions[0];
    setSelectedAccessProfileId(profile.id);

    // Keeps the portal preview coherent when the audience changes materially.
    if (profile.defaultVisibility !== selectedVisibilityMode) {
      setSelectedVisibilityMode(profile.defaultVisibility);
    }
  };

  return (
    <AdminFiltersContext.Provider
      value={{
        selectedOperationId,
        selectedPeriod,
        selectedAccessProfileId,
        selectedVisibilityMode,
        operationOptions,
        accessProfileOptions,
        selectedOperation,
        selectedOperationRecord,
        selectedAccessProfile,
        setSelectedOperationId,
        setSelectedPeriod,
        setSelectedAccessProfileId: handleAccessProfileChange,
        setSelectedVisibilityMode,
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

export function formatVisibilityModeLabel(value: VisibilityMode) {
  return visibilityModeOptions[value];
}
