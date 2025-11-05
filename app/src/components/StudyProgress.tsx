import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

interface StudyProgressProps {
  current: number;
  total: number;
  totalPoints?: number;
}

const StudyProgress = ({ current, total, totalPoints }: StudyProgressProps) => {
  const percentage = (current / total) * 100;

  return (
    <div className="bg-card border-b shadow-md">
      <div className="container max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">
              Szenario {current} von {total}
            </span>
            {typeof totalPoints === 'number' && (
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
                <Trophy className="w-4 h-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-semibold text-foreground">{totalPoints}</span>
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {Math.round(percentage)}% abgeschlossen
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    </div>
  );
};

export default StudyProgress;
