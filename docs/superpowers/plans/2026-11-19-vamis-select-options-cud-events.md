# Vamis Select Options CUD Events Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Align `addConfirm` / `editConfirm` / `deleteConfirm` event payload and ordering with Amis before local option mutation or option API requests.

**Architecture:** Keep the existing `useOptionsControl` and `useTreeField` state machines. Extract only the shared event payload, event dispatch, and option API persistence helpers. Wire the existing CUD flows through those helpers so `preventDefault()` stops mutation without duplicating option logic.

**Tech Stack:** Vue 3 composables, TypeScript, Vitest, happy-dom SDK tests, Amis 6.13.0 as the behavioral waterline.

**Spec:** `docs/superpowers/specs/component/form/2026-11-19-vamis-select-completion-design.md`

## Global Constraints

- Amis source behavior is the waterline; Vamis component names are implementation details.
- Do not add `allowCreate`; Amis 6.13 uses `creatable`.
- Reuse existing `useOptionsControl`, `useTreeField`, `persistOptionApi` concepts, and current dialog/UI; do not rebuild option state.
- Event payload must include current public data, `value`, `options`, `items`, `item`, and `[name]` when a name exists.
- `preventDefault()` must prevent local mutation and network requests.
- `addApi` / `editApi` / `deleteApi` execute after the matching confirm event.
- No commit or push unless the user explicitly requests it in the current turn.
- Final gates: `pnpm test`, `pnpm typecheck`, `pnpm sdk:build`, `pnpm compare --page select`, and `pnpm compare --page select --mobile`.

## Review Focus

- An `addConfirm` handler that prevents default must leave the option list unchanged and make zero `addApi` requests.
- An `editConfirm` handler that prevents default must leave labels and selected values unchanged and make zero `editApi` requests.
- A rejected `deleteConfirmText` confirmation must run before `deleteConfirm` and before `deleteApi`.
- A source-backed Select must reload source after a successful mutation instead of keeping a stale local copy.
- Event payloads must not expose `__super`, `__prev`, or other internal scope keys.

---

### Task 1: Shared Option Event Payload and Confirmation Helper

**Files:**
- Modify: `packages/vamis-core/src/utils/options.ts`
- Create: `packages/vamis/src/optionsEvents.ts`
- Test: `packages/vamis-core/__tests__/options.test.ts`
- Test: `packages/vamis-core/__tests__/option-events.test.ts`

**Interfaces:**
- Produces: `optionsEventPayload(input: OptionsEventPayloadInput): PlainObject`
- Produces: `runOptionConfirm(ctx: OptionConfirmContext): Promise<boolean>`
- `OptionsEventPayloadInput` fields: `data?: PlainObject`, `name?: string`, `value?: unknown`, `options?: OptionItem[]`, `item?: OptionItem`
- `OptionConfirmContext` fields: `schema: SchemaObject`, `eventName: 'addConfirm' | 'editConfirm' | 'deleteConfirm'`, `data: PlainObject`, `value: unknown`, `options: OptionItem[]`, `item: OptionItem`, `env`, `scoped`, `overlay`, `form`, `scope`
- `runOptionConfirm` returns `true` when the event is allowed and `false` when prevented.

- [x] **Step 1: Write the failing payload test**

```ts
expect(optionsEventPayload({
  data: { role: 'admin', __super: { hidden: true } },
  name: 'owner',
  value: 'a',
  options: [{ label: 'A', value: 'a' }],
  item: { label: 'A', value: 'a' },
})).toEqual({
  role: 'admin',
  value: 'a',
  options: [{ label: 'A', value: 'a' }],
  items: [{ label: 'A', value: 'a' }],
  owner: 'a',
  item: { label: 'A', value: 'a' },
})
```

- [x] **Step 2: Run the payload test and verify it fails**

Run: `pnpm --filter @vamis/core test -- __tests__/options.test.ts`

Expected: FAIL because `optionsEventPayload` is not exported.

- [x] **Step 3: Implement `optionsEventPayload`**

Implementation requirements:
- Spread only the provided public data.
- Remove keys beginning with `__`.
- Always include `value`, `options`, `items: options`, and `item`.
- Include `[name]: value` only when `name` is non-empty.

- [x] **Step 4: Write the failing confirm helper test**

