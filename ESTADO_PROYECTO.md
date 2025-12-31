# PP360VE - Estado del Proyecto

**Última actualización:** 30 de Diciembre de 2025 (Seguridad y Datos del Usuario)
**Avance estimado:** ~88% (Core funcional + Exportación PDF/CSV + Refactorización Modular)

---

## ✅ COMPLETADO



### Funcionalidades Implementadas

| Funcionalidad | Descripción |
|---------------|-------------|
| **Landing Page** | Hero, calculadora, gráficos, sidebar, diseño Brutalist Terminal |
| **Calculadora** | Input USD, conversión VES, comisión INCLUIDA, tasa DolarAPI |
| **Autenticación** | Registro, login, logout, middleware, OAuth (Google, Facebook, Microsoft) |
| **Magic Link** | Login sin contraseña por email |
| **Forgot Password** | Recuperación de contraseña con modal |
| **Dashboard Usuario** | Órdenes, estadísticas, formulario multi-paso, historial |
| **Panel Admin** | Filtros, estadísticas, detalle órdenes, cambio estados |
| **Guest Checkout** | Órdenes sin registro, ticket ID (P360-XXXX), validaciones |
| **API de Tasas** | Endpoint `/api/rates`, DolarAPI, cache 5min, descuento 12% |
| **RLS Policies** | Seguridad configurada en Supabase (Incluye Update Policy para dueños) |
| **Verificación PayPal** | Integración automática API, Webhook simulado client-side, Auto-Verify |
| **Storage Bucket** | `payment-proofs` para comprobantes |
| **Filtros Admin** | ALL, PENDING, VERIFYING, COMPLETED, CANCELLED, GUESTS, REGISTERED |
| **Footer Contacto** | WhatsApp, Facebook, Instagram, botón flotante animado |
| **Grid Comets** | Fondo animado con estelas de energía |
| **Selector Método Pago** | Usuario registrado elige Pago Móvil o Transferencia Bancaria |
| **Gestión de Cuentas** | Guardado automático de datos bancarios (Pago Móvil/Transf) al crear orden |
| **UX Formulario** | Monto mínimo 5 USD, Layout Grid optimizado, Validaciones en tiempo real |
| **Teléfono Admin** | Visualización de teléfono en panel de administración para transferencias |
| **Perfil de Usuario Mejorado** | Modal con 3 secciones (Identificación, Métodos Pago, PayPal), 15 campos nuevos, validaciones en tiempo real, barra de progreso, códigos de país internacionales |
| **Cálculo Secuencial** | Lógica (PayPal -> Servicio), base en Dólar Paralelo, $100 = $82.98 netos, consistencia total 1 USD = Tasa Neta |
| **UI Dashboard Refinada** | Resultado blanco/grande (3xl), Tasa visible (+1px), Decimales fijos (2), Encabezado con Dólar Paralelo |
| **Limpieza de Constantes** | Centralización de tasas y comisiones en `SITE_CONFIG` (Resolución de "Scattered Constants") |
| **Sistema de Archivado** | Gestión de órdenes históricas (is_archived), filtros dinámicos y acciones admin/dashboard |
| **🆕 Refactorización Dashboard** | `dashboard-content.tsx` dividido en 4 archivos modulares (1505→390 líneas, -74%) |
| **🆕 Utilidades Centralizadas** | `order-utils.ts` con funciones compartidas (getStatusColor, archiveOrder, uploadProof) |
| **🆕 Optimización Rendimiento** | useMemo, useCallback, React.memo aplicados. IIFE eliminada. |
| **🆕 Búsqueda Admin** | Campo de búsqueda por ID, email o ticket en panel de administración |
| **🆕 Exportar Factura PDF** | Usuarios descargan factura profesional de su orden (desglose comisiones, logo, footer) |
| **🆕 Exportar CSV/PDF Admin** | Selección múltiple con checkboxes, exportación masiva o individual |

| **🆕 Seguridad de Datos** | Validación Server-Side en `/api/orders/create`, bloqueo de edición de campos críticos (ID, Banco, Tlf) si ya existen datos. |
| **🆕 Bloqueo Perfil** | UI de candado en `ProfileModal` y `NewOrderForm`, enlace "Solicitar Cambio" a WhatsApp. |
| **🆕 Mantenimiento** | Limpieza de código, corrección de errores de linter, fix de hidratación y manejo de errores estricto. |

### 🐞 Errores Críticos Resueltos

