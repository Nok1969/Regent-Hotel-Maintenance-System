import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Upload, X, AlertCircle, Clock, Zap } from "lucide-react";

const formSchema = z.object({
  room: z.string().min(1, "Room is required"),
  category: z.string().min(1, "Category is required"),
  urgency: z.string().min(1, "Priority is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  images: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RepairFormProps {
  onSuccess?: () => void;
}

export function RepairForm({ onSuccess }: RepairFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      room: "",
      category: "",
      urgency: "",
      description: "",
      images: [],
    },
  });

  const createRepairMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/repairs", {
        ...data,
        images: uploadedImages,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("messages.success"),
        description: t("messages.repairSubmitted"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/repairs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      form.reset();
      setUploadedImages([]);
      onSuccess?.();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: t("messages.unauthorized"),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t("messages.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await apiRequest("POST", "/api/upload", formData);
      const result = await response.json();
      setUploadedImages((prev) => [...prev, ...result.urls]);
    } catch (error) {
      toast({
        title: t("messages.error"),
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormValues) => {
    createRepairMutation.mutate({
      ...data,
      images: uploadedImages,
    });
  };

  const rooms = [
    "Room 101", "Room 102", "Room 103", "Room 201", "Room 202", "Room 203",
    "Room 301", "Room 302", "Room 303", "Lobby", "Restaurant", "Kitchen",
    "Conference Room A", "Conference Room B", "Pool Area", "Gym"
  ];

  const categories = [
    { value: "electrical", label: t("categories.electrical") },
    { value: "plumbing", label: t("categories.plumbing") },
    { value: "air_conditioning", label: t("categories.air_conditioning") },
    { value: "furniture", label: t("categories.furniture") },
    { value: "other", label: t("categories.other") },
  ];

  const priorities = [
    { 
      value: "low", 
      label: t("priority.low"),
      icon: Clock,
      color: "bg-green-500",
      bgColor: "hover:bg-green-50 dark:hover:bg-green-900/20",
      borderColor: "peer-checked:border-green-500 peer-checked:bg-green-50 dark:peer-checked:bg-green-900/20"
    },
    { 
      value: "medium", 
      label: t("priority.medium"),
      icon: AlertCircle,
      color: "bg-yellow-500",
      bgColor: "hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
      borderColor: "peer-checked:border-yellow-500 peer-checked:bg-yellow-50 dark:peer-checked:bg-yellow-900/20"
    },
    { 
      value: "high", 
      label: t("priority.high"),
      icon: Zap,
      color: "bg-red-500",
      bgColor: "hover:bg-red-50 dark:hover:bg-red-900/20",
      borderColor: "peer-checked:border-red-500 peer-checked:bg-red-50 dark:peer-checked:bg-red-900/20"
    },
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t("repair.newRequest")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("repair.room")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("repair.selectRoom")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room} value={room}>
                          {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("repair.category")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("repair.selectCategory")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
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
                <FormItem className="space-y-3">
                  <FormLabel>{t("repair.priority")}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-3"
                    >
                      {priorities.map((priority) => {
                        const Icon = priority.icon;
                        return (
                          <FormItem key={priority.value}>
                            <FormControl>
                              <RadioGroupItem
                                value={priority.value}
                                id={priority.value}
                                className="peer sr-only"
                              />
                            </FormControl>
                            <FormLabel htmlFor={priority.value}>
                              <div className={`p-4 border border-muted rounded-lg cursor-pointer ${priority.bgColor} ${priority.borderColor} transition-colors`}>
                                <div className="text-center">
                                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full ${priority.color} flex items-center justify-center`}>
                                    <Icon className="h-4 w-4 text-white" />
                                  </div>
                                  <p className="text-sm font-medium">{priority.label}</p>
                                </div>
                              </div>
                            </FormLabel>
                          </FormItem>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("repair.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("repair.descriptionPlaceholder")}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <label className="text-sm font-medium">{t("repair.attachImages")}</label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  {t("repair.dragDropImages")}
                </p>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files);
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? t("messages.loading") : t("repair.browseFiles")}
                </Button>
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={createRepairMutation.isPending}
              >
                {createRepairMutation.isPending ? t("messages.loading") : t("repair.submitRequest")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setUploadedImages([]);
                }}
              >
                {t("repair.cancel")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
