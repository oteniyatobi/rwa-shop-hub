import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/Logo';
import { Search, Heart, User, Menu, LogOut, Package, Plus, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Logo size="sm" />

          <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl md:flex">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-secondary/50 pl-11 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </form>

          <nav className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                {profile?.role === 'vendor' && (
                  <Button asChild className="glow-primary">
                    <Link to="/dashboard/add-product">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Sell
                    </Link>
                  </Button>
                )}
                <Button asChild variant="ghost" size="icon">
                  <Link to="/favorites"><Heart className="h-5 w-5" /></Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full border border-border">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass">
                    <div className="px-3 py-2">
                      <p className="font-medium">{profile?.full_name || profile?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />{profile?.role}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    {profile?.role === 'vendor' && (
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="cursor-pointer"><Package className="mr-2 h-4 w-4" />My Listings</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer"><User className="mr-2 h-4 w-4" />Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost"><Link to="/login">Sign In</Link></Button>
                <Button asChild className="glow-primary"><Link to="/register">Get Started</Link></Button>
              </>
            )}
          </nav>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 glass border-l border-border/50">
              <div className="flex flex-col gap-6 pt-8">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none" />
                  </div>
                </form>
                {user ? (
                  <>
                    <div className="border-b border-border/50 pb-4">
                      <p className="font-medium">{profile?.full_name || profile?.email}</p>
                      <p className="text-sm text-muted-foreground capitalize">{profile?.role}</p>
                    </div>
                    {profile?.role === 'vendor' && (
                      <>
                        <Link to="/dashboard/add-product" className="flex items-center gap-3 text-sm hover:text-primary"><Plus className="h-4 w-4" />Add Product</Link>
                        <Link to="/dashboard" className="flex items-center gap-3 text-sm hover:text-primary"><Package className="h-4 w-4" />My Listings</Link>
                      </>
                    )}
                    <Link to="/favorites" className="flex items-center gap-3 text-sm hover:text-primary"><Heart className="h-4 w-4" />Favorites</Link>
                    <Link to="/profile" className="flex items-center gap-3 text-sm hover:text-primary"><User className="h-4 w-4" />Profile</Link>
                    <Button variant="outline" onClick={handleSignOut} className="mt-4"><LogOut className="mr-2 h-4 w-4" />Sign Out</Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button asChild className="glow-primary"><Link to="/register">Get Started</Link></Button>
                    <Button asChild variant="outline"><Link to="/login">Sign In</Link></Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
