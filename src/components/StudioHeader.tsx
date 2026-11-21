import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "./icons";

type StudioHeaderProps = {
  backHref: string;
  backLabel: string;
  rightSlot?: ReactNode;
};

export function StudioHeader({
  backHref,
  backLabel,
  rightSlot,
}: StudioHeaderProps) {
  return (
    <div className="studio-topbar">
      <div className="studio-topbar-left">
        <Link href={backHref} className="back-button" aria-label={backLabel}>
          <ArrowLeftIcon />
        </Link>
        <span className="studio-topbar-title">Estúdio de Artes</span>
      </div>
      {rightSlot}
    </div>
  );
}
