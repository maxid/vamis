# Vamis Select Table Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Amis-compatible `selectMode: table` without mounting the full Table renderer.

**Architecture:** `SelectTablePane` owns table presentation and selection emission. `Select.vue` keeps options/value/search/mobile-draft ownership and reuses `onPick` / `onToggleAll`.

**Tech Stack:** Vue 3, TypeScript, Vitest + happy-dom, Playwright, Amis 6.13.0.

**Spec:** `docs/superpowers/specs/component/form/2026-11-21-vamis-select-table-mode.md`

## Global Constraints

- Amis 6.13.0 is the waterline.
- Do not mount the full `Table.vue` renderer.
- Do not duplicate `joinValues` / `extractValue` / mobile draft state.
- Table mode ignores `menuTpl`, `hideSelected` and `deferApi`.

### Task 1: Contract Tests

- [x] Add single-row selection test.
- [x] Add multiple check-all with disabled option exclusion.
- [x] Add mobile draft confirm test.
- [x] Add `hideSelected: true` visible-selected-row test.

### Task 2: Table Pane

- [x] Create `SelectTablePane.vue` with Table and Checkbox primitives.
- [x] Render plain and SchemaRenderer columns.
- [x] Emit `pick` and `toggle-all` only.

### Task 3: Select Integration

- [x] Add table mode dispatch, Transfer search, popup height and mobile exclusions.
- [x] Expose `filteredCandidates` for table rows.
- [x] Keep values serialized by existing `useOptionsControl`.

### Task 4: Styling And Docs

- [x] Add Select table tokens and one-scroll-host styles.
- [x] Switch table documentation examples from static JSON to live schema.
- [x] Update design, TODO, CONTEXT and lessons.
- [ ] Virtualization and `searchResultMode` remain a separate slice.

### Task 5: Verification

- [x] Focused SDK table tests.
- [x] Real page table render and computed style check.
- [x] Full tests, typecheck, SDK build and compare.
