"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { savePaymentSettings } from "@/server/actions/payment-settings";
import type { PaymentSettings } from "@/db/schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const IBAN_RE = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;

const schema = z.object({
  iban: z
    .string()
    .min(1, "IBAN je povinný")
    .refine(
      (v) => IBAN_RE.test(v.replace(/\s+/g, "").toUpperCase()),
      "Neplatný formát IBAN",
    ),
  bic: z.string().optional(),
  beneficiaryName: z.string().min(1, "Meno príjemcu je povinné").max(70),
  paymentNote: z.string().max(140).optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  settings: PaymentSettings | null;
};

export function PaymentSettingsForm({ settings }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      iban: settings?.iban ?? "",
      bic: settings?.bic ?? "",
      beneficiaryName: settings?.beneficiaryName ?? "",
      paymentNote: settings?.paymentNote ?? "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: FormValues) {
    try {
      await savePaymentSettings({
        iban: values.iban.replace(/\s+/g, "").toUpperCase(),
        bic: values.bic?.replace(/\s+/g, "").toUpperCase() || undefined,
        beneficiaryName: values.beneficiaryName,
        paymentNote: values.paymentNote,
      });
      toast.success("Platobné nastavenia uložené");
    } catch {
      toast.error("Nepodarilo sa uložiť nastavenia");
    }
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="rounded-xl border border-surface-200 bg-white p-6 flex flex-col gap-5">
            <FormField
              control={form.control}
              name="iban"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IBAN *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="SK88 8888 8888 8888 8888 8888"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BIC / SWIFT</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="TATRSKBX"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="beneficiaryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meno príjemcu *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Jana Nováková" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poznámka k platbe</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Terapia" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {settings?.updatedAt && (
            <p className="text-xs text-neutral-400">
              Naposledy uložené:{" "}
              {new Date(settings.updatedAt).toLocaleString("sk-SK")}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {isSubmitting ? "Ukladám…" : "Uložiť nastavenia"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
