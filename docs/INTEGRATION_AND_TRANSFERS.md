# Integración, objetivos y transferencias

## Objetivos

La pantalla mantiene el skeleton completo hasta resolver objetivos, resumen y presupuesto de Cashy. El panel de presupuesto se muestra siempre: presenta importes cuando existe una vinculación válida y `N/A` con una explicación cuando no está disponible.

La barra lateral puede contraerse dejando visibles los iconos. El item Objetivos despliega los objetivos activos en orden alfabético para navegar entre ellos sin volver al listado.

## Aportes desde Cashy

Al abrir el formulario de aporte se consulta una vez el presupuesto disponible. La confirmación muestra el progreso mediante notificaciones y cierra el modal; si el servidor deja la operación pendiente, se conserva la clave para recuperar su estado sin duplicarla.

La actividad de Cashy comparte el panel de actividad del objetivo. Cada fila abre su detalle y las acciones disponibles se muestran como iconos accesibles.

## Registro de transferencia

El formulario dice `Registrar transferencia` porque Growly no ejecuta una transferencia real. El usuario elige:

- origen disponible del objetivo actual;
- objetivo y plataforma de destino;
- importe o cantidad;
- comisión en la misma unidad;
- notas opcionales.

El cliente valida formato, precisión, destino distinto y disponibilidad consultada. El backend vuelve a validar todo al confirmar.

Durante el procesamiento se guarda en `localStorage` la clave y el objetivo de origen; el borrador queda en `sessionStorage`. No se permite crear otra solicitud ni reintentar la misma mientras el servidor indica que continúa procesándose. Un estado definitivo limpia ambos registros.

## Estados esperados

- `pending`: recibida y todavía sin resultado definitivo;
- `completed`: débito, crédito y eventual comisión registrados;
- `rejected`: no produjo movimientos y muestra la causa.

## Verificación

```bash
npm run lint
npm run test:unit
npm run build
```
