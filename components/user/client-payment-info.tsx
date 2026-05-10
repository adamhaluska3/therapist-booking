import { db } from "@/lib/db";
import { PaymentInfoDialog } from "./payment-info-dialog";
import React from "react";

export type ClientPaymentInfoProp = {
    centPrice: number;
    vs: number | null;
    note: string;
    children: React.ReactNode;
}

export const ClientPaymentInfo = async ({centPrice, vs, note, children}: ClientPaymentInfoProp) => {
    const paymentSettings = (await db.query.paymentSettings.findMany())[0] ?? null;

    return (
        <PaymentInfoDialog centPrice={centPrice} vs={vs} note={note} paymentSettings={paymentSettings}>
            {children}
        </PaymentInfoDialog>
    );
}