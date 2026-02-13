import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  created_at: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

export function ProductCard({ product, isFavorite = false, onFavoriteToggle }: ProductCardProps) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(isFavorite);
  const [loading, setLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }
    setLoading(true);
    try {
      if (favorited) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', product.id);
        setFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, product_id: product.id });
        setFavorited(true);
        toast.success('Added to favorites');
      }
      onFavoriteToggle?.();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = product.images?.[0] || '/placeholder.svg';

  return (
    <Link to={`/products/${product.id}`}>
      <div className="group overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-2.5 top-2.5 h-9 w-9 rounded-xl bg-background/70 backdrop-blur-md border border-border/30 transition-all ${
              favorited ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:text-destructive'
            }`}
            onClick={handleFavorite}
            disabled={loading}
          >
            <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <div className="p-3.5">
          <p className="font-bold text-lg text-primary">{formatPrice(product.price)}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-foreground/90">{product.title}</h3>
          <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {product.location}
            </span>
            <span className="text-muted-foreground/70">{formatDate(product.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
