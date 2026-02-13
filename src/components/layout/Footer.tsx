import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-card/30">
      <div className="container mx-auto px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo size="md" />
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Rwanda's trusted marketplace. Buy and sell anything locally with confidence.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest text-muted-foreground">Categories</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/products?category=electronics" className="text-foreground/70 hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=fashion" className="text-foreground/70 hover:text-primary transition-colors">Fashion</Link></li>
              <li><Link to="/products?category=vehicles" className="text-foreground/70 hover:text-primary transition-colors">Vehicles</Link></li>
              <li><Link to="/products?category=real_estate" className="text-foreground/70 hover:text-primary transition-colors">Real Estate</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest text-muted-foreground">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/help" className="text-foreground/70 hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/safety" className="text-foreground/70 hover:text-primary transition-colors">Safety Tips</Link></li>
              <li><Link to="/contact" className="text-foreground/70 hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest text-muted-foreground">Sell on Doorstep</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/register?role=vendor" className="text-foreground/70 hover:text-primary transition-colors">Start Selling</Link></li>
              <li><Link to="/vendor-guide" className="text-foreground/70 hover:text-primary transition-colors">Vendor Guide</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-14 border-t border-border/30 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2026 Doorstep. Made by Oteniya Oluwatobi</p>
        </div>
      </div>
    </footer>
  );
}
