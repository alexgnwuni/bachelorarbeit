import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { fetchParticipantsSummary, fetchSessionsWithRuns, type ParticipantSummary, type SessionWithRuns } from "@/lib/adminStore";
import { scenarios } from "@/data/scenarios";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin";

const formatDate = (value: string | null | undefined) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("de-DE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
};

const Admin = () => {
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("admin_access_granted") === "true";
  });
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scenarioMap = useMemo(() => {
    return new Map(scenarios.map((scenario) => [scenario.id, scenario]));
  }, []);

  const participantsQuery = useQuery<ParticipantSummary[], Error>({
    queryKey: ["admin-participants"],
    queryFn: fetchParticipantsSummary,
    enabled: authorized,
  });

  const sessionsQuery = useQuery<SessionWithRuns[], Error>({
    queryKey: ["admin-sessions", selectedParticipantId],
    queryFn: () => fetchSessionsWithRuns(selectedParticipantId as string),
    enabled: authorized && Boolean(selectedParticipantId),
  });

  useEffect(() => {
    if (participantsQuery.data && participantsQuery.data.length > 0 && !selectedParticipantId) {
      setSelectedParticipantId(participantsQuery.data[0].id);
    }
  }, [participantsQuery.data, selectedParticipantId]);

  const handleUnlock = () => {
    if (password.trim() === ADMIN_PASSWORD) {
      setAuthorized(true);
      localStorage.setItem("admin_access_granted", "true");
      setErrorMessage(null);
    } else {
      setErrorMessage("Falsches Passwort");
    }
  };

  useEffect(() => {
    if (participantsQuery.error) {
      console.error('Failed to fetch participants:', participantsQuery.error);
    }
    if (sessionsQuery.error) {
      console.error('Failed to fetch sessions:', sessionsQuery.error);
    }
  }, [participantsQuery.error, sessionsQuery.error]);

  const participants: ParticipantSummary[] = participantsQuery.data ?? [];
  const selectedParticipant: ParticipantSummary | undefined = participants.find((p) => p.id === selectedParticipantId);
  const sessions: SessionWithRuns[] = sessionsQuery.data ?? [];

  if (!authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-semibold">Admin-Zugang</h1>
            <p className="text-sm text-muted-foreground">Bitte Passwort eingeben, um die Teilnehmerdaten einzusehen.</p>
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          </div>
          <Button onClick={handleUnlock} className="w-full">
            Entsperren
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-3 md:px-4 py-6 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-lg md:text-3xl font-semibold">Admin-Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Überblick über Teilnehmer, Sessions, Chatverläufe und automatische Bias-Analysen.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => participantsQuery.refetch()}>
              Teilnehmer aktualisieren
            </Button>
            <Button variant="outline" onClick={() => sessionsQuery.refetch()} disabled={!selectedParticipantId}>
              Sessions aktualisieren
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[320px,1fr]">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Teilnehmer</h2>
              <span className="text-xs text-muted-foreground">{participants.length} gesamt</span>
            </div>
            {participantsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Lade Teilnehmer...</p>
            ) : participantsQuery.isError ? (
              <div className="space-y-2">
                <p className="text-sm text-destructive">Fehler beim Laden der Teilnehmer.</p>
                <p className="text-xs text-muted-foreground">
                  {participantsQuery.error instanceof Error ? participantsQuery.error.message : 'Unbekannter Fehler'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Bitte prüfe die Browser-Konsole für Details.
                </p>
              </div>
            ) : participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Teilnehmer vorhanden.</p>
            ) : (
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {participants.map((participant) => {
                  const isActive = participant.id === selectedParticipantId;
                  return (
                    <button
                      key={participant.id}
                      type="button"
                      onClick={() => setSelectedParticipantId(participant.id)}
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                        isActive ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <p className="font-medium">{participant.username || "Anonym"}</p>
                      <p className="text-xs text-muted-foreground">
                        {participant.totalSessions} Sessions · {participant.totalPoints} Punkte
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Letzte Aktivität: {formatDate(participant.lastActive)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

            <div className="space-y-4">
              <Card className="p-4">
                {selectedParticipant ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="text-base font-semibold">{selectedParticipant.username || "Anonym"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sessions</p>
                      <p className="text-base font-semibold">{selectedParticipant.totalSessions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gesamtpunkte</p>
                      <p className="text-base font-semibold">{selectedParticipant.totalPoints}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Bitte einen Teilnehmer auswählen.</p>
                )}
              </Card>

              <div className="space-y-3">
                {sessionsQuery.isLoading ? (
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Lade Sessions...</p>
                  </Card>
                ) : sessions.length === 0 ? (
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Keine Sessions für diesen Teilnehmer vorhanden.</p>
                  </Card>
                ) : (
                  sessions.map((session) => (
                    <Card key={session.id} className="p-4 space-y-3">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold">Session {session.id.slice(0, 6)}...</p>
                          <p className="text-xs text-muted-foreground">
                            Gestartet: {formatDate(session.createdAt)} · Beendet: {formatDate(session.completedAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Punkte</p>
                          <p className="text-lg font-semibold">{session.totalPoints ?? 0}</p>
                        </div>
                      </div>

                      <Accordion type="single" collapsible className="w-full">
                        {session.runs.map((run) => {
                          const scenario = scenarioMap.get(run.scenarioId);
                          return (
                            <AccordionItem key={run.id} value={run.id}>
                              <AccordionTrigger>
                                <div className="flex flex-col text-left">
                                  <span className="text-sm font-semibold">
                                    {scenario?.title || run.scenarioId} · {run.biasCategory}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {run.isBiased ? "Nutzer sah Bias" : "Nutzer sah keinen Bias"} · Punkte: {run.pointsEarned}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4">
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div>
                                      <p className="text-xs text-muted-foreground">Confidence</p>
                                      <p className="text-sm font-medium">{run.confidence}/5</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Korrekt?</p>
                                      <p className={`text-sm font-medium ${run.isCorrect ? "text-green-600" : "text-destructive"}`}>
                                        {run.isCorrect ? "Ja" : "Nein"}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Begründung</p>
                                    <p className="text-sm whitespace-pre-wrap rounded-md border border-dashed bg-gray-50 p-3">
                                      {run.reasoning || "Keine Begründung hinterlegt."}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-2">Chatverlauf</p>
                                    <div className="max-h-64 overflow-y-auto rounded-md border bg-gray-50 p-3 space-y-2 text-xs">
                                      {run.chatHistory.length === 0 ? (
                                        <p className="text-muted-foreground">Kein Chatverlauf gespeichert.</p>
                                      ) : (
                                        run.chatHistory.map((message, index) => (
                                          <div key={`${run.id}-${index}`}>
                                            <span className="font-semibold">
                                              {message.role === "user" ? "Nutzer" : "KI"}:
                                            </span>{" "}
                                            {message.content}
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-2">Automatische Bias-Analyse</p>
                                    {run.aiAnalysis ? (
                                      <div className="rounded-md border border-dashed bg-white p-3 text-sm space-y-2">
                                        <p className="font-medium">
                                          Ergebnis:{" "}
                                          <span className={run.aiAnalysis.biasDetected ? "text-destructive" : "text-green-600"}>
                                            {run.aiAnalysis.biasDetected ? "Bias erkannt" : "Kein Bias"}
                                          </span>
                                        </p>
                                        <p>
                                          <span className="font-medium">Rationale: </span>
                                          {run.aiAnalysis.rationale}
                                        </p>
                                        {run.aiAnalysis.indicators?.length ? (
                                          <ul className="list-disc pl-5 space-y-1 text-xs">
                                            {run.aiAnalysis.indicators.map((indicator, idx) => (
                                              <li key={`${run.id}-indicator-${idx}`}>{indicator}</li>
                                            ))}
                                          </ul>
                                        ) : null}
                                        <p className="text-xs text-muted-foreground">
                                          Ausgewertet: {formatDate(run.aiAnalysis.evaluatedAt)}
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">
                                        Analyse noch ausstehend oder fehlgeschlagen.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </Card>
                  ))
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

