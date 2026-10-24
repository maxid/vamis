/** 同一份 schema，Amis `amis.embed` 与 Vamis `vamis.embed` 对照。 */
window.VAMIS_COMPARE_CASES = [
  {
    id: 'style-two-buttons',
    title: '两个按钮默认挨在一起',
    expect: '同一行，缝约 0（不要换行）',
    schema: {
      type: 'page',
      body: [
        {
          type: 'button',
          label: '按钮1',
          actionType: 'dialog',
          dialog: { title: '弹框', body: 'Hello World!' },
        },
        {
          type: 'button',
          label: '按钮2',
          actionType: 'dialog',
          dialog: { title: '弹框', body: 'Hello World!' },
        },
      ],
    },
    labels: ['按钮1', '按钮2'],
    pass: function (m) {
      return m.sameRow && m.gap <= 2
    },
  },
  {
    id: 'style-two-buttons-ml',
    title: '第二个按钮 className: m-l 拉开缝',
    expect: '同一行，缝 15px（Amis `.m-l` 硬编码，不是 `--gap-base` 12px）',
    schema: {
      type: 'page',
      body: [
        {
          type: 'button',
          label: '按钮1',
          actionType: 'dialog',
          dialog: { title: '弹框', body: 'Hello World!' },
        },
        {
          type: 'button',
          label: '按钮2',
          className: 'm-l',
          actionType: 'dialog',
          dialog: { title: '弹框', body: 'Hello World!' },
        },
      ],
    },
    labels: ['按钮1', '按钮2'],
    pass: function (m) {
      return m.sameRow && Math.abs(m.gap - 15) <= 1
    },
  },
]
