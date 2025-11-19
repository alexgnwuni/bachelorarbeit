import { useEffect, useState } from "react";
import { scenarios } from "@/data/scenarios";
import type { UserAssessment } from "@/types/study";
import ScenarioChat from "@/components/ScenarioChat";
import AssessmentForm from "@/components/AssessmentForm";
import StudyProgress from "@/components/StudyProgress";
import { useNavigate } from "react-router-dom";
import ScenarioSummary from "@/components/ScenarioSummary";
import { createSession, getStoredSessionId, insertScenarioRun, setStoredSessionId, completeSession, getStoredParticipantId, updateScenarioRunAnalysis } from "@/lib/studyStore";
import type { ChatItem } from "@/lib/studyStore";
import { analyzeScenarioRun } from "@/lib/analysisClient";

const Study = () => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [orderedScenarios] = useState(() => [...scenarios]);
  const [assessments, setAssessments] = useState<UserAssessment[]>([]);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [latestAssessment, setLatestAssessment] = useState<UserAssessment | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const navigate = useNavigate();

  const currentScenario = orderedScenarios[currentScenarioIndex];
  const isLastScenario = currentScenarioIndex === orderedScenarios.length - 1;
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
          console.warn('Could not auto-create session', e);
        }
      }
    })();
  }, []);

  const handleChatComplete = (messages: ChatItem[]) => {
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
        const runRecord = await insertScenarioRun({
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

        // Trigger background AI analysis for admin insights
        if (runRecord?.id) {
          void (async () => {
            try {
              console.log('Starting AI analysis for run:', runRecord.id);
              const analysis = await analyzeScenarioRun({
                scenarioId: currentScenario.id,
                scenarioTitle: currentScenario.title,
                biasCategory: currentScenario.category,
                groundTruthIsBiased: currentScenario.isBiased,
                chatHistory: chatHistory,
                assessment: {
                  isBiased: assessment.isBiased,
                  confidence: assessment.confidence,
                  reasoning: assessment.reasoning,
                },
              });
              console.log('Analysis result:', analysis);
              await updateScenarioRunAnalysis(runRecord.id, {
                ...analysis,
                evaluatedAt: analysis.evaluatedAt ?? new Date().toISOString(),
              });
              console.log('Analysis saved successfully');
            } catch (analysisError) {
              console.error('Failed to analyze scenario run:', analysisError);
              if (analysisError instanceof Error) {
                console.error('Error message:', analysisError.message);
                console.error('Error stack:', analysisError.stack);
              }
            }
          })();
        }
      }
    } catch (e) {
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
    <div className="min-h-screen bg-background">
      <StudyProgress 
        current={currentScenarioIndex + 1} 
        total={orderedScenarios.length}
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