| Error | Causa | Solución |
|-------|-------|----------|
| **Fallo Verificación Automática PayPal** (Prod) | 1. `SUPABASE_SERVICE_ROLE_KEY` truncada en Vercel (faltaba "Y" final).<br>2. Usuarios GUEST sin sesión no podían actualizar con cookie-based client. | 1. Cambio a Service Role (bypass RLS).<br>2. Corrección de API key en Vercel.<br>3. Verificado para GUEST y registrados. |

### ⚠️ Notas de Desarrollo (Sandbox)

> Actualmente el proyecto está configurado para **PayPal Sandbox**. Los siguientes items son comportamiento esperado y NO son errores:
> - PayPal Planes: Funciona con cuenta sandbox
> - QR Codes: Apuntan a cuenta sandbox (`sb-43h8a33591630@business.example.com`)
> - `paypal-button.tsx`: Código legacy, puede eliminarse cuando se migre a producción

**📌 TODO para Producción:** Actualizar credenciales PayPal y QR codes cuando se migre a producción.

---

## 🔄 EN PROGRESO

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| **Subida Comprobantes** | 100% | UI y backend funcionales ✅ |
| **División de Monolitos** | ✅ 100% | `NewOrderForm`, `ProfileModal`, `OrderCard` extraídos |
| **Centralización Utilidades** | ✅ 100% | `lib/utils/order-utils.ts` creado |

### Cambios Recientes (28 Dic 2025)

#### Auditoría Previa (completada antes de refactor)
- [x] Lógica de cálculos secuenciales (PayPal -> Servicio) Auditada y Corregida.
- [x] Implementación de fee fijo de PayPal ($0.30) en todos los componentes.
- [x] Recalculo de montos en el servidor para órdenes de invitados.
- [x] Restauración de instrucciones de pago para usuarios registrados (Formato lista 1-4).
- [x] Visualización de Tasa Paralelo en tiempo real en Panel Admin (Header Terminal).

#### Refactorización Modular
- [x] Refactorización completa de `dashboard-content.tsx` (1505 → 390 líneas)
- [x] Extraído `new-order-form.tsx` (formulario nueva orden)
- [x] Extraído `profile-modal.tsx` (modal de perfil)
- [x] **Paginación Admin**: Implementada paginación server-side con URL parameters (20 items/page).
- [x] Creado `lib/utils/order-utils.ts` (funciones compartidas)
- [x] IIFE reemplazada por `useMemo` para filtrado de órdenes
- [x] `useCallback` aplicado a handlers
- [x] `React.memo` aplicado a OrderCard
- [x] Backup de seguridad: `backup-pre-refactor-2024-12-28`
- [x] **Sync BD**: Creada migración local `006_enhance_user_payment_data.sql` para sincronizar con producción
- [x] **Admin Dashboard Refactor**: `admin-dashboard.tsx` actualizado para usar `order-utils.ts` centralizado
- [x] **Corrección de Errores (30 Dic)**: Eliminación de variables no usadas (`isPagoMovilLocked`), limpieza de `any`, y corrección de hidratación.

### Auditoría de Código (30 Dic 2025)

**Estado General: ✅ Bueno** - El código está bien estructurado con buenas prácticas.

#### ✅ Aspectos Positivos
- Utilidades centralizadas en `order-utils.ts` (getStatusColor, archiveOrder, uploadProof)
- Configuración unificada en `config/site.ts` (comisiones, límites)
- Memoización correcta en `profile-modal.tsx`, `dashboard-content.tsx`, `new-order-form.tsx`
- Cálculos de tasas unificados en `rate-calculator.ts`

#### ⚠️ Mejoras Menores Identificadas
| Prioridad | Archivo | Problema |
|-----------|---------|----------|
| 🟡 | `profile-modal.tsx` | Faltan 3 dependencias en useCallback: `idPrefix`, `pagoMovilCedulaPrefix`, `whatsappSecondaryCode` |
| 🟢 | `admin-dashboard.tsx` | Cliente Supabase sin `useMemo` (línea 60) |
| 🟢 | `new-order-form.tsx` | WhatsApp `15557745095` hardcodeado |
| 🟢 | API guest | `pagos@pp360ve.com` hardcodeado |

**Sugerencia:** Mover contactos a `SITE_CONFIG.contact`

---

## 🔜 PENDIENTE (Priorizado según Análisis Saldoar)

### 🔴 Alta Prioridad (Crítico para Crecimiento)

| # | Funcionalidad | Descripción | Est. |
|---|---------------|-------------|------|
| 1 | ~~**Perfil de Usuario**~~ | ✅ COMPLETADO - Modal con 3 secciones, validaciones, progreso | ~~4h~~ |
| 2 | **Notificaciones Email** | Email al crear orden, email al cambiar estado | ~6h |
| 3 | **Modal Comprobantes Admin** | Ver comprobante en modal grande (actual abre en nueva pestaña) | ~2h |

