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
      className="group flex flex-col items-center gap-3 rounded-2xl border border-border/40 bg-card p-5 text-center transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:rounded-2xl">
        {LucideIcon && <LucideIcon className="h-5 w-5" />}
      </div>
      <span className="text-xs font-semibold sm:text-sm">{label}</span>
    </Link>
  );
}
