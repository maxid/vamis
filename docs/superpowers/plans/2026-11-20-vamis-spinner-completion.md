# Vamis Spinner Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Spinner's remaining Amis-compatible semantics and shared Select host integration while preserving the intentional Vamis diamond indicator.

**Architecture:** Keep the existing Spinner renderer/store split. Add root-level authoring semantics and dark/disabled presentation in `Spinner.vue` and shared CSS; add the two missing Amis Select mount points in `Select.vue`; verify every existing Spinner consumer through SDK integration tests and focused browser comparisons.

**Tech Stack:** Vue 3, TypeScript, Vitest, Playwright compare, CSS tokens.

**Spec:** `docs/superpowers/specs/component/feedback/2026-11-20-vamis-spinner-completion-design.md`

## Global Constraints

- Preserve the Vamis center-symmetric diamond default indicator.
- Follow Amis 6.13.0 runtime source, including `overlay` default `false`.
- Do not copy Amis product version numbers or add a version column.
- Do not commit unless the user explicitly requests it in the current turn.
- Keep package boundaries: renderer in `packages/vamis`, shared tokens/styles in `packages/vamis-ui`, pure helpers in `packages/vamis-core`.

## Review Focus

- Invalid `loadingConfig.root` must not suppress the inline spinner.
- `disabled` must not recolor the intentional default diamond.
- A dark parent behind a custom icon must switch to the dark-surface token.
- Select must expose both trigger loading and control overlay without duplicate overlay boxes.
- Parent/child simultaneous loading must continue to show only the ancestor indicator.

---

### Task 1: Spinner Root Semantics And Visual States

**Files:**
- Modify: `packages/vamis/src/renderers/Spinner.vue`
- Modify: `packages/vamis-ui/src/styles.css`
- Modify: `packages/vamis-ui/src/themes.css`
- Test: `packages/vamis-sdk/__tests__/embed.test.ts`

**Interfaces:**
- Consumes: `spinnerShow`, `spinnerLoadingConfig`, `resolveClassName`, existing `disabled` renderer prop.
- Produces: actual `.vamis-spinner` root carries schema `className`; icon classes include disabled/dark-background state.

- [x] **Step 1: Write failing SDK tests for root class, disabled simple icon, dark parent icon token, and missing portal fallback**

Add a test that mounts a dark-background spinner container with `className: "my-spinner"`, `disabled: true`, `icon: "reload"`, asserts `.vamis-spinner.my-spinner`, `.vamis-spinner__icon--disabled`, and `.vamis-spinner__icon--dark-bg`. Add a second case with `loadingConfig.root: "#missing-root"` and expect the spinner to remain inline instead of disappearing or warning.

- [x] **Step 2: Run the Spinner tests to verify RED**

Run: `pnpm --filter @vamis/sdk exec vitest run __tests__/embed.test.ts -t "Spinner root"`

Expected: FAIL because the Spinner root and state classes are absent.

- [x] **Step 3: Implement root class and visual-state classes**

Add `rootClass`, parent background detection, disabled/dark state classes, and portal-target existence tracking in `Spinner.vue`; add tokens and selectors in `styles.css` / `themes.css`. Apply disabled and dark colors only to `.vamis-spinner__icon--simple`.

- [x] **Step 4: Run focused tests to verify GREEN**

Run: `pnpm --filter @vamis/sdk exec vitest run __tests__/embed.test.ts -t "Spinner root"`

Expected: PASS.

### Task 2: Select Spinner Mount Points

**Files:**
- Modify: `packages/vamis/src/renderers/form/Select.vue`
- Modify: `packages/vamis-ui/src/styles.css`
- Test: `packages/vamis-sdk/__tests__/select-options-events.test.ts`

**Interfaces:**
- Consumes: `ctl.loading`, `schema.loadingConfig`, existing local `Spinner` component.
- Produces: trigger `.vamis-select__spinner` with `reload + sm`; control-level `.vamis-spinner--overlay` inside `.vamis-select`.

- [x] **Step 1: Write a failing deferred-source Select test plus the host-consumer matrix**

Mount a Select whose `source` API remains pending; assert one `.vamis-select__input .vamis-spinner` containing a reload SVG and one `.vamis-select > .vamis-spinner--overlay`. In the core Spinner test, assert Page, Service, CRUD, Form, OverlayHost, Select, InputText, and TreeBranch consume the shared renderer and pass or derive `loadingConfig`.

- [x] **Step 2: Run the Select test to verify RED**

Run: `pnpm --filter @vamis/sdk exec vitest run __tests__/select-options-events.test.ts -t "Spinner"`

Expected: FAIL because only the dropdown-empty spinner exists.

