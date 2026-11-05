import { clearGetResponseCache } from "./axios";

export async function signOut(router) {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) throw new Error("Unable to sign out. Please try again.");
  clearGetResponseCache();
  localStorage.removeItem("token");
  router.replace("/login");
  router.refresh();
}
