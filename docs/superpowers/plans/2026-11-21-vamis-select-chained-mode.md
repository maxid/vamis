# Vamis Select Chained Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Amis-compatible `selectMode: chained` using a column path pane.

**Architecture:** `SelectChainedPane` owns path expansion and leaf emission. `Select.vue` keeps option search, value serialization, mobile draft and change dispatch.

**Spec:** `docs/superpowers/specs/component/form/2026-11-21-vamis-select-chained-mode.md`

### Task 1: Contract Tests

- [x] Add single path / leaf write test.
- [x] Add multiple leaf check-all test.
- [x] Verify parent click does not write a form value.
- [x] Cover value-less parents and switch between sibling columns by index path.

### Task 2: Chained Pane

- [x] Create `SelectChainedPane.vue`.
- [x] Render up to three columns with an index path; branch active and leaf selected are separate states.
- [x] Use SchemaRenderer for schema columns.
- [x] Emit `pick` and `toggle-all` only.

### Task 3: Select Integration

- [x] Add chained dispatch, Transfer search, popup height and mobile exclusions.
- [x] Restrict check-all to recursive leaves.
- [x] Reuse `onPick` and existing value serialization.

### Task 4: Styling And Docs

- [x] Add chained column / item tokens and styles.
- [x] Switch chained documentation examples to live schema.
- [x] Add component spec and update progress.
- [ ] Deferred parent loading, `defaultSelectedIndex`, virtualization and `searchResultMode` remain.

### Task 5: Verification

- [x] Focused SDK chained tests.
- [x] Verify searchable focus / blur recovery for desktop / mobile chained and no auto-focus for autoComplete-only.
- [x] Full tests, typecheck, SDK build and compare.
