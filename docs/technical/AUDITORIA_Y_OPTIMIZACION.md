# 🔍 Walkthrough: Auditoría y Optimización de Código - PP360VE

Este documento es nuestra hoja de ruta para llevar el código de PP360VE a un nivel profesional y escalable.

---

## ✅ Completado (Ya Optimizado)

| Mejora | Estado | Detalle |
|--------|--------|---------|
| **Constantes Dispersas** | ✅ RESUELTO | Se eliminaron redundancias en `constants.tsx` y locales. |
| **Fuente de Verdad** | ✅ RESUELTO | Configuración centralizada en `config/site.ts`. |
| **Lógica de Comisiones** | ✅ RESUELTO | Implementación secuencial (PayPal -> Servicio). |
| **Dólar Paralelo** | ✅ RESUELTO | Todo el sistema usa el paralelo como base. |

---

## 🚨 Problemas Críticos (Hoja de Ruta)

### 1. 🏗️ Archivos Monolíticos (Mantenimiento Difícil)
> [!CAUTION]
> Estos archivos son demasiado grandes y deben ser divididos para evitar errores.

- **[dashboard-content.tsx](file:///Users/wilfredy/PP360VE/application/components/dashboard/dashboard-content.tsx)**: **1,512 líneas**.
  - 🛠️ **Plan**: Extraer `NewOrderForm` y `ProfileModal` a archivos independientes.
- **[exchange-calculator.tsx](file:///Users/wilfredy/PP360VE/application/components/features/exchange-calculator.tsx)**: **620 líneas**.
  - 🛠️ **Plan**: Separar lógica de estados de la UI.
- **[admin-dashboard.tsx](file:///Users/wilfredy/PP360VE/application/components/admin/admin-dashboard.tsx)**: **580 líneas**.
  - 🛠️ **Plan**: Extraer `OrderCard` a un componente reutilizable.

---

## 🛠️ Código Duplicado (Fase 1)

> [!IMPORTANT]
> Funciones que existen en múltiples archivos y deben centralizarse.

| Función | Ubicación Actual | Destino Propuesto |
|---------|------------------|-------------------|
| `getStatusColor()` | Dashboard, Admin | `lib/order-utils.ts` |
| `archiveOrder()` | Dashboard, Admin | `lib/order-utils.ts` |
| `formatCurrency()` | Múltiples | `lib/utils.ts` |

---

## 🚀 Plan de Ejecución Priorizado

### 📅 Paso 1: Centralización de Utilidades
- [ ] Crear `application/lib/order-utils.ts`.
- [ ] Mover lógica de visualización de estados.
- [ ] Eliminar código muerto.

### 📅 Paso 2: División del Dashboard
- [ ] Mover el Modal de Perfil a su propio archivo.
- [ ] Mover el Formulario de Órdenes a su propio archivo.

---

## 📈 Impacto Esperado
- **Estabilidad**: Menos riesgo al tocar archivos masivos.
- **Rapidez**: El editor cargará más rápido y será más fácil navegar.
- **Escalabilidad**: Listos para añadir Referidos y nuevos Métodos de Pago.

---

*Actualizado: 28 Dic 2025 - Antigravity AI (Plan de Optimización)*
