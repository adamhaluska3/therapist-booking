import { db } from "@/lib/db";
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
import React from "react";

export type ClientPaymentInfoProp = {
    centPrice: number;
    vs: number | null;
    note: string;
    children: React.ReactNode;
}

export const ClientPaymentInfo = async ({centPrice, vs, note, children}: ClientPaymentInfoProp) => {
    if (!vs) {
        return <span>Nie je možné splatiť</span>
    }

    const paymentSettings = (await db.query.paymentSettings.findMany())[0];
    const price = centPrice / 100;

    const data: PayBySquareData = {
      iban: paymentSettings.iban || "",
      bic: paymentSettings.bic || "",
      amount: price,
      currencyCode: "EUR",
      beneficiaryName: paymentSettings.beneficiaryName || "",
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

                <div className="p-10 flex flex-col gap-5 ">
                    <div className="flex justify-center">
                        <PayBySquareQr payment={data} size={200}/>
                    </div>
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            <span className="text-gray-400 text-xs uppercase">Číslo účtu</span>
                            <span>{paymentSettings.iban}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-gray-400 text-xs uppercase">Variabilný symbol</span>
                            <span>{vs}</span>
                        </div>
                        <span className="text-brand-500 font-bold">{`${price}`} €</span>
                    
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose
                        render={<Button variant="outline" />}
                    >
                        Zatvor
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}