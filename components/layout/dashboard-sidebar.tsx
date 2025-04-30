/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Home,
  RefreshCw,
  User,
  CreditCard,
  Key,
  // Settings,
  Menu,
  X,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/setup";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Conversions",
      href: "/dashboard/conversions",
      icon: RefreshCw,
    },
    {
      title: "QR Codes",
      href: "/dashboard/qrcodes",
      icon: QrCode,
    },
    {
      title: "API Keys",
      href: "/dashboard/api-keys",
      icon: Key,
      proOnly: true,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      title: "Subscription",
      href: "/dashboard/subscription",
      icon: CreditCard,
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-16 left-0 z-20 m-4">
        <Button variant="outline" size="icon" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 pt-16">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            {user && (
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-white capitalize">
                    {getInitials(user.name || user.username)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium capitalize">
                    {user.name || user.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.isPro ? "Pro Plan" : "Free Plan"}
                  </p>
                </div>
              </div>
            )}
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              if (item.proOnly && !user?.isPro) return null;

              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                      pathname === item.href
                        ? "bg-primary-50 text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 flex-shrink-0 h-5 w-5",
                        pathname === item.href
                          ? "text-primary"
                          : "text-gray-400 group-hover:text-gray-500"
                      )}
                    />
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 flex z-10 pt-16">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={toggleMobileMenu}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 mb-5">
                {user && (
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-white">
                        {getInitials(user.name || user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {user.name || user.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.isPro ? "Pro Plan" : "Free Plan"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navItems.map((item) => {
                  if (item.proOnly && !user?.isPro) return null;

                  return (
                    <Link key={item.href} href={item.href}>
                      <span
                        className={cn(
                          "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                          pathname === item.href
                            ? "bg-primary-50 text-primary"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                        onClick={toggleMobileMenu}
                      >
                        <item.icon
                          className={cn(
                            "mr-3 flex-shrink-0 h-6 w-6",
                            pathname === item.href
                              ? "text-primary"
                              : "text-gray-400 group-hover:text-gray-500"
                          )}
                        />
                        {item.title}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
