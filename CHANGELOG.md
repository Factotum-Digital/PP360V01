# Changelog - PP360VE

Registro de cambios, correcciones y mejoras del proyecto.

## [Unreleased]

## [2025-12-26]

### Bugs Críticos Corregidos
| # | Bug | Archivo | Estado |
|---|-----|---------|--------|
| 1 | Tasa 12% unificada en todo el sistema | `dashboard/page.tsx`, `api/rates/route.ts` | ✅ |
| 2 | Eliminado `"use server"` incorrecto | `api/orders/guest/route.ts` | ✅ |
| 3 | Campo `order.order_id` correcto | `api/orders/guest/route.ts` | ✅ |
| 4 | Tipos TypeScript completos (campos guest) | `lib/supabase/database.types.ts` | ✅ |
| 5 | Forgot Password con modal funcional | `app/login/page.tsx` | ✅ |
| 6 | Data Loss: Datos de pago se borraban al usar Pago Móvil | `dashboard-content.tsx` | ✅ |
| 7 | Validación: Cta. Bancaria requiere 20 dígitos | `dashboard-content.tsx` | ✅ |
| 8 | Refactor: Lógica de subida archivos duplicada | `dashboard-content.tsx` | ✅ |

### Problemas de UX Corregidos
| # | Problema | Ubicación | Estado |
|---|----------|-----------|--------|
| 1 | Navegación (ADMIN + LOGOUT) | Dashboard Usuario | ✅ |
| 2 | Link Admin visible para administradores | Dashboard Usuario | ✅ |
| 3 | Guarda `is_guest: false` + `exchange_rate` | `dashboard-content.tsx` | ✅ |
| 4 | Admin muestra email, tasa, badge GUEST/REGISTRADO | Panel Admin | ✅ |
| 5 | Botón WhatsApp "Contactar Cliente" | Panel Admin | ✅ |
| 6 | Visualización Método Pago (Badge + Datos) | Panel Admin | ✅ |
