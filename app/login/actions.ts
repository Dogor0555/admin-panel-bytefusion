"use server";

export async function iniciarSesion(formData: FormData) {
  const correo = formData.get("correo");
  const contrasena = formData.get("contrasena");

  if (!correo || !contrasena) {
    throw new Error("Correo y contraseña son obligatorios");
  }

  const allowedEmails = ["juan.perez@sucursal.com", "marcosteven0717@gmail.com"];
  if (!allowedEmails.includes(correo as string)) {
    throw new Error("Usuario no autorizado");
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bytefusionsv.com";

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ correo, contrasena }),
    credentials: "include",
  });

  const text = await res.text();

  if (!res.ok) {
    let mensaje;
    try {
      mensaje = JSON.parse(text)?.mensaje;
    } catch {}
    throw new Error(mensaje || `Error ${res.status}`);
  }

  try {
    const data = JSON.parse(text);
    // Solo retorna los datos — el cliente se encarga de guardar en localStorage
    return { success: true, data };
  } catch {
    throw new Error("Respuesta no válida del servidor");
  }
}