import { Link, useLocation } from "wouter";
import { Home, MapPin, FileText, User } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/tracking", icon: MapPin, label: "Tracking" },
    { path: "/reports", icon: FileText, label: "Reports" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={`flex flex-col items-center py-2 px-3 transition-colors ${
                  isActive
                    ? "safety-orange"
                    : "text-gray-400 hover:text-safety-orange"
                }`}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-xs">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
