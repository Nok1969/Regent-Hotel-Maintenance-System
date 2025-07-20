import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import maintenanceIcon from "@assets/Icon_maintenance2.png!sw800_1752589313813.png";
import { HotelBackground, HotelLogo } from "@/components/HotelBackground";

export default function Landing() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const mockLoginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/mock-login", credentials);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Login Successful",
        description: "Welcome to the Hotel Maintenance System",
      });
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    mockLoginMutation.mutate({ username, password });
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(/uploads/regent-bg.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center">
          <HotelLogo />
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md backdrop-blur-lg bg-white/90 dark:bg-black/80 shadow-2xl border-white/30 mt-8">
          <CardHeader className="text-center space-y-4">
          
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <img 
              src={maintenanceIcon} 
              alt="Hotel Maintenance System" 
              className="w-16 h-16 rounded-full"
            />
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold">
              {t("app.title")}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {t("app.subtitle")}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Mock Login for Testing */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Test Login</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Use these credentials to test different roles:
              </p>
            </div>
            
            <form onSubmit={handleMockLogin} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin, manager, staff, or technician"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Use: admin123, manager123, staff123, tech123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={mockLoginMutation.isPending}
              >
                {mockLoginMutation.isPending ? "Signing in..." : "Test Login"}
              </Button>
            </form>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>admin/admin123</strong> - Full access + user management</p>
              <p><strong>manager/manager123</strong> - Full access (no new users)</p>
              <p><strong>staff/staff123</strong> - View + create only</p>
              <p><strong>technician/tech123</strong> - Can update job status</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Or sign in with your Replit account
            </p>
            
            <Button 
              onClick={handleLogin}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {t("auth.signIn")} with Replit
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
      </div>
    </div>
  );
}
