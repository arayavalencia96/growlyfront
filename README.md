# Growly Web

Frontend de Growly, una aplicación para definir objetivos financieros, registrar aportes y extracciones, administrar inversiones y visualizar el patrimonio por objetivo y plataforma.

Incluye autenticación, recuperación de contraseña, objetivos, movimientos de caja, operaciones de inversión, resúmenes, privacidad de saldos, temas y administración del perfil.

## Tecnologías

- React 19 y TypeScript
- Vite 8 y Tailwind CSS 4
- React Router
- React Hook Form y Zod
- Sonner y Lucide React
- Vitest, ESLint y Husky
- Firebase Hosting

## Requisitos

- Node.js `24.x`
- npm `11.x`
- Una instancia local o desplegada de `growlyback`
- Acceso a Firebase solamente para publicar

```bash
node --version
npm --version
```

## Configuración inicial

### 1. Levantar el backend

El frontend necesita Growly API. Para desarrollo local, inicia `growlyback` y verifica:

```text
http://localhost:3000/api/v1/health
```

Consulta el README del backend para configurar MongoDB Atlas, JWT y Brevo.

### 2. Instalar dependencias

```bash
npm ci
```

### 3. Clonar el archivo de entorno

Configuración local:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_VERSION=0.1.0
VITE_DOLAR_API_URL=https://dolarapi.com/v1/dolares/bolsa
```

| Variable | Uso |
| --- | --- |
| `VITE_API_URL` | URL de Growly API, incluyendo `/api/v1`. |
| `VITE_DOLAR_API_URL` | API usada para sugerir la cotización MEP/CCL. |
| `VITE_APP_VERSION` | Variable reservada; la versión visible actual está en la configuración de la aplicación. |

Las variables `VITE_*` quedan incorporadas en el bundle. Nunca guardes secretos o API keys privadas en ellas.

## Ejecutar localmente

```bash
npm run dev
```

Abre:

```text
http://localhost:5173
```

Orden recomendado para el entorno completo:

1. Autoriza tu IP en MongoDB Atlas.
2. Inicia `growlyback` con `npm run start:dev`.
3. Comprueba `http://localhost:3000/api/v1/health`.
4. Inicia `growlyfront` con `npm run dev`.
5. Abre `http://localhost:5173`.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia Vite con recarga automática. |
| `npm run build` | Valida TypeScript y genera `dist`. |
| `npm run preview` | Sirve localmente el bundle. |
| `npm run lint` | Ejecuta ESLint. |
| `npm run test:unit` | Ejecuta Vitest. |

Validación recomendada:

```bash
npm run lint
npm run test:unit
npm run build
```

## Rutas

Públicas:

- `/login`: inicio de sesión.
- `/register`: registro y términos de uso.
- `/verify-code`: verificación del código recibido por correo.
- `/recover-password`: solicitud de recuperación.
- `/reset-password`: contraseña nueva mediante enlace.
- `/change-password`: cambio obligatorio después de desbloquear la cuenta.

Protegidas:

- `/home`: inicio autenticado.
- `/objectives`: objetivos y patrimonio global.
- `/objectives/:goalId`: efectivo, posiciones, actividad y resumen del objetivo.
- `/profile`: datos personales, contraseña, baja y datos de la aplicación.

Las rutas protegidas pasan por `RequireSession` y usan `ApplicationLayout`.

## Arquitectura

El proyecto está organizado por funcionalidades:

```text
src/
|-- app/        # Arranque, router y páginas generales
|-- common/     # Componentes, servicios, configuración y contratos compartidos
|-- modules/    # Dominios funcionales
|-- styles/     # Estilos globales y Tailwind CSS
`-- utils/      # Funciones reutilizables sin dependencia de un módulo
```

Cada módulo puede contener:

```text
components/
interfaces/
pages/
services/
utils/
validations/
```

- `pages`: componen pantallas y coordinan casos de uso.
- `components`: presentación reutilizable.
- `services`: comunicación con la API y operaciones del dominio.
- `validations`: esquemas Zod.
- `interfaces`: contratos TypeScript.
- `common`: infraestructura transversal.

El alias `@/` apunta a `src/`.

## Comunicación con la API

`HttpService` centraliza:

- URL base y JSON.
- Contrato `IApiResponse<T>`.
- Errores normalizados como `ApiError`.
- Envío del access token.
- Renovación automática ante un `401` elegible.
- Rotación de tokens y reintento de la petición original.

Los tokens se guardan en `sessionStorage`: sobreviven a una recarga, pero no a una nueva sesión del navegador. La preferencia para ocultar saldos se guarda en `localStorage` mientras existe una sesión.

## Formularios y experiencia de usuario

- React Hook Form administra formularios.
- Zod concentra validaciones.
- Sonner muestra éxito, error, información y advertencias.
- `ConfirmModal` confirma acciones sensibles.
- El usuario puede ocultar saldos y alternar tema claro u oscuro.
- DolarApi sugiere la cotización MEP/CCL, que siempre puede editarse.

Si DolarApi no responde, el formulario debe permitir ingresar la cotización manualmente.

## Producción

Crea `.env.production`:

```env
VITE_API_URL=https://TU-BACKEND/api/v1
VITE_DOLAR_API_URL=https://dolarapi.com/v1/dolares/bolsa
```

Compila y prueba:

```bash
npm run build
npm run preview
```

El resultado queda en `dist/`. Antes de publicar, prueba login, refresh, rutas directas y recuperación de contraseña.

## Firebase Hosting

`firebase.json` publica `dist` y redirige las rutas de la SPA hacia `index.html`.

```bash
npm install --global firebase-tools
firebase login
firebase use --add
npm run build
firebase deploy --only hosting
```

Debes tener permisos sobre el proyecto seleccionado. Después del despliegue, actualiza en el backend:

```env
FRONTEND_PASSWORD_RESET_URL=https://TU-SITIO.web.app/reset-password
FRONTEND_BLOCKED_PASSWORD_CHANGE_URL=https://TU-SITIO.web.app/change-password
```

No ejecutes `firebase init hosting` nuevamente sin revisar los cambios, porque puede sobrescribir `firebase.json`.

## Commits y Husky

- `pre-commit`: ejecuta ESLint y pruebas unitarias.
- `commit-msg`: exige que el mensaje coincida exactamente con la rama.

```bash
git switch -c feature/GROWLY-20
git add .
git commit -m "feature/GROWLY-20"
```

La regla también aplica en GitHub Desktop.

## Solución de problemas

### La API no responde

- Verifica que `VITE_API_URL` incluya `/api/v1`.
- Comprueba el health check del backend.
- Reinicia Vite después de modificar `.env`.

### Una ruta devuelve 404 al recargar

El hosting debe redirigir rutas no físicas a `/index.html`. Firebase ya tiene la regla en `firebase.json`.

### Aparece `Unauthorized`

- Revisa los tokens en `sessionStorage`.
- Confirma que `/auth/refresh` responda.
- Si el refresh token venció o fue revocado, inicia sesión nuevamente.

### El enlace de recuperación abre una ruta incorrecta

`FRONTEND_PASSWORD_RESET_URL` y `FRONTEND_BLOCKED_PASSWORD_CHANGE_URL` pertenecen al backend y deben apuntar al dominio de este frontend.
