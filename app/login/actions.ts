// app/login/actions.ts

export async function iniciarSesion(formData: FormData) {
  const correo = formData.get("correo");
  const contrasena = formData.get("contrasena");

  // Validación de correos permitidos
  if (correo !== "juan.perez@sucursal.com" && correo !== "marcosteven0717@gmail.com") {
    throw new Error("Usuario no autorizado");
  }

  if (!correo || !contrasena) {
    throw new Error("Correo y contraseña son obligatorios");
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bytefusionsv.com";
  
  console.log("API_URL usada:", API_URL);

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ correo, contrasena }),
    credentials: "include"
  });

  const text = await res.text();
  console.log("Respuesta:", text);

  if (!res.ok) {
    let mensaje;
    try {
      mensaje = JSON.parse(text)?.mensaje;
    } catch {}
    throw new Error(mensaje || `Error ${res.status}`);
  }

  try {
    const data = JSON.parse(text);
    
    if (typeof window !== 'undefined') {
      if (data.empresa) localStorage.setItem("empresa", JSON.stringify(data.empresa));
      if (data.empleado) localStorage.setItem("empleado", JSON.stringify(data.empleado));
      if (data.sucursal) localStorage.setItem("sucursal", JSON.stringify(data.sucursal));
      localStorage.setItem("isAuthenticated", "true");
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Error parseando JSON:", error);
    throw new Error(`Respuesta no válida`);
  }
}