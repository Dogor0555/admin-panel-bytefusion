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

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  if (!API_URL) {
    throw new Error("API URL no configurada");
  }

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
  console.log("Respuesta completa:", text);

  if (!res.ok) {
    let mensaje;
    try {
      mensaje = JSON.parse(text)?.mensaje;
    } catch {}
    throw new Error(mensaje || `Error ${res.status}`);
  }

  try {
    const data = JSON.parse(text);
    console.log("Datos parseados:", data);
    
    // 🔥 IMPORTANTE: Guardar la respuesta en localStorage si es necesario
    if (typeof window !== 'undefined') {
      if (data.empresa) {
        localStorage.setItem("empresa", JSON.stringify(data.empresa));
        console.log("Empresa guardada:", data.empresa);
      }
      if (data.empleado) {
        localStorage.setItem("empleado", JSON.stringify(data.empleado));
        console.log("Empleado guardado:", data.empleado);
      }
      if (data.sucursal) {
        localStorage.setItem("sucursal", JSON.stringify(data.sucursal));
        console.log("Sucursal guardada:", data.sucursal);
      }
      
      // Guardar token o lo que necesites
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
    }
    
    // 🔥 Devolver los datos para que el componente los use
    return data;
  } catch (error) {
    console.error("Error parseando JSON:", error);
    throw new Error(`Respuesta no válida: ${text.substring(0, 200)}...`);
  }
}