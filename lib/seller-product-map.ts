/** Map DB row (+ joined brand + images) to the Product shape used in the storefront hook. */
export function mapDbProductToProduct(row: {
  id: string
  name_en: string
  name_es: string
  description_en: string | null
  description_es: string | null
  ingredients: string | null
  how_to_use: string | null
  price: number
  compare_at_price: number | null
  stock: number
  category: string
  status: string
  brands: { brand_name: string; brand_slug: string } | { brand_name: string; brand_slug: string }[] | null
  product_images?: { url: string; position: number | null; is_primary: boolean | null }[] | null
}) {
  const brand = Array.isArray(row.brands) ? row.brands[0] : row.brands
  const images = (row.product_images ?? [])
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((img) => img.url)

  return {
    id: row.id,
    name: row.name_en,
    nameEs: row.name_es,
    brand: brand?.brand_name ?? 'Marca',
    brandSlug: brand?.brand_slug ?? 'brand',
    category: row.category as 'skincare' | 'makeup',
    price: Number(row.price),
    comparePrice: row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    description: row.description_en ?? '',
    descriptionEs: row.description_es ?? '',
    ingredients: row.ingredients ?? '',
    howToUse: row.how_to_use ?? '',
    howToUseEs: row.how_to_use ?? '',
    images: images.length > 0 ? images : ['/placeholder.svg'],
    rating: 4.5,
    reviewCount: 0,
    stock: row.stock,
    status:
      row.status === 'draft'
        ? 'draft'
        : row.status === 'inactive'
          ? 'inactive'
          : 'active',
  }
}
