import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Library, Moon, Sun, LogOut, Bookmark, LayoutDashboard, Search } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-serif font-bold text-xl text-primary mr-8">
            <Library className="h-6 w-6" />
            <span>Academic Hub</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium flex-1">
            <Link href="/dashboard" className="transition-colors hover:text-primary flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link href="/browse" className="transition-colors hover:text-primary flex items-center gap-2">
              <Search className="h-4 w-4" /> Browse
            </Link>
            <Link href="/bookmarks" className="transition-colors hover:text-primary flex items-center gap-2">
              <Bookmark className="h-4 w-4" /> Bookmarks
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-sm font-medium leading-none">{user?.name}</span>
              <span className="text-xs text-muted-foreground">{user?.studentId || "Student"}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button variant="outline" onClick={handleLogout} className="hidden md:flex">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
