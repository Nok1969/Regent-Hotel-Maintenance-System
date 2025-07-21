import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import maintenanceIcon from "@assets/Icon_maintenance2.png!sw800_1752589313813.png";
import { HotelBackground, HotelLogo } from "@/components/HotelBackground";
import { User, Lock, Hotel, Settings } from "lucide-react";
import "../force-orange.css";



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
      const response = await fetch("/api/auth/mock-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include", // Include cookies for session
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: "ยินดีต้อนรับสู่ระบบซ่อมแซมโรงแรม",
      });
      // Reload the page to refresh auth state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error: any) => {
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: error.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
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
    <div className="min-h-screen flex items-center justify-center animate-fade-in relative overflow-hidden bg-orange-gradient">
      
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
        <Card className="w-full max-w-md backdrop-blur-lg bg-white/95 dark:bg-gray-900/95 shadow-modern border-orange-200/30 mt-8 animate-scale-in">
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
              <div className="space-y-3 animate-slide-left">
                <Label htmlFor="username" className="form-label-modern">
                  <User className="inline w-4 h-4 mr-2" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin, manager, staff, or technician"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input-modern"
                />
              </div>
              
              <div className="space-y-3 animate-slide-left" style={{ animationDelay: '0.1s' }}>
                <Label htmlFor="password" className="form-label-modern">
                  <Lock className="inline w-4 h-4 mr-2" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Use: admin123, manager123, staff123, tech123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input-modern"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full btn-orange animate-slide-up"
                style={{ animationDelay: '0.2s' }}
                disabled={mockLoginMutation.isPending}
              >
                <Settings className="inline w-4 h-4 mr-2" />
                {mockLoginMutation.isPending ? "Signing in..." : "Sign In"}
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
      
      {/* Professional Footer */}
      <footer className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="text-white/80 text-sm font-light backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full">
          <Hotel className="inline w-4 h-4 mr-2" />
          Vala Hua-Hin Nu Chapter Hotel © 2025
        </div>
      </footer>
      </div>
      </div>
    </div>
  );
}
