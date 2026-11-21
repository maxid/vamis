# Vamis Select Associated Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Amis-compatible `selectMode: associated` main path without turning Associated Selection into a second form control.

**Architecture:** `SelectAssociatedPane.vue` owns only the left-column local value and the right-column mode dispatch. `Select.vue` continues to own option normalization, source loading, form value serialization, search, overlays, and mobile draft state. The left value is matched to `options[].ref`; only the right pane emits selectable values.

**Tech Stack:** Vue 3, `@vamis/core` `OptionItem` / `normalizeOptions` / tree helpers, existing `SelectTreePane`, `SelectTablePane`, `SelectChainedPane`, `@vamis/ui`, Vitest + SDK DOM tests.

**Spec:** `docs/superpowers/specs/component/form/2026-11-19-vamis-select-completion-design.md`

## Global Constraints

- Amis 6.13.0 is the behavior waterline; do not preserve `cxd-` class names or copy React component structure.
- `leftOptions` belongs to the pane and must never write the outer Select field.
- Only right-side selectable values enter `joinValues` / `extractValue` / `multiple` serialization.
- Reuse existing pane boundaries; do not mount a complete `TreeSelect` / `InputTree` or duplicate `useTreeState`.
- Keep component specs under `docs/superpowers/specs/component/form/`.
- Do not use Vamis current behavior to redefine an Amis contract.

## Review Focus

- Left tree selection must not leak into the form value; switching left must change right candidates without clearing an already selected right value.
- `leftDefaultValue` and source metadata `options[0].leftOptions / children / leftDefaultValue` must resolve the same way.
- Right `list`, `table`, `tree`, and `chained` modes must all emit through the existing Select value path.
- Mobile confirmation must keep right-side draft behavior and not submit on left-column clicks.
- Associated mode must preserve the one-scroll-host and focus behavior established for other Transfer-style panes.

---

### Task 1: Lock the associated value contract

**Files:**
- Modify: `packages/vamis-sdk/__tests__/select-options-events.test.ts`
- Modify: `packages/vamis/src/renderers/form/Select.vue`

**Interfaces:**
- Consumes: `OptionItem`, `normalizeOptions`, existing `useOptionsControl`.
- Produces: `associatedLeftOptions: OptionItem[]`, `associatedRightOptions: OptionItem[]`, and `isAssociatedMenu` dispatch state in `Select.vue`.

- [x] **Step 1: Write the failing test**

Add a test named `renders associated mode and writes only a right-side selection`. Use static `leftOptions` with `法师 / 战士`, `leftDefaultValue: 'mage'`, and `options` descriptors with `ref: 'mage'` and `ref: 'warrior'`, each carrying right children. Assert:

```ts
expect(form?.getData?.()?.hero).toBeUndefined()
click(right item 'A')
expect(form?.getData?.()?.hero).toBe('a')
```

Also click `战士` and assert the right pane contains `B` while the left label `战士` is active.

- [x] **Step 2: Run the focused test to verify RED**

Run: `pnpm --filter @vamis/sdk test -- select-options-events.test.ts -t "associated mode"`

Expected: the associated DOM / selection is absent or no form value is written.

- [x] **Step 3: Implement the minimal associated dispatch in `Select.vue`**

Add `isAssociatedMenu`, exclude associated from normal grouping/virtual/wheel/tick branches, and derive:

```ts
associatedLeftOptions
associatedRightOptions
associatedLeftDefaultValue
```

Use `normalizeOptions` for `leftOptions`; when `ctl.options[0]` carries the Amis source metadata shape, unwrap `leftOptions`, `children`, and `leftDefaultValue`. Do not add a second option loader.

- [x] **Step 4: Run the focused test to verify GREEN**

Run the same command as Step 2.

- [x] **Step 5: Commit**

```bash
git add packages/vamis/src/renderers/form/Select.vue packages/vamis-sdk/__tests__/select-options-events.test.ts
git commit -m "feat(select): 接入关联选择模式数据"
```

### Task 2: Add the associated pane and right-mode dispatch

**Files:**
- Create: `packages/vamis/src/renderers/form/select/SelectAssociatedPane.vue`
- Modify: `packages/vamis/src/renderers/form/Select.vue`
- Test: `packages/vamis-sdk/__tests__/select-options-events.test.ts`

**Interfaces:**
- Consumes: `schema: SchemaObject`, `leftOptions: OptionItem[]`, `nodes: OptionItem[]`, `selectedValues: unknown[]`, `leftDefaultValue?: unknown`, `disabled?: boolean`.
- Produces: local `leftValue: unknown`; `pick`, `toggle-all`, and `toggle` events for the right pane.

- [x] **Step 1: Write the failing tests**

Add tests for:

