# ✅ Guía de Configuración Final - Beauty Therapist

## 🎯 Estado Actual

He realizado los siguientes cambios en tu aplicación:

### ✅ Completado:

1. **Cuentas de Usuario Limpias**
   - ❌ Eliminada: maria@example.com / password123
   - ❌ Eliminada: elena@example.com / password123
   - ❌ Reemplazada: angela@angebae.com → **angebae@gmail.com / password123**
   - Solo se mantiene angebae@gmail.com en el sistema para tests

2. **Arreglado: Dashboard del Seller que se quedaba cargando**
   - Ahora expone correctamente `seller` y `buyer` en el contexto de autenticación
   - El dashboard debe cargar sin problemas después del login

3. **Migración de Productos Mock a Supabase**
   - ✅ Creado hook `use-products.ts` con fallback a datos locales
   - ✅ Actualizado: FeaturedProducts component
   - ✅ Actualizado: Shop page
   - ✅ Actualizado: Brands page
   - ✅ Actualizado: Seller products page
   - ✅ Actualizado: Seller dashboard
   - **Los datos vienen de Supabase cuando está disponible, fallback a datos locales**

4. **Script SQL para Supabase**
   - ✅ Creado `seed_products.sql` con todos los 8 productos
   - ✅ Incluye seller angebae@gmail.com
   - ✅ Incluye todas las imágenes y detalles

---

## 📋 Próximos Pasos (Manual)

### 1️⃣ **Ejecutar el Script SQL en Supabase**

Ve a tu dashboard de Supabase:

```
Supabase > Beauty Therapist Project > SQL Editor > New Query
```

**Copia y ejecuta el contenido de:**

- `supabase/seed_products.sql`

Este script:

- Crea el perfil de angebae@gmail.com
- Crea la marca AngeBae
- Inserta los 8 productos con todas sus imágenes
- Configura las categorías y precios correctamente

### 2️⃣ **Verificar Conexión a Supabase**

Asegúrate de que tu `.env.local` tiene:

```
NEXT_PUBLIC_SUPABASE_URL=https://cntumaksbvnfqscixyxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_sJggJG9A6JHa1srs1ThZHw_jHbMSeSS
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3️⃣ **Configuración de Mercado Pago**

Tu `.env.local` ya tiene:

```
NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-a6bd8b5a-667f-46b1-832f-490041584b22
MERCADOPAGO_ACCESS_TOKEN=TEST-8594693705475488-032717-40f5591ddf766f8f18bdd9058fdc5dee-1853433854
MERCADOPAGO_WEBHOOK_SECRET=b91df94d7958173a02fbae3ad6558e05091050ced2adc73c9f5d616821db2f67
MERCADOPAGO_INTEGRATOR_ID=1853433854
```

**Para PRODUCCIÓN, necesitas:**

- Cambiar claves de TEST a LIVE en Mercado Pago Dashboard
- Actualizar `.env.production`:
  ```
  NEXT_PUBLIC_MP_PUBLIC_KEY=LIVE-xxxxx
  MERCADOPAGO_ACCESS_TOKEN=LIVE-xxxxx
  MERCADOPAGO_WEBHOOK_SECRET=xxxxx
  ```

### 4️⃣ **Deploy a Vercel**

```bash
# 1. Sube los cambios a Git
git add .
git commit -m "Cleanup: Remove test accounts, Supabase integration, fix seller dashboard"
git push origin main

# 2. Vercel se deployará automáticamente
# O ve a https://vercel.com > Beauty Therapist > Redeploy

# 3. Agrega variables de entorno en Vercel:
# Settings > Environment Variables
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - NEXT_PUBLIC_MP_PUBLIC_KEY
# - MERCADOPAGO_ACCESS_TOKEN
# - MERCADOPAGO_WEBHOOK_SECRET
# - MERCADOPAGO_INTEGRATOR_ID
```

### 5️⃣ **Test de Login (Temporalmente Local)**

Para testing, usa:

- **Email:** angebae@gmail.com
- **Password:** password123
- **Role:** Seller

_Nota: Los datos se cargan desde Supabase si está conectado, sino de datos locales como fallback_

---

## 🔒 Seguridad Post-Production

Antes de hacer público:

1. **Deshabilitar Mercado Pago TEST:**
   - En `lib/mercadopago.ts`, cambiar claves a LIVE
   - Verificar que `auto_return` está habilitado

2. **Borrar Datos de Prueba en Supabase:**

   ```sql
   DELETE FROM products WHERE brand_id NOT IN (
     SELECT id FROM brands WHERE brand_slug = 'angebae'
   );
   ```

3. **Activar SSL en Vercel:**
   - Settings > Security > Force HTTPS ✅

4. **Configurar Webhook de Mercado Pago:**
   - En Mercado Pago Dashboard > Webhooks
   - URL: `https://tudominio.com/api/webhooks/mercadopago`

---

## 🧪 Checklist Final

- [ ] Script SQL ejecutado en Supabase
- [ ] Productos visibles en la tienda
- [ ] Login con angebae@gmail.com funciona
- [ ] Dashboard del seller carga sin ataques
- [ ] Mercado Pago en TEST funciona (checkout)
- [ ] Variables de entorno en Vercel configuradas
- [ ] Deploy en Vercel completado
- [ ] Tests en producción realizados
- [ ] Verificado en mobile

---

## 🆘 Troubleshooting

### Los productos no aparecen

- Verifica que el script SQL se ejecutó correctamente
- Revisa la consola de Supabase para errores

### Dashboard sigue cargando

- Limpia el localStorage: `localStorage.clear()`
- Verifica que `isAuthenticated` es true después del login

### Mercado Pago no funciona

- Verifica claves en .env.local
- Comprueba que los items tienen `unit_price` > 0

### Vercel dice "Build Failed"

- Verifica tipos TypeScript: `npm run type-check`
- Lee los logs de Vercel en detalle

---

## 📞 Contacto

Todos los cambios se han documentado en los archivos editados.
Revisa los comentarios en el código para más detalles.

**Archivos principales modificados:**

- `contexts/auth-context.tsx` - Cuentas de usuario
- `hooks/use-products.ts` - Nuevo hook para productos
- `supabase/seed_products.sql` - SQL para insertar datos
- Múltiples componentes - Uso del nuevo hook
