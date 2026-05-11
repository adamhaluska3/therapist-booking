"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { contactSchema, type ContactFormValues } from "@/lib/contact-schema";
import { submitContactForm } from "@/server/contact-form/contact";
import type { BookingType } from "@/db/schema";
import { toast } from "sonner";

export function ContactForm({ bookingTypes }: { bookingTypes: BookingType[] }) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      serviceType: "",
      message: "",
    },
  });

  async function onSubmit(values: ContactFormValues) {
    const result = await submitContactForm(values);
    if (result.success) {
      form.reset();
      toast.success("Správa bola úspešne odoslaná!");
    } else {
      toast.error(
        "Nastala chyba pri odosielaní správy. Skúste to prosím znovu neskôr.",
      );
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
                  {bookingTypes.map((bt) => (
                    <SelectItem key={bt.id} value={bt.name}>
                      {bt.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Iné">Iné</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
