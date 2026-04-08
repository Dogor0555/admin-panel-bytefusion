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

  // 🔥 FORZAR la URL correcta de tu API (cámbiala por la real)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bytefusionsv.com";
  
  // 🔥 Probar diferentes endpoints
  const endpoints = [
    `${API_URL}/login`,      // Intentar este primero
    `${API_URL}/api/login`,  // Si no funciona, probar este
    `${API_URL}/auth/login`, // O este
  ];
  
  let lastError: any = null; // ✅ SOLUCIÓN: Tipar como any o crear una interfaz
  
  // Probar cada endpoint
  for (const endpoint of endpoints) {
    try {
      console.log("Intentando:", endpoint);
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ correo, contrasena }),
        credentials: "include"
      });

      const text = await res.text();
      console.log(`Respuesta de ${endpoint}:`, res.status, text);

      if (res.ok) {
        try {
          return JSON.parse(text);
        } catch {
          throw new Error(`Respuesta no válida: ${text}...`);
        }
      }
      
      lastError = { status: res.status, text, endpoint };
    } catch (err) {
      lastError = err;
    }
  }
  
  // Si llegamos aquí, todos los endpoints fallaron
  if (lastError) {
    throw new Error(`Error ${lastError.status || "desconocido"} en ${lastError.endpoint || "API"}: ${lastError.text || lastError.message}`);
  }
  
  throw new Error("No se pudo conectar con el servidor");
}