- [x] **Step 3: Implement both Select Spinner hosts**

Render the trigger Spinner in the suffix while `ctl.loading` is true and render the control overlay after the trigger. Pass `loadingConfig` to both.

- [x] **Step 4: Run the Select test to verify GREEN**

Run: `pnpm --filter @vamis/sdk exec vitest run __tests__/select-options-events.test.ts -t "Spinner"`

Expected: PASS.

### Task 3: Existing Spinner Host Regression Scenarios

**Files:**
- Modify: `packages/vamis-core/__tests__/spinner.test.ts`
- Test: existing `packages/vamis-sdk/__tests__/embed.test.ts`
- Test: existing `packages/vamis-sdk/__tests__/select-options-events.test.ts`

**Interfaces:**
- Consumes: Task 1 and Task 2 behavior.
- Produces: runtime regression evidence for Page, Service, CRUD, Form, Dialog, Select, InputText, and tree defer loading.

- [x] **Step 1: Run existing Page/Form/Dialog host tests**

Run: `pnpm --filter @vamis/sdk exec vitest run __tests__/embed.test.ts`

Expected: PASS; Page root AJAX, Form body, Dialog-info, and feedback nesting retain their existing Spinner counts.

- [x] **Step 2: Run existing Select, InputText, and tree tests**

Run: `pnpm --filter @vamis/sdk exec vitest run __tests__/select-options-events.test.ts && pnpm --filter @vamis/core exec vitest run __tests__/input-text.test.ts __tests__/tree.test.ts`

Expected: PASS.

- [x] **Step 3: Re-run the complete focused host set**

Run: `pnpm --filter @vamis/core exec vitest run __tests__/spinner.test.ts && pnpm --filter @vamis/sdk exec vitest run __tests__/embed.test.ts __tests__/select-options-events.test.ts`

Expected: PASS.

### Task 4: Documentation And Progress

**Files:**
- Modify: `website/src/components/spinner.md`
- Modify: `docs/design/component/feedback/spinner.md`
- Modify: `docs/superpowers/specs/2026-10-20-vamis-component-todo.md`
- Modify: `docs/superpowers/specs/2026-10-20-vamis-component-deps.md`
- Modify: `CONTEXT.md`
- Modify: `README.md`, `README.en.md`, marketing test-count references as required
- Modify: `.cursor/rules/lessons.mdc`

**Interfaces:**
- Consumes: final verified behavior and test counts.
- Produces: Spinner `已完成 100%`, no stale host-gap text, accurate test counts.

- [x] **Step 1: Write the final status text**

Mark the intentional diamond as retained product behavior; remove “缺 Select / 深色 / 375” once verified; record exact host matrix and test counts.

- [x] **Step 2: Recompute generated dependency status**

Run: `node scripts/component-priority.mjs`

Expected: Spinner dependency entry reports 100% without reordering unrelated nodes.

- [x] **Step 3: Verify docs contain no stale Spinner gap**

Run: `rg -n "缺 Select|缺 Dialog / Form|spinner.*95%|Spinner.*95%" website/src/components/spinner.md docs/design/component/feedback/spinner.md docs/superpowers/specs/2026-10-20-vamis-component-todo.md CONTEXT.md`

Expected: no stale match.

### Task 5: Full Regression And Browser Verification

**Files:**
- Generated only: `docs/superpowers/specs/2026-10-24-sdk-compare-report.md`

**Interfaces:**
- Consumes: all implementation and documentation changes.
- Produces: fresh completion evidence.

- [x] **Step 1: Build SDK and run the full source test suite**

Run: `pnpm sdk:build && pnpm test && pnpm typecheck && git diff --check`

Expected: exit 0, zero test failures, zero type errors.

- [x] **Step 2: Run Spinner and host comparisons**

Run each with a new report check after the last run:

`pnpm compare --page spinner`

`pnpm compare --page select`

`pnpm compare --page page`

`pnpm compare --page service`

`pnpm compare --page crud`

`pnpm compare --page form`

`pnpm compare --page dialog`

`pnpm compare --page input-text`

`pnpm compare --page input-tree`

`pnpm compare --page tree-select`

Expected: no P0 regression; compare only proves schema-tree/contract coverage.

- [x] **Step 3: Run mobile and dark visual checks**

Use Playwright to verify Spinner at 375px, `.dark`, Select trigger/overlay, Page/Form/Dialog shared host counts, and ancestor/child mutual exclusion with screenshots or computed geometry.

- [x] **Step 4: Report final evidence**

State exact test count, typecheck result, Spinner desktop/mobile result, each host result, and any residual non-P0 gaps.