1. `leftMode: tree` selects a left option without writing the outer value.
2. `rightMode: table`, `tree`, and `chained` each expose the selected left option's children and write a right value.
3. Switching from a left option with selected right value to another left option changes candidates without clearing the existing right value.

- [x] **Step 2: Run the focused tests to verify RED**

Run: `pnpm --filter @vamis/sdk test -- select-options-events.test.ts -t "associated"`

Expected: missing `SelectAssociatedPane`, missing left-pane state, or no right-mode DOM.

- [x] **Step 3: Implement `SelectAssociatedPane.vue`**

Use a local `leftValue` initialized from `leftDefaultValue`, match the selected left option by:

```ts
option.ref === leftValue || optionValuesEqual(option.value, leftValue, valueField)
```

Render left as a simple list for `leftMode: list` and reuse `SelectTreePane` for `leftMode: tree`. Render right by `rightMode`:

- `table` → `SelectTablePane`
- `tree` → `SelectTreePane`
- `chained` → `SelectChainedPane`
- `list` / `group` → local flattened list

Emit only right-side `pick` / `toggle` / `toggle-all` events. Do not render a second `FormItem`.

- [x] **Step 4: Wire the pane into both desktop and mobile Select branches**

Pass the same associated state through both branches, and keep the left-column selection local. Respect the existing popup height, search input, and draft confirmation paths.

- [x] **Step 5: Add scoped styles**

Add only structural styles in `packages/vamis-ui/src/styles.css`: two-column flex, left/right independent scrolling, 1px separator, 32px option rows, and the same disabled/active tokens used by the other panes.

- [x] **Step 6: Run focused tests to verify GREEN**

Run the same command as Step 2.

- [x] **Step 7: Commit**

```bash
git add packages/vamis/src/renderers/form/select/SelectAssociatedPane.vue packages/vamis/src/renderers/form/Select.vue packages/vamis-ui/src/styles.css packages/vamis-sdk/__tests__/select-options-events.test.ts
git commit -m "feat(select): 完成关联选择左右栏主路径"
```

### Task 3: Lock source metadata, mobile draft, and search interaction

**Files:**
- Modify: `packages/vamis/src/renderers/form/Select.vue`
- Modify: `packages/vamis/src/renderers/form/select/SelectAssociatedPane.vue`
- Modify: `packages/vamis-sdk/__tests__/select-options-events.test.ts`

**Interfaces:**
- Consumes: the left/right derivation from Tasks 1–2 and existing `ctl.keyword`, `mobileDraft`, `onPick`, `onToggleAll`.
- Produces: source metadata resolution before pane render and mobile draft-only right selection.

- [x] **Step 1: Write failing source/mobile tests**

Add:

- a source-shaped options fixture `{ leftOptions, children, leftDefaultValue }` resolves the same right panel as `leftOptions` / `options`;
- a mobile associated test asserts a right click does not write the form value until `确认`;
- an associated searchable test asserts the shared `searchable` focus policy still applies.

- [x] **Step 2: Run focused tests to verify RED**

Run: `pnpm --filter @vamis/sdk test -- select-options-events.test.ts -t "associated|mobile"`.

- [x] **Step 3: Fix source unwrapping and mobile handling**

Unwrap source metadata without mutating the raw `OptionItem[]`; keep local left state. For mobile, route associated right picks into `mobileDraft` and commit only from the existing confirm action. Do not add a second timer or search focus path.

- [x] **Step 4: Run focused tests to verify GREEN**

Run the same command as Step 2.

- [x] **Step 5: Commit**

```bash
git add packages/vamis/src/renderers/form/Select.vue packages/vamis/src/renderers/form/select/SelectAssociatedPane.vue packages/vamis-sdk/__tests__/select-options-events.test.ts
git commit -m "fix(select): 收口关联选择数据与移动草稿"
```

### Task 4: Docs, spec status, and full verification

**Files:**
- Modify: `docs/design/component/form/select.md`
- Modify: `docs/superpowers/specs/component/form/2026-11-19-vamis-select-completion-design.md`
- Modify: `docs/superpowers/specs/2026-10-20-vamis-component-todo.md`
- Modify: `CONTEXT.md`
- Modify: `website/src/components/form/select.md`

- [x] **Step 1: Update the component contract and live docs**

Mark associated main path as implemented, list deferred items (dynamic left defer, personnel picker, search result mode), and keep the page section order aligned with Amis.

- [x] **Step 2: Run the full checks**

```bash
pnpm test
pnpm typecheck
pnpm sdk:build
pnpm compare --page select
pnpm compare --page select --mobile
git diff --check
```

Expected: tests pass, typecheck exits 0, SDK build succeeds, Select compare remains P0 0, and whitespace check is clean.

- [x] **Step 3: Commit**

```bash
git add docs CONTEXT.md README.md README.en.md website/src/components/form/select.md
git commit -m "docs(select): 同步关联选择进度与验收"
```

