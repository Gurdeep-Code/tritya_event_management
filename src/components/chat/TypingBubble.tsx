import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { forwardRef } from "react";

export const TypingBubble = forwardRef<HTMLDivElement>((_, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="flex items-end gap-2"
  >
    <div className="h-7 w-7 sm:h-9 sm:w-9 shrink-0 rounded-full bg-gradient-header flex items-center justify-center text-primary-foreground shadow-bubble">
    <GraduationCap className="w-4 sm:w-5"/>
    </div>
    <div className="bg-card rounded-2xl rounded-bl-sm px-3 py-2 sm:px-4 sm:py-3 shadow-bubble flex items-center gap-1.5">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  </motion.div>
));
TypingBubble.displayName = "TypingBubble";