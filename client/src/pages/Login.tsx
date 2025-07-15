import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Hotel Maintenance System</CardTitle>
          <CardDescription className="text-center">
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
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">Test Accounts:</p>
            <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Manager:</strong> manager / manager123</p>
              <p><strong>Staff:</strong> staff / staff123</p>
              <p><strong>Technician:</strong> technician / tech123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}