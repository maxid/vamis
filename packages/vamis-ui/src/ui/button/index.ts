import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium touch-manipulation transition-[color,background-color,box-shadow,border-color,opacity] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-success text-success-foreground hover:bg-success/90",
        warning:
          "bg-warning text-warning-foreground hover:bg-warning/90",
        info:
          "bg-info text-info-foreground hover:bg-info/90",
      },
      size: {
        "default": "h-[var(--control-h)] px-3 py-1.5 has-[>svg]:px-2.5",
        "xs": "h-[var(--control-h-sm)] gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        "sm": "h-[var(--control-h-sm)] rounded-md gap-1.5 px-2.5 text-xs has-[>svg]:px-2",
        "lg": "h-[var(--control-h-lg)] rounded-md px-4 has-[>svg]:px-3",
        "icon": "size-[var(--control-h)]",
        "icon-xs": "size-[var(--control-h-sm)] rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-[var(--control-h-sm)]",
        "icon-lg": "size-[var(--control-h-lg)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>

/** Map Amis `level` / actionType onto shadcn button variants. */
export function levelToVariant(
  level?: unknown,
  actionType?: unknown,
): NonNullable<ButtonVariants["variant"]> {
  const lv = String(level || "")
  const at = String(actionType || "")
  if (at === "submit" || lv === "primary") return "default"
  if (lv === "danger" || lv === "error") return "destructive"
  if (lv === "success") return "success"
  if (lv === "warning") return "warning"
  if (lv === "info") return "info"
  if (lv === "link") return "link"
  if (lv === "enhance" || lv === "secondary") return "secondary"
  if (lv === "light") return "ghost"
  return "outline"
}

export function sizeToButtonSize(
  size?: unknown,
): NonNullable<ButtonVariants["size"]> {
  if (size === "xs") return "xs"
  if (size === "sm") return "sm"
  if (size === "lg") return "lg"
  return "default"
}
