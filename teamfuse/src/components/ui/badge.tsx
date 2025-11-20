import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 \
   gap-1 [&>svg]:size-3 [&>svg]:pointer-events-none transition-all duration-300 \
   overflow-hidden select-none ring-1 ring-transparent",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-indigo-600 to-purple-600 text-white \
           hover:from-indigo-500 hover:to-purple-500 shadow-sm shadow-indigo-500/20",
        
        secondary:
          "bg-white/10 text-white border border-white/20 backdrop-blur-sm \
           hover:bg-white/20 hover:border-white/30",
        
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/30",
        
        outline:
          "border border-white/20 text-white/80 hover:bg-white/10 hover:text-white \
           dark:border-white/10 dark:hover:bg-white/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
