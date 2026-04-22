"use client";

import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const toneIcon = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info
};

export function ToastViewport() {
  const { items } = useToast();

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
      <AnimatePresence>
        {items.map((item) => {
          const Icon = toneIcon[item.tone];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              className={cn(
                "pointer-events-auto rounded-[1.8rem] border px-4 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.12)] backdrop-blur",
                item.tone === "success" && "border-emerald-200 bg-emerald-50/90",
                item.tone === "error" && "border-rose-200 bg-rose-50/90",
                item.tone === "info" && "border-black/10 bg-white/95"
              )}
            >
              <div className="flex items-start gap-3">
                <Icon size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-black">{item.title}</p>
                  {item.description ? <p className="mt-1 text-sm text-zinc-600">{item.description}</p> : null}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
