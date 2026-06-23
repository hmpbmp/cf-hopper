import { Dumbbell, Shuffle, Bookmark, List } from "lucide-react";

interface LandingPageProps {
  onStartWizard: () => void;
  onQuickGenerate: () => void;
  onPresets: () => void;
  onMovements: () => void;
}

const CARDS = [
  {
    key: "wizard" as const,
    icon: Dumbbell,
    title: "New Hopper",
    description: "Configure movements, reps, and format step by step",
    accent: true,
  },
  {
    key: "quick" as const,
    icon: Shuffle,
    title: "Quick Generate",
    description: "Instant random workout with default settings",
    accent: false,
  },
  {
    key: "presets" as const,
    icon: Bookmark,
    title: "Presets",
    description: "Ready-made configs for different training goals",
    accent: false,
  },
  {
    key: "movements" as const,
    icon: List,
    title: "Movements",
    description: "Browse and customize the full movement library",
    accent: false,
  },
];

export function LandingPage({ onStartWizard, onQuickGenerate, onPresets, onMovements }: LandingPageProps) {
  const handlers = {
    wizard: onStartWizard,
    quick: onQuickGenerate,
    presets: onPresets,
    movements: onMovements,
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl w-full">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-[#C41230]/10 flex items-center justify-center">
            <Dumbbell className="w-10 h-10 text-[#C41230]" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
          HOPPER
        </h1>

        <p className="text-[#A0A0A0] text-lg mb-12">
          Randomized CrossFit Workout Generator
        </p>

        <div className="grid grid-cols-2 gap-4">
          {CARDS.map(({ key, icon: Icon, title, description, accent }) => (
            <button
              key={key}
              onClick={handlers[key]}
              className={`
                p-6 rounded-xl text-left transition-all border group
                ${
                  accent
                    ? "bg-[#C41230]/10 border-[#C41230]/30 hover:border-[#C41230]/60"
                    : "bg-[#1A1A1A] border-[#333] hover:border-[#666]"
                }
              `}
            >
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center mb-4
                ${accent ? "bg-[#C41230]/20" : "bg-[#222]"}
              `}>
                <Icon className={`w-6 h-6 ${accent ? "text-[#C41230]" : "text-[#A0A0A0] group-hover:text-white"} transition-colors`} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">
                {title}
              </h3>
              <p className="text-[#666] text-sm">
                {description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
