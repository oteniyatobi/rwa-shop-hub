import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Phone, MessageCircle, MapPin, Calendar, ChevronLeft, ChevronRight, User, Heart, Share2, Flag } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportOpen, setReportOpen] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          vendor:profiles!products_vendor_id_fkey(
            id,
            full_name,
            phone,
            whatsapp,
            avatar_url,
            business_name,
            location,
            created_at
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleCall = () => {
    if (product?.vendor?.phone) {
      window.location.href = `tel:${product.vendor.phone}`;
    } else {
      toast.error('Seller phone number not available');
    }
  };

  const handleWhatsApp = () => {
    const number = product?.vendor?.whatsapp || product?.vendor?.phone;
    if (number) {
      const message = encodeURIComponent(`Hi! I'm interested in your listing "${product.title}" on Doorstep.`);
      window.open(`https://wa.me/${number.replace(/\D/g, '')}?text=${message}`, '_blank');
    } else {
      toast.error('Seller contact not available');
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }
    
    try {
      if (favorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', id);
        setFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, product_id: id });
        setFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const reportMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error('Not authenticated');
      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_product_id: id,
        reason: reportReason,
        description: reportDescription || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Report submitted. Our team will review it.');
      setReportOpen(false);
      setReportReason('');
      setReportDescription('');
    },
    onError: () => toast.error('Failed to submit report. Please try again.'),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="aspect-square max-w-2xl rounded-lg bg-muted"></div>
            <div className="mt-4 h-8 w-2/3 rounded bg-muted"></div>
            <div className="mt-2 h-6 w-1/3 rounded bg-muted"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p className="mt-2 text-muted-foreground">This listing may have been removed.</p>
          <Button asChild className="mt-4">
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const images = product.images?.length > 0 ? product.images : ['/placeholder.svg'];
  const categoryInfo = PRODUCT_CATEGORIES.find(c => c.value === product.category);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          {' / '}
          <Link to="/products" className="hover:text-foreground">Products</Link>
          {' / '}
          <Link to={`/products?category=${product.category}`} className="hover:text-foreground">
            {categoryInfo?.label}
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              <img
                src={images[currentImageIndex]}
                alt={product.title}
                className="h-full w-full object-cover"
              />
              
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}

              {/* Action Buttons */}
              <div className="absolute right-3 top-3 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`bg-background/80 backdrop-blur-sm ${favorited ? 'text-destructive' : ''}`}
                  onClick={handleFavorite}
                >
                  <Heart className={`h-5 w-5 ${favorited ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background/80 backdrop-blur-sm"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      index === currentImageIndex ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Product Details */}
            <div className="mt-6">
              <h1 className="text-2xl font-bold md:text-3xl">{product.title}</h1>
              <p className="mt-2 text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {categoryInfo?.icon} {categoryInfo?.label}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {product.location}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(product.created_at)}
                </Badge>
              </div>

              {product.description && (
                <div className="mt-6">
                  <h2 className="font-semibold mb-2">Description</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Seller Info & Contact */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                {/* Seller Info */}
                <div className="flex items-center gap-3 pb-4 border-b">
                  {product.vendor?.avatar_url ? (
                    <img
                      src={product.vendor.avatar_url}
                      alt={product.vendor.full_name || 'Seller'}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">
                      {product.vendor?.business_name || product.vendor?.full_name || 'Seller'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Member since {new Date(product.vendor?.created_at || '').getFullYear()}
                    </p>
                  </div>
                </div>

                {/* Location */}
                {product.vendor?.location && (
                  <div className="flex items-center gap-2 py-4 border-b text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{product.vendor.location}</span>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="mt-6 space-y-3">
                  <Button className="w-full" size="lg" onClick={handleCall}>
                    <Phone className="mr-2 h-5 w-5" />
                    Call Seller
                  </Button>
                  <Button variant="outline" className="w-full" size="lg" onClick={handleWhatsApp}>
                    <MessageCircle className="mr-2 h-5 w-5" />
                    WhatsApp
                  </Button>
                </div>

                {/* Safety Tips */}
                <div className="mt-6 rounded-lg bg-muted p-4">
                  <h4 className="font-semibold text-sm mb-2">Safety Tips</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Meet in a public place</li>
                    <li>• Inspect the item before paying</li>
                    <li>• Never send payment in advance</li>
                    <li>• Trust your instincts</li>
                  </ul>
                </div>

                {/* Report Button */}
                <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 w-full text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        if (!user) {
                          toast.error('Please sign in to report a listing');
                          return;
                        }
                        setReportOpen(true);
                      }}
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      Report this listing
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Report Listing</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Reason</Label>
                        <Select value={reportReason} onValueChange={setReportReason}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fraudulent listing">Fraudulent listing</SelectItem>
                            <SelectItem value="Illegal item">Illegal item</SelectItem>
                            <SelectItem value="Spam">Spam</SelectItem>
                            <SelectItem value="Misleading info">Misleading information</SelectItem>
                            <SelectItem value="Duplicate listing">Duplicate listing</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Details (optional)</Label>
                        <Textarea
                          placeholder="Provide more details about the issue..."
                          value={reportDescription}
                          onChange={(e) => setReportDescription(e.target.value)}
                          maxLength={1000}
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        onClick={() => reportMutation.mutate()}
                        disabled={!reportReason || reportMutation.isPending}
                      >
                        {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
