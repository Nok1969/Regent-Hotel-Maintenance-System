import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileImage } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["electrical", "plumbing", "hvac", "furniture", "other"]),
  urgency: z.enum(["low", "medium", "high"]),
  location: z.string().min(3, "Location must be at least 3 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface RepairFormProps {
  onSuccess?: () => void;
}

export function RepairForm({ onSuccess }: RepairFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "other",
      urgency: "medium",
      location: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // First create the repair request
      const response = await apiRequest("POST", "/api/repairs", data);
      const repair = await response.json();
      
      // Then upload files if any
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        uploadedFiles.forEach((file) => {
          formData.append("images", file);
        });
        
        await apiRequest("POST", `/api/repairs/${repair.id}/upload`, formData);
      }
      
      return repair;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repairs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: t("messages.success"),
        description: t("messages.repairCreated"),
      });
      form.reset();
      setUploadedFiles([]);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: t("messages.error"),
        description: error.message || t("messages.repairFailed"),
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: t("messages.error"),
          description: t("messages.invalidFileType"),
          variant: "destructive",
        });
        return false;
      }
      
      if (file.size > maxSize) {
        toast({
          title: t("messages.error"),
          description: t("messages.fileTooLarge"),
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      low: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };
    return colors[urgency as keyof typeof colors];
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t("forms.newRepair")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">{t("forms.title")}</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder={t("forms.titlePlaceholder")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t("forms.location")}</Label>
            <Input
              id="location"
              {...form.register("location")}
              placeholder={t("forms.locationPlaceholder")}
            />
            {form.formState.errors.location && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.location.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">{t("forms.category")}</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value) => form.setValue("category", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("forms.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electrical">{t("categories.electrical")}</SelectItem>
                  <SelectItem value="plumbing">{t("categories.plumbing")}</SelectItem>
                  <SelectItem value="hvac">{t("categories.hvac")}</SelectItem>
                  <SelectItem value="furniture">{t("categories.furniture")}</SelectItem>
                  <SelectItem value="other">{t("categories.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">{t("forms.urgency")}</Label>
              <Select
                value={form.watch("urgency")}
                onValueChange={(value) => form.setValue("urgency", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("forms.selectUrgency")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t("urgency.low")}</SelectItem>
                  <SelectItem value="medium">{t("urgency.medium")}</SelectItem>
                  <SelectItem value="high">{t("urgency.high")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("forms.description")}</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder={t("forms.descriptionPlaceholder")}
              rows={4}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("forms.images")}</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("forms.uploadImages")}
                </span>
              </label>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-2">
                      <FileImage className="w-4 h-4 text-blue-500" />
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{t("forms.urgency")}:</span>
              <Badge className={getUrgencyColor(form.watch("urgency"))}>
                {t(`urgency.${form.watch("urgency")}`)}
              </Badge>
            </div>
            
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-32"
            >
              {mutation.isPending ? t("forms.creating") : t("forms.create")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}