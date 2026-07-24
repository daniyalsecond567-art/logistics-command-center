import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { subscribeMaintenance, type MaintenanceState } from "@/services/maintenanceService";

const MaintenanceContext = createContext<MaintenanceState>({ enabled: false });

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MaintenanceState>({ enabled: false });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const unsub = subscribeMaintenance(setState);
    return () => unsub();
  }, []);

  return <MaintenanceContext.Provider value={state}>{children}</MaintenanceContext.Provider>;
}

export function useMaintenance() {
  return useContext(MaintenanceContext);
}