### 🟡 Media Prioridad (Mejoras Operativas)

| # | Funcionalidad | Descripción | Est. |
|---|---------------|-------------|------|

| 7 | ~~**Búsqueda Admin**~~ | ✅ COMPLETADO - Buscar por ID/email/ticket con UI integrada | ~~3h~~ |
| 8 | ~~**Exportar CSV/PDF**~~ | ✅ COMPLETADO - Factura PDF para usuarios, CSV+PDF para admin con selección | ~~5h~~ |
| 9 | **Historial Tasas Real** | Guardar tasas en BD, gráfico con datos reales | ~4h |
| 10 | **🆕 Empty States** | Ilustraciones + CTA cuando no hay datos (estilo Saldoar) | ~3h |
| 11 | **Múltiples Métodos Pago** | Zelle, Binance Pay, PayPal | ~6h |

### 🟢 Baja Prioridad (Backlog)

| # | Funcionalidad | Descripción | Est. |
|---|---------------|-------------|------|
| 12 | **🆕 Sistema de Ofertas** | Marketplace de ofertas con filtros (estilo Saldoar) | ~15h |
| 13 | **🆕 Verificar PayPal (VCC)** | Venta de tarjetas virtuales para verificar PayPal | ~10h |
| 14 | **Estadísticas Dashboard** | Gráficos de volumen, reportes PDF | ~8h |
| 15 | **🆕 Centro de Ayuda** | Guías, FAQ, links a redes sociales | ~4h |
| 16 | **🆕 Términos y Condiciones** | Página `/terms` con T&C del servicio | ~1h |
| 17 | **🆕 Política de Privacidad** | Página `/privacy` con política de datos | ~1h |
| 18 | **PWA** | App móvil con notificaciones push | ~12h |
| 19 | **Multiidioma** | Soporte inglés/portugués | ~8h |
| 20 | **Modo Oscuro/Claro** | Toggle de tema | ~4h |
| 21 | **2FA** | Autenticación de dos factores | ~6h |
| 22 | **🆕 Sistema de Referidos** | Programa de 3 niveles (hasta $30 USD/referido), link compartible, panel de ganancias, retiros | ~22h |


### 🎨 Diseño UI/UX Pendiente

| # | Componente | Descripción | Referencia |
|---|------------|-------------|------------|
| 1 | **Panel de Referidos** | Widget ganancias + barra progreso + botones compartir | Saldoar |
| 2 | **Tabla de Referidos** | Estados visuales (Registrado → Activo → Completado) | Saldoar |
| 3 | **Empty States** | Ilustraciones animadas para secciones vacías | Saldoar |
| 4 | **Modal Agregar Cuenta** | Formulario por tipo de método (banco, cripto, wallet) | Saldoar |
| 5 | **Tarjetas de Ofertas** | Cards con logo, porcentaje, monto, botón acción | Saldoar |

---

## 📊 Resumen de Estimación

| Prioridad | Funcionalidades | Horas Estimadas |
|-----------|-----------------|-----------------|
| 🔴 Alta | 2 items (1 completado) | ~8 horas |
| 🟡 Media | 6 items | ~20 horas |
| 🟢 Baja | 11 items | ~99 horas |
| | **TOTAL** | **~127 horas** |

---

## 🔧 Estructura del Proyecto (Real + Pendientes)