```ts
const event = await runOptionConfirm({
  schema: { onEvent: { addConfirm: { actions: [{ actionType: 'preventDefault' }] } } },
  eventName: 'addConfirm',
  data: { role: 'admin' },
  value: 'b',
  options: [],
  item: { label: 'B', value: 'b' },
  env: { notify: vi.fn() } as any,
  scoped: undefined,
  overlay: undefined,
  form: undefined,
  scope: undefined,
})
expect(event).toBe(false)
```

- [x] **Step 5: Run the confirm helper test and verify it fails**

Run: `pnpm --filter @vamis/core test -- __tests__/option-events.test.ts`

Expected: FAIL because `packages/vamis/src/optionsEvents.ts` does not exist.

- [x] **Step 6: Implement `runOptionConfirm`**

Use `createVamisEvent`, `eventEvalData`, and `runOnEvent`. Build the payload with `optionsEventPayload`, run the event, and return `!event.prevented`.

- [x] **Step 7: Run both tests**

Run: `pnpm --filter @vamis/core test`

Expected: PASS.

### Task 2: Shared Option API Mutation Helper

**Files:**
- Create: `packages/vamis/src/optionsMutation.ts`
- Modify: `packages/vamis/src/optionsControl.ts`
- Modify: `packages/vamis-core/src/utils/options.ts`
- Test: `packages/vamis-core/__tests__/option-events.test.ts`

**Interfaces:**
- Produces: `persistOptionMutation(input: PersistOptionMutationInput): Promise<PersistOptionMutationResult>`
- `PersistOptionMutationInput`: `api`, `method: 'post' | 'delete'`, `env`, `data`, `payload`, `failureMessage`
- `PersistOptionMutationResult`: `{ ok: boolean; data: PlainObject }`
- Produces `optionsAddDialogSchema` / `optionsEditDialogSchema` without embedding `addApi` / `editApi` in the dialog Form body.
- Existing `useOptionsControl.persistOptionApi` is removed or becomes a thin wrapper around the shared helper.

- [x] **Step 1: Write the failing API-order helper test**

```ts
const calls: string[] = []
const result = await persistOptionMutation({
  api: '/api/add',
  method: 'post',
  data: { name: 'A' },
  payload: { name: 'A' },
  failureMessage: '新增选项失败',
  env: {
    fetcher: async () => {
      calls.push('api')
      return { status: 0, data: { value: 'saved' } }
    },
    notify: vi.fn(),
  } as any,
})
expect(result).toEqual({ ok: true, data: { name: 'A', value: 'saved' } })
expect(calls).toEqual(['api'])
```

- [x] **Step 2: Run the test and verify it fails**

Run: `pnpm --filter @vamis/core test -- __tests__/option-events.test.ts`

Expected: FAIL because `packages/vamis/src/optionsMutation.ts` does not exist.

- [x] **Step 3: Implement `persistOptionMutation`**

Move the current `persistOptionApi` behavior from `useOptionsControl` into the helper, preserving `requestApi`, `isEffectiveApi`, error notification, skipped API behavior, and response-data merge semantics.

- [x] **Step 4: Write failing dialog-schema assertions**

```ts
expect(optionsAddDialogSchema({ addApi: '/api/add' }).body).not.toHaveProperty('api')
expect(optionsEditDialogSchema({ editApi: '/api/edit' }).body).not.toHaveProperty('api')
```

- [x] **Step 5: Update the dialog schemas**

Keep `editInitApi`; remove `addApi` / `editApi` from the generated Form schema. API execution belongs to the option mutation helper after confirm events.

- [x] **Step 6: Run core tests**

Run: `pnpm --filter @vamis/core test`

Expected: PASS.

### Task 3: Wire `useOptionsControl` CUD Flow

**Files:**
- Modify: `packages/vamis/src/optionsControl.ts`
- Test: `packages/vamis-sdk/__tests__/select-options-events.test.ts`

**Interfaces:**
- Consumes: `runOptionConfirm(context): Promise<boolean>`
- Consumes: `persistOptionMutation(input): Promise<PersistOptionMutationResult>`
- Preserves: `createOption`, `editOption`, `deleteOption` public methods returned by `useOptionsControl`.

- [x] **Step 1: Write failing SDK tests for prevented add**

Mount a `form > select` with `creatable: true`, `addApi: '/api/add'`, and:

