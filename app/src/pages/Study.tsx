import { useEffect, useState } from "react";
import { getRandomizedScenarios } from "@/data/scenarios";
import type { UserAssessment } from "@/types/study";
import ScenarioChat from "@/components/ScenarioChat";
import AssessmentForm from "@/components/AssessmentForm";
import StudyProgress from "@/components/StudyProgress";
import { useNavigate } from "react-router-dom";
import ScenarioSummary from "@/components/ScenarioSummary";
import { createSession, getStoredSessionId, insertScenarioRun, setStoredSessionId, completeSession, getStoredParticipantId } from "@/lib/studyStore";

const Study = () => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [randomizedScenarios] = useState(() => getRandomizedScenarios());
  const [assessments, setAssessments] = useState<UserAssessment[]>([]);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [latestAssessment, setLatestAssessment] = useState<UserAssessment | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const navigate = useNavigate();

  const currentScenario = randomizedScenarios[currentScenarioIndex];
  const isLastScenario = currentScenarioIndex === randomizedScenarios.length - 1;
  const pointsSoFar =
    assessments.reduce((sum, a) => sum + (a.pointsEarned || 0), 0) +
    (showSummary && latestAssessment ? (latestAssessment.pointsEarned || 0) : 0);

  // Ensure a session exists 
  useEffect(() => {
    (async () => {
      const sid = getStoredSessionId();
      if (!sid) {
        try {
          const session = await createSession();
          setStoredSessionId(session.id);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Could not auto-create session', e);
        }
      }
    })();
  }, []);

  const handleChatComplete = (messages: any[]) => {
    setChatHistory(messages);
    setShowAssessment(true);
  };

  const handleAssessmentSubmit = async (assessment: Omit<UserAssessment, 'scenarioId' | 'chatHistory' | 'timestamp' | 'isCorrect' | 'pointsEarned'>) => {
    const isCorrect = assessment.isBiased === currentScenario.isBiased;
    const pointsEarned = isCorrect ? 100 + assessment.confidence * 10 : 0;

    const enriched: UserAssessment = {
      ...assessment,
      scenarioId: currentScenario.id,
      chatHistory: chatHistory,
      timestamp: new Date(),
      isCorrect,
      pointsEarned,
    };

    setLatestAssessment(enriched);
    setShowSummary(true);

    // Persist run to Supabase (best-effort)
    try {
      const sid = getStoredSessionId();
      if (sid) {
        const pid = getStoredParticipantId();
        await insertScenarioRun({
          sessionId: sid,
          participantId: pid,
          scenarioId: currentScenario.id,
          biasCategory: currentScenario.category,
          chatHistory: chatHistory,
          isBiased: assessment.isBiased,
          confidence: assessment.confidence,
          reasoning: assessment.reasoning,
          isCorrect,
          pointsEarned,
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to save scenario run', e);
    }
  };

  const handleSummaryContinue = async () => {
    if (!latestAssessment) return;
    const newAssessments = [...assessments, latestAssessment];
    setAssessments(newAssessments);

    if (isLastScenario) {
      localStorage.setItem('studyResults', JSON.stringify(newAssessments));
      // complete session in Supabase
      try {
        const sid = getStoredSessionId();
        if (sid) {
          const finalPoints = newAssessments.reduce((s, a) => s + (a.pointsEarned || 0), 0);
          await completeSession(sid, finalPoints);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to complete session', e);
      }
      navigate('/results');
    } else {
      setCurrentScenarioIndex(prev => prev + 1);
      setShowAssessment(false);
      setShowSummary(false);
      setLatestAssessment(null);
      setChatHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-background my-2 md:my-5">
      <StudyProgress 
        current={currentScenarioIndex + 1} 
        total={randomizedScenarios.length}
        totalPoints={pointsSoFar}
      />
      
      <div className="container max-w-5xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {showSummary && latestAssessment ? (
          <ScenarioSummary 
            scenario={currentScenario}
            assessment={latestAssessment}
            onContinue={handleSummaryContinue}
            isLastScenario={isLastScenario}
          />
        ) : !showAssessment ? (
          <ScenarioChat 
            scenario={currentScenario}
            onComplete={handleChatComplete}
          />
        ) : (
          <AssessmentForm 
            scenario={currentScenario}
            onSubmit={handleAssessmentSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default Study;