```
/Users/wilfredy/PP360VE/
├── application/
│   ├── app/
│   │   ├── api/
│   │   │   ├── orders/
│   │   │   │   ├── guest/route.ts       ← Guest checkout API
│   │   │   │   └── upload-proof/route.ts ← Subida comprobantes
│   │   │   ├── rates/route.ts           ← Tasas DolarAPI
│   │   │   └── referrals/               ← ❌ PENDIENTE (No existe)
│   │   ├── admin/page.tsx               ← Panel admin
│   │   ├── auth/callback/               ← OAuth callback
│   │   ├── dashboard/page.tsx           ← Dashboard usuario
│   │   ├── login/page.tsx               ← Login + Forgot Password
│   │   ├── register/page.tsx            ← Registro
│   │   ├── terms/page.tsx               ← ❌ PENDIENTE (No existe)
│   │   ├── privacy/page.tsx             ← ❌ PENDIENTE (No existe)
│   │   ├── help/page.tsx                ← ❌ PENDIENTE (No existe)
│   │   ├── globals.css                  ← Estilos globales
│   │   ├── layout.tsx                   ← Layout principal
│   │   └── page.tsx                     ← Landing page
│   │
│   ├── components/
│   │   ├── admin/admin-dashboard.tsx    ← Panel admin completo
│   │   ├── dashboard/
│   │   │   ├── dashboard-content.tsx    ← Dashboard principal (390 líneas, refactorizado)
│   │   │   ├── new-order-form.tsx       ← 🆕 Formulario nueva orden (extraído)
│   │   │   └── profile-modal.tsx        ← 🆕 Modal de perfil (extraído)
│   │   ├── features/                    ← Cards de features
│   │   ├── landing/                     ← Componentes landing
│   │   ├── layout/
│   │   │   ├── footer.tsx               ← Footer con contactos
│   │   │   └── sidebar.tsx              ← Sidebar navegación
│   │   ├── ui/
│   │   │   ├── brutalist-system.tsx     ← Sistema de diseño
│   │   │   ├── grid-comets.tsx          ← Fondo animado
│   │   │   ├── icons.tsx                ← Iconos SVG
│   │   │   └── whatsapp-button.tsx      ← Botón flotante WA
│   │   └── referrals/                   ← ❌ PENDIENTE (No existe)
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                ← Cliente browser
│   │   │   ├── server.ts                ← Cliente server
│   │   │   ├── config.ts                ← Configuración central
│   │   │   ├── middleware.ts            ← Auth middleware
│   │   │   └── database.types.ts        ← Tipos TypeScript
│   │   ├── services/                    ← Servicios externos
│   │   ├── utils/
│   │   │   └── order-utils.ts           ← 🆕 Utilidades de órdenes (centralizado)
│   │   ├── admin-config.ts              ← Config admin
│   │   ├── utils.ts                     ← Utilidades generales
│   │   └── referrals/                   ← ❌ PENDIENTE (No existe)
│   │
│   ├── supabase/migrations/
│   │   ├── 003_guest_checkout.sql       ← Guest orders
│   │   ├── 004_storage_bucket.sql       ← Payment proofs
│   │   ├── 005_user_payment_data.sql    ← User payment data
EL 
│   │
│   ├── middleware.ts                    ← Next.js middleware
│   ├── constants.tsx                    ← Constantes globales
│   └── types.ts                         ← Tipos globales
```│
├── DOCUMENTACION_PP360VE.md
└── ESTADO_PROYECTO.md
```

---

## 🔗 Enlaces

| Recurso | URL |
|---------|-----|
| **Producción** | https://pp360v01.vercel.app |
| **GitHub** | https://github.com/Factotum-Digital/PP360V01 |
| **Supabase** | https://supabase.com/dashboard/project/gbqlvpceruyiburzlpjo |
| **Vercel** | https://vercel.com/factotum-digitals-projects/pp360v01 |
| **Referencia Saldoar** | https://saldo.com.ar/my/dashboard |

---

## ⚡ Comandos

```bash
cd /Users/wilfredy/PP360VE/application
npm run dev                                    # Dev server
git add -A && git commit -m "msg" && git push  # Deploy
```

---

## 📋 Plan de Implementación Disponible

Ver plan detallado del sistema de referidos en:
`~/.gemini/antigravity/brain/622ae1aa-fe97-4d27-bb1c-e19099685acf/implementation_plan.md`

### 🔍 Auditoría y Optimización
Para detalles sobre la refactorización de código y eliminación de monolitos, ver:
- [REPORTE_TECNICO.md](file:///Users/wilfredy/PP360VE/docs/technical/REPORTE_TECNICO.md) (Análisis profundo)
- [AUDITORIA_Y_OPTIMIZACION.md](file:///Users/wilfredy/PP360VE/docs/technical/AUDITORIA_Y_OPTIMIZACION.md) (Hoja de ruta ejecutable)
- [RESULTADOS_COMISIONES.md](file:///Users/wilfredy/PP360VE/docs/technical/RESULTADOS_COMISIONES.md) (Pruebas de la nueva lógica)

---

## 🔜 PENDIENTE (Menor Prioridad - Optimizaciones Opcionales)

| # | Funcionalidad | Descripción | Est. |
|---|---------------|-------------|------|
| P1 | **Consolidación Estados** | Agrupar 18 estados de NewOrderForm con useReducer | ~3h |
| P2 | **Webhook PayPal** | Redundancia para verificación de pagos | ~4h |


---

*Actualizado: 28 Dic 2025 - Antigravity AI (Refactorización Dashboard Modular)*

**Tags de Backup:**
- `backup-pre-refactor-2024-12-28` - Estado antes de la refactorización
