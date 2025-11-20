import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all select-none disabled:pointer-events-none disabled:opacity-50 \
   [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 \
   outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",

  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 \
           hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-500/30",

        destructive:
          "bg-red-600 text-white shadow-red-500/20 hover:bg-red-700 hover:shadow-red-500/40",

        outline:
          "border border-white/10 bg-white/5 text-white backdrop-blur-sm \
           hover:bg-white/10 hover:text-white shadow-sm shadow-indigo-500/10",

        secondary:
          "bg-indigo-900/40 text-indigo-100 border border-indigo-700/40 \
           hover:bg-indigo-800/40",

        ghost:
          "text-gray-300 hover:bg-white/10 hover:text-white transition",

        link: "text-indigo-400 hover:text-indigo-300 underline-offset-4 hover:underline",
      },

      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
