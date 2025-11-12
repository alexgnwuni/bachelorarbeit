import { Card } from "@/components/ui/card";
import { Award, Brain, CheckCircle2, Zap } from "lucide-react";
import type { Badge } from "@/types/study";

interface BadgeDisplayProps {
  badges: Badge[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  award: Award,
  brain: Brain,
  check: CheckCircle2,
  zap: Zap,
};

const BadgeDisplay = ({ badges }: BadgeDisplayProps) => {
  return (
    <Card className="p-6 shadow-md">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Errungenschaften
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge) => {
          const IconComponent = iconMap[badge.icon] || Award;
          return (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                badge.earned
                  ? "border-primary bg-green-200 shadow-md"
                  : "border-border bg-muted/30 opacity-60"
              }`}
            >
              <div className="flex justify-center mb-2">
                <IconComponent
                  className={`w-8 h-8 ${
                    badge.earned ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <div
                className={`font-semibold text-sm mb-1 ${
                  badge.earned ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {badge.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {badge.description}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default BadgeDisplay;

