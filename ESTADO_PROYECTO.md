# PP360VE - Estado del Proyecto (23 Dic 2025)

## ✅ COMPLETADO HOY

### Guest Checkout
- [x] Crear orden sin cuenta (invitado)
- [x] Generar ticket ID único (P360-XXXX)
- [x] Validaciones: email, cédula, teléfono, WhatsApp
- [x] RLS policies configuradas en Supabase
- [x] Mínimo $5 USD (antes era $10)

### Admin Dashboard
- [x] Filtros: ALL, PENDING, VERIFYING, COMPLETED, CANCELLED, GUESTS, REGISTERED
- [x] Visualización de órdenes de invitados
- [x] Badge "GUEST" para identificar

### Carga de Comprobantes
- [x] Bucket `payment_proofs` creado en Supabase Storage
- [x] Botón "SUBIR COMPROBANTE" en pantalla de orden generada
- [x] API `/api/orders/upload-proof` para guardar URL
- [x] Visualización del comprobante en Admin (expandir orden)
- [ ] **PENDIENTE PROBAR**: Subir imagen real y verificar en admin

### Estructura del Proyecto
- [x] Limpieza de archivos duplicados
- [x] GitHub actualizado: https://github.com/Factotum-Digital/PP360V01

## 🔜 PRÓXIMOS PASOS

1. **Probar subida de comprobante** - Verificar flujo completo
2. **Notificaciones por Email** - Avisar al admin cuando hay nueva orden
3. **Vinculación automática** - Si un guest se registra y su email PayPal coincide, vincular órdenes
4. **Deploy a Vercel** - Verificar que producción funciona igual

## 📁 ARCHIVOS CLAVE

- `/Users/wilfredy/PP360VE/application/` - Código fuente Next.js
- Supabase: `gbqlvpceruyiburzlpjo`
- GitHub: `Factotum-Digital/PP360V01`
- Vercel: `pp360v01.vercel.app`

## 🔧 COMANDOS ÚTILES

```bash
cd /Users/wilfredy/PP360VE/application
npm run dev                    # Servidor local
git add -A && git commit -m "msg" && git push  # Subir cambios
```

## ⚠️ NOTAS IMPORTANTES

- El servidor `npm run dev` debe ejecutarse desde `/PP360VE/application/` (no desde la raíz)
- Las políticas RLS ya están configuradas en Supabase
- El bucket `payment_proofs` ya existe y es público
