# Nexus · Librería universitaria y coworking (Next.js + App Router)

Actividad 1 de *Frameworks frontend*: migración a **Next.js 16 con App Router** de la aplicación React de la librería
universitaria Nexus (Actividad 2 de *Desarrollo Web Orientado a Componentes*, hecha con Create React App, React Router
y datos hardcodeados).

- **Librería**: top 10 de más vendidos, catálogo con menú lateral desplegable de categorías (libros y revistas) y filtros
  (año de publicación, tipo, idioma, precio, stock, búsqueda y orden), ficha de cada libro o revista (al pasar el ratón y
  al hacer clic), carrito, compra sin pasarela de pago y vista de libros adquiridos.
- **Coworking**: plano de la planta con la ocupación de cada espacio (quién lo ocupa, desde qué hora y cuándo se libera),
  ficha de cada espacio (al pasar el ratón y al hacer clic), reserva sin pasarela de pago e historial de reservas.
- **Landing general** y **login**: cualquier vista de la librería o del coworking exige haber iniciado sesión.

Todos los datos llegan por HTTP desde una **API simulada en Apidog** (ver [`docs/api-simulada`](docs/api-simulada/README.md)).

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y pon la URL del mock de Apidog en NEXUS_API_URL
npm run dev                  # http://localhost:3000
```

Cuenta de prueba: `jhordy.camacho@nexus.edu` / `nexus2026` (el login es simulado: cualquier correo válido y una contraseña
de 6 o más caracteres entran).

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción: muestra qué rutas se prerenderizan |
| `npm start` | Sirve el build de producción |
| `npm run lint` | ESLint con las reglas de Next.js y React |

## Rutas (App Router)

Cada carpeta dentro de `src/app` es un segmento de la URL; `page.js` la hace accesible y `layout.js` define la interfaz
compartida por sus rutas hijas. Los segmentos entre corchetes son rutas dinámicas.

| URL | Archivo | Renderizado | Acceso |
| --- | --- | --- | --- |
| `/` | `app/page.js` | Estático (datos cacheados de la API) | Pública |
| `/login` | `app/login/page.js` | Estático + formulario cliente | Pública |
| `/libreria` | `app/libreria/page.js` | Estático, se regenera cada hora (top 10) | Con sesión |
| `/libreria/catalogo` | `app/libreria/catalogo/page.js` | Estructura estática + resultados por petición (filtros en la URL) | Con sesión |
| `/libreria/catalogo/[categoria]` | `app/libreria/catalogo/[categoria]/page.js` | SSG de las 10 categorías + filtros por petición | Con sesión |
| `/libreria/libros/[id]` | `app/libreria/libros/[id]/page.js` | SSG: una página por cada uno de los 32 títulos | Con sesión |
| `/libreria/carrito` | `app/libreria/carrito/page.js` | Estructura estática + carrito en el cliente (CSR) | Con sesión |
| `/libreria/mis-libros` | `app/libreria/mis-libros/page.js` | SSR en cada petición (cookie de sesión + historial) | Con sesión |
| `/coworking` | `app/coworking/page.js` | SSR de la ocupación + actualización en el cliente cada 30 s | Con sesión |
| `/coworking/espacios/[id]` | `app/coworking/espacios/[id]/page.js` | SSG de los 14 espacios + "estado ahora" por petición | Con sesión |
| `/coworking/reservar` | `app/coworking/reservar/page.js` | Estructura estática + formulario cliente | Con sesión |
| `/coworking/mis-reservas` | `app/coworking/mis-reservas/page.js` | SSR en cada petición | Con sesión |

Layouts anidados: `app/layout.js` (cabecera, pie y carrito) → `app/libreria/layout.js` y `app/coworking/layout.js`
(subnavegación de cada sección) → `app/libreria/catalogo/layout.js` (menú lateral compartido por el catálogo y las
categorías). Además: `not-found.js` (404), `error.js` (errores de la API) y `src/proxy.js`, que redirige a `/login` si se
entra en `/libreria/*` o `/coworking/*` sin sesión (en Next.js 16 el *middleware* se llama *proxy*).

## Server Components y Client Components

Por defecto todo es **Server Component**: se renderiza en el servidor, puede llamar directamente a la API y no envía su
JavaScript al navegador. Solo se marcan con `'use client'` los componentes que necesitan estado, eventos o APIs del
navegador.

**Client Components** (`'use client'`) y por qué:

| Componente | Motivo |
| --- | --- |
| `context/CartContext.js` | Estado del carrito compartido entre páginas y guardado en `localStorage` (`useSyncExternalStore`) |
| `components/layout/MainNav.js` | `usePathname()` para marcar la sección activa y `useState` para el menú móvil |
| `components/layout/SubNav.js` | `usePathname()` para marcar la pestaña activa |
| `components/layout/CartBadge.js` | Lee el contexto del carrito |
| `components/libreria/SidebarDrawer.js` | Estado abierto/cerrado del panel lateral en móvil |
| `components/libreria/CategoryMenu.js` | Grupos desplegables (Libros/Revistas) con estado y categoría activa |
| `components/libreria/CatalogFilters.js` | Campos controlados que reescriben los `searchParams` con `useRouter()` |
| `components/libreria/AddToCartButton.js` | `onClick` que modifica el carrito |
| `components/libreria/CartView.js` | Cantidades, eliminar y confirmar la compra (Server Action con `useTransition`) |
| `components/coworking/CoworkingPlan.js` | Consulta la ocupación desde el navegador cada 30 s (`setInterval` + `fetch`) y muestra la ficha al pasar el ratón |
| `components/coworking/ReservationForm.js` | Formulario controlado (precio estimado y aforo en vivo) con `useActionState` |
| `components/auth/LoginForm.js` | `useActionState` para errores y estado de envío, `useSearchParams()` para volver a la página pedida |
| `app/error.js` | Next.js exige que los límites de error sean de cliente (`reset()`) |

**Server Components** (sin directiva): todos los `layout.js` y `page.js`, `SiteHeader`, `UserMenu` (lee la cookie de
sesión), `SiteFooter`, `BookCard` (la ficha rápida al pasar el ratón se hace solo con CSS), `BookGrid`, `BookCover`
(`next/image`), `CatalogResults` (filtra en el servidor según la URL) y `MiniPlano`.

Las mutaciones (`login`, `logout`, `comprar`, `reservar`) son **Server Actions** en `src/actions/`: validan en el servidor
(por ejemplo, recalculan los precios con el catálogo de la API en vez de fiarse del navegador) y hacen el `POST` a la API.

## Datos, caché y renderizado

El proyecto usa **Cache Components** (`cacheComponents: true`), el modelo por defecto en Next.js 16:

- Los datos que no dependen del usuario se leen con funciones `'use cache'` + `cacheLife` en `src/lib/api.js`
  (categorías y espacios: días; catálogo: horas). Se incluyen en el HTML generado en el build y se regeneran pasado ese
  tiempo, que es la regeneración incremental (ISR) de este modelo.
- Lo que depende de la petición (cookies, `searchParams`) o debe estar siempre al día (ocupación del coworking, historial
  del usuario) se lee sin caché dentro de `<Suspense>`: el resto de la página se sirve al instante y esa parte llega en
  streaming (*Partial Prerendering*).
- `generateStaticParams` prerenderiza las rutas dinámicas (`/libreria/libros/[id]`, `/libreria/catalogo/[categoria]`,
  `/coworking/espacios/[id]`).
- El plano del coworking también pide datos desde el navegador (CSR); esas peticiones se ven en la pestaña *Red* de las
  herramientas de desarrollo. Las del servidor aparecen en la terminal con el prefijo `[API simulada]`.

## Estilos

- **Tailwind CSS v4** con tokens propios (`@theme` en `src/app/globals.css`) y utilidades reutilizables con `@utility`
  (`btn-primary`, `card`, `field`...).
- **CSS Modules** en el plano del coworking (`components/coworking/Plano.module.css`): rejilla CSS posicionada con
  variables y clases encapsuladas.
- Fuentes con `next/font` (Fraunces para títulos, Geist para texto) e imágenes optimizadas con `next/image`.

## Qué cambió respecto a la versión React

| React (CRA) | Next.js (App Router) |
| --- | --- |
| `react-router-dom` con `<Routes>` en `App.js` | Rutas por sistema de ficheros en `src/app` |
| `ProtectedRoute` en el cliente | `src/proxy.js` en el servidor, antes de renderizar |
| Todo eran Client Components con `useEffect` para cargar datos | Server Components que piden los datos en el servidor |
| `services/api.js` con datos hardcodeados y `setTimeout` | API simulada en Apidog consumida por HTTP |
| Login contra credenciales escritas en el código y `localStorage` | Server Action + API simulada + cookie `httpOnly` |
| Estilos con CSS global y CSS Modules | Tailwind CSS v4 + CSS Modules |

## Despliegue en Vercel

1. Sube el proyecto a un repositorio de GitHub e impórtalo en [vercel.com/new](https://vercel.com/new) (o ejecuta `npx vercel`).
2. En *Settings → Environment Variables* añade `NEXUS_API_URL` con la URL del mock de Apidog.
3. Despliega. Vercel detecta Next.js y no necesita más configuración.

## Estructura

```
src/
├── app/            Rutas (layouts, páginas, error, 404, icono)
├── actions/        Server Actions: auth, compras, reservas
├── components/     layout/, libreria/, coworking/, auth/
├── context/        CartContext (cliente)
├── lib/            api.js (acceso a la API), session.js (cookies), catalogo.js (filtros), format.js
└── proxy.js        Protección de rutas
docs/api-simulada/  Contrato OpenAPI de la API simulada para Apidog
```
