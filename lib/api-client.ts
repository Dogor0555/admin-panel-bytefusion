//lib/api-client.ts
/**
 * Este archivo es para llamadas a la API del lado del cliente.
 * Incluye automáticamente las credenciales para las solicitudes autenticadas.
 */

async function clientFetch(path: string, options: RequestInit = {}) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${path}`;

  const defaultOptions: RequestInit = {
    credentials: 'include', // Envía cookies, incluso en peticiones cross-origin
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `La petición falló con estado ${response.status}` }));
    throw new Error(errorData.error || "Ocurrió un error en la petición a la API");
  }

  // El método DELETE puede retornar una respuesta sin cuerpo.
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return { message: "Operación exitosa" };
  }

  return response.json();
}

export const apiDelete = (path: string) => clientFetch(path, { method: 'DELETE' });