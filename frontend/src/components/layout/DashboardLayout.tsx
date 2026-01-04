import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar - hidden on mobile unless menu open */}
      <div className={cn(
        'fixed inset-0 z-40 md:relative md:inset-auto',
        mobileMenuOpen ? 'block' : 'hidden md:block'
      )}>
        {/* Backdrop for mobile */}
        <div 
          className="absolute inset-0 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
        <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <main className={cn('flex-1 overflow-auto', className)}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
