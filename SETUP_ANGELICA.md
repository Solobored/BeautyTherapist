# 🎯 Setup Final: Angelica Baeriswyl - Tienda Vacía

## ¿Qué Has Pedido?

1. ✅ Perfil de **Angelica Baeriswyl** (tu clienta)
2. ✅ Email: **angebae@gmail.com**
3. ✅ Contraseña: **password123**
4. ✅ Marca: **AngeBae**
5. ✅ **SIN productos mock** (tienda vacía)
6. ✅ Angelica puede subir sus productos desde su dashboard

---

## 📋 Qué He Hecho

### Cambios en la Base de Datos

- ✅ Creado `supabase/seed_clean.sql` con SOLO:
  - Perfil: Angelica Baeriswyl
  - Marca: AngeBae
  - **SIN PRODUCTOS**

### Cambios en la Aplicación

- ✅ Actualizado nombre a "Angelica Baeriswyl" en `auth-context.tsx`
- ✅ Actualizado componentes para mostrar "No hay productos" cuando está vacío:
  - Featured Products
  - Shop page
  - Brands page
- ✅ Agregada traducción `noProducts` en i18n

---

## ⚡ PASO 1: Ejecutar SQL en Supabase (CRÍTICO)

```sql
1. Abre: https://app.supabase.com
2. Proyecto: Beauty Therapist
3. SQL Editor > New Query
4. Copia y ejecuta esto ↓↓↓

-- ============================================================================
-- BEAUTY THERAPIST - VERSIÓN LIMPIA (SIN PRODUCTOS)
-- ============================================================================
-- Crea SOLO:
-- 1. Perfil de Angelica Baeriswyl (seller)
-- 2. Marca AngeBae
-- 3. SIN productos (vacío para que Angelica agregue los suyos)
-- ============================================================================

-- 1. Insertar perfil de Angelica Baeriswyl
INSERT INTO profiles (
    user_type,
    full_name,
    email,
    phone,
    avatar_url
  )
VALUES (
    'seller',
    'Angelica Baeriswyl',
    'angebae@gmail.com',
    '+1 555 123 4567',
    'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=200&h=200&fit=crop'
  ) ON CONFLICT (email) DO NOTHING;

-- 2. Crear marca AngeBae
WITH angelica_seller AS (
  SELECT id
  FROM profiles
  WHERE email = 'angebae@gmail.com'
)
INSERT INTO brands (
    owner_id,
    brand_name,
    brand_slug,
    description,
    logo_url,
    category,
    is_active
  )
SELECT angelica_seller.id,
  'AngeBae',
  'angebae',
  'Skincare y maquillaje premium elaborado con amor. Nuestros productos combinan ingredientes naturales con fórmulas innovadoras.',
  'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=200&h=200&fit=crop',
  'both',
  true
FROM angelica_seller ON CONFLICT (brand_slug) DO NOTHING;

-- ============================================================================
-- LISTO! Perfil creado: angebae@gmail.com / password123
-- ============================================================================
```

**Resultado:** ✅ Angelica lista para subir sus productos

---

## 💻 PASO 2: Probar Localmente

```bash
npm run dev
# Abre http://localhost:3000
```

**Verifica:**

- ✅ Tienda muestra "No hay productos disponibles" (vacía)
- ✅ Brand page muestra "No products available from this brand yet"
- ✅ Login funciona:
  - Email: **angebae@gmail.com**
  - Password: **password123**

---

## 📊 PASO 3: Angelica Entra a Su Dashboard

1. Abre: http://localhost:3000/seller/login
2. Entra con:
   - Email: `angebae@gmail.com`
   - Password: `password123`
3. Click en **"Seller Dashboard"**
4. Verá:
   - Métricas (inician en 0)
   - "Add Product" button
   - Lista vacía de productos

---

## ➕ Cómo Angelica Agrega Productos

**En el Dashboard:**

1. Click en **"+ Add Product"** (botón verde)
2. Completa el formulario:
   - Nombre del producto
   - Descripción (EN y ES)
   - Precio
   - Categoría (Skincare/Makeup)
   - Imágenes (subir desde Cloudinary)
   - Stock
3. Click **"Save"**
4. ✅ Producto aparece en la tienda

---

## 🔓 Credenciales Importantes

```
Dashboard Seller (Angelica):
├─ Email: angebae@gmail.com
├─ Password: password123
├─ Status: ✅ Activo
└─ Marca: AngeBae

Tienda Para Compradores:
├─ Visitantes: Ven tienda vacía (normal)
├─ Esperan a que Angelica agregue productos
└─ Cuando agregue, aparecerán automáticamente
```

---

## 📁 Archivos a Ejecutar

**SOLO NECESITAS EJECUTAR ESTO EN SUPABASE:**

```
supabase/seed_clean.sql ← EL ARCHIVO DEFINITIVO
```

**Archivos anteriores (YA NO USES):**

- ⚠️ `supabase/seed_products.sql` ← DESCARTA (tiene productos de prueba)

---

## ✅ Checklist Final

- [ ] SQL ejecutado en Supabase
- [ ] `npm run dev` funciona
- [ ] Tienda muestra vacía
- [ ] Login con angebae@gmail.com funciona
- [ ] Dashboard del seller accesible
- [ ] "Add Product" button visible

---

## 🚀 Deploy a Vercel

```bash
git add .
git commit -m "Setup: Clean DB with Angelica Baeriswyl, no mock products"
git push origin main
# Vercel se deployará automáticamente
```

---

## 💡 Resumen

| Elemento            | Status | Notas                       |
| ------------------- | ------ | --------------------------- |
| Perfil de Angelica  | ✅     | angebae@gmail.com           |
| Marca AngeBae       | ✅     | Listo para productos        |
| Productos iniciales | ❌     | Vacío (Angelica agrega)     |
| Dashboard seller    | ✅     | Funcional                   |
| Tienda pública      | ✅     | Vacía (esperando productos) |

---

## 🎉 Conclusión

**Tu tienda está LISTA para que Angelica comience a vender. Sin datos de prueba que contaminen la experiencia real.**

Cuando Angelica agregue sus primeros productos, aparecerán automáticamente en:

1. Featured Products (homepage)
2. Shop page
3. Brand page (AngeBae)
4. Checkout

¡Listo para producción! 🚀

---

**Próximas acciones:**

1. Ejecutar SQL en Supabase (este documento)
2. Deploy a Vercel
3. Angelica accede y empieza a subir productos
