import Link from "next/link";
import {
  BoxIcon,
  ChartIcon,
  GiftIcon,
  HelpIcon,
  HomeIcon,
  LogoutIcon,
  PaletteIcon,
  PlusIcon,
  SettingsIcon,
  TreeIcon,
} from "./icons";
import { signOutAction } from "@/lib/auth/actions";

type SidebarProps = {
  active: "inicio" | "estudio" | "caixinhas";
};

const unavailableItems = [
  { label: "Relatórios", icon: ChartIcon },
  { label: "Configurações", icon: SettingsIcon },
  { label: "Ajuda", icon: HelpIcon },
];

export function Sidebar({ active }: SidebarProps) {
  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span className="brand-mark">
          <GiftIcon />
        </span>
        <span className="brand-name">
          Caixinha
          <strong>Virtual</strong>
        </span>
      </Link>

      <nav className="sidebar-nav" aria-label="Navegação principal">
        <Link
          href="/"
          className={`nav-item ${active === "inicio" ? "is-active" : ""}`}
        >
          <HomeIcon />
          Painel
        </Link>

        <Link
          href="/caixinhas/nova"
          className={`nav-item ${active === "caixinhas" ? "is-active" : ""}`}
        >
          <PlusIcon />
          Nova caixinha
        </Link>

        <Link
          href="/estudio-de-artes"
          className={`nav-item ${active === "estudio" ? "is-active" : ""}`}
        >
          <PaletteIcon />
          Estúdio de Artes
        </Link>

        <span
          className="nav-item is-muted"
          aria-disabled="true"
          title="Disponível na plataforma completa"
        >
          <BoxIcon />
          Minha Caixinha
        </span>

        {unavailableItems.map((item) => {
          const Icon = item.icon;
          return (
            <span
              key={item.label}
              className="nav-item is-muted"
              aria-disabled="true"
              title="Disponível na plataforma completa"
            >
              <Icon />
              {item.label}
            </span>
          );
        })}
      </nav>

      <form action={signOutAction} className="sidebar-signout">
        <button type="submit" className="nav-item">
          <LogoutIcon />
          Sair
        </button>
      </form>

      <div className="sidebar-promo">
        <span className="sidebar-promo-icon">
          <TreeIcon />
        </span>
        <strong>Natal Solidário</strong>
        <span>Faça a diferença</span>
      </div>
    </aside>
  );
}
