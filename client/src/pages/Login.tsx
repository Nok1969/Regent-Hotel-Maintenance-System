import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Wrench, User, Lock, Hotel } from "lucide-react";

export default function Login() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/mock-login", credentials);
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Login successful",
          description: `Welcome back! You are logged in as ${data.role}`,
        });
        
        // Invalidate and refetch the auth query to update the authentication state
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        
        // Force page reload to ensure clean state
        window.location.href = "/";
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-gradient animate-fade-in relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:30px_30px]"></div>
      </div>
      
      <Card className="w-full max-w-md shadow-modern bg-white/95 backdrop-blur-sm border-orange-200/30 animate-scale-in">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg">
            <Wrench className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            Vala Hua-Hin Nu Chapter Hotel Maintenance System
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3 animate-slide-left">
              <Label htmlFor="username" className="form-label-modern">
                <User className="inline w-4 h-4 mr-2" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
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
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                className="form-input-modern"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full btn-orange animate-slide-up" 
              style={{ animationDelay: '0.2s' }}
              disabled={isLoading}
            >
              <Wrench className="inline w-4 h-4 mr-2" />
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Professional Footer */}
      <footer className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="text-white/80 text-sm font-light backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full">
          <Hotel className="inline w-4 h-4 mr-2" />
          Vala Hua-Hin Nu Chapter Hotel © 2025
        </div>
      </footer>
    </div>
  );
}