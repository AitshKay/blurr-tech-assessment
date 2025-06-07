import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { auth, signOut } from "@/auth";
import { Suspense } from "react";
import { Session } from "next-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import Link from "next/link";

interface UserSession extends Session {
  user: {
    id: string;
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth() as UserSession | null;
  
  if (!session?.user) {
    redirect("/login");
  }
  
  const { user } = session;

  return (
    <div className={cn(
      "flex min-h-screen w-full flex-col bg-muted/40",
      "transition-colors duration-300"
    )}>
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <MobileSidebar />
            <span className="font-semibold text-lg">Blurr.so HR</span>
          </div>
          <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end" forceMount>
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    <p className="font-medium">User Menu</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer w-full">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <form
                    action={async () => {
                      'use server';
                      await signOut({ redirectTo: '/' });
                    }}
                    className="w-full"
                  >
                    <button 
                      type="submit"
                      className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent flex items-center text-destructive hover:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex" />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="min-h-[calc(100vh-4rem)]">
            {children}
          </div>
          
          {/* Footer */}
          <footer className="border-t bg-background/95 backdrop-blur">
            <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-24 md:flex-row md:py-0">
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                &copy; {new Date().getFullYear()} Blurr.so HR Portal. All rights reserved.
              </p>
            </div>
          </footer>
        </main>
      </div>
      

    </div>
  );
}