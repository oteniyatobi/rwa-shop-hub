import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PRODUCT_CATEGORIES, RWANDA_LOCATIONS } from '@/lib/constants';
import { toast } from 'sonner';
import { Loader2, X, ImagePlus, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function AddProduct() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
    if (!authLoading && profile && profile.role !== 'vendor') { toast.error('Only vendors can add products'); navigate('/'); }
  }, [user, profile, authLoading, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) { toast.error('Maximum 5 images allowed'); return; }
    setImages(prev => [...prev, ...files]);
    setImageUrls(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    const uploadedUrls: string[] = [];
    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user!.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, image);
      if (uploadError) { console.error('Upload error:', uploadError); continue; }
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
      uploadedUrls.push(publicUrl);
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) { toast.error('Profile not found'); return; }
    if (!category || !location) { toast.error('Please fill in all required fields'); return; }
    setLoading(true);
    try {
      const uploadedImageUrls = await uploadImages();
      const { error } = await supabase.from('products').insert({ vendor_id: profile.id, title, description, price: parseFloat(price), category: category as any, location, images: uploadedImageUrls });
      if (error) throw error;
      toast.success('Product added successfully!');
      navigate('/dashboard');
    } catch (error: any) { toast.error(error.message || 'Failed to add product'); }
    finally { setLoading(false); }
  };

  if (authLoading) {
    return <Layout><div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
          <motion.div variants={fadeUp}>
            <Button variant="ghost" size="sm" className="mb-4 rounded-xl gap-1.5" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="rounded-2xl border-border/50 shadow-xl shadow-primary/5 overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Add New Product</CardTitle>
                    <CardDescription>Create a listing to reach buyers across Rwanda</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Images */}
                  <div className="space-y-2">
                    <Label>Photos (up to 5)</Label>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-muted ring-1 ring-border/50">
                          <img src={url} alt="" className="h-full w-full object-cover" />
                          <Button type="button" variant="destructive" size="icon" className="absolute right-1 top-1 h-6 w-6 rounded-lg" onClick={() => removeImage(index)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {images.length < 5 && (
                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all">
                          <ImagePlus className="h-6 w-6 text-muted-foreground" />
                          <span className="mt-1 text-xs text-muted-foreground">Add</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" placeholder="e.g., iPhone 15 Pro Max 256GB" value={title} onChange={(e) => setTitle(e.target.value)} required className="rounded-xl" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select value={category} onValueChange={setCategory} required>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {PRODUCT_CATEGORIES.map((cat) => (<SelectItem key={cat.value} value={cat.value}>{cat.icon} {cat.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (RWF) *</Label>
                      <Input id="price" type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} min="0" required className="rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Location *</Label>
                    <Select value={location} onValueChange={setLocation} required>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select location" /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {RWANDA_LOCATIONS.map((loc) => (<SelectItem key={loc} value={loc}>{loc}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Describe your product in detail..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="rounded-xl" />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => navigate('/dashboard')}>Cancel</Button>
                    <Button type="submit" className="flex-1 rounded-xl glow-primary" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Post Product
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
