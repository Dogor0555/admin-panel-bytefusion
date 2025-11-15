import { cookies } from "next/headers";

export async function apiGet(path: string) {
  const cookieStore = await cookies();   // ← AQUÍ va el await

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`http://localhost:3000${path}`, {
    cache: "no-store",
    credentials: "include",
    headers: {
      Cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    console.error("Error en fetch:", {
      status: res.status,
      statusText: res.statusText,
      url: res.url,
    });
    throw new Error(`Fetch falló: ${res.status}`);
  }

  return res.json();
}