```ts
onEvent: {
  addConfirm: { actions: [{ actionType: 'preventDefault' }] },
}
```

Enter a new label, confirm the inline add form, and assert:
- `env.fetcher` was not called
- the option is absent from the open menu
- the select value did not change

- [x] **Step 2: Run the test and verify it fails**

Run: `pnpm --filter @vamis/sdk test -- __tests__/select-options-events.test.ts`

Expected: FAIL because the current implementation writes locally and calls `addApi`.

- [x] **Step 3: Wire `createOption`**

Order:
1. Build item.
2. `runOptionConfirm('addConfirm')`.
3. Return if prevented.
4. `persistOptionMutation(addApi)`.
5. Reload source or append local option.
6. Toggle the created item.

- [x] **Step 4: Write failing SDK tests for edit and delete prevention**

Edit case:
- open menu
- trigger edit icon
- submit changed label
- assert no `editApi`, no label change

Delete case:
- `deleteConfirmText: '确认删除？'`
- mock `env.confirm` to resolve `true`
- `deleteConfirm` prevents
- assert no `deleteApi`, option remains

- [x] **Step 5: Wire `editOption` and `deleteOption`**

`editOption` order: dialog result -> item -> `editConfirm` -> `editApi` -> source reload or local update -> selected value sync.

`deleteOption` order: `deleteConfirmText` -> `deleteConfirm` -> `deleteApi` -> source reload or local removal -> selected value sync.

- [x] **Step 6: Run the Select SDK tests**

Run: `pnpm --filter @vamis/sdk test -- __tests__/select-options-events.test.ts`

Expected: PASS.

### Task 4: Align `useTreeField` CUD and Verify Existing Reuse

**Files:**
- Modify: `packages/vamis/src/renderers/form/useTreeField.ts`
- Test: `packages/vamis-sdk/__tests__/select-options-events.test.ts`

**Interfaces:**
- Reuses: `runOptionConfirm` and `persistOptionMutation`
- Preserves: `useTreeField` return API used by `InputTree.vue` and `TreeSelect.vue`

- [x] **Step 1: Write failing InputTree add/edit event tests**

For `type: input-tree`:
- add a node through the existing add UI and prevent `addConfirm`
- edit a node and prevent `editConfirm`
- assert both the option tree and field value remain unchanged

- [x] **Step 2: Write failing InputTree delete event test**

Set `deleteConfirmText`, approve the confirm dialog, then prevent `deleteConfirm`; assert the node remains and no `deleteApi` request runs.

- [x] **Step 3: Wire `openAddDialog` / `openEditDialog` / `removeItem`**

Replace the local add/edit event payload with `runOptionConfirm`. Call `persistOptionMutation` after the confirm event. Keep built-in inline CUD UI intact; only add API execution where the dialog forms previously owned it.

- [x] **Step 4: Run InputTree and TreeSelect SDK tests**

Run: `pnpm --filter @vamis/sdk test`

Expected: PASS.

### Task 5: Documentation, Full Verification, and Compare

**Files:**
- Modify: `CONTEXT.md`
- Modify: `docs/superpowers/specs/2026-10-20-vamis-component-todo.md`
- Modify: `docs/design/component/form/select.md`
- Modify: `website/src/components/form/select.md`
- Modify: `docs/superpowers/specs/component/form/2026-11-19-vamis-select-completion-design.md`

- [x] **Step 1: Update docs**

Record:
- confirm events and payload
- confirm-before-API ordering
- line that existing `useOptionsControl` / `useTreeField` were extended, not replaced
- remaining `selectMode` and searchResult work

- [x] **Step 2: Run source tests**

Run: `pnpm test`

Expected: all tests pass.

- [x] **Step 3: Run typecheck**

Run: `pnpm typecheck`

Expected: 0 errors.

- [x] **Step 4: Build the SDK**

Run: `pnpm sdk:build`

Expected: build exits 0.

- [x] **Step 5: Run Select compare**

Run: `pnpm compare --page select`

Then: `pnpm compare --page select --mobile`

Expected: compare harness completes and the report records P0 failures.

- [x] **Step 6: Manually verify**

Open the Select documentation and verify:
- addConfirm toast payload
- editConfirm toast payload
- deleteConfirm toast payload
- canceled/prevented operations do not mutate the option list
- deep-mode popover still uses tokens
