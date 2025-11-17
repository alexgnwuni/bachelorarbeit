import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Scenario } from "@/types/study";
import { Slider } from "@/components/ui/slider";

interface AssessmentFormProps {
  scenario: Scenario;
  onSubmit: (assessment: {
    isBiased: boolean;
    confidence: number;
    reasoning: string;
  }) => void;
}

const AssessmentForm = ({ scenario, onSubmit }: AssessmentFormProps) => {
  const [isBiased, setIsBiased] = useState<boolean | null>(null);
  const [confidence, setConfidence] = useState<number>(3);
  const [reasoning, setReasoning] = useState("");

  const handleSubmit = () => {
    if (isBiased === null || !reasoning.trim()) return;

    onSubmit({
      isBiased,
      confidence,
      reasoning: reasoning.trim(),
    });
  };

  const isValid = isBiased !== null && reasoning.trim().length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full">
      <Card className="p-4 md:p-6 shadow-md">
        <h2 className="text-base md:text-2xl font-semibold text-foreground mb-4">
          Bewertung: {scenario.title}
        </h2>
        
        <div className="space-y-6">
          
          <div className="space-y-3">
            <Label className="text-base font-medium">
              War die KI-Antwort verzerrt (biased)?
            </Label>
            <RadioGroup
              value={isBiased === null ? undefined : isBiased.toString()}
              onValueChange={(value) => setIsBiased(value === 'true')}
            >
              <div
                className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isBiased === true
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem 
                  value="true" 
                  id="biased-yes" 
                  className={isBiased === true ? "border-primary data-[state=checked]:border-primary" : ""}
                />
                <Label htmlFor="biased-yes" className={`cursor-pointer flex-1 ${isBiased === true ? "font-semibold text-primary" : ""}`}>
                  Ja, die Antworten waren verzerrt
                </Label>
              </div>
              <div
                className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isBiased === false
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem 
                  value="false" 
                  id="biased-no"
                  className={isBiased === false ? "border-primary data-[state=checked]:border-primary" : ""}
                />
                <Label htmlFor="biased-no" className={`cursor-pointer flex-1 ${isBiased === false ? "font-semibold text-primary" : ""}`}>
                  Nein, die Antworten waren neutral/fair
                </Label>
              </div>
            </RadioGroup>
          </div>

          
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Wie sicher sind Sie sich? ({confidence}/5)
            </Label>
            <div className="pt-2">
              <Slider
                value={[confidence]}
                onValueChange={([value]) => setConfidence(value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Unsicher</span>
                <span>Sehr sicher</span>
              </div>
            </div>
          </div>

          
          <div className="space-y-3">
            <Label htmlFor="reasoning" className="text-base font-medium">
              Begründung Ihrer Einschätzung
            </Label>
            <Textarea
              id="reasoning"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Beschreiben Sie, warum Sie zu dieser Einschätzung gekommen sind. Welche Aspekte der KI-Antworten haben Sie beachtet? Welche Strategien haben Sie verwendet?"
              className="min-h-[150px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Mindestens ein paar Wörter erforderlich
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full"
            size="lg"
          >
            Bewertung abschicken
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AssessmentForm;
