import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { QuizConfig, QuizParticipant, QuizAnswer } from "@/types/quiz";
import { getNextQuestionId, sendEmailGateWebhook, getQuestionText, getOptionText } from "@/utils/quizUtils";
import QuestionCard from "./QuestionCard";
import InterstitialCard from "./InterstitialCard";
import InterstitialStep from "./InterstitialStep";
import ProgressBar from "./ProgressBar";

interface QuizControllerProps {
  config: QuizConfig;
}

type QuizStage = "intro" | "questions" | "interstitial-a" | "interstitial-b" | "interstitial-c" | "interstitial" | "redirecting";

const QuizController = ({ config }: QuizControllerProps) => {
  const [stage, setStage] = useState<QuizStage>("questions");
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    config.questions.length > 0 ? config.questions[0].id : null
  );
  const [questionHistory, setQuestionHistory] = useState<string[]>(
    config.questions.length > 0 ? [config.questions[0].id] : []
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isInterstitialTransitioning, setIsInterstitialTransitioning] = useState(false);
  const [currentInterstitial, setCurrentInterstitial] = useState<'a' | 'b' | 'c' | null>(null);
  const [participant, setParticipant] = useState<QuizParticipant>({
    name: "",
    email: "",
    answers: []
  });
  
  // Interstitial data state for generic interstitials (if used)
  const [interstitialData, setInterstitialData] = useState<{
    title: string;
    features: Array<{ title: string; description: string; icon?: string }>;
  } | null>(null);

  const { toast } = useToast();
  const [hasSentCompletionData, setHasSentCompletionData] = useState(false);

  // Effect to handle completion of questions and redirect
  useEffect(() => {
    if (stage === "questions" && currentQuestionId === null && participant.answers.length > 0 && !hasSentCompletionData) {
      setHasSentCompletionData(true);
      setStage("redirecting");
      
      console.log("=== QUIZ COMPLETE - INITIATING WEBHOOK & REDIRECT ===");
      
      // 1. Prepare Data Payload
      const humanReadableMap: Record<string, string> = {};
      participant.answers.forEach((ans) => {
        const qTitle = getQuestionText(ans.questionId, config);
        const optionText = getOptionText(ans.questionId, ans.value, config);
        humanReadableMap[qTitle] = optionText;
      });

      const payloadOverride = {
        name: "Spanish Learner",
        email: "Spanishlearner@fallsale.com",
        score: JSON.stringify(humanReadableMap),
        "quizz-id": "fall-sale"
      };

      // 2. Send Webhook (Fire and forget, but log errors)
      if (config.webhookUrl && config.webhookUrl.trim() !== "") {
        console.log("Sending completion webhook...");
        sendEmailGateWebhook(config.webhookUrl, "Spanishlearner@fallsale.com", payloadOverride)
          .then((success) => console.log("Webhook sent successfully:", success))
          .catch((error) => console.error("Webhook send failed:", error));
      } else {
        console.log("No webhook URL configured, skipping.");
      }

      // 3. Send Redirect Message to Parent
      const redirectUrl = "https://spanishvip.com/sale/new-year/adults/";
      console.log(`Sending redirect message for URL: ${redirectUrl}`);
      
      try {
        window.parent.postMessage({
          action: 'redirect',
          url: redirectUrl
        }, '*'); 
        // Note: targetOrigin is '*' to allow any parent to receive the message. 
        // In production, you might want to restrict this if known.
        
        // Fallback for direct access (not in iframe)
        if (window.parent === window) {
           console.log("Not in iframe, redirecting directly window.location");
           window.location.href = redirectUrl;
        }
      } catch (e) {
        console.error("Error sending postMessage:", e);
        // Fallback
        window.location.href = redirectUrl;
      }
    }
  }, [stage, currentQuestionId, participant.answers, hasSentCompletionData, config]);

  const handleAnswer = (answer: QuizAnswer) => {
    console.log("Answer received:", answer);
    
    // Update or add the answer
    const existingIndex = participant.answers.findIndex(
      (a) => a.questionId === answer.questionId
    );
    
    if (existingIndex > -1) {
      const updatedAnswers = [...participant.answers];
      updatedAnswers[existingIndex] = answer;
      setParticipant({ ...participant, answers: updatedAnswers });
    } else {
      setParticipant({
        ...participant,
        answers: [...participant.answers, answer]
      });
    }
  };

  // Add this function to determine when to show interstitials
  const shouldShowInterstitial = useCallback((fromQuestionId: string, toQuestionId: string): 'a' | 'b' | 'c' | null => {
    // After Q1 → Q2, show Interstitial A
    if (fromQuestionId === 'q1' && toQuestionId === 'q2') {
      return 'a';
    }
    
    // After Q3 → Q4, show Interstitial B
    if (fromQuestionId === 'q3' && toQuestionId === 'q4') {
      return 'b';
    }
    
    // After Q5 → Q6, show Interstitial C
    if (fromQuestionId === 'q5' && toQuestionId === 'q6') {
      return 'c';
    }
    
    return null;
  }, []);
  
  const handleNext = useCallback(() => {
    if (!currentQuestionId) {
      return;
    }
    
    // Find next question ID
    const nextQuestionId = getNextQuestionId(
      currentQuestionId,
      participant.answers,
      config.questions
    );
    
    if (nextQuestionId) {
      // Check if we should show an interstitial
      const interstitialType = shouldShowInterstitial(currentQuestionId, nextQuestionId);
      
      if (interstitialType) {
        // Show interstitial instead of next question
        setIsTransitioning(true);
        
        setTimeout(() => {
          setStage(`interstitial-${interstitialType}` as QuizStage);
          setCurrentInterstitial(interstitialType);
          setIsTransitioning(false);
        }, 300); // Question fade-out duration
      } else {
        // Regular question transition
        setIsTransitioning(true);
        
        setTimeout(() => {
          setCurrentQuestionId(nextQuestionId);
          setQuestionHistory(prev => [...prev, nextQuestionId]);
          setIsTransitioning(false);
        }, 50);
      }
    } else {
      // End of questions
      setCurrentQuestionId(null);
    }
  }, [currentQuestionId, participant.answers, config.questions, shouldShowInterstitial]);

  // New interstitial handlers
  const handleInterstitialContinue = useCallback(() => {
    if (!currentInterstitial || isInterstitialTransitioning) return;
    
    setIsInterstitialTransitioning(true);
    
    // Determine which question to go to after interstitial
    let nextQuestionId: string | null = null;
    
    if (currentInterstitial === 'a') {
      // After Interstitial A, go to Q2
      nextQuestionId = 'q2';
    } else if (currentInterstitial === 'b') {
      // After Interstitial B, go to Q4
      nextQuestionId = 'q4';
    } else if (currentInterstitial === 'c') {
      // After Interstitial C, go to Q6
      nextQuestionId = 'q6';
    }
    
    setTimeout(() => {
      if (nextQuestionId) {
        setStage("questions");
        setCurrentQuestionId(nextQuestionId);
        setQuestionHistory(prev => [...prev, nextQuestionId]);
        setCurrentInterstitial(null);
      }
      setIsInterstitialTransitioning(false);
    }, 500); // Interstitial fade-out duration
  }, [currentInterstitial, isInterstitialTransitioning]);

  const handleInterstitialBack = useCallback(() => {
    if (!currentInterstitial || isInterstitialTransitioning) return;
    
    setIsInterstitialTransitioning(true);
    
    // Determine which question to go back to
    let previousQuestionId: string | null = null;
    
    if (currentInterstitial === 'a') {
      // Before Interstitial A, go back to Q1
      previousQuestionId = 'q1';
    } else if (currentInterstitial === 'b') {
      // Before Interstitial B, go back to Q3
      previousQuestionId = 'q3';
    } else if (currentInterstitial === 'c') {
      // Before Interstitial C, go back to Q5
      previousQuestionId = 'q5';
    }
    
    setTimeout(() => {
      if (previousQuestionId) {
        setStage("questions");
        setCurrentQuestionId(previousQuestionId);
        setCurrentInterstitial(null);
      }
      setIsInterstitialTransitioning(false);
    }, 500);
  }, [currentInterstitial, isInterstitialTransitioning]);

  const handlePrevious = useCallback(() => {
    if (questionHistory.length <= 1) {
      return;
    }
    
    // Check if we're coming from an interstitial
    if (currentInterstitial) {
      handleInterstitialBack();
      return;
    }
    
    // Regular question back navigation
    setIsTransitioning(true);
    
    const newHistory = [...questionHistory];
    newHistory.pop();
    const previousQuestionId = newHistory[newHistory.length - 1];
    
    setTimeout(() => {
      setCurrentQuestionId(previousQuestionId);
      setQuestionHistory(newHistory);
      setIsTransitioning(false);
    }, 50);
  }, [questionHistory, currentInterstitial, handleInterstitialBack]);


  // Calculate progress and question numbers
  const calculateProgress = () => {
    if (!currentQuestionId || config.questions.length === 0) return 0;
    
    const currentIndex = config.questions.findIndex(q => q.id === currentQuestionId);
    if (currentIndex === -1) return 0;
    
    return Math.round(((currentIndex + 1) / config.questions.length) * 100);
  };

  const getCurrentQuestionNumber = () => {
    if (!currentQuestionId) return 1;
    const currentIndex = config.questions.findIndex(q => q.id === currentQuestionId);
    return currentIndex + 1;
  };
  
  // Find current question
  const currentQuestion = currentQuestionId
    ? config.questions.find(q => q.id === currentQuestionId)
    : null;
  
  // Find current answer if it exists
  const currentAnswer = currentQuestionId
    ? participant.answers.find(a => a.questionId === currentQuestionId)
    : undefined;

  const canGoBack = questionHistory.length > 1;

  // Render the appropriate stage
  const renderStage = () => {
    switch (stage) {
      case "questions":
        return currentQuestion ? (
          <QuestionCard
            question={currentQuestion}
            currentAnswer={currentAnswer}
            canGoBack={canGoBack}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isTransitioning={isTransitioning}
          />
        ) : (
          <div className="w-full max-w-2xl bg-svip-card rounded-xl shadow-svip p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-svip-accent border-r-transparent border-b-svip-accent border-l-transparent"></div>
              <p className="mt-4 text-svip-muted text-lg">Finalizing...</p>
            </div>
          </div>
        );
      case "interstitial-a":
        return (
          <InterstitialStep
            type="a"
            onContinue={handleInterstitialContinue}
            isTransitioning={isInterstitialTransitioning}
          />
        );
      case "interstitial-b":
        return (
          <InterstitialStep
            type="b"
            onContinue={handleInterstitialContinue}
            isTransitioning={isInterstitialTransitioning}
          />
        );
      case "interstitial-c":
        return (
          <InterstitialStep
            type="c"
            onContinue={handleInterstitialContinue}
            isTransitioning={isInterstitialTransitioning}
          />
        );
      case "interstitial":
        return interstitialData ? (
          <InterstitialCard
            title={interstitialData.title}
            features={interstitialData.features}
            onCtaClick={() => handleNext()} // Generic continue
          />
        ) : null;
      case "redirecting":
        return (
             <div className="w-full max-w-2xl bg-svip-card rounded-xl shadow-svip p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-svip-accent border-r-transparent border-b-svip-accent border-l-transparent"></div>
              <p className="mt-4 text-svip-muted text-lg">Redirecting you to our special offer...</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-svip-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* SpanishVIP Logo - show on questions and interstitials */}
        { (
          <div className="flex justify-center mb-6">
            <img
              src="/images/SpanishVIP Logo.png"
              alt="SpanishVIP Logo"
              className="h-8 md:h-11 w-auto"
            />
          </div>
        )}
        
        {/* Progress Bar - hide during interstitials */}
        {stage === "questions" && currentQuestion && (
          <ProgressBar
            progress={calculateProgress()}
            currentQuestion={getCurrentQuestionNumber()}
            totalQuestions={config.questions.length}
            className="mb-6"
          />
        )}
        
        {renderStage()}
      </div>
    </div>
  );
};

export default QuizController;

