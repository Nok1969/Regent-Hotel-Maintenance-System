import { useEffect } from "react";
import { useLocation } from "wouter";
import { RepairForm } from "@/components/RepairForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function NewRepair() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to home if not authenticated (debounced)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (!isLoading && !isAuthenticated) {
      timeoutId = setTimeout(() => {
        toast({
          title: "Unauthorized",
          description: t("messages.unauthorized"),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }, 100);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isAuthenticated, isLoading, toast, t]);

  const handleSuccess = () => {
    setLocation("/repairs");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>{t("messages.loading")}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <RepairForm onSuccess={handleSuccess} />;
}
