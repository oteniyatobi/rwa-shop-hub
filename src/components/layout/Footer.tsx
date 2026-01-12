import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                D
              </div>
              <span className="font-bold text-lg">Doorstep</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Rwanda's trusted marketplace. Buy and sell anything locally.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products?category=electronics" className="hover:text-foreground transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=fashion" className="hover:text-foreground transition-colors">Fashion</Link></li>
              <li><Link to="/products?category=vehicles" className="hover:text-foreground transition-colors">Vehicles</Link></li>
              <li><Link to="/products?category=real_estate" className="hover:text-foreground transition-colors">Real Estate</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link to="/safety" className="hover:text-foreground transition-colors">Safety Tips</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Sell on Doorstep</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/register?role=vendor" className="hover:text-foreground transition-colors">Start Selling</Link></li>
              <li><Link to="/vendor-guide" className="hover:text-foreground transition-colors">Vendor Guide</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Doorstep. Made with ❤️ in Rwanda</p>
        </div>
      </div>
    </footer>
  );
}
