export async function iniciarSesion(formData: FormData) {
  const correo = formData.get("correo");
  const contrasena = formData.get("contrasena");

  if (correo !== "juan.perez@sucursal.com") {
    throw new Error("Usuario no autorizado");
  }

  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena }),
    credentials: "include"
  });

  const text = await res.text();
  console.log("Respuesta del servidor:", text); // Mira la consola (F12) para ver el contenido real

  if (!res.ok) {
    let mensaje;
    try {
      mensaje = JSON.parse(text)?.mensaje;
    } catch {}
    throw new Error(mensaje || `Error ${res.status}: ${text.slice(0, 150)}...`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Respuesta no válida: ${text}...`);
  }
}
