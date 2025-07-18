import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Wrench } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-fade-in">
      <Card className="w-full max-w-md shadow-modern">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-modern">
            <Wrench className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-bg bg-clip-text text-transparent">
            Hotel Maintenance System
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Sign in to access the maintenance dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
                className="shadow-hover"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                className="shadow-hover"
              />
            </div>
            <Button type="submit" className="w-full shadow-modern" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          

        </CardContent>
      </Card>
    </div>
  );
}