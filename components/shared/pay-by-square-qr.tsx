"use client";

export type PayBySquareData = {
  iban: string;
  bic?: string;
  amount?: number;
  currencyCode?: string;
  variableSymbol?: string;
  constantSymbol?: string;
  specificSymbol?: string;
  paymentNote?: string;
  beneficiaryName?: string;
  beneficiaryAddressLine1?: string;
  beneficiaryAddressLine2?: string;
  paymentDueDate?: string;
};

type Props = {
  payment: PayBySquareData;
  size?: number;
};

const BASE = "https://api.freebysquare.sk/pay/v1/generate-png";

function buildUrl(payment: PayBySquareData, size: number): string {
  const params = new URLSearchParams();

  params.set("size", String(size));
  params.set("color", "1"); // black & white

  if (payment.amount !== undefined)
    params.set("amount", payment.amount.toFixed(2));

  params.set("currencyCode", payment.currencyCode ?? "EUR");
  params.set("iban", payment.iban.replace(/\s+/g, ""));

  if (payment.paymentDueDate) params.set("dueDate", payment.paymentDueDate);
  if (payment.variableSymbol)
    params.set("variableSymbol", payment.variableSymbol);
  if (payment.constantSymbol)
    params.set("constantSymbol", payment.constantSymbol);
  if (payment.specificSymbol)
    params.set("specificSymbol", payment.specificSymbol);
  if (payment.paymentNote) params.set("paymentNote", payment.paymentNote);
  if (payment.beneficiaryName)
    params.set("beneficiaryName", payment.beneficiaryName);
  if (payment.beneficiaryAddressLine1)
    params.set("beneficiaryAddressLine1", payment.beneficiaryAddressLine1);
  if (payment.beneficiaryAddressLine2)
    params.set("beneficiaryAddressLine2", payment.beneficiaryAddressLine2);

  return `${BASE}?${params.toString()}`;
}

export function PayBySquareQr({ payment, size = 300 }: Props) {
  if (!payment.iban) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        IBAN is required.
      </div>
    );
  }

  const url = buildUrl(payment, size);

  return (
    <img
      src={url}
      alt="Pay by Square QR"
      width={size}
      height={size}
      style={{ display: "block", background: "#fff" }}
    />
  );
}
