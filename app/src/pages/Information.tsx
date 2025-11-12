import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ensureParticipant, createSession, setStoredSessionId, setStoredParticipantId } from "@/lib/studyStore";

const MIN_AGE = 6;
const MAX_AGE = 100;

const Information = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [age, setAge] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("");

  const ages = useMemo(() => Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i), []);

  // On mount, snap to previously selected age if any
  useEffect(() => {
    const stored = localStorage.getItem("participantAge");
    const initial = stored ? parseInt(stored, 10) : NaN;
    if (containerRef.current) {
      const index = !isNaN(initial) ? Math.min(Math.max(initial, MIN_AGE), MAX_AGE) - MIN_AGE : 0;
      const itemHeight = 56; // must match h-14 below
      containerRef.current.scrollTo({ top: index * itemHeight - itemHeight, behavior: "instant" as ScrollBehavior });
      if (!isNaN(initial)) setAge(initial);
    }
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const itemHeight = 56; 
    const centerOffset = el.scrollTop + el.clientHeight / 2;
    const index = Math.round(centerOffset / itemHeight) - 1;
    const value = MIN_AGE + Math.min(Math.max(index, 0), ages.length - 1);
    setAge(value);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setAge(prev => {
        const next = Math.max((prev ?? MIN_AGE) - 1, MIN_AGE);
        scrollToAge(next);
        return next;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setAge(prev => {
        const next = Math.min((prev ?? MIN_AGE) + 1, MAX_AGE);
        scrollToAge(next);
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      onContinue();
    }
  };

  const scrollToAge = (value: number) => {
    if (!containerRef.current) return;
    const itemHeight = 56;
    const index = value - MIN_AGE;
    containerRef.current.scrollTo({ top: index * itemHeight - itemHeight, behavior: "smooth" });
  };

  const onContinue = async () => {
    try {
      if (age !== null) {
        localStorage.setItem("participantAge", String(age));
      }
      // Create participant (with age and username) → session
      const participant = await ensureParticipant(undefined, age ?? null, username.trim() || null)
      if (participant?.id) setStoredParticipantId(participant.id)
      const session = await createSession(participant?.id)
      setStoredSessionId(session.id)
      navigate("/study");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize session', e)
      navigate("/study");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-3 md:px-4 py-6 md:py-10">
        <Card className="p-4 md:p-6">
          <h1 className="text-base md:text-lg font-semibold">Eine kurze Information</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Bitte geben Sie Ihre Informationen an (optional).</p>

          <div className="mt-4 md:mt-8 space-y-4 md:space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground">
                Nutzername (optional)
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ihr Nutzername für die Rangliste"
                className="w-full"
              />
            </div>

            {/* Age Picker */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Alter (optional)</Label>
              {age !== null && (
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
                  <span className="text-sm text-muted-foreground">Ausgewählt:</span>
                  <span className="text-sm font-semibold text-foreground">{age}</span>
                </div>
              )}
              <div 
                className="relative mt-3 h-60 overflow-y-auto overflow-x-hidden snap-y snap-mandatory rounded-xl border bg-card"
                onScroll={handleScroll}
                ref={containerRef}
                tabIndex={0}
                onKeyDown={handleKey}
                aria-label="Alter wählen"
              >
                
                <div className="pointer-events-none absolute top-1/2 left-0 right-0 -translate-y-1/2 h-14 rounded-md bg-primary/5" />

                <div className="py-7" aria-live="polite" aria-atomic>
                  {ages.map(v => (
                    <div
                      key={v}
                      className={
                        "snap-center h-14 flex items-center justify-center text-xl md:text-2xl font-semibold transition-colors transition-transform " +
                        (age === v ? "text-primary scale-105" : "text-muted-foreground")
                      }
                      onClick={() => { setAge(v); scrollToAge(v); }}
                      role="button"
                      aria-pressed={age === v}
                    >
                      {v}
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Auf Touchpads mit zwei Fingern nach oben und unten scrollen.
              </p>
            </div>

            <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-2 md:gap-3">
              <Button className="bg-primary text-primary-foreground w-full sm:w-auto" onClick={onContinue}>
                Weiter
              </Button>
              <Button variant="ghost" className="w-full sm:w-auto" onClick={async () => {
                try {
                  const participant = await ensureParticipant(undefined, null, username.trim() || null)
                  if (participant?.id) setStoredParticipantId(participant.id)
                  const session = await createSession(participant?.id)
                  setStoredSessionId(session.id)
                } catch {}
                navigate("/study")
              }}>Überspringen</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Information;


