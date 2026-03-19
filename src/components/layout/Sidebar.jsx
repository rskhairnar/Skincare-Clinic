'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText, 
  UserCircle,
  Clock,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Sidebar = () => {
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

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">
          Skincare Clinic
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isSuperAdmin ? 'Super Admin' : 'Doctor Panel'}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <Button 
          onClick={logout}
          variant="outline" 
          className="w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;