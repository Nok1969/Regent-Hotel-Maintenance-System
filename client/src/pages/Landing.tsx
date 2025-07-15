import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from "react-i18next";
import maintenanceIcon from "@assets/Icon_maintenance2.png!sw800_1752589313813.png";

export default function Landing() {
  const { t } = useTranslation();

  const handleLogin = () => {
    window.location.href = "/api/login";
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
