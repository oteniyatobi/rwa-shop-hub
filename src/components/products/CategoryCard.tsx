import { Link } from 'react-router-dom';

interface CategoryCardProps {
  value: string;
  label: string;
  icon: string;
}

export function CategoryCard({ value, label, icon }: CategoryCardProps) {
  return (
    <Link
      to={`/products?category=${value}`}
      className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-all hover:border-primary hover:shadow-md"
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
