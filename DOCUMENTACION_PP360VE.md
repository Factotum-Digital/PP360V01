# PP360VE - Documentación del Proyecto

**Fecha de creación:** 23 de Diciembre de 2025  
**Autor:** Desarrollo con Antigravity AI  
**Versión:** 1.0.0

---

## 📋 Índice

1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Funcionalidades Implementadas](#funcionalidades-implementadas)
5. [Base de Datos](#base-de-datos)
6. [Autenticación](#autenticación)
7. [Panel de Administración](#panel-de-administración)
8. [Lógica de Tasas](#lógica-de-tasas)
9. [URLs y Accesos](#urls-y-accesos)
10. [Despliegue](#despliegue)
11. [Lo que Falta por Implementar](#lo-que-falta-por-implementar)
12. [Mejoras Sugeridas](#mejoras-sugeridas)

---

## 🎯 Resumen del Proyecto

**PP360VE** es una plataforma de intercambio de divisas (PayPal USD → Bolívares VES) con una interfaz de diseño **Brutalist Terminal** inspirada en terminales de trading profesionales.

### Características principales:
- Calculadora de intercambio en tiempo real
- Tasas dinámicas desde DolarAPI (paralelo y oficial)
- Sistema de autenticación completo
- Dashboard de usuario para gestionar órdenes
- Panel de administración para procesar órdenes

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Next.js** | 15.x | Framework React |
| **React** | 19.x | UI Library |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 4.x | Estilos |
| **Supabase** | Latest | Auth + Database |
| **Recharts** | Latest | Gráficos |
| **DolarAPI** | v1 | Tasas de cambio |
| **Vercel** | - | Hosting |

---

## 📁 Estructura del Proyecto

```
/Users/wilfredy/PP360VE/application/
├── app/
│   ├── admin/
│   │   └── page.tsx              # Panel de administración
│   ├── api/
│   │   └── rates/
│   │       └── route.ts          # API de tasas de cambio
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # Callback de autenticación
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard de usuario
│   ├── login/
│   │   └── page.tsx              # Página de login
│   ├── register/
│   │   └── page.tsx              # Página de registro
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página principal (landing)
├── components/
│   ├── admin/
│   │   └── admin-dashboard.tsx   # Componente del panel admin
│   ├── dashboard/
│   │   └── dashboard-content.tsx # Contenido del dashboard usuario
│   ├── features/
│   │   └── exchange-calculator.tsx # Calculadora de intercambio
│   ├── landing/
│   │   └── sections.tsx          # Secciones del landing
│   ├── layout/
│   │   ├── footer.tsx            # Footer
│   │   └── sidebar.tsx           # Sidebar (Terminal Info)
│   └── ui/
│       └── brutalist-system.tsx  # Sistema de diseño Brutalist
├── lib/
│   ├── services/
│   │   └── dolar-api.ts          # Servicio de DolarAPI
│   ├── supabase/
│   │   ├── client.ts             # Cliente Supabase (browser)
│   │   ├── server.ts             # Cliente Supabase (server)
│   │   ├── middleware.ts         # Middleware de sesión
│   │   └── database.types.ts     # Tipos de TypeScript para BD
│   ├── admin-config.ts           # Configuración de admins
│   └── utils.ts                  # Utilidades generales
├── config/
│   └── site.ts                   # Configuración del sitio
├── middleware.ts                 # Middleware de Next.js
├── .env.local                    # Variables de entorno (NO en git)
└── package.json                  # Dependencias
```

---

## ✅ Funcionalidades Implementadas

### 1. Landing Page (Página Principal)
- [x] Hero section con calculadora de intercambio
- [x] Gráfico histórico de tasas (simulado)
- [x] Panel de AI Market Intelligence
- [x] Logs en tiempo real (estilo terminal)
- [x] Sidebar con información del sistema
- [x] Diseño Brutalist Terminal

### 2. Calculadora de Intercambio
- [x] Input de monto en USD
- [x] Conversión automática a VES
- [x] Cálculo de comisión (5%)
- [x] Tasa dinámica desde DolarAPI
- [x] Fórmula: `Paralelo × 0.85` (15% descuento)

### 3. Sistema de Autenticación
- [x] Registro de usuarios con email
- [x] Login con email/password
- [x] Confirmación de email
- [x] Protección de rutas (middleware)
- [x] Logout

### 4. Dashboard de Usuario
- [x] Vista de órdenes propias
- [x] Estadísticas personales
- [x] Creación de nuevas órdenes
- [x] Formulario multi-paso (monto → datos → confirmación)
- [x] Historial de transacciones

### 5. Panel de Administración
- [x] Vista de TODAS las órdenes
- [x] Estadísticas globales
- [x] Filtrado por estado
- [x] Detalle expandible de cada orden
- [x] Cambio de estado (PENDING → VERIFYING → COMPLETED/CANCELLED)
- [x] Filtros por tipo de usuario (GUESTS / REGISTERED)
- [x] Identificación visual de órdenes de invitados
- [x] Protección solo para admin

### 6. Sistema de Invitados (Guest Checkout)
- [x] Creación de órdenes sin registro
- [x] Auto-vinculación de órdenes al registrarse (mismo email)
- [x] Vista simplificada de checkout

### 7. API de Tasas
- [x] Endpoint `/api/rates`
- [x] Obtiene tasas de DolarAPI
- [x] Calcula tasa de pago (paralelo - 15%)
- [x] Cache de 5 minutos

---

## 🗄️ Base de Datos

### Proveedor: Supabase

**URL:** `https://gbqlvpceruyiburzlpjo.supabase.co`

### Tablas

#### `exchange_rates`
```sql
CREATE TABLE exchange_rates (
  id SERIAL PRIMARY KEY,
  pair VARCHAR(50) NOT NULL,           -- ej: 'PAYPAL_TO_VES'
  rate DECIMAL(12,4) NOT NULL,         -- Tasa de referencia
  buy_price DECIMAL(12,4) NOT NULL,    -- Precio de compra
  sell_price DECIMAL(12,4) NOT NULL,   -- Precio de venta
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `exchange_orders`
```sql
CREATE TABLE exchange_orders (
  order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  amount_sent DECIMAL(12,2) NOT NULL,      -- Monto enviado (USD)
  currency_sent VARCHAR(20) DEFAULT 'USD_PAYPAL',
  amount_received DECIMAL(12,2) NOT NULL,  -- Monto recibido (VES)
  currency_received VARCHAR(20) DEFAULT 'VES',
  status VARCHAR(20) DEFAULT 'PENDING',    -- PENDING, VERIFYING, COMPLETED, CANCELLED
  payment_proof_url TEXT,                  -- URL del comprobante
  destination_data JSONB,                  -- {bank, phone, id_number}
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Usuarios ven solo sus órdenes
CREATE POLICY "Users can view own orders" ON exchange_orders
  FOR SELECT USING (auth.uid() = user_id);

-- Usuarios crean solo sus órdenes
CREATE POLICY "Users can insert own orders" ON exchange_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin ve todas las órdenes
CREATE POLICY "Admin can view all orders" ON exchange_orders
  FOR SELECT USING (auth.jwt() ->> 'email' = 'wilfredy54@gmail.com');

-- Admin actualiza todas las órdenes
CREATE POLICY "Admin can update all orders" ON exchange_orders
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'wilfredy54@gmail.com');
```

---

## 🔐 Autenticación

### Configuración de Supabase Auth

- **Email confirmación:** Habilitado
- **Redirect URL:** `https://pp360v01.vercel.app/auth/callback`

### Administradores

```typescript
// lib/admin-config.ts
export const ADMIN_EMAILS = [
  'wilfredy54@gmail.com',
];
```

Para agregar más admins, simplemente agrega emails a este array.

---

## 👨‍💼 Panel de Administración

### Acceso
- **URL:** `/admin`
- **Protección:** Solo usuarios en `ADMIN_EMAILS`

### Funcionalidades
1. **Estadísticas globales:** Total órdenes, pendientes, completadas, etc.
2. **Filtros:** Ver órdenes por estado
3. **Detalle de orden:** Expandir para ver banco, teléfono, cédula del cliente
4. **Acciones:** Cambiar estado de órdenes

### Estados de Orden
| Estado | Descripción |
|--------|-------------|
| `PENDING` | Orden creada, esperando pago |
| `VERIFYING` | Pago recibido, verificando |
| `COMPLETED` | Pago enviado al cliente |
| `CANCELLED` | Orden cancelada |

---

## 💱 Lógica de Tasas

### Fuente de Datos
**API:** https://ve.dolarapi.com/v1/dolares

### Fórmula de Pago
```
Tasa de Pago = Dólar Paralelo × 0.85
```

**Ejemplo:**
- Dólar Paralelo: 480.43 VES
- Tasa de Pago: 480.43 × 0.85 = **408.37 VES**

### Comisión
- **5%** sobre el monto enviado por el cliente

**Ejemplo de transacción:**
- Cliente envía: $100 USD
- Después de comisión: $95 USD
- Cliente recibe: $95 × 408.37 = **38,795 VES**

---

## 🔗 URLs y Accesos

### Producción
| Recurso | URL |
|---------|-----|
| **Sitio Principal** | https://pp360v01.vercel.app |
| **Login** | https://pp360v01.vercel.app/login |
| **Registro** | https://pp360v01.vercel.app/register |
| **Dashboard Usuario** | https://pp360v01.vercel.app/dashboard |
| **Panel Admin** | https://pp360v01.vercel.app/admin |

### Servicios
| Servicio | URL |
|----------|-----|
| **GitHub** | https://github.com/Factotum-Digital/PP360V01 |
| **Vercel Dashboard** | https://vercel.com/factotum-digitals-projects/pp360v01 |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/gbqlvpceruyiburzlpjo |

---

## 🚀 Despliegue

### Variables de Entorno (Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=https://gbqlvpceruyiburzlpjo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build de producción
npm run build

# Subir cambios a producción
git add .
git commit -m "descripción del cambio"
git push
# Vercel despliega automáticamente
```

---

## ❌ Lo que Falta por Implementar

### Alta Prioridad

1. **Subida de Comprobante de Pago**
   - Integrar Supabase Storage
   - Permitir al usuario subir imagen/PDF del pago PayPal
   - Mostrar comprobante en panel admin

2. **Notificaciones por Email**
   - Email cuando el usuario crea orden
   - Email cuando admin cambia estado
   - Usar Supabase Edge Functions o servicio externo (Resend, SendGrid)

3. **Verificación de Pago PayPal**
   - Integrar PayPal API para verificar transacciones
   - Validación automática de comprobantes

### Media Prioridad

4. **Historial de Tasas Real**
   - Guardar tasas históricas en base de datos
   - Gráfico con datos reales (no simulados)

5. **Búsqueda y Paginación**
   - Buscar órdenes por ID o email
   - Paginación en panel admin

6. **Perfil de Usuario**
   - Editar datos personales
   - Guardar datos de pago (banco, teléfono) por defecto

7. **Múltiples Métodos de Pago**
   - Zelle
   - Binance Pay
   - Criptomonedas

### Baja Prioridad

8. **Dashboard de Estadísticas**
   - Gráficos de volumen transaccional
   - Reportes exportables (CSV, PDF)

9. **Sistema de Referidos**
   - Códigos de referido
   - Comisiones por referido

10. **App Móvil**
    - PWA o React Native
    - Notificaciones push

11. **Soporte Multiidioma**
    - Inglés
    - Portugués

---

## 💡 Mejoras Sugeridas

### UX/UI
- [ ] Animaciones de transición entre páginas
- [ ] Modo oscuro/claro toggle
- [ ] Sonidos de terminal (opcional)
- [ ] Tutorial onboarding para nuevos usuarios

### Seguridad
- [ ] Rate limiting en API
- [ ] 2FA (Autenticación de dos factores)
- [ ] Logs de auditoría para admin
- [ ] Detección de fraude

### Performance
- [ ] Optimizar imágenes
- [ ] Lazy loading de componentes
- [ ] Service Worker para offline

### SEO
- [ ] Metatags dinámicos
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Open Graph images

---

## 📞 Contacto y Soporte

### Canales de Atención

- **WhatsApp:** [+1 (555) 774-5095](https://wa.me/15557745095) - Atención 24/7
- **Facebook:** [Grupo PP360VE](https://www.facebook.com/groups/paypal360ve)
- **Instagram:** [@paypal360ve](https://www.instagram.com/paypal360ve/)
- **Botón Flotante WhatsApp:** Disponible en todas las páginas con opciones de:
  - Chat Directo
  - Canal PP360VE

### Admin Principal
**Email:** wilfredy54@gmail.com

---

## 📝 Changelog

### v1.1.0 (23 Dic 2025 - Update Guest)
- ✅ Soporte completo para órdenes de Invitados (Guest)
- ✅ Auto-vinculación de órdenes guest al registrar usuario
- ✅ Filtros Admin: GUESTS vs REGISTERED
- ✅ Corrección de validación de teléfonos (+58)
- ✅ Fix crítico en Login page

### v1.0.0 (23 Dic 2025)
- ✅ Lanzamiento inicial
- ✅ UI Brutalist Terminal
- ✅ Calculadora de intercambio
- ✅ Sistema de autenticación
- ✅ Dashboard usuario
- ✅ Panel admin
- ✅ Despliegue en Vercel
- ✅ Footer con información de contacto (WhatsApp, Facebook, Instagram)
- ✅ Botón flotante de WhatsApp con animación

---

*Documentación generada con Antigravity AI*
https://www.facebook.com/groups/paypal360ve
https://www.instagram.com/paypal360ve/
 whatsapp: +1 (555) 774-5095
 boton flotante de whatsApp https://whatsapp.com/channel/0029Vb6gXXSFMqrY7mFbEi0K