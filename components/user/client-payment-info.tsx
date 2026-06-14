import { PaymentInfoDialog } from "./payment-info-dialog";
import React from "react";
import { getPaymentSettings } from "@/server/payment-settings/queries";

export type ClientPaymentInfoProp = {
  centPrice: number;
  vs: number | null;
  note: string;
  children: React.ReactNode;
};

export const ClientPaymentInfo = async ({
  centPrice,
  vs,
  note,
  children,
}: ClientPaymentInfoProp) => {
  const paymentSettings = await getPaymentSettings();

  return (
    <PaymentInfoDialog
      centPrice={centPrice}
      vs={vs}
      note={note}
      paymentSettings={paymentSettings}
    >
      {children}
    </PaymentInfoDialog>
  );
};
