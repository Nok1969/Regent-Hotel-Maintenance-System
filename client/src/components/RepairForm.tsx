import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { insertRepairSchema, type InsertRepair } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileImage } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Use shared schema for type safety consistency
const formSchema = insertRepairSchema;
type FormValues = InsertRepair;

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
      status: "pending",
      userId: user?.id || "",
      images: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Transform data to match backend expectations
      const repairData = {
        ...data,
        room: data.location, // Backend expects 'room' field
        userId: user?.id || "",
      };
      
      // First create the repair request
      const response = await apiRequest("POST", "/api/repairs", repairData);
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
      queryClient.invalidateQueries({ queryKey: ["repairs"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
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

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t("forms.newRepair")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.title")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("forms.titlePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.location")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("forms.locationPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.category")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("forms.selectCategory")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="electrical">{t("categories.electrical")}</SelectItem>
                        <SelectItem value="plumbing">{t("categories.plumbing")}</SelectItem>
                        <SelectItem value="air_conditioning">{t("categories.hvac")}</SelectItem>
                        <SelectItem value="furniture">{t("categories.furniture")}</SelectItem>
                        <SelectItem value="other">{t("categories.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.urgency")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("forms.selectUrgency")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">{t("urgency.low")}</SelectItem>
                        <SelectItem value="medium">{t("urgency.medium")}</SelectItem>
                        <SelectItem value="high">{t("urgency.high")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("forms.descriptionPlaceholder")}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>{t("forms.images")}</FormLabel>
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

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setUploadedFiles([]);
                }}
              >
                {t("forms.reset")}
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? t("forms.creating") : t("forms.create")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}