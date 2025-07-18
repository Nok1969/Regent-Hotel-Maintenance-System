import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { scheduleSchema, type Schedule } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

interface ScheduleFormProps {
  repairId: number;
  technicians: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function ScheduleForm({ repairId, technicians, onSuccess }: ScheduleFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const form = useForm<Schedule>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
      repairId,
      technicianId: "",
    },
  });

  const onSubmit = (data: Schedule) => {
    // This demonstrates the custom validation working
    toast({
      title: t("messages.success"),
      description: "Schedule created with custom validation checks passed!",
    });
    
    console.log("Schedule data:", data);
    onSuccess?.();
  };

  // Helper function to get minimum datetime (now + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16); // Format for datetime-local input
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Schedule Repair Work</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="technicianId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Technician</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a technician" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        min={getMinDateTime()}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Must be at least 1 hour from now
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        min={form.watch("startTime") || getMinDateTime()}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Must be after start time (min 30 minutes)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Custom Validation Rules (using refine())
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Start time must be before end time</li>
                <li>• Schedule must be in the future</li>
                <li>• Minimum duration is 30 minutes</li>
                <li>• High urgency repairs require detailed description (min 20 chars)</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <Button type="submit">
                Create Schedule
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}