import { useEffect } from "react";
import { heartbeat, HEARTBEAT_SECONDS } from "@/services/visitorService";

/** Sends a heartbeat while the tab is visible so admins can see who is live and for how long. */
export function VisitorPresence() {
  useEffect(() => {
    const beat = () => { if (document.visibilityState === "visible") void heartbeat(HEARTBEAT_SECONDS).catch(() => {}); };
    void heartbeat(0).catch(() => {});
    const t = window.setInterval(beat, HEARTBEAT_SECONDS * 1000);
    const onVis = () => { if (document.visibilityState === "visible") void heartbeat(0).catch(() => {}); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("visitor:named", onVis);
    return () => { window.clearInterval(t); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("visitor:named", onVis); };
  }, []);
  return null;
}
