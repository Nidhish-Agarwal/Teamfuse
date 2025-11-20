"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10 dark:ring-white/5 transition-all duration-300 hover:ring-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/20",
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full object-cover animate-fade-in",
        className
      )}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex items-center justify-center w-full h-full rounded-full \
         bg-gradient-to-br from-indigo-500/40 to-purple-600/40 \
         text-sm font-medium text-white backdrop-blur-sm animate-fade-in",
        className
      )}
      {...props}
    />
  );
}


export { Avatar, AvatarImage, AvatarFallback };
