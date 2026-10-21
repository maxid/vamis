/** Amis `page.cssVars` names that differ from shadcn tokens. Same-name vars pass through. */
const AMIS_CSS_VAR_ALIASES: Record<string, string> = {
  "--text-color": "--foreground",
  "--text--muted-color": "--muted-foreground",
  "--text--loud-color": "--foreground",
  "--body-bg": "--background",
  "--borderColor": "--border",
  "--borderRadius": "--radius",
  "--danger": "--destructive",
  "--link-color": "--primary",
  "--Form-input-height": "--control-h",
  "--Form-item-gap": "--form-item-gap",
  "--Form--horizontal-label-widthBase": "--form-label-width",
  "--TableCell-height": "--table-row-h",
}

export function resolveCssVars(
  cssVars?: Record<string, string> | null,
): Record<string, string> {
  if (!cssVars) return {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(cssVars)) {
    if (!key || value == null) continue
    out[key] = value
    const alias = AMIS_CSS_VAR_ALIASES[key]
    if (alias && alias !== key) out[alias] = value
  }
  return out
}
