# Vamis Select Tree Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `selectMode: tree` and node-level `deferApi` work through an embeddable tree pane that reuses Vamis tree state instead of mounting `TreeSelect`.

**Architecture:** Extract expansion and deferred-node loading from `useTreeField` into a generic `useTreeState`. Add `SelectTreePane` as the presentational bridge between `useOptionsControl` values/options and the existing `TreeBranch`; `Select.vue` only dispatches tree mode and commits the resulting option values.

**Tech Stack:** Vue 3, TypeScript, Vitest, happy-dom SDK integration tests, Playwright compare, Amis 6.13.0 as the behavioral waterline.

**Spec:** `docs/superpowers/specs/component/form/2026-11-19-vamis-select-completion-design.md`

## Global Constraints

- Amis 6.13.0 is the waterline.
- Implement only the `selectMode: tree` + `deferApi` slice in this plan.
- Do not mount full `TreeSelect.vue` or `InputTree.vue` inside Select.
- Keep tree state single-sourced; do not copy `useTreeField` traversal/defer logic into `Select.vue`.
- Tree mode keeps the Select trigger, option value serialization, source/search handling, overlay and mobile draft behavior.
- Do not copy Amis product version numbers or add a version column.
- No commit or push unless the user explicitly requests it in the current turn.

## Review Focus

- A deferred node must expand after `deferApi` returns and must not issue a second request.
- Multiple tree selection defaults to leaf-only when no deferred nodes exist, matching Amis `onlyChildren ?? !isTreeDeferLoad`.
- Mobile tree changes stay in the draft until confirm.
- `joinValues: false` and custom `valueField` must keep the same selected-value contract as ordinary Select.
- Search must retain matching parent paths and highlight the matching node label.

---

### Task 1: Shared Tree State

**Files:**
- Create: `packages/vamis/src/renderers/form/useTreeState.ts`
- Modify: `packages/vamis/src/renderers/form/useTreeField.ts`
- Test: `packages/vamis-sdk/__tests__/select-options-events.test.ts`
- Test: `packages/vamis-core/__tests__/tree.test.ts`

**Interfaces:**
- Produces: `useTreeState(context)` returning `deferField`, `isExpanded`, `isDeferring`, `toggleExpand`, `seedExpanded`.
- `TreeStateContext` fields: `schema`, `nodes`, `setNodes`, optional `disabled`, optional `query`, optional `currentValue`.

- [x] **Step 1: Run the existing InputTree defer and tree selection tests**

Run: `pnpm --filter @vamis/sdk test -- __tests__/select-options-events.test.ts -t "deferred node Spinner"`

Expected: PASS before refactor; this characterizes current behavior.

- [x] **Step 2: Extract `useTreeState` without changing behavior**

Move `expanded`, `deferring`, `deferField`, expansion seeding, `toggleExpand`, `deferLoad` and `deferLoadFinished` event dispatch into `useTreeState`. `useTreeField` calls it with `localOptions` and its current field value.

- [x] **Step 3: Run tree-focused tests**

Run: `pnpm --filter @vamis/sdk test -- __tests__/select-options-events.test.ts -t "InputTree"`

Run: `pnpm --filter @vamis/core test -- __tests__/tree.test.ts`

Expected: PASS, no behavior change.

### Task 2: Embeddable Select Tree Pane

**Files:**
- Create: `packages/vamis/src/renderers/form/select/SelectTreePane.vue`
- Test: `packages/vamis-sdk/__tests__/select-options-events.test.ts`

**Interfaces:**
- Consumes: `useTreeState`, `TreeBranch`, `toggleTreeSelection`, `isTreeItemChecked`, `treeItemPartial`.
- Produces Vue props: `schema`, `nodes`, `selectedValues`, `disabled`, optional `query`, optional `loadingConfig`.
- Produces events: `update:nodes`, `toggle` with `unknown[]`.

- [x] **Step 1: Write the failing single-tree integration test**

Mount `form > select` with `selectMode: tree`, two parent groups and leaf values. Open the trigger and assert:

- `.vamis-tree` is rendered.
- `.vamis-select__group` is not rendered.
- Clicking leaf `曹操` writes `caocao`.

- [x] **Step 2: Run the test and verify RED**

Run: `pnpm --filter @vamis/sdk test -- __tests__/select-options-events.test.ts -t "renders Select tree mode"`

Expected: FAIL because tree mode currently renders grouped Select rows.

