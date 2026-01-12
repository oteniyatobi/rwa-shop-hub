export const PRODUCT_CATEGORIES = [
  { value: 'electronics', label: 'Electronics', icon: '📱' },
  { value: 'fashion', label: 'Fashion', icon: '👗' },
  { value: 'vehicles', label: 'Vehicles', icon: '🚗' },
  { value: 'home_garden', label: 'Home & Garden', icon: '🏠' },
  { value: 'services', label: 'Services', icon: '🔧' },
  { value: 'jobs', label: 'Jobs', icon: '💼' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏢' },
  { value: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { value: 'health_beauty', label: 'Health & Beauty', icon: '💄' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'babies_kids', label: 'Babies & Kids', icon: '👶' },
  { value: 'other', label: 'Other', icon: '📦' },
] as const;

export const RWANDA_LOCATIONS = [
  'Kigali',
  'Butare (Huye)',
  'Gisenyi (Rubavu)',
  'Ruhengeri (Musanze)',
  'Byumba (Gicumbi)',
  'Gitarama (Muhanga)',
  'Kibungo (Ngoma)',
  'Kibuye (Karongi)',
  'Cyangugu (Rusizi)',
  'Nyanza',
  'Rwamagana',
  'Kayonza',
  'Nyagatare',
  'Bugesera',
  'Other',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]['value'];
export type RwandaLocation = typeof RWANDA_LOCATIONS[number];
