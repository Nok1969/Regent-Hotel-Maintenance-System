// This file demonstrates custom validation examples using refine()
// Shows how shared schemas ensure type safety between frontend and backend

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

// Example 1: Time validation with refine()
const timeRangeSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  description: z.string().min(5, "Description required"),
}).refine((data) => {
  // Custom validation: start time must be before end time
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return start < end;
}, {
  message: "Start time must be before end time",
  path: ["endTime"], // Error will show on endTime field
}).refine((data) => {
  // Custom validation: minimum duration of 30 minutes
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  return diffInMinutes >= 30;
}, {
  message: "Minimum duration is 30 minutes",
  path: ["endTime"],
});

// Example 2: Conditional validation based on urgency
const repairValidationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  urgency: z.enum(["low", "medium", "high"]),
  category: z.enum(["electrical", "plumbing", "air_conditioning", "furniture", "other"]),
}).refine((data) => {
  // Custom validation: high urgency requires detailed description
  if (data.urgency === "high" && data.description.length < 20) {
    return false;
  }
  return true;
}, {
  message: "High urgency repairs require detailed description (min 20 characters)",
  path: ["description"],
}).refine((data) => {
  // Custom validation: electrical repairs need specific keywords
  if (data.category === "electrical" && !data.description.toLowerCase().includes("electric")) {
    return false;
  }
  return true;
}, {
  message: "Electrical repairs should mention 'electric' in description",
  path: ["description"],
});

// Example 3: Password confirmation validation
const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  email: z.string().email("Invalid email format"),
}).refine((data) => {
  // Custom validation: passwords must match
  return data.password === data.confirmPassword;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type TimeRangeForm = z.infer<typeof timeRangeSchema>;
type RepairForm = z.infer<typeof repairValidationSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export function ValidationExamples() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"time" | "repair" | "password">("time");

  // Time Range Form
  const timeForm = useForm<TimeRangeForm>({
    resolver: zodResolver(timeRangeSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
      description: "",
    },
  });

  // Repair Form with Conditional Validation
  const repairForm = useForm<RepairForm>({
    resolver: zodResolver(repairValidationSchema),
    defaultValues: {
      title: "",
      description: "",
      urgency: "medium",
      category: "other",
    },
  });

  // Password Form
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      email: "",
    },
  });

  const onSubmit = (data: any) => {
    toast({
      title: "Validation Passed!",
      description: "All custom validation rules passed successfully.",
    });
    console.log("Form data:", data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Validation Examples with refine()</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-6">
            <Button 
              variant={activeTab === "time" ? "default" : "outline"}
              onClick={() => setActiveTab("time")}
            >
              Time Validation
            </Button>
            <Button 
              variant={activeTab === "repair" ? "default" : "outline"}
              onClick={() => setActiveTab("repair")}
            >
              Conditional Validation
            </Button>
            <Button 
              variant={activeTab === "password" ? "default" : "outline"}
              onClick={() => setActiveTab("password")}
            >
              Password Match
            </Button>
          </div>

          {activeTab === "time" && (
            <Form {...timeForm}>
              <form onSubmit={timeForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={timeForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={timeForm.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>
                        Must be after start time with min 30 minutes duration
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={timeForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Test Time Validation</Button>
              </form>
            </Form>
          )}

          {activeTab === "repair" && (
            <Form {...repairForm}>
              <form onSubmit={repairForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={repairForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={repairForm.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={repairForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="electrical">Electrical</SelectItem>
                            <SelectItem value="plumbing">Plumbing</SelectItem>
                            <SelectItem value="air_conditioning">Air Conditioning</SelectItem>
                            <SelectItem value="furniture">Furniture</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={repairForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormDescription>
                        High urgency requires 20+ characters. Electrical repairs should mention "electric".
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Test Conditional Validation</Button>
              </form>
            </Form>
          )}

          {activeTab === "password" && (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Must match the password above
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Test Password Validation</Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Type Safety Consistency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              ✅ Shared Schema Benefits
            </h4>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
              <li>• Same validation rules on frontend and backend</li>
              <li>• TypeScript types automatically generated from Zod schemas</li>
              <li>• Custom refine() functions for complex business rules</li>
              <li>• Consistent error messages across the application</li>
              <li>• Type-safe API responses and request handling</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}