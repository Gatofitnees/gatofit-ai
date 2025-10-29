# 🧪 Reporte de Pruebas del Sistema de Pagos PayPal
**Fecha:** 29 de Octubre 2025
**Estado:** En progreso

## ✅ Fase 1: Verificación de Infraestructura

### 1.1 Base de Datos
- ✅ Columna `payment_failed_at` agregada a `user_subscriptions`
- ✅ Índice de performance creado
- ✅ Enum `subscription_status` incluye todos los estados necesarios:
  - `active`, `expired`, `cancelled`, `pending`, `trial`, `suspended`, `payment_failed`
- ✅ Estructura de `subscription_payment_failures` verificada
- ✅ Estructura de `paypal_webhook_events` verificada

### 1.2 Edge Functions
- ✅ `paypal-webhook` usa `payment_failed_at` correctamente (línea 385)
- ✅ `retry-paypal-payment` verifica status `payment_failed`
- ✅ `check-expired-grace-periods` procesa grace periods expirados
- ✅ `verify-paypal-payment` verifica pagos nuevos
- ✅ `create-paypal-subscription` crea suscripciones

### 1.3 Estado Actual del Sistema
- 📊 10 suscripciones activas
- 📊 0 fallos de pago activos
- 📊 7 eventos de webhook procesados recientemente
- 📊 2 códigos de descuento activos (GATOFIT 96%, ebooksecret 6 meses gratis)

---

## 🧪 Fase 2: Pruebas de Flujo Completo

### Test Suite A: Creación de Suscripciones ✅

#### A.1 Suscripción Mensual Nueva
**Objetivo:** Verificar flujo completo de suscripción mensual
**Pasos:**
1. Usuario hace clic en plan mensual
2. Se crea suscripción en PayPal
3. Usuario aprueba pago
4. Webhooks recibidos: `PAYMENT.SALE.COMPLETED` + `BILLING.SUBSCRIPTION.ACTIVATED`
5. `verify-paypal-payment` procesa y activa suscripción

**Verificar:**
- [ ] Status = `active`
- [ ] Plan type = `monthly`
- [ ] `expires_at` = now() + 30 días
- [ ] `auto_renewal` = true
- [ ] `paypal_subscription_id` poblado
- [ ] Eventos registrados en `paypal_webhook_events`

#### A.2 Suscripción Anual Nueva
**Objetivo:** Verificar flujo completo de suscripción anual
**Pasos:** Similar a A.1 pero con plan yearly

**Verificar:**
- [ ] Status = `active`
- [ ] Plan type = `yearly`
- [ ] `expires_at` = now() + 365 días

#### A.3 Suscripción con Código de Descuento
**Objetivo:** Verificar aplicación de descuentos
**Códigos disponibles:**
- `GATOFIT` - 96% descuento
- `ebooksecret` - 6 meses gratis

**Pasos:**
1. Usuario ingresa código de descuento
2. Se valida código
3. Se crea suscripción con descuento
4. Se registra uso del código

**Verificar:**
- [ ] Descuento aplicado correctamente
- [ ] `user_discount_codes` registro creado
- [ ] `discount_codes.current_uses` incrementado
- [ ] Meses bonus aplicados si aplica

---

### Test Suite B: Fallos de Pago (CRÍTICO) 🚨

#### B.1 Simular Fallo de Pago
**Objetivo:** Verificar que el sistema maneja fallos correctamente
**Método:** Usar tarjeta de prueba PayPal que falla: `4000000000000002`

