import QRCode from "qrcode";

export async function pixQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 360,
    color: {
      dark: "#0c3b2b",
      light: "#fffdf8",
    },
  });
}
