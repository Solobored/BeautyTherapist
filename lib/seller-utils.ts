/** Slug alineado con `brands.brand_slug` (ej. AngeBae → angebae). */
export function brandNameToSlug(brandName: string): string {
  return brandName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}
