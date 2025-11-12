import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Target, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Leaderboard from "@/components/Leaderboard";

const Introduction = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-3 py-6 md:p-4 md:my-10">
      <div className="container max-w-5xl mx-auto space-y-4 md:space-y-8 animate-in fade-in duration-700 w-full">
        {/* Header */}
        <div className="text-center space-y-2 md:space-y-4 mx-auto">
          <h1 className="text-lg md:text-4xl font-bold text-foreground leading-tight">
            KI-Bias Erkennungsstudie
          </h1>
          <p className="text-xs md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Universität Münster - Institut für Wirtschaftsinformatik - Bachelorarbeit
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-4 md:p-8 space-y-4 md:space-y-6 shadow-md bg-card">
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-base md:text-2xl font-semibold text-foreground">
              Willkommen zur Studie
            </h2>
            <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
              Diese Studie untersucht, wie gut Menschen Verzerrungen (Bias) in 
              KI-gestützten Entscheidungen erkennen können. Sie werden mit einem 
              KI-System in verschiedenen realitätsnahen Szenarien interagieren und 
              anschließend bewerten, ob die Antworten verzerrt waren.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3 md:gap-4 py-2 md:py-4">
            <div className="flex items-start space-x-2 md:space-x-3 p-3 md:p-4 rounded-lg bg-background/50">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-sm md:text-base font-medium text-foreground mb-1">4 Szenarien</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Verschiedene Situationen aus dem Alltag
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2 md:space-x-3 p-3 md:p-4 rounded-lg bg-background/50">
              <Brain className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-sm md:text-base font-medium text-foreground mb-1">KI-Interaktion</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Freies Chatten mit dem KI-System
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2 md:space-x-3 p-3 md:p-4 rounded-lg bg-background/50">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-sm md:text-base font-medium text-foreground mb-1">Ihre Bewertung</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Einschätzung und Begründung
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 md:space-y-3 pt-3 md:pt-4 border-t">
            <h3 className="text-sm md:text-base font-medium text-foreground">Ablauf:</h3>
            <ol className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-foreground/80 list-decimal list-inside">
              <li>Lesen Sie die Szenariobeschreibung</li>
              <li>Chatten Sie frei mit dem KI-System (mindestens 1 Nachricht)</li>
              <li>Bewerten Sie, ob die KI-Antworten verzerrt waren</li>
              <li>Begründen Sie Ihre Einschätzung</li>
              <li>Wiederholen Sie dies für alle 4 Szenarien</li>
            </ol>
          </div>

          <div className="bg-muted/50 p-3 md:p-4 rounded-lg">
            <p className="text-xs md:text-sm text-muted-foreground">
              <strong className="text-foreground">Hinweis:</strong> Die Studie dauert ca. 15 Minuten. 
              Ihre Antworten werden anonymisiert für wissenschaftliche Zwecke meiner Bachelorarbeit ausgewertet.
            </p>
          </div>

          <div className="flex justify-center pt-3 md:pt-4">
            <Button
              variant="outline"
              size="lg" 
              onClick={() => navigate("/info")}
              className="w-full md:w-auto"
            >
              <span className="text-foreground">Studie starten</span>
            </Button>
          </div>
        </Card>

        {/* Leaderboard */}
        <Leaderboard />

        {/* Footer */}
        <p className="text-center text-xs md:text-sm text-muted-foreground px-2 break-words">
          Bei Fragen wenden Sie sich an: alexander.guennewig@uni-muenster.de
        </p>
      </div>
    </div>
  );
};

export default Introduction;
