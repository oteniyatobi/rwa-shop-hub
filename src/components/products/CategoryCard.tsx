import { Link } from 'react-router-dom';
import { icons } from 'lucide-react';

interface CategoryCardProps {
  value: string;
  label: string;
  icon: string;
}

export function CategoryCard({ value, label, icon }: CategoryCardProps) {
  const LucideIcon = icons[icon as keyof typeof icons];

  return (
    <Link
      to={`/products?category=${value}`}
      className="group flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-card p-5 text-center transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {LucideIcon && <LucideIcon className="h-6 w-6" />}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
