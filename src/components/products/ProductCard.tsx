import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    if (diffDays < 7) return `${diffDays} days ago`;
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
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);
        setFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, product_id: product.id });
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
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm transition-colors ${
              favorited ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
            }`}
            onClick={handleFavorite}
            disabled={loading}
          >
            <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <CardContent className="p-3">
          <p className="font-bold text-lg text-primary">{formatPrice(product.price)}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-tight">{product.title}</h3>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {product.location}
            </span>
            <span>{formatDate(product.created_at)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
