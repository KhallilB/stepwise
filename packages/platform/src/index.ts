export function platformLinks(
  hostname: string,
  desktop = typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__INTERVIEW_DESKTOP__" in window),
) {
  if (desktop) return { lab: "/react-lab", stepwise: "/" };
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
  return {
    lab: local ? `http://${hostname}:5173/react-lab` : "https://practice.kcb.pro/react-lab",
    stepwise: local ? `http://${hostname}:5174/` : "https://stepwise.kcb.pro/",
  };
}
