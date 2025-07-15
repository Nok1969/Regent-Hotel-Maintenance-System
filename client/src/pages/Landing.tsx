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
      return await apiRequest("/api/auth/mock-login", "POST", credentials);
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
      className="min-h-screen bg-gradient-to-br from-blue-600/90 via-blue-700/90 to-blue-800/90 flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 50%, rgba(29, 78, 216, 0.9) 100%), 
                         url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="hotel" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect fill="%23ffffff" fill-opacity="0.05" width="20" height="20"/><circle cx="10" cy="10" r="2" fill="%23ffffff" fill-opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23hotel)"/></svg>')`,
        backgroundSize: 'cover, 40px 40px',
        backgroundPosition: 'center, 0 0'
      }}
    >
      <Card className="w-full max-w-md backdrop-blur-sm bg-card/95 shadow-2xl border-white/20">
        <CardHeader className="text-center space-y-4">
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          
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
  );
}
