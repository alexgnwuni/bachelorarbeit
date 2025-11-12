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
      <div className="container max-w-5xl mx-auto px-3 md:px-4 py-3 md:py-4">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <span className="text-xs md:text-sm font-medium text-foreground whitespace-nowrap">
              Szenario {current} von {total}
            </span>
            {typeof totalPoints === 'number' && (
              <div className="inline-flex items-center gap-1.5 md:gap-2 rounded-full bg-primary/10 px-2 md:px-3 py-0.5 md:py-1">
                <Trophy className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" aria-hidden="true" />
                <span className="text-xs md:text-sm font-semibold text-foreground">{totalPoints}</span>
              </div>
            )}
          </div>
          <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
            {Math.round(percentage)}%
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    </div>
  );
};

export default StudyProgress;
