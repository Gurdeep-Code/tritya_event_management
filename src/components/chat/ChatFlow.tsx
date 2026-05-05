import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { TypingBubble } from "./TypingBubble";
import { OptionButtons } from "./OptionButtons";
import { toast } from "@/hooks/use-toast";

type Msg =
  | { id: string; type: "bot"; content: React.ReactNode; ts: string }
  | { id: string; type: "user"; content: string; ts: string };

type Step =
  | "intro"
  | "q1"
  | "q2"
  | "q3"
  | "askPhone"
  | "askName"
  | "askEmail"
  | "askCity"
  | "askQualification"
  | "done";

const TYPING_DELAY = 800;

const now = () => {
  const d = new Date();
  const hours24 = d.getHours();
  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 >= 12 ? "PM" : "AM";
  return `Today at ${hours12.toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} ${ampm}`;
};

const uid = () => Math.random().toString(36).slice(2, 9);

interface ChatFlowProps {
  resetKey: number;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

export const ChatFlow = ({ resetKey, onSubmittingChange }: ChatFlowProps) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [input, setInput] = useState("");
  const [lead, setLead] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef(0);
  const leadSubmitMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const endpoint = import.meta.env.VITE_LEAD_ENDPOINT?.trim();
      if (!endpoint) throw new Error("Missing VITE_LEAD_ENDPOINT");

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          body || `Lead submit failed with status ${response.status}`,
        );
      }
    },
  });

  const buildLeadPayload = (
    leadData: Record<string, string>,
    stage: "phone_capture" | "final_submit",
  ) => ({
    name: leadData.name ?? "",
    phone: leadData.phone ?? "",
    email: leadData.email ?? "",
    city: leadData.city ?? "",
    qualification: leadData.qualification ?? "",
    course: leadData.course ?? "",
    interest: leadData.interest ?? "",
    contactPref: leadData.contactPref ?? "",
    source: "website_chatbot",
    page_url: window.location.href,
    submission_stage: stage,
    submitted_at: new Date().toISOString(),
  });

  const pushBot = (content: React.ReactNode) =>
    setMessages((m) => [...m, { id: uid(), type: "bot", content, ts: now() }]);

  const pushUser = (content: string) =>
    setMessages((m) => [...m, { id: uid(), type: "user", content, ts: now() }]);

  const botSequence = async (items: React.ReactNode[]) => {
    const myRun = runIdRef.current;
    for (const item of items) {
      if (runIdRef.current !== myRun) return;
      setTyping(true);
      await new Promise((r) => setTimeout(r, TYPING_DELAY));
      if (runIdRef.current !== myRun) return;
      setTyping(false);
      pushBot(item);
      await new Promise((r) => setTimeout(r, 200));
    }
  };

  useLayoutEffect(() => {
    runIdRef.current += 1;
    setMessages([]);
    setStep("intro");
    setTyping(false);
    setInput("");
    setLead({});
  }, [resetKey]);

  useEffect(() => {
    onSubmittingChange?.(leadSubmitMutation.isPending);
  }, [leadSubmitMutation.isPending, onSubmittingChange]);

  // Start intro only after the cleared state has been painted
  useEffect(() => {
    const myRun = runIdRef.current;
    const frameId = requestAnimationFrame(() => {
      void (async () => {
        await botSequence([
          <>
            Welcome to <strong>Tritya Institute of Event Management</strong>, established since
            2010, where we offer degree and diploma courses after 12th class and
            graduation in Event Management and Wedding Planning, with assured
            placement support and paid internships in leading event management
            and wedding planning companies.
          </>,
          <>
            <span className="font-semibold text-secondary">
            Upto 90% off* With Scholarship
            </span>
            {" | "}
            <span className="font-semibold text-primary">
            University Recognised Courses
            </span>
            {" | "}
            <span className="font-semibold text-accent">
            100+ Events Days Experience
            </span>
          </>,
          <>We are here to enhance and customize your experience. <strong>Kindly select the course</strong></>,
        ]);
        if (runIdRef.current === myRun) setStep("q1");
      })();
    });

    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Auto-scroll: keep newest message / typing indicator / option buttons in view
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
    return () => cancelAnimationFrame(id);
  }, [messages, typing, step]);

  const handleOption = async (value: string) => {
    pushUser(value);
    if (step === "q1") {
      setLead((l) => ({ ...l, course: value }));
      await botSequence([<>You are here for</>]);
      setStep("q2");
    } else if (step === "q2") {
      setLead((l) => ({ ...l, interest: value }));
      await botSequence([<>Perfect! Where shall we send you these details?</>]);
      setStep("q3");
    } else if (step === "q3") {
      setLead((l) => ({ ...l, contactPref: value }));
      await botSequence([<>Your number please 📞</>]);
      setStep("askPhone");
    }
  };

  const validate = (val: string): string | null => {
    if (step === "askPhone") {
      if (!/^[6-9]\d{9}$/.test(val.replace(/\D/g, "")))
        return "Enter a valid 10-digit mobile number";
    }
    if (step === "askName") {
      if (val.trim().length < 2 || val.trim().length > 60)
        return "Enter your full name";
    }
    if (step === "askEmail") {
      if (!/^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(val.trim()))
        return "Enter a valid email";
    }
    if (step === "askCity") {
      if (val.trim().length < 2 || val.trim().length > 60)
        return "Enter a valid city";
    }
    if (step === "askQualification") {
      if (val.trim().length < 2 || val.trim().length > 80)
        return "Enter your qualification";
    }
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = input.trim();
    if (!val || typing || leadSubmitMutation.isPending) return;
    const err = validate(val);
    if (err) {
      toast({
        title: "Please check",
        description: err,
        variant: "destructive",
      });
      return;
    }
    pushUser(val);
    setInput("");

    if (step === "askPhone") {
      const leadAfterPhone: Record<string, string> = { ...lead, phone: val };
      setLead(leadAfterPhone);
      const phoneCapturePayload = buildLeadPayload(
        leadAfterPhone,
        "phone_capture",
      );
      leadSubmitMutation.mutate(phoneCapturePayload, {
        onError: (error) => {
          console.error("Phone capture submission failed:", error);
        },
      });
      await botSequence([<>Your Name?</>]);
      setStep("askName");
    } else if (step === "askName") {
      setLead((l) => ({ ...l, name: val }));
      await botSequence([<>Your Email?</>]);
      setStep("askEmail");
    } else if (step === "askEmail") {
      setLead((l) => ({ ...l, email: val }));
      await botSequence([<>Your City?</>]);
      setStep("askCity");
    } else if (step === "askCity") {
      setLead((l) => ({ ...l, city: val }));
      await botSequence([<>Your Qualification?</>]);
      setStep("askQualification");
    } else if (step === "askQualification") {
      const finalLead: Record<string, string> = { ...lead, qualification: val };
      setLead(finalLead);
      await botSequence([
        <>🎉 Thanks for sharing your details! Redirecting…</>,
      ]);
      setStep("done");
      await botSequence([
        <>In case of urgency, kindly call on  <strong><i>+91-9910225389 / +91-9990937354</i></strong></>,
      ]);

      const payload = buildLeadPayload(finalLead, "final_submit");
      console.log("Final lead submission:", payload);

      leadSubmitMutation.mutate(payload, {
        onSuccess: () => {
          toast({
            title: "Submitted successfully",
            description: "Your details have been saved.",
          });
          window.location.replace("https://airhostessinstitute.com/thank-you/");
        },
        onError: (error) => {
          console.error("Lead submission failed:", error);
          toast({
            title: "Submission failed",
            description: "Unable to submit lead payload",
            variant: "destructive",
          });
        },
      });
    }
  };

  const isInputStep = [
    "askPhone",
    "askName",
    "askEmail",
    "askCity",
    "askQualification",
  ].includes(step);

  const inputPlaceholder =
    {
      askPhone: "10-digit mobile number",
      askName: "Your full name",
      askEmail: "you@example.com",
      askCity: "Your city",
      askQualification: "Your qualification",
    }[step as
      | "askPhone"
      | "askName"
      | "askEmail"
      | "askCity"
      | "askQualification"] ??
    "Type your message…";

  const inputType =
    step === "askPhone"
      ? "tel"
      : step === "askEmail"
        ? "email"
        : "text";

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 bg-dot-pattern"
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-3 sm:gap-4">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.type} timestamp={m.ts}>
                {m.type === "bot" ? m.content : m.content}
              </MessageBubble>
            ))}
            {typing || step === "done" && <TypingBubble key="typing" />}
            {!typing && step === "q1" && (
              <OptionButtons
                key="opts-q1"
                options={[
                  "BBA in Event Management",
                  "MBA in Event Management",
                  "Diploma in Event Management",
                  "PG Diploma in Event Management",
                  "Wedding Planning Certification",
                  "Celebrity Management Certification",
                  "Sports Management Certification",
                  "Digital Marketing Certification"
                ]}
                onSelect={handleOption}
              />
            )}
            {!typing && step === "q2" && (
              <OptionButtons
                key="opts-q2"
                options={[
                  "Fees Details",
                  "About us",
                  "Scholarship",
                  "All of the above",
                ]}
                onSelect={handleOption}
                highlightLast
              />
            )}
            {!typing && step === "q3" && (
              <OptionButtons
                key="opts-q3"
                options={["Call", "WhatsApp"]}
                onSelect={handleOption}
              />
            )}
          </AnimatePresence>

          <div ref={bottomRef} aria-hidden className="h-1 w-full" />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-border bg-card/80 backdrop-blur px-3 sm:px-6 py-3 sm:py-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]"
      >
        <div className="max-w-3xl mx-auto flex items-center gap-2 sm:gap-3">
          <input
            type={inputType}
            inputMode={inputType === "tel" ? "numeric" : undefined}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!isInputStep || typing || leadSubmitMutation.isPending}
            placeholder={
              isInputStep ? inputPlaceholder : "Choose an option above…"
            }
            className="flex-1 min-w-0 bg-muted/50 border border-border rounded-sm sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[15px] outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent disabled:opacity-100 disabled:cursor-not-allowed placeholder:text-foreground/70 disabled:placeholder:text-foreground/80 transition"
            maxLength={step === "askEmail" ? 120 : 80}
            autoFocus={isInputStep}
          />
          <button
            type="submit"
            disabled={
              !isInputStep ||
              !input.trim() ||
              typing ||
              leadSubmitMutation.isPending
            }
            className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-sm sm:rounded-xl bg-accent text-accent-foreground flex items-center justify-center shadow-glow hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Send"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
