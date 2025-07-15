import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from "react-i18next";
import { Wrench } from "lucide-react";

export default function Landing() {
  const { t } = useTranslation();

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Wrench className="w-8 h-8 text-primary-foreground" />
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
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Welcome to the hotel maintenance system. Please sign in to continue.
            </p>
            
            <Button 
              onClick={handleLogin}
              className="w-full"
              size="lg"
            >
              {t("auth.signIn")}
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Secure authentication powered by Replit
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
