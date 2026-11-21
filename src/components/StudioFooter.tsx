import { PhoneIcon, SparkleIcon, StarIcon, WandIcon } from "./icons";

const items = [
  { label: "Templates Profissionais", icon: StarIcon },
  { label: "Personalização Automática", icon: WandIcon },
  { label: "Compatível com Celular", icon: PhoneIcon },
  { label: "Espalhe o espírito do Natal!", icon: SparkleIcon },
];

export function StudioFooter() {
  return (
    <footer className="studio-strip">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <span key={item.label} className="studio-strip-item">
            <Icon />
            {item.label}
          </span>
        );
      })}
    </footer>
  );
}
