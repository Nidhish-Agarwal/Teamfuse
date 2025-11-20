import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full rounded-lg px-3 py-2 text-base md:text-sm",
        "bg-white/5 backdrop-blur-md border border-white/10 text-white",
        "placeholder:text-gray-400",
        "hover:bg-white/10",
        "focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-400/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-all outline-none shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
