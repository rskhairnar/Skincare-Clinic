'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = ({ onMenuClick }) => {
  const [searchOpen, setSearchOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'New appointment', message: 'John Doe booked for 3:00 PM', time: '5 min ago', unread: true },
    { id: 2, title: 'Appointment cancelled', message: 'Jane Smith cancelled', time: '1 hour ago', unread: true },
    { id: 3, title: 'New patient', message: 'Mike Johnson registered', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search..." 
                  className="pl-9 h-9 bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((item) => (
                  <DropdownMenuItem key={item.id} className="flex flex-col items-start p-3 cursor-pointer">
                    <div className="flex items-start gap-2 w-full">
                      {item.unread && (
                        <span className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                      )}
                      <div className={cn("flex-1", !item.unread && "ml-4")}>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-sm text-gray-600">
                  View all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="hidden md:flex h-9 bg-neutral-900 hover:bg-neutral-800 text-white">
              + New Appointment
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-200",
          searchOpen ? "max-h-12 mt-3" : "max-h-0"
        )}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search..." 
              className="pl-9 h-9 bg-gray-50"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;