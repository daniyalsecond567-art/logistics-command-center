import { useEffect, useState } from "react";
import { DEFAULT_FEATURES, subscribeFeatures, type FeatureFlags } from "@/services/featureService";

export function useFeatures(): FeatureFlags {
  const [f, setF] = useState<FeatureFlags>(DEFAULT_FEATURES);
  useEffect(() => subscribeFeatures(setF), []);
  return f;
}
