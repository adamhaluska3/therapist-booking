"use client";

import React from "react";
import { PayBySquareData, PayBySquareQr } from "../shared/pay-by-square-qr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { PaymentSettings } from "@/db/schema";

export type PaymentInfoDialogProps = {
  centPrice: number;
  vs: number | null;
  note: string;
  paymentSettings: PaymentSettings | null;
  children: React.ReactNode;
};

export function PaymentInfoDialog({ centPrice, vs, note, paymentSettings, children }: PaymentInfoDialogProps) {
  if (!vs) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        Nie je možné zaplatiť
      </span>
    );
  }

  const price = centPrice / 100;

  const data: PayBySquareData = {
    iban: paymentSettings?.iban || "",
    bic: paymentSettings?.bic || "",
    amount: price,
    currencyCode: "EUR",
    beneficiaryName: paymentSettings?.beneficiaryName || "",
    variableSymbol: `${vs}`,
    constantSymbol: "0308",
    paymentNote: note,
  };

  return (
    <Dialog>
      <DialogTrigger nativeButton={false} render={<span>{children}</span>} />
      <DialogContent className="max-w-fit">
        <DialogHeader>
          <DialogTitle>Platobné údaje</DialogTitle>
        </DialogHeader>

        <div className="p-10 flex flex-col gap-5">
          <div className="flex justify-center">
            <PayBySquareQr payment={data} size={200} />
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs uppercase">Číslo účtu</span>
              <span>{paymentSettings?.iban}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs uppercase">Variabilný symbol</span>
              <span>{vs}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs uppercase">Cena</span>
              <span className="text-brand-500 font-bold">{price} €</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Zatvor
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
