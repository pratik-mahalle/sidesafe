import { useState } from "react";
import { useOffline } from "@/hooks/use-offline";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Wifi, WifiOff, LogOut, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { isOnline } = useOffline();
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold safety-orange">RakshaSahayak</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Network Status */}
            <div className="flex items-center space-x-2">
              <div className={`network-indicator ${isOnline ? 'online' : 'offline'}`}></div>
              <span className="text-sm text-gray-600 hidden sm:inline">
                {isOnline ? 'Online' : 'Offline'}
              </span>
              {isOnline ? (
                <Wifi className="w-4 h-4 text-safe-green sm:hidden" />
              ) : (
                <WifiOff className="w-4 h-4 text-yellow-500 sm:hidden" />
              )}
            </div>
            
            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <User className="w-5 h-5 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.displayName || user?.email}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
