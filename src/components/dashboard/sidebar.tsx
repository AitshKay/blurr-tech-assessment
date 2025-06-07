"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Folders,
  Briefcase,
  FileText,
  Calendar,
  BarChart2,
  MessageSquare,
  HelpCircle,
  DollarSign,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// User and Settings are already imported above

interface SidebarNavItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  isCollapsed?: boolean;
}

function SidebarNavItem({ 
  href, 
  icon, 
  title, 
  isActive,
  isCollapsed = false 
}: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        isCollapsed ? "justify-center px-2" : ""
      )}
    >
      <div className={cn("flex items-center gap-3", isCollapsed ? "gap-0" : "")}>
        <span className={cn("flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground")}>
          {icon}
        </span>
        {!isCollapsed && <span className="truncate">{title}</span>}
      </div>
    </Link>
  );
}

interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
  isCollapsed?: boolean;
}

function SidebarSection({ title, children, isCollapsed }: SidebarSectionProps) {
  if (isCollapsed) return <div className="space-y-1">{children}</div>;
  
  return (
    <div className="space-y-2">
      {title && (
        <h3 className="px-4 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

interface DashboardSidebarProps {
  isCollapsed?: boolean;
  className?: string;
}

export function Sidebar({ 
  isCollapsed = false, 
  className,
}: DashboardSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const width = isCollapsed ? 'w-16' : 'w-64';

  const navItems = [
    {
      title: "Main",
      items: [
        {
          title: "AI Assistant",
          href: "/dashboard/chat",
          icon: <MessageSquare className="h-5 w-5" />,
        },
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          href: "/dashboard/employees",
          icon: <Users className="h-5 w-5" />,
          title: "Employees",
        },
        {
          href: "/dashboard/projects",
          icon: <Folders className="h-5 w-5" />,
          title: "Projects",
        },
        {
          href: "/dashboard/tasks",
          icon: <FileText className="h-5 w-5" />,
          title: "Tasks",
        },
        {
          href: "/dashboard/salaries",
          icon: <DollarSign className="h-5 w-5" />,
          title: "Salaries",
        },
      ],
    },
    {
      title: "Organization",
      items: [
        {
          href: "/dashboard/departments",
          icon: <Briefcase className="h-5 w-5" />,
          title: "Departments",
        },
      ],
    },
    {
      title: "Tools",
      items: [
        {
          href: "/dashboard/calendar",
          icon: <Calendar className="h-5 w-5" />,
          title: "Calendar",
        },
        {
          href: "/dashboard/reports",
          icon: <BarChart2 className="h-5 w-5" />,
          title: "Reports",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          href: "/dashboard/support",
          icon: <MessageSquare className="h-5 w-5" />,
          title: "Support",
        },
        {
          href: "/dashboard/help",
          icon: <HelpCircle className="h-5 w-5" />,
          title: "Help Center",
        },
      ],
    },
  ];

  return (
    <div 
      className={cn(
        "flex h-screen flex-col border-r bg-background/95 backdrop-blur transition-all duration-300 ease-in-out",
        width,
        className
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-lg font-bold">B</span>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-semibold">Blurr.so</span>
          )}
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navItems.map((section) => (
            <SidebarSection 
              key={section.title} 
              title={isCollapsed ? undefined : section.title}
              isCollapsed={isCollapsed}
            >
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  isActive={pathname === item.href}
                  isCollapsed={isCollapsed}
                />
              ))}
            </SidebarSection>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="mt-auto px-4 py-4 space-y-2">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || 'User'} />
                <AvatarFallback>{session?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email || ''}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
