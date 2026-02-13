import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 'h-9 w-9', text: 'text-lg', iconInner: 'h-4 w-4' },
    md: { icon: 'h-11 w-11', text: 'text-xl', iconInner: 'h-5 w-5' },
    lg: { icon: 'h-14 w-14', text: 'text-3xl', iconInner: 'h-7 w-7' },
  };

  return (
    <Link to="/" className={cn('flex items-center gap-2.5 group', className)}>
      <div className={cn(
        'relative flex items-center justify-center rounded-xl bg-primary transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/25',
        sizes[size].icon
      )}>
        <svg viewBox="0 0 24 24" fill="none" className={cn('relative z-10', sizes[size].iconInner)}>
          <path d="M4 21V5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary-foreground" />
          <path d="M8 21V7C8 6.44772 8.44772 6 9 6H15C15.5523 6 16 6.44772 16 7V21" fill="currentColor" className="text-primary-foreground/90" />
          <circle cx="14" cy="13" r="1" fill="currentColor" className="text-primary" />
          <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary-foreground" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold tracking-tight leading-none gradient-text', sizes[size].text)}>
            Doorstep
          </span>
          <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">
            Rwanda
          </span>
        </div>
      )}
    </Link>
  );
}
