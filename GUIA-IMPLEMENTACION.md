# Rediseño del dashboard del seller + SEO — Guía de implementación

Esta carpeta tiene la MISMA estructura que tu proyecto. Copia cada archivo en su misma ruta (reemplaza los existentes).

## 1. Antes de copiar
- Haz un commit o una rama: `git checkout -b rediseno-dashboard-seller`
- Archivos que se REEMPLAZAN (ya existían): app/seller/dashboard/page.tsx, app/api/seller/orders/route.ts,
  app/layout.tsx, app/robots.ts, app/sitemap.ts, app/brands/[brand]/layout.tsx, lib/seo.ts, lib/site-url.ts,
  components/mobile-bottom-nav.tsx, components/skin-analysis/maien-floating-assistant.tsx
- Archivos NUEVOS: components/seller/dashboard/*, lib/seller-finance.ts, app/api/seller/finance/costs/route.ts,
  supabase/migrations/20261029000000_product_cost_price.sql, __tests__/seller-finance.test.ts

## 2. Base de datos (obligatorio para ver costos y margen)
Ejecuta la migración en Supabase (SQL Editor, o `npm run db:push`):
    supabase/migrations/20261029000000_product_cost_price.sql
Agrega la columna `products.cost_price`. Sin ella el dashboard funciona, pero no puede guardar costos
(el API te mostrará un aviso claro). Verifica además que tengas aplicada la migración 20260710000000 (comisión del marketplace).

## 3. Variables de entorno (Vercel → Settings → Environment Variables)
- NEXT_PUBLIC_APP_URL = https://TU-DOMINIO.cl   ← MUY IMPORTANTE para SEO (canonical, sitemap, JSON-LD)
- NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION = (código que te da Google Search Console)
- NEXT_PUBLIC_BING_SITE_VERIFICATION = (opcional, Bing Webmaster)
Luego haz Redeploy.

## 4. Probar en local
    npm install
    npm run dev
    npx jest __tests__/seller-finance.test.ts --coverage=false
Entra a /seller/dashboard. Navegación por URL: ?s=resumen | ventas | finanzas | costos | categorias | destacados | videos | cupones | resenas | mi-marca | envios

## 5. Primer uso de Finanzas
1. Ve a **Costos** y escribe el costo unitario de cada producto → Guardar.
2. En **Costos** ajusta la "comisión de pago" a la tarifa real de tu cuenta de Mercado Pago (por defecto 3,5 %, es una estimación).
3. Revisa **Finanzas**: estado de resultados, utilidad y margen por producto.

## 6. SEO — pasos que NO se pueden hacer con código
1. Entra a https://search.google.com/search-console → agrega tu dominio → verifica con el código del paso 3.
2. En "Sitemaps" envía: https://TU-DOMINIO.cl/sitemap.xml
3. En "Inspección de URL" pide indexar la home, /shop y la página de cada marca.
4. Haz lo mismo en Bing Webmaster Tools (puedes importar desde Search Console).
5. Crea/completa tu ficha de Google Business Profile si aplica y enlaza tus redes (Instagram/TikTok) con la web.
El código mejora que Google entienda y muestre bien tu sitio, pero ninguna implementación garantiza posición en los resultados.

## 7. Verificación SEO después del deploy
- https://TU-DOMINIO.cl/robots.txt y /sitemap.xml deben mostrar tu dominio (no *.vercel.app).
- Prueba una marca en https://search.google.com/test/rich-results (debe detectar Brand/CollectionPage/BreadcrumbList).
