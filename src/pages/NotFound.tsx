import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-extrabold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" className="rounded-xl gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
          <Button asChild className="rounded-xl glow-primary gap-2">
            <Link to="/"><Home className="h-4 w-4" /> Home</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
