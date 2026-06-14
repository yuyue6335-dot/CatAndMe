import type { MemoryView } from "./types";

export class AuthenticationRequiredError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AuthenticationRequiredError";
  }
}

export async function requestMemoryView(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { error?: string } | null;
    if (response.status === 401) {
      throw new AuthenticationRequiredError(error?.error);
    }
    throw new Error(error?.error || "Request failed.");
  }

  return (await response.json()) as MemoryView;
}

export async function loadMemoryView() {
  return requestMemoryView("/api/memories", {
    cache: "no-store"
  });
}
