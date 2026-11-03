import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 box-border whitespace-nowrap rounded-[var(--button-radius)] font-normal text-[14px] leading-[1.5] touch-manipulation transition-[color,background-color,box-shadow,border-color,opacity] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border border-solid border-primary bg-primary text-primary-foreground hover:border-[var(--primary-hover)] hover:bg-[var(--primary-hover)] active:border-[var(--primary-active)] active:bg-[var(--primary-active)]",
        destructive:
          "border border-solid border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-solid border-input bg-card text-foreground shadow-none hover:border-primary hover:bg-card hover:text-primary active:border-[var(--primary-active)] active:text-[var(--primary-active)]",
        secondary:
          "border border-solid border-[var(--button-secondary)] bg-[var(--button-secondary)] text-[var(--button-secondary-foreground)] hover:border-[var(--button-secondary-hover)] hover:bg-[var(--button-secondary-hover)] active:border-[var(--button-secondary-active)] active:bg-[var(--button-secondary-active)]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "border-0 bg-transparent text-primary underline-offset-4 hover:underline",
        success:
          "border border-solid border-success bg-success text-success-foreground hover:bg-success/90",
        warning:
          "border border-solid border-warning bg-warning text-warning-foreground hover:bg-warning/90",
        info:
          "border border-solid border-[var(--button-info)] bg-[var(--button-info)] text-[var(--button-info-foreground)] hover:border-[var(--button-info-hover)] hover:bg-[var(--button-info-hover)] active:border-[var(--button-info-active)] active:bg-[var(--button-info-active)]",
        light:
          "border border-solid border-[var(--button-light)] bg-[var(--button-light)] text-[var(--button-light-foreground)] hover:border-[var(--button-light-hover)] hover:bg-[var(--button-light-hover)] active:border-[var(--button-light-active)] active:bg-[var(--button-light-active)]",
        dark:
          "border border-solid border-[var(--button-dark)] bg-[var(--button-dark)] text-[var(--button-dark-foreground)] hover:border-[var(--button-dark-hover)] hover:bg-[var(--button-dark-hover)] active:border-[var(--button-dark-active)] active:bg-[var(--button-dark-active)]",
        enhance:
          "border border-solid border-primary bg-card text-primary hover:border-[var(--primary-hover)] hover:text-[var(--primary-hover)] active:border-[var(--primary-active)] active:text-[var(--primary-active)]",
      },
      size: {
        "default": "h-[var(--button-h)] px-3 has-[>svg]:px-2.5",
        "md": "h-[var(--button-h-md)] px-3 has-[>svg]:px-2.5",
        "xs": "h-[var(--button-h-xs)] gap-1 px-1 text-[12px] leading-[1.5] has-[>svg]:px-1 [&_svg:not([class*='size-'])]:size-3",
        "sm": "h-[var(--button-h-sm)] gap-1 px-2.5 text-[12px] leading-[1.5] has-[>svg]:px-2",
        "lg": "h-[var(--button-h-lg)] px-4 has-[>svg]:px-3",
        "icon": "size-[var(--button-h)]",
        "icon-xs": "size-[var(--button-h-xs)] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-[var(--button-h-sm)]",
        "icon-lg": "size-[var(--button-h-lg)]",
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
  if (lv === "secondary") return "secondary"
  if (lv === "enhance") return "enhance"
  if (lv === "light") return "light"
  if (lv === "dark") return "dark"
  return "outline"
}

export function sizeToButtonSize(
  size?: unknown,
): NonNullable<ButtonVariants["size"]> {
  if (size === "xs") return "xs"
  if (size === "sm") return "sm"
  if (size === "md") return "md"
  if (size === "lg") return "lg"
  return "default"
}
