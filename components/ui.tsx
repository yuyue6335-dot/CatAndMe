import type React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md";
};

export function Button({ className, variant = "default", size = "md", ...props }: ButtonProps) {
  const variants = {
    default: "bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(54,122,83,0.22)] hover:bg-[#2f764a]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-[#dcefe2]",
    ghost: "text-text hover:bg-black/5",
    outline: "border border-line bg-white/80 text-text hover:border-primary/35 hover:bg-white"
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition duration-200",
        "active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-white/70 bg-white/90 shadow-soft ring-1 ring-black/[0.02]", className)}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-transparent bg-[#f4f7f6] px-3.5 text-sm text-text outline-none transition duration-200",
        "placeholder:text-muted/70 hover:bg-white focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-y rounded-xl border border-transparent bg-[#f4f7f6] px-3.5 py-3 text-sm leading-6 text-text outline-none transition duration-200",
        "placeholder:text-muted/70 hover:bg-white focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10",
        className
      )}
      {...props}
    />
  );
}

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-primary/10 bg-[#edf8ef] px-2.5 py-1 text-xs font-medium text-[#356844]",
        className
      )}
      {...props}
    />
  );
}
