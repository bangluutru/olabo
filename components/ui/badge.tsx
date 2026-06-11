import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700",
        blue: "bg-blue-100 text-blue-700",
        cyan: "bg-cyan-100 text-cyan-700",
        purple: "bg-violet-100 text-violet-700",
        orange: "bg-orange-100 text-orange-700",
        yellow: "bg-yellow-100 text-yellow-700",
        green: "bg-green-100 text-green-700",
        red: "bg-red-100 text-red-700",
        emerald: "bg-emerald-100 text-emerald-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot = true, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", {
            "bg-slate-500": variant === "default" || !variant,
            "bg-blue-500": variant === "blue",
            "bg-cyan-500": variant === "cyan",
            "bg-violet-500": variant === "purple",
            "bg-orange-500": variant === "orange",
            "bg-yellow-500": variant === "yellow",
            "bg-green-500": variant === "green",
            "bg-red-500": variant === "red",
            "bg-emerald-500": variant === "emerald",
          })}
        />
      )}
      {children}
    </span>
  );
}
