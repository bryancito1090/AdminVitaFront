# AdminVitaFront

Front-end Angular 19 para la plataforma VITA de gestion de ordenes de trabajo, inventario y adquisiciones de un taller/flota. Incluye dos portales: uno administrativo y uno orientado a mecanicos, ambos consumiendo el backend configurado en `src/environments/environment.development.ts`.

## Caracteristicas clave
- Landing (`/`) con acceso separado para el portal administrativo y el de mecanica.
- Autenticacion:
  - Administracion: login email/clave (`/login`), token JWT guardado en `authToken`.
  - Mecanica: acceso con PIN (`/login_mecanica`), token `mecanico-token` y guards para proteger rutas.
- Portal administrativo (`/panel` con `administradorGuard`):
  - Dashboard con graficos de Chart.js (ordenes por estado, kardex de inventario, top items, vehiculos matriculados).
  - Ordenes de trabajo: alta/edicion, asignacion de supervisor, validacion de cliente/vehiculo, seguimiento de tareas/repuestos/observaciones/solicitudes, descarga de adjuntos, exportes a Excel y PDF.
  - Vehiculos: registro institucional, propietarios, licencias, tipos, carga de documentos e imagenes.
  - Adquisiciones: listado y detalle de compras, descarga de facturas adjuntas, exporte masivo a Excel.
  - Personas: gestion de usuarios, mecanicos y proveedores.
- Portal de mecanica (`/mecanica` con `mecanicaGuard`):
  - Lista filtrable de ordenes por mecanico/estado/prioridad.
  - Detalle por codigo con tareas, repuestos, solicitudes, observaciones y adjuntos.
  - Alta de nuevas ordenes de trabajo con validacion via dialogo OTP.
- UI construida con PrimeNG 19, Tailwind, ngx-toastr, Chart.js y exportes con `xlsx` + `jspdf`.

## Requisitos
- Node 18.19+ o 20 LTS.
- npm 9+.
- Angular CLI 19 instalado globalmente (`npm i -g @angular/cli@19`).

## Puesta en marcha
1) Instalar dependencias:
```bash
npm install
```
2) Configurar el backend en `src/environments/environment.development.ts` (ver siguiente seccion).
3) Levantar el servidor de desarrollo (puerto 4200 por defecto):
```bash
npm start
# o
ng serve --open
```
4) Acceder segun rol:
   - Portal admin: `http://localhost:4200/login` -> `/panel`
   - Portal mecanica: `http://localhost:4200/login_mecanica` -> `/mecanica`

## Variables/entornos
- `src/environments/environment.development.ts` define el dominio por defecto (`https://servicios.istpet.edu.ec/apiVita`) y los segmentos usados por los servicios (`apiEndpoint`, `authentication`, `ordenesTrabajo`, `mecanico`, etc). Ajustalo al dominio de tu API.
- `src/environments/environment.ts` queda para builds de produccion; replica ahi los valores requeridos o configura `fileReplacements` segun tu entorno.
- Los tokens JWT se guardan en `localStorage` como `authToken` (admin) y `mecanico-token` (mecanica).

## Scripts disponibles
- `npm start`: corre `ng serve` en modo desarrollo.
- `npm run build`: compila a produccion en `dist/`.
- `npm run watch`: build incremental (`ng build --watch --configuration development`).
- `ng test`: ejecuta las pruebas unitarias (Karma). No hay e2e configurado.

## Rutas principales
- `/`: selector de portales.
- `/login`: login administrativo.
- `/panel`: layout privado; hijos: `OrdenTrabajo`, `Vehiculos`, `Inventario`, `Adquisiciones` (con `agregar` y `editar/:factura`), `persons/Usuario`, `persons/Mecanico`, `persons/Proveedor`.
- `/login_mecanica`: login por PIN para mecanicos.
- `/mecanica`: dashboard de mecanica; hijos: `agregar-orden` y `/:codigo` para detalle de OT.
- `/notFound404`: pagina 404; cualquier ruta desconocida redirige aqui.

## Estructura util
- `src/app/layout`: componentes de layout (sidebar, topbar, footer) y servicios de tema.
- `src/app/views/auth`: login admin y mecanica, guards y servicio de autenticacion.
- `src/app/views/dashboard`: modulos administrativos (home, orden-trabajo, vehiculo, inventario, adquisicion, persona).
- `src/app/views/dashboard-mecanica`: portal para mecanicos (dashboard, agregar OT, detalle OT).
- `src/app/views/services`: capa de servicios HTTP hacia el backend.
- `src/domain/request` y `src/domain/response`: modelos tipados de las peticiones y respuestas.
- `src/assets`: estilos SCSS de layout, presets y recursos graficos.

## Build y despliegue
- Compilar para produccion:
```bash
npm run build
```
El artefacto queda en `dist/admin-vita-front/` listo para servir con tu servidor web.
- Si necesitas un dominio distinto para produccion, actualiza `environment.ts` y opcionalmente define reemplazos en `angular.json`.

## Notas de desarrollo
- PrimeNG y Tailwind conviven; los estilos globales estan en `src/styles.scss` y presets de tema en `src/assets/layout`.
- Muchas tablas permiten exporte a Excel (via `xlsx`) y generar reportes PDF (via `jspdf-autotable`).
- Los servicios dependen de endpoints REST; si ves errores de CORS o 401 revisa el dominio configurado y los tokens almacenados.
