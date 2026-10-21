# Vamis P0 Runtime Implementation Plan

> **For agentic workers:** This plan was executed in the same session after IR investigation. Do not re-litigate stack choices.

**Goal:** Ship a runnable Vue 3 Amis-compatible YAML runtime with IR envelope, playground, and editor skeleton.

**Architecture:** pnpm workspace packages (`@vamis/core`, `@vamis/ui`, `vamis`, `@vamis/editor`, playground). Schema YAML uses `lcdp.ir/v1` + `kind: UiPage`. Pinia hub stores form/crud nodes.

**Tech Stack:** Vue 3.5, Vite, TypeScript, Tailwind v4, shadcn-vue/reka-ui, Pinia, Vue Router, yaml, @vamis/formula（amis-formula 6.13.0）

---

### Delivered in P0

- [x] Workspace + shadcn-vue primitives
- [x] IR parse/serialize/compile (`packages/vamis-core/src/ir.ts`)
- [x] factory / SchemaRenderer / VamisRoot / env / formula / Scoped
- [x] P0 renderers in `packages/vamis/src/register.ts`
- [x] Playground YAML rail + Amis JSON converter
- [x] Editor: tree + preview + YAML/properties
- [x] NOTICE / Apache-2.0 attribution
