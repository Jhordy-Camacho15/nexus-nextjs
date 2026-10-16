// Genera nexus-openapi.json (OpenAPI 3.0) a partir de nexus-data.json.
// Uso: node generar-openapi.mjs
// El fichero resultante se importa en Apidog (Settings > Import data > OpenAPI/Swagger).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(dir, 'nexus-data.json'), 'utf8'));

// Metadatos de cada endpoint: [método ruta] -> { tag, summary, status, body }
const endpoints = {
  'GET /nexus': { tag: 'Nexus', summary: 'Información general de Nexus y sus servicios' },
  'GET /categorias': { tag: 'Librería', summary: 'Categorías de libros y revistas' },
  'GET /catalogo': { tag: 'Librería', summary: 'Catálogo completo de libros y revistas' },
  'GET /coworking/espacios': { tag: 'Coworking', summary: 'Espacios de coworking de la planta y su posición en el plano' },
  'GET /coworking/ocupacion': { tag: 'Coworking', summary: 'Ocupación actual de cada espacio (quién, desde y hasta qué hora)' },
  'POST /auth/login': {
    tag: 'Usuario',
    summary: 'Inicio de sesión simulado',
    body: { email: 'jhordy.camacho@nexus.edu', password: 'nexus2026' },
  },
  'GET /usuarios/me/compras': { tag: 'Usuario', summary: 'Historial de compras del usuario' },
  'POST /compras': {
    tag: 'Librería',
    summary: 'Registrar una compra (sin pasarela de pago)',
    status: '201',
    body: {
      items: [
        { libroId: 1, cantidad: 1, precioUnitario: 42.9 },
        { libroId: 18, cantidad: 2, precioUnitario: 17.95 },
      ],
      total: 78.8,
    },
  },
  'GET /usuarios/me/reservas': { tag: 'Usuario', summary: 'Historial de reservas de coworking del usuario' },
  'POST /coworking/reservas': {
    tag: 'Coworking',
    summary: 'Reservar un espacio de coworking (sin pasarela de pago)',
    status: '201',
    body: { espacioId: 'S2', fecha: '2026-10-20', desde: '10:00', hasta: '12:00', personas: 4, motivo: 'Reunión de grupo' },
  },
};

// Inferencia sencilla de JSON Schema a partir de un valor de ejemplo.
function schemaOf(values) {
  const list = Array.isArray(values) ? values : [values];
  const nonNull = list.filter((v) => v !== null && v !== undefined);
  const nullable = nonNull.length < list.length;
  if (nonNull.length === 0) return { nullable: true };

  const first = nonNull[0];
  let schema;
  if (Array.isArray(first)) {
    schema = { type: 'array', items: schemaOf(nonNull.flat()) };
  } else if (typeof first === 'object') {
    const keys = [...new Set(nonNull.flatMap((o) => Object.keys(o)))];
    const properties = {};
    for (const key of keys) properties[key] = schemaOf(nonNull.map((o) => (key in o ? o[key] : null)));
    const required = keys.filter((key) => nonNull.every((o) => key in o && o[key] !== null));
    schema = { type: 'object', properties, ...(required.length ? { required } : {}) };
  } else if (typeof first === 'number') {
    schema = { type: nonNull.every(Number.isInteger) ? 'integer' : 'number' };
  } else {
    schema = { type: typeof first };
  }
  return nullable ? { ...schema, nullable: true } : schema;
}

function rootSchema(example) {
  return Array.isArray(example) ? { type: 'array', items: schemaOf(example) } : schemaOf(example);
}

const paths = {};
for (const [key, meta] of Object.entries(endpoints)) {
  const [method, path] = key.split(' ');
  const example = data[key];
  if (example === undefined) throw new Error(`Falta el ejemplo de ${key} en nexus-data.json`);

  const operation = {
    tags: [meta.tag],
    summary: meta.summary,
    operationId: `${method.toLowerCase()}${path.replace(/\/(\w)/g, (_, c) => c.toUpperCase()).replace(/\W/g, '')}`,
    responses: {
      [meta.status ?? '200']: {
        description: 'OK',
        content: { 'application/json': { schema: rootSchema(example), example } },
      },
    },
  };
  if (meta.body) {
    operation.requestBody = {
      required: true,
      content: { 'application/json': { schema: rootSchema(meta.body), example: meta.body } },
    };
  }
  paths[path] = { ...paths[path], [method.toLowerCase()]: operation };
}

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Nexus API simulada',
    version: '1.0.0',
    description:
      'API simulada de Nexus (librería universitaria y coworking) para la actividad 1 de Frameworks frontend. ' +
      'Importar en Apidog y activar en Project Settings > Feature Settings > Mock Settings la opción "Response example first".',
  },
  servers: [{ url: 'https://mock.apidog.com/m1/{proyecto}-default', variables: { proyecto: { default: '1088929-1078328' } } }],
  tags: [
    { name: 'Nexus', description: 'Información general' },
    { name: 'Librería', description: 'Catálogo, categorías y compras' },
    { name: 'Coworking', description: 'Espacios, ocupación y reservas' },
    { name: 'Usuario', description: 'Sesión e historial del usuario' },
  ],
  security: [],
  paths,
};

writeFileSync(join(dir, 'nexus-openapi.json'), JSON.stringify(openapi, null, 2) + '\n');
console.log(`nexus-openapi.json generado con ${Object.keys(endpoints).length} endpoints`);
