import { useState, useEffect, useRef } from "react";
import { LandingPage } from "@/components/layout/LandingPage";
import { WizardShell } from "@/components/layout/WizardShell";
import { StepMovements } from "@/components/wizard/StepMovements";
import { StepReps } from "@/components/wizard/StepReps";
import { StepFormat } from "@/components/wizard/StepFormat";
import { StepSimulate } from "@/components/wizard/StepSimulate";
import { StepReview } from "@/components/wizard/StepReview";
import { ResultsView } from "@/components/wizard/ResultsView";
import { PresetsPage } from "@/components/workout/PresetsPage";
import { MovementLibraryPage } from "@/components/workout/MovementLibraryPage";
import { useWizardStore } from "@/store/useWizardStore";
import { useHistoryStore } from "@/store/useHistoryStore";
import { useMovementOverridesStore } from "@/store/useMovementOverridesStore";
import { quickGenerate } from "@/engine/simulator";

type View = "landing" | "wizard" | "results" | "presets" | "movement-library";

export default function App() {
  const [view, setView] = useState<View>("landing");
  const { currentStep, goToStep, reset, setGeneratedWorkouts, generationCount } =
    useWizardStore();
  const { addWorkout, loadWorkouts } = useHistoryStore();
  const { loadOverrides } = useMovementOverridesStore();
  const prevGenerationCount = useRef(generationCount);

  // Load data from API on mount
  useEffect(() => {
    loadWorkouts();
    loadOverrides();
  }, [loadWorkouts, loadOverrides]);

  useEffect(() => {
    if (generationCount > prevGenerationCount.current) {
      setView("results");
    }
    prevGenerationCount.current = generationCount;
  }, [generationCount]);

  const handleStartWizard = () => {
    reset();
    goToStep(0);
    setView("wizard");
  };

  const handleQuickGenerate = () => {
    const workout = quickGenerate();
    setGeneratedWorkouts([workout]);
    addWorkout(workout);
    setView("results");
  };

  const handleNewHopper = () => {
    reset();
    goToStep(0);
    setView("landing");
  };

  const handleRunAgain = () => {
    goToStep(4);
    setView("wizard");
  };

  const renderWizardStep = () => {
    switch (currentStep) {
      case 0:
        return <StepMovements />;
      case 1:
        return <StepReps />;
      case 2:
        return <StepFormat />;
      case 3:
        return <StepSimulate />;
      case 4:
        return <StepReview />;
      default:
        return <StepMovements />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {view === "landing" && (
        <LandingPage
          onStartWizard={handleStartWizard}
          onQuickGenerate={handleQuickGenerate}
          onPresets={() => setView("presets")}
          onMovements={() => setView("movement-library")}
        />
      )}

      {view === "wizard" && (
        <WizardShell>{renderWizardStep()}</WizardShell>
      )}

      {view === "results" && (
        <ResultsView
          onNewHopper={handleNewHopper}
          onRunAgain={handleRunAgain}
        />
      )}

      {view === "presets" && (
        <PresetsPage
          onBack={() => setView("landing")}
          onLoadPreset={() => setView("wizard")}
        />
      )}

      {view === "movement-library" && (
        <MovementLibraryPage onBack={() => setView("landing")} />
      )}
    </div>
  );
}
