import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Search, Heart, User, Menu, LogOut, Package, Plus } from 'lucide-react';
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
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              D
            </div>
            <span className="hidden font-bold text-xl sm:inline-block">Doorstep</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-full border bg-muted/50 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-background"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                {profile?.role === 'vendor' && (
                  <Button asChild variant="default" size="sm">
                    <Link to="/dashboard/add-product">
                      <Plus className="mr-1 h-4 w-4" />
                      Sell
                    </Link>
                  </Button>
                )}
                <Button asChild variant="ghost" size="icon">
                  <Link to="/favorites">
                    <Heart className="h-5 w-5" />
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || 'User'}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{profile?.full_name || profile?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {profile?.role === 'vendor' && (
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard">
                          <Package className="mr-2 h-4 w-4" />
                          My Listings
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 pt-8">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 w-full rounded-lg border bg-muted/50 pl-10 pr-4 text-sm outline-none"
                    />
                  </div>
                </form>
                
                {user ? (
                  <>
                    <div className="border-b pb-4">
                      <p className="font-medium">{profile?.full_name || profile?.email}</p>
                      <p className="text-sm text-muted-foreground capitalize">{profile?.role}</p>
                    </div>
                    {profile?.role === 'vendor' && (
                      <>
                        <Link to="/dashboard/add-product" className="flex items-center gap-2 text-sm">
                          <Plus className="h-4 w-4" />
                          Add Product
                        </Link>
                        <Link to="/dashboard" className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4" />
                          My Listings
                        </Link>
                      </>
                    )}
                    <Link to="/favorites" className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4" />
                      Favorites
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Button variant="outline" onClick={handleSignOut} className="mt-4">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button asChild>
                      <Link to="/register">Get Started</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/login">Sign In</Link>
                    </Button>
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