- [x] **Step 3: Implement the tree pane and single-select emission**

Use `TreeBranch` with `showIcon: false`, no CUD, and `cascade: true`. Convert selected values with `toggleTreeSelection`.

- [x] **Step 4: Write the failing multiple/default-selection test**

Assert no-defer multiple mode writes only selected leaves by default, while `onlyChildren: false` keeps parent and children according to `cascade: true`.

- [x] **Step 5: Implement multiple selection defaults and check-all**

Default `onlyChildren` to `!hasDeferredTreeNodes`. Implement check-all over selectable leaves when `onlyChildren`, otherwise over every selectable node.

### Task 3: Select Mode Wiring And Deferred Loading

**Files:**
- Modify: `packages/vamis/src/renderers/form/Select.vue`
- Modify: `packages/vamis/src/optionsControl.ts`
- Test: `packages/vamis-sdk/__tests__/select-options-events.test.ts`

**Interfaces:**
- Consumes: `SelectTreePane`.
- Produces `useOptionsControl.replaceOptions(next)` for deferred/current-tree updates.
- Preserves existing `commit(selectedItems)` value serialization.

- [x] **Step 1: Write the failing deferred-node test**

Mount `selectMode: tree`, `multiple: true`, `deferApi: "/api/defer"` and a node marked `defer: true`. Expand it and assert:

- The request context contains the node label/value.
- A loading Spinner is visible while pending.
- The resolved child appears under the node.
- `deferLoadFinished` fires once.

- [x] **Step 2: Run the deferred test and verify RED**

Run: `pnpm --filter @vamis/sdk test -- __tests__/select-options-events.test.ts -t "defers Select tree nodes"`

Expected: FAIL because tree mode is not wired.

- [x] **Step 3: Route desktop tree mode through `SelectTreePane`**

Keep the existing Select trigger, search, overlay and Spinner. Replace only the candidate panel body when `selectMode === 'tree'`.

- [x] **Step 4: Route mobile tree mode through the draft value**

Tree pane emits value arrays; while mobile is open map them to `mobileDraft`, and commit only through the existing confirm action.

- [x] **Step 5: Run focused Select tests**

Run: `pnpm --filter @vamis/sdk test -- __tests__/select-options-events.test.ts`

Expected: PASS.

### Task 4: Documentation And Verification

**Files:**
- Modify: `website/src/components/form/select.md`
- Modify: `docs/design/component/form/select.md`
- Modify: `docs/superpowers/specs/component/form/2026-11-19-vamis-select-completion-design.md`
- Modify: `docs/superpowers/specs/2026-10-20-vamis-component-todo.md`
- Modify: `CONTEXT.md`

- [x] **Step 1: Update implementation status and tree/defer contract**

Remove tree-mode and defer “未接” wording. Keep table/chained/associated/searchResultMode as remaining gaps.

- [x] **Step 2: Run full source gates**

Run: `pnpm test`

Run: `pnpm typecheck`

Run: `git diff --check`

Expected: tests pass, typecheck 0, no whitespace errors.

- [x] **Step 3: Build and compare**

Run: `pnpm sdk:build`

Run: `pnpm compare --page select`

Run: `pnpm compare --page select --mobile`

Expected: P0 failures remain 0; record any existing schema-tree differences.

- [x] **Step 4: Verify the live Select page**

Open Vamis `/components/form/select` and Amis `/zh-CN/components/form/select`. Check tree single, multiple, search and deferred examples in desktop, 375px and dark mode.

### Review Fixes

- [x] Separate exact row selection from aggregate checkbox state; selecting one leaf no longer styles its parent.
- [x] Key node deferring by full-tree path; expanding one deferred folder no longer shows spinners on every valueless folder.
- [x] Keep search-only `searchApi` option metadata when committing selected values.
- [x] Respect `initiallyOpen` and `unfoldedLevel` through shared expansion seeding.
- [x] Send the serialized Select value in `deferLoadFinished`, not the internal selected-value array.
- [x] Match Amis grouped selection typography: group header 14 / 21px, weight 400, neutral-text-5, 4×12 padding; child rows inherit 14 / 32px, weight 400, neutral-text-2 with 24px indent.
- [x] Keep mobile Form panel background on `--page-main-bg`; only the page canvas uses `--background`.
- [x] Preserve partial state on tree check-all and reject legacy label/id/value fallbacks in `normalizeOptions`.
