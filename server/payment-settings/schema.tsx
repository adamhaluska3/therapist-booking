export type PaymentSettingsInput = {
  iban: string;
  bic?: string;
  beneficiaryName: string;
  paymentNote?: string;
};
