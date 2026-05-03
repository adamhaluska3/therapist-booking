"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { contactSchema, SERVICE_TYPES, SERVICE_LABELS, type ContactFormValues } from "@/lib/contact-schema";
import { submitContactForm } from "@/server/actions/contact";

export function ContactForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      serviceType: undefined,
      serviceTypeOther: "",
      message: "",
    },
  });

  const serviceType = form.watch("serviceType");

  async function onSubmit(values: ContactFormValues) {
    const result = await submitContactForm(values);
    if (result.success) {
      toast.success("Správa odoslaná! Ozveme sa vám čoskoro.");
      form.reset();
    } else {
      toast.error(result.error ?? "Niečo sa pokazilo.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Meno/Prezývka
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Katka"
                    className="border-0 bg-surface-100 focus-visible:ring-brand-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="katka@email.com"
                    className="border-0 bg-surface-100 focus-visible:ring-brand-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="serviceType"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Typ služby
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full border-0 bg-surface-100">
                    <SelectValue placeholder="Vyberte službu" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {SERVICE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {serviceType === "other" && (
          <FormField
            control={form.control}
            name="serviceTypeOther"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Upresniite typ služby
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Napr. párová terapia, skupinové sedenie…"
                    className="border-0 bg-surface-100 focus-visible:ring-brand-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Správa
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ako vám môžem pomôcť?"
                  className="min-h-32 resize-none border-0 bg-surface-100 focus-visible:ring-brand-300"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full rounded-lg bg-brand-700 py-3 text-white hover:bg-brand-800"
        >
          {form.formState.isSubmitting ? "Odosielam…" : "Odoslať správu"}
        </Button>
      </form>
    </Form>
  );
}
