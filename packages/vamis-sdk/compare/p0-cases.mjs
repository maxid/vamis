/** P0：同一份 schema 对照 Amis 盒模型。判定是「Vamis 是否对齐 Amis 实测」，不是硬编码期望。 */

function twoButtons(className) {
  const second = {
    type: 'button',
    label: '按钮2',
    actionType: 'dialog',
    dialog: { title: '弹框', body: 'Hello World!' },
  }
  if (className) second.className = className
  return {
    type: 'page',
    body: [
      {
        type: 'button',
        label: '按钮1',
        actionType: 'dialog',
        dialog: { title: '弹框', body: 'Hello World!' },
      },
      second,
    ],
  }
}

function pairCase(id, title, className, note) {
  return {
    id,
    group: 'p0-helper',
    layer: 'p0',
    title,
    expect: note,
    schema: twoButtons(className),
    measure: { type: 'pair', labels: ['按钮1', '按钮2'] },
  }
}

export const p0Cases = [
  {
    id: 'style-two-buttons',
    group: 'p0-layout',
    layer: 'p0',
    title: '两个按钮默认挨在一起',
    expect: '同一行，缝约 0（不要换行）',
    schema: twoButtons(),
    measure: { type: 'pair', labels: ['按钮1', '按钮2'] },
  },
  {
    id: 'style-two-buttons-ml',
    group: 'p0-layout',
    layer: 'p0',
    title: '第二个按钮 className: m-l 拉开缝',
    expect: 'Amis `.m-l` 为 15px',
    schema: twoButtons('m-l'),
    measure: { type: 'pair', labels: ['按钮1', '按钮2'] },
  },
  pairCase('helper-m-l-none', 'className: m-l-none', 'm-l-none', 'Amis 0px'),
  pairCase('helper-m-l-xs', 'className: m-l-xs', 'm-l-xs', 'Amis 5px'),
  pairCase('helper-m-l-sm', 'className: m-l-sm', 'm-l-sm', 'Amis 10px'),
  pairCase('helper-m-l', 'className: m-l', 'm-l', 'Amis 15px'),
  pairCase('helper-m-l-md', 'className: m-l-md', 'm-l-md', 'Amis 20px'),
  pairCase('helper-m-l-lg', 'className: m-l-lg', 'm-l-lg', 'Amis 30px'),
  pairCase('helper-m-l-xl', 'className: m-l-xl', 'm-l-xl', 'Amis 40px'),
  pairCase('helper-m-l-xxl', 'className: m-l-xxl', 'm-l-xxl', 'Amis 50px'),
  pairCase('helper-m-l-n', 'className: m-l-n', 'm-l-n', 'Amis -15px'),
  {
    id: 'helper-space-x-6',
    group: 'p0-helper',
    layer: 'p0',
    title: 'tpl 容器 className: flex space-x-6',
    expect: '后盒相对前盒 margin-left 24px（Amis space-x-6）',
    schema: {
      type: 'page',
      body: {
        type: 'tpl',
        className: 'flex space-x-6',
        tpl: '<div data-box="a" style="width:64px;height:64px;background:#fde68a">A</div><div data-box="b" style="width:64px;height:64px;background:#fde68a">B</div>',
      },
    },
    measure: { type: 'pair', selectors: ['[data-box="a"]', '[data-box="b"]'] },
  },
  {
    id: 'button-level-primary',
    group: 'p0-layout',
    layer: 'p0',
    title: 'primary 按钮能渲染',
    schema: {
      type: 'page',
      body: { type: 'button', label: '提交', level: 'primary' },
    },
    measure: { type: 'smoke' },
  },
  {
    id: 'form-default',
    group: 'p0-layout',
    layer: 'p0',
    title: '默认 Form',
    schema: {
      type: 'page',
      body: {
        type: 'form',
        body: [{ type: 'input-text', name: 'name', label: '姓名' }],
      },
    },
    measure: { type: 'smoke' },
  },
]
