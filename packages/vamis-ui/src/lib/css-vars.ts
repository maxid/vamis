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
  "--Form-input-paddingX": "--control-px",
  "--Form--horizontal-label-widthBase": "--form-label-width",
  "--Form--horizontal-label-widthXs": "--form-label-width-xs",
  "--Form--horizontal-label-widthSm": "--form-label-width-sm",
  "--Form--horizontal-label-widthMd": "--form-label-width-md",
  "--Form--horizontal-label-widthLg": "--form-label-width-lg",
  "--Form-control-widthXs": "--form-control-width-xs",
  "--Form-control-widthSm": "--form-control-width-sm",
  "--Form-control-widthBase": "--form-control-width",
  "--Form-control-widthMd": "--form-control-width-md",
  "--Form-control-widthLg": "--form-control-width-lg",
  "--TableCell-height": "--table-row-h",
  "--TableCell-height-small": "--table-row-h-sm",
  "--TableCell-height-large": "--table-row-h-lg",
  "--TableCell-paddingX": "--table-cell-px",
  "--Page-body-padding": "--page-body-padding",
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