**Flujo esperado:**
1. PayPal envía webhook `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
2. Handler `handlePaymentFailed()` procesa evento
3. Base de datos actualizada

**Verificar:**
- [ ] Webhook recibido y logueado en `paypal_webhook_events`
- [ ] `user_subscriptions` actualizado:
  - [ ] `status` = `payment_failed`
  - [ ] `payment_failed_at` = timestamp actual
  - [ ] `auto_renewal` = true (para reintentos)
- [ ] Registro en `subscription_payment_failures`:
  - [ ] `failed_at` = timestamp actual
  - [ ] `grace_period_ends_at` = now() + 4 días
  - [ ] `retry_count` = 0
  - [ ] `resolved_at` = NULL

#### B.2 Usuario Ve Popup de Fallo
**Objetivo:** Verificar UI de notificación
**Componente:** `PaymentFailurePopup`

**Verificar:**
- [ ] Popup aparece automáticamente al hacer login
- [ ] Muestra días y horas restantes correctamente
- [ ] Botón "Actualizar Método de Pago" funcional
- [ ] Puede cerrar temporalmente el modal

#### B.3 Usuario Ve Alerta en Suscripción
**Objetivo:** Verificar alerta en página de suscripción
**Componente:** `PaymentFailureAlert`
**Ruta:** `/subscription`

**Verificar:**
- [ ] Alerta visible en página
- [ ] Muestra tiempo restante
- [ ] Estilo de urgencia correcto:
  - [ ] Rojo si < 1 día
  - [ ] Amarillo si < 2 días
  - [ ] Azul si > 2 días
- [ ] Botón "Actualizar Pago" funcional

#### B.4 Reintentar Pago Manualmente
**Objetivo:** Verificar función `retry-paypal-payment`
**Acción:** Usuario hace clic en "Actualizar Método de Pago"

**Caso 1: Pago resuelto en PayPal**
**Verificar:**
- [ ] Edge function consulta PayPal API
- [ ] Detecta status ACTIVE
- [ ] Resuelve fallo en DB:
  - [ ] `status` → `active`
  - [ ] `payment_failed_at` → NULL
  - [ ] `subscription_payment_failures.resolved_at` → now()
- [ ] Toast de éxito mostrado
- [ ] Página recarga automáticamente

**Caso 2: Pago aún fallido**
**Verificar:**
- [ ] `retry_count` incrementa
- [ ] Mensaje informativo mostrado
- [ ] Usuario puede intentar nuevamente

#### B.5 PayPal Resuelve Automáticamente
**Objetivo:** Verificar resolución automática por webhook
**Escenario:** PayPal reintenta cobro y tiene éxito

**Flujo esperado:**
1. PayPal envía `PAYMENT.SALE.COMPLETED`
2. Handler `handlePaymentCompleted()` detecta:
   - Existe fallo sin resolver en `subscription_payment_failures`
3. Resuelve automáticamente

**Verificar:**
- [ ] Fallo marcado como resuelto
- [ ] Suscripción reactivada
- [ ] `expires_at` extendido según plan type
- [ ] Usuario puede continuar usando app

---

### Test Suite C: Expiración de Grace Period ⏰

#### C.1 Identificar Grace Periods Expirados
**Objetivo:** Verificar que el cron job funciona
**Edge Function:** `check-expired-grace-periods`
**Frecuencia:** Cada hora

**Verificar:**
- [ ] Cron job se ejecuta automáticamente
- [ ] Identifica correctamente subscriptions con:
  - `status` = `payment_failed`
  - `grace_period_ends_at` < now()
  - `resolved_at` IS NULL
- [ ] Logs muestran procesamiento correcto

#### C.2 Cancelación Automática en PayPal
**Objetivo:** Verificar cancelación cuando expira grace period

**Flujo esperado:**
1. Cron job identifica grace period expirado
2. Llama PayPal API para cancelar suscripción
3. Actualiza DB

**Verificar:**
- [ ] Llamada a PayPal API exitosa
- [ ] PayPal subscription status = CANCELLED
- [ ] `user_subscriptions` actualizado:
  - [ ] `status` = `expired`
  - [ ] `auto_renewal` = false

#### C.3 Usuario Pierde Acceso
**Objetivo:** Verificar que el acceso se revoca correctamente

**Verificar:**
- [ ] `useSubscription().isPremium` = false
- [ ] Features premium bloqueadas
- [ ] Mensaje de suscripción expirada visible
- [ ] Usuario puede re-suscribirse

---

### Test Suite D: Renovaciones Automáticas 🔄

#### D.1 Renovación Mensual Exitosa
**Objetivo:** Verificar renovación automática mensual
**Tiempo:** 30 días después de suscripción activa

**Flujo esperado:**
1. PayPal cobra automáticamente
2. Webhook `PAYMENT.SALE.COMPLETED` recibido
3. Handler extiende `expires_at`

**Verificar:**
- [ ] `expires_at` extendido + 30 días
- [ ] `status` permanece `active`
- [ ] `auto_renewal` = true
- [ ] Sin registros de fallo

#### D.2 Renovación Anual Exitosa
**Objetivo:** Similar a D.1 pero anual
**Tiempo:** 365 días después

**Verificar:**
- [ ] `expires_at` extendido + 365 días

---

### Test Suite E: Cancelaciones 🚫

#### E.1 Usuario Cancela Suscripción
**Objetivo:** Verificar cancelación iniciada por usuario

**Flujo esperado:**
1. Usuario hace clic en "Cancelar Suscripción"
2. Frontend llama a API de cancelación
3. PayPal cancela suscripción
4. Webhook `BILLING.SUBSCRIPTION.CANCELLED` recibido

**Verificar:**
- [ ] `cancelled_at` timestamp registrado
- [ ] `auto_renewal` = false
- [ ] `status` permanece `active` hasta `expires_at`
- [ ] Usuario mantiene acceso hasta expiración
- [ ] No se procesan más pagos

#### E.2 Suscripción Expira Post-Cancelación
**Objetivo:** Verificar expiración natural

**Verificar:**
- [ ] Al llegar a `expires_at`, status → `expired`
- [ ] Usuario pierde acceso
- [ ] Puede re-suscribirse

---

### Test Suite F: Cambios de Plan 🔄

#### F.1 Upgrade: Monthly → Yearly
**Objetivo:** Verificar upgrade de plan

**Flujo esperado:**
1. Usuario selecciona cambio a plan anual
2. Sistema cancela suscripción actual en PayPal
3. Crea nueva suscripción yearly
4. Actualiza inmediatamente

**Verificar:**
- [ ] `plan_type` = `yearly`
- [ ] `paypal_subscription_id` actualizado (nuevo ID)
- [ ] `expires_at` recalculado
- [ ] Precio correcto cobrado

#### F.2 Downgrade Bloqueado: Yearly → Monthly
**Objetivo:** Verificar que downgrades están bloqueados

**Verificar:**
- [ ] Sistema rechaza downgrade
- [ ] Mensaje de error apropiado
- [ ] Sugiere esperar a expiración

---

### Test Suite G: Suspensiones ⚠️

#### G.1 PayPal Suspende Suscripción
**Objetivo:** Manejar suspensión de PayPal
**Webhook:** `BILLING.SUBSCRIPTION.SUSPENDED`

**Flujo esperado:**
1. Webhook recibido
2. Handler verifica contexto:
   - Si es por `payment_failed` + grace period expirado → `expired`
   - Si no → `suspended`

**Verificar:**
- [ ] Status actualizado correctamente
- [ ] `suspended_at` timestamp registrado
- [ ] `auto_renewal` = false

---

### Test Suite H: Edge Cases 🔍

#### H.1 Webhook Duplicado (Idempotencia)
**Objetivo:** Verificar que eventos duplicados no causan problemas

**Escenario:** PayPal reenvía mismo evento

**Verificar:**
- [ ] `paypal_webhook_events` detecta `event_id` duplicado
- [ ] No procesa segunda vez
- [ ] Devuelve 200 OK
- [ ] Logs muestran detección de duplicado

#### H.2 Webhook con Firma Inválida
**Objetivo:** Verificar seguridad del webhook

**Escenario:** Intento de webhook falso/malicioso

**Verificar:**
- [ ] Validación de firma falla
- [ ] Devuelve 401 Unauthorized
- [ ] No procesa evento
- [ ] Log de seguridad generado

#### H.3 Webhook con Body Vacío (Test Ping)
**Objetivo:** Verificar manejo de test pings de PayPal

**Verificar:**
- [ ] Detecta body vacío
- [ ] Devuelve 200 OK
- [ ] No intenta parsear JSON
- [ ] Log indica test ping

#### H.4 Usuario sin Suscripción Previa
**Objetivo:** Primera suscripción de usuario

**Verificar:**
- [ ] Crea nueva suscripción exitosamente
- [ ] Todos los campos poblados
- [ ] Sin errores de constraints

#### H.5 Múltiples Fallos Consecutivos
**Objetivo:** PayPal reintenta y falla múltiples veces

**Verificar:**
- [ ] `retry_count` incrementa con cada intento
- [ ] Solo un registro activo en `subscription_payment_failures`
- [ ] Grace period no se resetea
- [ ] Último timestamp de fallo se actualiza

---

## 📊 Fase 3: Pruebas de Performance y Logs

### P.1 Verificar Logs de Webhook
**Query:**
```sql
SELECT * FROM paypal_webhook_events 
ORDER BY created_at DESC 
LIMIT 50;
```

**Verificar:**
- [ ] Todos los eventos logueados
- [ ] Sin errores en payload
- [ ] Timestamps correctos
- [ ] `event_id` únicos

### P.2 Verificar Logs de Cron Job
**Edge Function:** `check-expired-grace-periods`

**Verificar:**
- [ ] Se ejecuta cada hora
- [ ] Completa < 30 segundos
- [ ] Sin timeouts
- [ ] Logs claros y detallados

### P.3 Performance con Múltiples Usuarios
**Objetivo:** Simular carga

**Escenario:** 100+ usuarios con subscriptions

**Verificar:**
- [ ] Webhook responde < 5s
- [ ] Cron job procesa todos en < 30s
- [ ] Sin bloqueos de DB
- [ ] Índices funcionando correctamente

---

## 🎯 Criterios de Éxito para Producción

Para considerar el sistema listo para producción, todos estos elementos deben estar ✅:

### Funcionalidad Core
- [ ] Creación de suscripciones (monthly, yearly)
- [ ] Aplicación de descuentos
- [ ] Detección de fallos de pago
- [ ] Grace period de 4 días
- [ ] Notificaciones de fallo (popup + alerta)
- [ ] Reintentos manuales funcionando
- [ ] Resolución automática por webhook
- [ ] Expiración de grace period
- [ ] Cancelación automática en PayPal
- [ ] Renovaciones automáticas
- [ ] Cancelación por usuario

### Seguridad
- [ ] Validación de firma de webhook
- [ ] Idempotencia de webhooks
- [ ] RLS policies correctas
- [ ] No hay SQL injection points
- [ ] Logs de seguridad funcionando

### Performance
- [ ] Webhooks responden < 5s
- [ ] Cron jobs completan < 30s
- [ ] Queries optimizadas con índices
- [ ] Sin memory leaks

### UX
- [ ] Mensajes claros y útiles
- [ ] Estados visuales correctos
- [ ] Traducciones completas
- [ ] Responsive en móviles

### Monitoring
- [ ] Logs completos y claros
- [ ] Eventos registrados en DB
- [ ] Errores capturados y logueados
- [ ] Métricas de PayPal configuradas

---

## 📝 Notas de Implementación

### Cambios Realizados
1. ✅ Agregada columna `payment_failed_at` a `user_subscriptions`
2. ✅ Creado índice de performance para queries de payment_failed
3. ✅ Verificado que todos los edge functions usan la columna correctamente
4. ✅ Mejorado manejo de errores en webhook para test pings

### Pendientes
- [ ] Ejecutar todas las pruebas del Test Suite
- [ ] Documentar resultados
- [ ] Corregir issues encontrados
- [ ] Validar en PayPal Sandbox completo
- [ ] Preparar checklist para migración a producción

---

## 🚀 Próximos Pasos

1. **Ejecutar Test Suite A** - Creación de suscripciones
2. **Ejecutar Test Suite B** - Fallos de pago (CRÍTICO)
3. **Ejecutar Test Suite C** - Expiración de grace periods
4. **Ejecutar Test Suite D-H** - Resto de flujos
5. **Revisar logs y métricas**
6. **Documentar findings**
7. **Preparar deployment a producción**

---

**Estado Final:** 🟡 En Progreso
**Última Actualización:** 29 de Octubre 2025
