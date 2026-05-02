"use client";

import { useState } from "react";
import {
  PayBySquareQr,
  type PayBySquareData,
} from "@/components/shared/pay-by-square-qr";
import { Input } from "@/components/ui/input";

const DEFAULTS: PayBySquareData = {
  iban: "SK8209000000000011424060",
  bic: "TATRSKBX",
  amount: 50,
  currencyCode: "EUR",
  beneficiaryName: "Jana Nováková",
  variableSymbol: "1234567890",
  constantSymbol: "0308",
  paymentNote: "Psychoterapia",
};

export default function PayQrTestPage() {
  const [form, setForm] = useState<PayBySquareData>(DEFAULTS);
  const [submitted, setSubmitted] = useState<PayBySquareData>(DEFAULTS);
  const [size, setSize] = useState(300);

  function set(
    field: keyof PayBySquareData,
    value: string | number | undefined,
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold">Pay by Square — test</h1>
      <div className="grid gap-10 lg:grid-cols-2">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted({ ...form });
          }}
        >
          <Field label="IBAN *">
            <Input
              value={form.iban}
              onChange={(e) => set("iban", e.target.value)}
              placeholder="SK8209000000000011424060"
            />
          </Field>

          <Field label="BIC / SWIFT">
            <Input
              value={form.bic ?? ""}
              onChange={(e) => set("bic", e.target.value || undefined)}
              placeholder="TATRSKBX"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (EUR)">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.amount ?? ""}
                onChange={(e) =>
                  set(
                    "amount",
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
                placeholder="50.00"
              />
            </Field>
            <Field label="Currency">
              <Input
                value={form.currencyCode ?? "EUR"}
                maxLength={3}
                onChange={(e) =>
                  set("currencyCode", e.target.value.toUpperCase())
                }
              />
            </Field>
          </div>

          <Field label="Beneficiary name">
            <Input
              value={form.beneficiaryName ?? ""}
              onChange={(e) =>
                set("beneficiaryName", e.target.value || undefined)
              }
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="VS">
              <Input
                value={form.variableSymbol ?? ""}
                maxLength={10}
                onChange={(e) =>
                  set("variableSymbol", e.target.value || undefined)
                }
              />
            </Field>
            <Field label="KS">
              <Input
                value={form.constantSymbol ?? ""}
                maxLength={4}
                onChange={(e) =>
                  set("constantSymbol", e.target.value || undefined)
                }
              />
            </Field>
            <Field label="SS">
              <Input
                value={form.specificSymbol ?? ""}
                maxLength={10}
                onChange={(e) =>
                  set("specificSymbol", e.target.value || undefined)
                }
              />
            </Field>
          </div>

          <Field label="Payment note">
            <Input
              value={form.paymentNote ?? ""}
              maxLength={140}
              onChange={(e) => set("paymentNote", e.target.value || undefined)}
            />
          </Field>

          <Field label="Due date (YYYYMMDD)">
            <Input
              value={form.paymentDueDate ?? ""}
              maxLength={8}
              onChange={(e) =>
                set("paymentDueDate", e.target.value || undefined)
              }
              placeholder="20261231"
            />
          </Field>

          <Field label="Size (px)">
            <Input
              type="number"
              min={100}
              max={600}
              step={50}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </Field>

          <button
            type="submit"
            className="bg-brand-600 hover:bg-brand-700 mt-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            Generate QR
          </button>
        </form>

        <div className="flex flex-col gap-4 pt-2">
          <PayBySquareQr payment={submitted} size={size} />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
