# 🚀 INSTRUCCIONES - Todo en 3 Pasos Simples

## PASO 1: Ejecutar SQL en Supabase (Copy-Paste)

### 1.1 Abre Supabase
```
🔗 https://app.supabase.com
```

### 1.2 Selecciona Proyecto
```
Beauty Therapist
```

### 1.3 Abre SQL Editor
```
SQL Editor > New Query
```

### 1.4 Copia TODO ESTO Y EJECUTA:

```sql
-- Crear perfil de Angelica Baeriswyl
INSERT INTO profiles (user_type, full_name, email, phone, avatar_url)
VALUES (
    'seller',
    'Angelica Baeriswyl',
    'angebae@gmail.com',
    '+1 555 123 4567',
    'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=200&h=200&fit=crop'
) ON CONFLICT (email) DO NOTHING;

-- Crear marca AngeBae
WITH angelica_seller AS (
  SELECT id FROM profiles WHERE email = 'angebae@gmail.com'
)
INSERT INTO brands (owner_id, brand_name, brand_slug, description, logo_url, category, is_active)
SELECT 
    angelica_seller.id,
    'AngeBae',
    'angebae',
    'Skincare y maquillaje premium elaborado con amor',
    'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=200&h=200&fit=crop',
    'both',
    true
FROM angelica_seller ON CONFLICT (brand_slug) DO NOTHING;
```

**Resultado:** ✅ `Query executed successfully`

---

## PASO 2: Verificar Localmente

```bash
npm run dev
```

**Abre el navegador:**
```
http://localhost:3000
```

**Verifica que ves:**
- ✅ Tienda vacía (dice "No hay productos disponibles")
- ✅ Brand page de AngeBae también vacía

---

## PASO 3: Login como Angelica

### URL del login
```
http://localhost:3000/seller/login
```

### Credenciales
```
Email: angebae@gmail.com
Password: password123
```

### Click en Dashboard
```
Presiona "Seller Dashboard" después de login
```

**Resultado:** ✅ Dashboard de Angelica (vacío, esperando que agregue productos)

---

## 🎯 LISTO

Tu tienda está PREPARADA para que **Angelica Baeriswyl** agregue sus productos.

### Cuando Angelica agregue su primer producto:
1. Aparecerá en "Featured Products"
2. Aparecerá en la tienda (/shop)
3. Aparecerá en su brand page
4. Los clientes podrán comprar

---

## ⚠️ Importante: NUNCA Uses Esto

❌ **NO ejecutes `seed_products.sql`** (tiene 8 productos mock)

✅ **USA SOLO `seed_clean.sql`** (limpio, solo Angelica)

---

**¡Listo! Ya puedes hacer push a Vercel. 🚀**
