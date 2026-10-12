// Shared template gallery categories.
// Kept in one place so both the Templates page and the app sidebar render the
// exact same list (and labels) without a circular import between them.

export const CATEGORY_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'ads-product', label: 'Ads & Product' },
  { id: 'brand-logo', label: 'Brand & Logo' },
  { id: 'video', label: 'Videos' },
  { id: 'illustration-3d', label: 'Illustration & 3D' },
  { id: 'posters-visuals', label: 'Posters & Visuals' },
  { id: 'portraits', label: 'Portraits' },
  { id: 'storyboard-characters', label: 'Storyboard & Characters' },
  { id: 'wallpaper', label: 'Wallpaper' },
]

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_OPTIONS.map((item) => [item.id, item.label]),
)
