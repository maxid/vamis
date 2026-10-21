import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Alert } from "./Alert.vue"
export { default as AlertDescription } from "./AlertDescription.vue"
export { default as AlertTitle } from "./AlertTitle.vue"

export const alertVariants = cva(
  "relative w-full rounded-lg border px-3 py-2.5 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "border-destructive/30 bg-destructive/8 text-destructive [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
        success:
          "border-success/30 bg-success/8 text-success [&>svg]:text-current *:data-[slot=alert-description]:text-success/90",
        warning:
          "border-warning/35 bg-warning/10 text-warning-foreground [&>svg]:text-current *:data-[slot=alert-description]:text-warning-foreground/80",
        info:
          "border-info/30 bg-info/8 text-info [&>svg]:text-current *:data-[slot=alert-description]:text-info/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export type AlertVariants = VariantProps<typeof alertVariants>

export function levelToAlertVariant(
  level?: unknown,
): NonNullable<AlertVariants["variant"]> {
  const lv = String(level || "")
  if (lv === "danger" || lv === "error") return "destructive"
  if (lv === "success") return "success"
  if (lv === "warning") return "warning"
  if (lv === "info") return "info"
  return "default"
}
