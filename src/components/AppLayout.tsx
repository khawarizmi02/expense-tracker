import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Receipt, TrendingUp, Wallet, Calendar, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Incomes', href: '/incomes', icon: TrendingUp },
  { name: 'Budget', href: '/budget', icon: Wallet },
  { name: 'Months', href: '/months', icon: Calendar },
];

function NavLinks({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <nav className={cn('flex', mobile ? 'flex-col' : 'flex-col gap-1')}>
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              mobile && 'text-base py-3'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

function Sidebar() {
  return (
    <aside className="hidden border-r bg-card md:flex md:w-64 md:flex-col">
      <div className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center">
          <Wallet className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold">Expense Tracker</span>
        </div>
        <ThemeToggle />
      </div>
      <div className="flex-1 overflow-auto p-4">
        <NavLinks />
      </div>
      <div className="border-t p-4">
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p className="font-medium">PWA Ready</p>
          <p className="mt-1">Install for offline access</p>
        </div>
      </div>
    </aside>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between border-b bg-card px-4 py-3 md:hidden">
      <div className="flex items-center gap-2">
        <Wallet className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">Expense Tracker</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-16 items-center border-b px-6">
              <Wallet className="h-6 w-6 text-primary" />
              <span className="ml-2 text-lg font-semibold">Expense Tracker</span>
            </div>
            <div className="p-4">
              <NavLinks mobile onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileNav />
        <main className="flex-1 overflow-auto bg-background p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
