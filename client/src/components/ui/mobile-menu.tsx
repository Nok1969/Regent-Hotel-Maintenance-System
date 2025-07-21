import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

interface MobileMenuProps {
  children: React.ReactNode;
}

export function MobileMenu({ children }: MobileMenuProps) {
  return (
    <div className="sm:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <div className="flex flex-col space-y-4 mt-6">
            <div className="flex items-center space-x-4 pb-4 border-b">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            {children}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}