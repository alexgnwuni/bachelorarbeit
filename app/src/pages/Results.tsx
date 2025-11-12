import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { UserAssessment, BiasCategory, Badge, GameStats } from "@/types/study";
import { scenarios } from "@/data/scenarios";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";
import BadgeDisplay from "@/components/BadgeDisplay";
import Leaderboard from "@/components/Leaderboard";

const Results = () => {
  const [assessments, setAssessments] = useState<UserAssessment[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalPoints: 0,
    currentStreak: 0,
    badges: [],
    rank: "Anfänger"
  });
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('studyResults');
    if (!stored) {
      navigate('/');
      return;
    }
    const parsedAssessments = JSON.parse(stored);
    setAssessments(parsedAssessments);

    // Calculate game stats
    const totalPoints = parsedAssessments.reduce((sum: number, a: UserAssessment) => sum + (a.pointsEarned || 0), 0);
    const correctCount = parsedAssessments.filter((a: UserAssessment) => a.isCorrect).length;
    const allCorrect = correctCount === parsedAssessments.length;
    const allPerfect = allCorrect && parsedAssessments.every((a: UserAssessment) => a.confidence === 5);

    // Determine rank
    let rank = "Anfänger";
    if (totalPoints > 600) rank = "Meister";
    else if (totalPoints > 400) rank = "Experte";
    else if (totalPoints > 200) rank = "Fortgeschritten";

    // Calculate badges
    const badges: Badge[] = [
      {
        id: "detective",
        name: "Bias-Detektiv",
        description: "Alle Szenarien korrekt bewertet",
        icon: "award",
        earned: allCorrect
      },
      {
        id: "perfectionist",
        name: "Perfektionist",
        description: "Alle korrekt mit Sicherheit 5",
        icon: "brain",
        earned: allPerfect
      },
      {
        id: "thinker",
        name: "Kritischer Denker",
        description: "Mind. 2 korrekt erkannt",
        icon: "check",
        earned: correctCount >= 2
      },
      {
        id: "fast",
        name: "Schnelldenker",
        description: "Studie abgeschlossen",
        icon: "zap",
        earned: true
      }
    ];

    setGameStats({
      totalPoints,
      currentStreak: 0,
      badges,
      rank
    });
  }, [navigate]);

  const calculateAccuracy = (assessments: UserAssessment[]) => {
    if (assessments.length === 0) return 0;
    
    const correct = assessments.filter(assessment => {
      const scenario = scenarios.find(s => s.id === assessment.scenarioId);
      return scenario && scenario.isBiased === assessment.isBiased;
    }).length;

    return (correct / assessments.length) * 100;
  };

  const calculateAccuracyByCategory = (category: BiasCategory) => {
    const categoryAssessments = assessments.filter(assessment => {
      const scenario = scenarios.find(s => s.id === assessment.scenarioId);
      return scenario?.category === category;
    });

    return calculateAccuracy(categoryAssessments);
  };

  const overallAccuracy = calculateAccuracy(assessments);

  const categoryNames: Record<BiasCategory, string> = {
    gender: 'Geschlecht',
    age: 'Alter',
    ethnicity: 'Ethnische Herkunft',
    status: 'Status'
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Vielen Dank für Ihre Teilnahme!
          </h1>
          <p className="text-lg text-muted-foreground">
            Hier ist eine Zusammenfassung Ihrer Ergebnisse
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 bg-card shadow-md text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-medium text-muted-foreground mb-2">
              Gesamtpunkte
            </h2>
            <div className="text-6xl font-bold text-foreground mb-2 animate-in zoom-in-50">
              {gameStats.totalPoints}
            </div>
            <p className="text-muted-foreground font-semibold">
              Rang: {gameStats.rank}
            </p>
          </Card>

          <Card className="p-8 bg-card shadow-md text-center">
            <h2 className="text-lg font-medium text-muted-foreground mb-2">
              Gesamtgenauigkeit
            </h2>
            <div className="text-6xl font-bold text-foreground mb-2">
              {Math.round(overallAccuracy)}%
            </div>
            <p className="text-muted-foreground">
              {assessments.filter(a => a.isCorrect).length} von {assessments.length} korrekt erkannt
            </p>
          </Card>
        </div>

        <BadgeDisplay badges={gameStats.badges} />

        <Leaderboard />

        <Card className="p-6 shadow-md">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Erkennungsleistung nach Kategorie
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {(['gender', 'age', 'ethnicity', 'status'] as BiasCategory[]).map(category => {
              const accuracy = calculateAccuracyByCategory(category);
              return (
                <div key={category} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">
                      {categoryNames[category]}
                    </span>
                    <span className="text-2xl font-bold text-foreground">
                      {Math.round(accuracy)}%
                    </span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 shadow-md">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Detaillierte Bewertungen
          </h2>
          <div className="space-y-3">
            {assessments.map((assessment, index) => {
              const scenario = scenarios.find(s => s.id === assessment.scenarioId);
              const isCorrect = scenario?.isBiased === assessment.isBiased;
              
              return (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card flex items-start gap-3"
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-foreground mb-1">
                      {scenario?.title} ({categoryNames[scenario?.category as BiasCategory]})
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Ihre Einschätzung: {assessment.isBiased ? 'Verzerrt' : 'Neutral'} 
                      {' · '}
                      Sicherheit: {assessment.confidence}/5
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 bg-muted/50">
          <p className="text-foreground/80 leading-relaxed">
            Ihre Antworten wurden gespeichert und werden für wissenschaftliche Zwecke 
            anonymisiert ausgewertet. Die Daten helfen uns zu verstehen, wie Menschen 
            Bias in KI-Systemen erkennen und welche Strategien dabei zum Einsatz kommen.
          </p>
          <p className="text-foreground/80 leading-relaxed mt-3">
            Bei Fragen zur Studie wenden Sie sich bitte an: alexander.guennewig@uni-muenster.de
          </p>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={() => {
              localStorage.removeItem('studyResults');
              navigate('/');
            }}
            variant="outline"
          >
            Zurück zum Start
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
