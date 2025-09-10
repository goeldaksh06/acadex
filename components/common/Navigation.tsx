'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface NavigationProps {
  currentPath: string;
}

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/settings', icon: Settings, label: 'Settings' }
];

export default function Navigation({ currentPath }: NavigationProps) {
  const currentPagePath = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleNavigation = async (path: string, label: string) => {
    try {
      if (path === '/dashboard') {
        // Smart home navigation based on user role
        if (user) {
          // For now, default to student dashboard - you can add role-based logic here later
          const dashboardPath = currentPagePath.includes('/teacher') ? '/dashboard/teacher' : '/dashboard/student';
          router.push(dashboardPath);
        } else {
          router.push('/dashboard');
        }
      } else if (path === '/settings') {
        // For now, show a coming soon message - you can create the settings page later
        toast({
          title: "Settings",
          description: "Settings page coming soon! You can customize your preferences here.",
          duration: 3000
        });
      } else {
        router.push(path);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Navigation Error",
        description: `Failed to navigate to ${label}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-t border-border"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-16 gap-8">
          {navItems.map((item) => {
            const isActive = (item.path === '/dashboard' && (currentPagePath.includes('/dashboard'))) || 
                            currentPagePath === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path, item.label)}
                className={`
                  flex flex-col items-center justify-center space-y-2 p-4 rounded-xl transition-all duration-200 relative
                  ${isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Icon className="h-6 w-6" />
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                  )}
                </motion.div>
                
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
