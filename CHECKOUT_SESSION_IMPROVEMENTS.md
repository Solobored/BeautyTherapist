# Soluciones Implementadas - Julio 11, 2026

## 🔴 Problema 1: Error Mercado Pago OAuth "Invalid request parameters"

### Causa
Faltan dos variables de entorno en `.env.local`:
- `MERCADOPAGO_MARKETPLACE_CLIENT_ID` (vacía)
- `MERCADOPAGO_MARKETPLACE_CLIENT_SECRET` (vacía)

Sin estas credenciales, Mercado Pago rechaza la solicitud OAuth con error "Invalid request parameters".

### Solución
Agrega estas dos líneas a tu `.env.local`:

```env
MERCADOPAGO_MARKETPLACE_CLIENT_ID=YOUR_CLIENT_ID_HERE
MERCADOPAGO_MARKETPLACE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

**Cómo obtenerlas:**
1. Ve a https://www.mercadopago.com/developers/panel
2. En el menú lateral, ve a **Aplicaciones > Mis aplicaciones**
3. Crea una nueva aplicación (o usa una existente) de tipo **Integración**
4. Selecciona **OAuth** como tipo de autorización
5. Copia el `Client ID` y `Client Secret`
6. En **Configuración > URL de redirección**, asegúrate que esté:
   - `https://www.beautyandtherapy.com/api/seller/mercadopago/connect/callback`

Una vez configurado, el botón de conexión en el dashboard del vendedor funcionará correctamente.

---

## 🟢 Problema 2: Link de Checkout Muy Largo - Solución Implementada ✅

### Cambios Realizados

Se implementó un sistema de **tokens cortos y seguros** para las sesiones de checkout compartidas.

#### Migraciones de Base de Datos (New)
- **`supabase/migrations/20260711000000_shared_checkout_sessions.sql`**
  - Nueva tabla `shared_checkout_sessions` para almacenar sesiones con tokens cortos
  - Los tokens expiran automáticamente después de 7 días
  - Rastrea accesos y datos de sesión

#### Nuevos Endpoints API
1. **`POST /api/checkout/share`** - Genera un token corto y guarda la sesión
   - Recibe datos del formulario y carrito
   - Devuelve un token corto (~16 caracteres)
   - Devuelve una URL limpia: `https://www.beautyandtherapy.com/checkout?session=AbCdEfGhIjKlMnOp`

2. **`GET /api/checkout/load-session?token=TOKEN`** - Carga la sesión desde el token
   - Valida que el token exista y no esté expirado
   - Devuelve los datos de la sesión
   - Rastrea la cantidad de accesos

#### Cambios en el Checkout
- El formulario ahora soporta dos métodos de compartir:
  - **Nuevo (recomendado):** `?session=TOKEN_CORTO` ← URL limpia y profesional
  - **Antiguo (compatibilidad):** `?checkoutSession=ENCODED_JSON` ← Mantiene compatibilidad

#### Interfaz Mejorada
- El botón "Compartir link de compra" ahora:
  1. Envía los datos a `/api/checkout/share`
  2. Recibe un token corto
  3. Copia automáticamente una URL limpia al portapapeles
  4. Muestra un mensaje de éxito: "✓ Enlace copiado al portapapeles y listo para compartir"

### Flujo de Uso

**Vendedor (crea el link):**
1. Llena los datos del comprador en el checkout
2. Hace clic en **"Compartir link de compra"**
3. El sistema genera un token y copia la URL
4. Envía algo como: `https://www.beautyandtherapy.com/checkout?session=X9kL2mN5pQ7r`

**Comprador (abre el link):**
1. Abre el enlace compartido
2. Todos los datos vienen prellenados:
   - Carrito con productos
   - Dirección de envío
   - Región, comuna, tipo de entrega
   - Ubicación en el mapa
   - Cupón aplicado
3. Solo necesita revisar y hacer clic en "Completar compra"

### Ventajas
✅ URL corta y profesional (~50 caracteres vs ~2000 caracteres)  
✅ No parece malware o phishing  
✅ Más fácil de compartir por WhatsApp, SMS, email  
✅ Datos almacenados de forma segura en la base de datos  
✅ Expiración automática después de 7 días  
✅ Rastreo de cuántas veces se accedió  
✅ Compatible hacia atrás con URLs antiguas  

### Próximos Pasos
1. **Aplica la migración en Supabase:**
   ```bash
   # Ve a tu proyecto en Supabase
   # SQL Editor → New Query → Copia y ejecuta:
   ```
   (Ver contenido de `supabase/migrations/20260711000000_shared_checkout_sessions.sql`)

2. **Agrega las variables Mercado Pago OAuth** (ver Problema 1 arriba)

3. **Prueba:**
   - Entra a https://www.beautyandtherapy.com/checkout
   - Llena algunos datos
   - Hace clic en "Compartir link de compra"
   - Verifica que la URL sea corta y funcione

### Archivos Modificados
- `app/checkout/page.tsx` - Actualizado para cargar sesiones por token
- `app/api/checkout/share/route.ts` - Nuevo endpoint para generar tokens
- `app/api/checkout/load-session/route.ts` - Nuevo endpoint para cargar sesiones
- `supabase/migrations/20260711000000_shared_checkout_sessions.sql` - Nueva tabla
