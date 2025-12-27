export async function iniciarSesion(formData: FormData) {
  const correo = formData.get("correo");
  const contrasena = formData.get("contrasena");

  if (correo !== "marcosteven0717@gmail.com") {
    throw new Error("Usuario no autorizado");
  }

  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena }),
    credentials: "include"
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.mensaje || "Error al iniciar sesión");
  }

  return res.json();
}
