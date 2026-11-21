"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button type="button" className="btn btn-small btn-outline" onClick={copy}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? "Link copiado" : "Copiar link"}
    </button>
  );
}
