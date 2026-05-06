import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { ChatFlow } from "@/components/chat/ChatFlow";
import logoMain from "@/assets/Logo_Main.png";
import logoBest from "@/assets/Image_Best.png";


const Index = () => {
  const [resetKey, setResetKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* Top promo bar */}
      <div className="bg-secondary/90 shrink-0 text-accent-foreground text-center text-[11px] sm:text-sm font-semibold py-2 sm:py-2.5 px-3 sm:px-4">
      🎓✨ TIEM Delhi - Where future event professionals are made.
      </div>

      {/* Sticky Header */}
      <header className="shrink-0 z-30 backdrop-blur border-b border-border bg-background">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center min-w-0 gap-2 mx-auto">
            <img
              src={logoMain}
              alt="Tritya Event Management"
              className="w-32 sm:w-48 md:w-56 object-contain drop-shadow-sm"
            />
             <img
              src={logoBest}
              alt="Tritya Event Management"
              className="w-24 sm:w-32 md:w-36 object-contain drop-shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setResetKey((k) => k + 1)}
              disabled={isSubmitting}
              className="inline-flex bg-accent items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-2 sm:py-3  rounded-[8px] text-accent-foreground text-[11px] sm:text-xs font-semibold hover:bg-background/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Restart conversation"
            >
              <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Restart
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <ChatFlow resetKey={resetKey} onSubmittingChange={setIsSubmitting} />
      </main>
    </div>
  );
};

export default Index;
