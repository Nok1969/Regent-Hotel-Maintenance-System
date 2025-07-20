import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Form schema for adding new user with enhanced validation
const addUserSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Zก-ฮ0-9\s]+$/, "Name can only contain letters, numbers and spaces"),
  email: z.string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Zก-ฮ0-9]+$/, "First name can only contain letters and numbers"),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Zก-ฮ0-9]+$/, "Last name can only contain letters and numbers"),
  role: z.enum(["admin", "manager", "staff", "technician"]),
  language: z.enum(["en", "th"]).default("en"),
});

type AddUserFormData = z.infer<typeof addUserSchema>;

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddUserDialog({ open, onClose }: AddUserDialogProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Form for adding new user
  const addUserForm = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "staff",
      language: "en",
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async (userData: AddUserFormData) => {
      return await apiRequest("POST", "/api/users", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User Added Successfully",
        description: "New user has been created with secure password",
      });
      onClose();
      addUserForm.reset();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t("common.unauthorized"),
          description: t("auth.loginAgain"),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      // Handle specific error messages from backend
      const errorMessage = error.message.includes("Email already exists") 
        ? "This email is already registered" 
        : error.message.includes("Username already exists")
        ? "This username is already taken"
        : "Failed to add user. Please try again.";
        
      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: AddUserFormData) => {
    addUserMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">👤</span>
            Add New User
          </DialogTitle>
          <DialogDescription>
            Create a new user account with appropriate role and secure password.
            All fields are required for security compliance.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...addUserForm}>
          <form onSubmit={addUserForm.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Full Name Field */}
            <FormField
              control={addUserForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter full name (e.g., John Smith)" 
                      {...field} 
                      disabled={addUserMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Full name as it will appear in the system (letters, numbers, spaces allowed)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={addUserForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Enter email address" 
                      {...field} 
                      disabled={addUserMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Must be a valid email address for login
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={addUserForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter secure password" 
                      {...field} 
                      disabled={addUserMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum 6 characters (e.g., test123)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* First and Last Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={addUserForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="First name" 
                        {...field} 
                        disabled={addUserMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addUserForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Last name" 
                        {...field} 
                        disabled={addUserMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Role Selection */}
            <FormField
              control={addUserForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Role *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={addUserMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">🔑 Administrator - Full system access</SelectItem>
                      <SelectItem value="manager">🛡️ Manager - Manage operations</SelectItem>
                      <SelectItem value="staff">👥 Staff - Create requests</SelectItem>
                      <SelectItem value="technician">🔧 Technician - Handle repairs</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose role based on user responsibilities
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Language Selection */}
            <FormField
              control={addUserForm.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Language</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={addUserMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="th">🇹🇭 ไทย (Thai)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={addUserMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addUserMutation.isPending}
                className="min-w-[100px]"
              >
                {addUserMutation.isPending ? (
                  <>
                    <span className="animate-spin mr-2">⚡</span>
                    Adding...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✅</span>
                    Add User
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}