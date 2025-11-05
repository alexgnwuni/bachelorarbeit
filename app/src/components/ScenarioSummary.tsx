import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Trophy, Flame, Sparkles } from "lucide-react";
import type { Scenario, UserAssessment } from "@/types/study";

interface ScenarioSummaryProps {
  scenario: Scenario;
  assessment: UserAssessment;
  onContinue: () => void;
  isLastScenario: boolean;
}

const ScenarioSummary = ({ assessment, onContinue, isLastScenario }: ScenarioSummaryProps) => {
  const [showPoints, setShowPoints] = useState(false);
  const [animatedPoints, setAnimatedPoints] = useState(0);

  useEffect(() => {
    // Start point animation after a short delay
    const timer = setTimeout(() => {
      setShowPoints(true);
      animatePoints();
    }, 500);

    return () => clearTimeout(timer);
  }, [assessment.pointsEarned]);

  const animatePoints = () => {
    const duration = 1500;
    const steps = 50;
    const increment = assessment.pointsEarned / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= assessment.pointsEarned) {
        setAnimatedPoints(assessment.pointsEarned);
        clearInterval(interval);
      } else {
        setAnimatedPoints(Math.floor(current));
      }
    }, duration / steps);
  };

  const getStreakBonus = () => {
    if (assessment.pointsEarned > 150) return 50;
    return 0;
  };

  const getConfidenceBonus = () => assessment.confidence * 10;
  const basePoints = 100;

  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-in fade-in">
      <Card className="max-w-2xl w-full shadow-md">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {assessment.isCorrect ? (
              <div className="relative">
                <CheckCircle2 className="w-24 h-24 text-green-500 animate-in zoom-in-50" />
              </div>
            ) : (
              <XCircle className="w-24 h-24 text-destructive animate-in zoom-in-50" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold">
            {assessment.isCorrect ? "Perfekt erkannt!" : "Nicht ganz richtig"}
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {assessment.isCorrect 
              ? "Du hast den Bias korrekt identifiziert!" 
              : "Weiter geht's - du wirst besser!"}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Point Animation */}
          {assessment.isCorrect && (
            <div className="text-center py-8 relative">
              <div className="inline-flex items-center gap-3 px-8 py-6 rounded-2xl animate-in zoom-in-50">
                <Trophy className="w-12 h-12 text-primary" />
                <div className="text-6xl font-bold text-primary animate-pulse">
                  {showPoints ? `+${animatedPoints}` : "..."}
                </div>
              </div>
              
              {showPoints && animatedPoints === assessment.pointsEarned && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-4xl animate-in fade-in">✨</div>
                </div>
              )}
            </div>
          )}

          {/* Point Breakdown */}
          {assessment.isCorrect && showPoints && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Basis-Punkte</span>
                <span className="text-lg font-bold text-primary">+{basePoints}</span>
              </div>
              
              {getConfidenceBonus() > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Selbstvertrauen Bonus</span>
                  <span className="text-lg font-bold text-primary">+{getConfidenceBonus()}</span>
                </div>
              )}
              
              {getStreakBonus() > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium">Streak Bonus</span>
                  </div>
                  <span className="text-lg font-bold text-orange-500">+{getStreakBonus()}</span>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Card className="p-4 bg-card/50">
              <div className="text-sm text-muted-foreground mb-1">Deine Einschätzung</div>
              <div className="font-bold text-lg">
                {assessment.isBiased ? "Bias erkannt" : "Kein Bias"}
              </div>
            </Card>
            
            <Card className="p-4 bg-card/50">
              <div className="text-sm text-muted-foreground mb-1">Selbstvertrauen</div>
              <div className="font-bold text-lg">
                {assessment.confidence}/5
              </div>
            </Card>
          </div>

          {/* Reasoning */}
          {assessment.reasoning && (
            <Card className="p-4 bg-muted/30">
              <div className="text-sm text-muted-foreground mb-2">Deine Begründung:</div>
              <p className="text-sm">{assessment.reasoning}</p>
            </Card>
          )}

          {/* Continue Button */}
          <Button 
            onClick={onContinue}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {isLastScenario ? "Zum Endergebnis 🏆" : "Nächstes Szenario →"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScenarioSummary;
