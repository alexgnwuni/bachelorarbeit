import { useState } from "react";
import { getRandomizedScenarios } from "@/data/scenarios";
import type { UserAssessment } from "@/types/study";
import ScenarioChat from "@/components/ScenarioChat";
import AssessmentForm from "@/components/AssessmentForm";
import StudyProgress from "@/components/StudyProgress";
import { useNavigate } from "react-router-dom";

const Study = () => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [randomizedScenarios] = useState(() => getRandomizedScenarios());
  const [assessments, setAssessments] = useState<UserAssessment[]>([]);
  const [showAssessment, setShowAssessment] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const navigate = useNavigate();

  const currentScenario = randomizedScenarios[currentScenarioIndex];
  const isLastScenario = currentScenarioIndex === randomizedScenarios.length - 1;

  const handleChatComplete = (messages: any[]) => {
    setChatHistory(messages);
    setShowAssessment(true);
  };

  const handleAssessmentSubmit = (assessment: Omit<UserAssessment, 'scenarioId' | 'chatHistory' | 'timestamp'>) => {
    const fullAssessment: UserAssessment = {
      ...assessment,
      scenarioId: currentScenario.id,
      chatHistory: chatHistory,
      timestamp: new Date(),
    };

    const newAssessments = [...assessments, fullAssessment];
    setAssessments(newAssessments);

    if (isLastScenario) {
      // Store results and navigate to results page
      localStorage.setItem('studyResults', JSON.stringify(newAssessments));
      navigate('/results');
    } else {
      // Move to next scenario
      setCurrentScenarioIndex(prev => prev + 1);
      setShowAssessment(false);
      setChatHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-background my-5">
      <StudyProgress 
        current={currentScenarioIndex + 1} 
        total={randomizedScenarios.length} 
      />
      
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {!showAssessment ? (
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
