export type BankOption = {
  code: string;
  name: string;
};

export const OTHER_BANK_CODE = "other";

export const BANKS: BankOption[] = [
  { code: "260", name: "Nubank" },
  { code: "341", name: "Itaú" },
  { code: "237", name: "Bradesco" },
  { code: "001", name: "Banco do Brasil" },
  { code: "104", name: "Caixa Econômica Federal" },
  { code: "033", name: "Santander" },
  { code: "077", name: "Banco Inter" },
  { code: "336", name: "C6 Bank" },
  { code: "290", name: "PagBank" },
  { code: "323", name: "Mercado Pago" },
  { code: "380", name: "PicPay" },
  { code: "756", name: "Sicoob" },
  { code: "748", name: "Sicredi" },
  { code: "208", name: "BTG Pactual" },
  { code: "348", name: "XP Investimentos" },
  { code: "655", name: "Neon" },
  { code: "212", name: "Banco Original" },
  { code: "280", name: "Will Bank" },
  { code: "121", name: "Agibank" },
  { code: "041", name: "Banrisul" },
  { code: "422", name: "Banco Safra" },
  { code: "197", name: "Stone" },
  { code: OTHER_BANK_CODE, name: "Outro banco" },
];

export function findBank(code: string): BankOption | null {
  return BANKS.find((bank) => bank.code === code) ?? null;
}

export function bankDisplayName(
  code: string,
  customName: string,
  storedName: string,
): string {
  if (storedName.trim()) return storedName.trim();
  if (code === OTHER_BANK_CODE) return customName.trim() || "Outro banco";
  return findBank(code)?.name ?? "Banco informado";
}
