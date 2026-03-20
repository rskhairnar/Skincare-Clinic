// components/layout/Sidebar.jsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope,
  Briefcase,  // Icon for Specializations
  Calendar, 
  FileText, 
  UserCircle,
  Clock,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const menuItems = [
    { 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      href: '/dashboard',
      roles: ['SUPER_ADMIN', 'DOCTOR_ADMIN']
    },
    { 
      label: 'Doctors', 
      icon: Users, 
      href: '/doctors',
      roles: ['SUPER_ADMIN']
    },
    { 
      label: 'Specializations', 
      icon: Briefcase, 
      href: '/specializations',
      roles: ['SUPER_ADMIN']
    },
    { 
      label: 'Treatments', 
      icon: Stethoscope, 
      href: '/treatments',
      roles: ['SUPER_ADMIN']
    },
    { 
      label: 'Appointments', 
      icon: Calendar, 
      href: '/appointments',
      roles: ['SUPER_ADMIN', 'DOCTOR_ADMIN']
    },
    { 
      label: 'Availability', 
      icon: Clock, 
      href: '/availability',
      roles: ['DOCTOR_ADMIN']
    },
    { 
      label: 'Blogs', 
      icon: FileText, 
      href: '/blogs',
      roles: ['SUPER_ADMIN', 'DOCTOR_ADMIN']
    },
    { 
      label: 'Patients', 
      icon: UserCircle, 
      href: '/patients',
      roles: ['SUPER_ADMIN', 'DOCTOR_ADMIN']
    },
    { 
      label: 'Settings', 
      icon: Settings, 
      href: '/settings',
      roles: ['SUPER_ADMIN']
    },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U';
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 text-white",
        "transform transition-transform duration-300 ease-in-out",
        "lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-neutral-800">
          <div>
            <h1 className="text-lg font-semibold text-white">
              Skincare Clinic
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isSuperAdmin ? 'Super Admin' : 'Doctor Panel'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-neutral-400 hover:text-white hover:bg-neutral-800"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-white text-neutral-900" 
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-medium text-white">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="w-full justify-start gap-2 text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;