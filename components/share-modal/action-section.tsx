import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";

interface ActionSectionProps {
  icon: IconSvgElement; 
  title: string;
  children: React.ReactNode;
}

export function ActionSection({ icon, title, children }: ActionSectionProps) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
        <HugeiconsIcon icon={icon} className="w-4 h-4 text-muted-foreground" />
        {title}
      </h3>
      {children}
    </div>
  );
}