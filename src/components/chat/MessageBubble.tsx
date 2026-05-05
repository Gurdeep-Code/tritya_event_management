import { motion } from "framer-motion";
import { forwardRef } from "react";
import { GraduationCap, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "bot" | "user";
  children: React.ReactNode;
  timestamp?: string;
}

export const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(
  ({ role, children, timestamp }, ref) => {
    const isBot = role === "bot";
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={cn(
          "flex items-end gap-2 max-w-full",
          isBot ? "justify-start" : "justify-end",
        )}
      >
        {isBot && (
          <div className="h-7 w-7 sm:h-9 sm:w-9 shrink-0 rounded-full bg-gradient-header flex items-center justify-center text-primary-foreground shadow-bubble">
            <GraduationCap className="w-4 sm:w-5"/>
          </div>
        )}
        <div className="flex flex-col gap-1 max-w-[82%] sm:max-w-[80%]">
          <div
            className={cn(
              "px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-bubble text-[13px] sm:text-[15px] leading-relaxed break-words",
              isBot
                ? "bg-card text-card-foreground rounded-bl-sm border border-border/40"
                : "bg-secondary text-secondary-foreground rounded-br-sm",
            )}
          >
            {children}
          </div>
          {timestamp && (
            <span
              className={cn(
                "text-[10px] sm:text-[11px] text-muted-foreground px-1",
                isBot ? "text-left" : "text-right",
              )}
            >
              {timestamp}
            </span>
          )}
        </div>
        {!isBot && (
          <div className="h-7 w-7 sm:h-9 sm:w-9 shrink-0 rounded-full bg-accent flex items-center justify-center text-accent-foreground shadow-bubble">
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        )}
      </motion.div>
    );
  },
);
MessageBubble.displayName = "MessageBubble";
