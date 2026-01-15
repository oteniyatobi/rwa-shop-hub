export const PRODUCT_CATEGORIES = [
  { value: 'electronics', label: 'Electronics', icon: 'Smartphone' },
  { value: 'fashion', label: 'Fashion', icon: 'Shirt' },
  { value: 'vehicles', label: 'Vehicles', icon: 'Car' },
  { value: 'home_garden', label: 'Home & Garden', icon: 'Home' },
  { value: 'services', label: 'Services', icon: 'Wrench' },
  { value: 'jobs', label: 'Jobs', icon: 'Briefcase' },
  { value: 'real_estate', label: 'Real Estate', icon: 'Building2' },
  { value: 'agriculture', label: 'Agriculture', icon: 'Wheat' },
  { value: 'health_beauty', label: 'Health & Beauty', icon: 'Sparkles' },
  { value: 'sports', label: 'Sports', icon: 'Dumbbell' },
  { value: 'babies_kids', label: 'Babies & Kids', icon: 'Baby' },
  { value: 'other', label: 'Other', icon: 'Package' },
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
