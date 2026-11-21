export type PixPayloadInput = {
  key: string;
  receiverName: string;
  city: string;
  amountCents?: number;
  txid?: string;
};

function tlv(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function sanitizeAscii(value: string, maxLength: number): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 .-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
    .toUpperCase();
}

function crc16(payload: string): string {
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixPayload({
  key,
  receiverName,
  city,
  amountCents,
  txid,
}: PixPayloadInput): string {
  const cleanKey = key.trim();
  const name = sanitizeAscii(receiverName, 25) || "CAIXINHA VIRTUAL";
  const merchantCity = sanitizeAscii(city, 15) || "BRASIL";

  const merchantAccount = tlv(
    "26",
    `${tlv("00", "br.gov.bcb.pix")}${tlv("01", cleanKey)}`,
  );

  const amount =
    amountCents && amountCents > 0
      ? tlv("54", (amountCents / 100).toFixed(2))
      : "";

  const additionalData = tlv("62", tlv("05", txid?.trim() || "***"));

  const payload = [
    tlv("00", "01"),
    merchantAccount,
    tlv("52", "0000"),
    tlv("53", "986"),
    amount,
    tlv("58", "BR"),
    tlv("59", name),
    tlv("60", merchantCity),
    additionalData,
  ].join("");

  return `${payload}6304${crc16(`${payload}6304`)}`;
}
