import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full rounded-lg px-3 py-2 text-base md:text-sm outline-none transition-all",
        "bg-white/5 backdrop-blur-md border border-white/10 shadow-sm",
        "placeholder:text-gray-400 text-white",
        "hover:bg-white/10",
        "focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-400/40",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "file:text-foreground file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  );
}

export { Input };
