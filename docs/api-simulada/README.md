# API simulada de Nexus (Apidog)

La aplicación **no tiene datos en el código**: todo lo obtiene por HTTP de una API simulada publicada en Apidog.
Esta carpeta contiene el contrato de esa API para poder recrearla.

| Archivo | Para qué sirve |
| --- | --- |
| `nexus-openapi.json` | Especificación OpenAPI 3.0 con los 10 endpoints y sus respuestas de ejemplo. Es lo que se importa en Apidog. |
| `nexus-data.json` | Respuestas de ejemplo de cada endpoint (fuente desde la que se genera el OpenAPI). |
| `generar-openapi.mjs` | Script que regenera `nexus-openapi.json` a partir de `nexus-data.json` (`node generar-openapi.mjs`). |

## Endpoints

| Método | Ruta | Uso en la app |
| --- | --- | --- |
| GET | `/nexus` | Landing general y pie de página |
| GET | `/categorias` | Menú lateral de categorías de libros y revistas |
| GET | `/catalogo` | Catálogo, top 10, fichas de libros y revistas |
| GET | `/coworking/espacios` | Plano del coworking y fichas de los espacios |
| GET | `/coworking/ocupacion` | Quién ocupa cada espacio, desde y hasta qué hora (se consulta también desde el navegador cada 30 s) |
| POST | `/auth/login` | Inicio de sesión simulado |
| GET | `/usuarios/me/compras` | Historial de compras (vista "Mis libros") |
| POST | `/compras` | Registrar una compra |
| GET | `/usuarios/me/reservas` | Historial de reservas |
| POST | `/coworking/reservas` | Registrar una reserva |

## Cómo publicarla en Apidog

1. En Apidog, abre el proyecto (o crea uno nuevo) y ve a **Settings → Import data → OpenAPI/Swagger**. Sube `nexus-openapi.json`.
2. En **Project Settings → Feature Settings → Mock Settings**, cambia **Default mock method** a **Response example first**.
   Así el mock devuelve exactamente los ejemplos del archivo en lugar de datos aleatorios.
3. Copia la URL base del **Cloud Mock** (algo como `https://mock.apidog.com/m1/XXXXXXX-XXXXXXX-default`) y ponla en la variable
   de entorno `NEXUS_API_URL` (archivo `.env.local` en local y en *Environment Variables* en Vercel).
4. Comprueba que responde: `curl https://mock.apidog.com/m1/XXXXXXX-XXXXXXX-default/categorias`.

Como un mock no guarda datos, lo que el usuario compra o reserva durante la sesión se recuerda en cookies y se combina
con el historial que devuelve la API.
