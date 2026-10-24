import { describe, expect, it } from 'vitest'
import {
  taskBtnText,
  taskCanOperate,
  taskCanRetry,
  taskItems,
  taskNameLabel,
  taskRemark,
  taskRemarkLabel,
  taskRetryBtnText,
  taskStatus,
  taskStatusLabel,
  taskStatusText,
} from '../src/utils/tasks'

describe('tasks defaults', () => {
  it('reads items and maps status 0–5', () => {
    expect(taskItems({})).toEqual([])
    expect(taskItems({ items: [{ label: 'hive', status: 4 }] })).toEqual([{ label: 'hive', status: 4 }])
    expect(taskStatus({ status: 4 })).toBe(4)
    expect(taskStatus({ status: '2' })).toBe(2)
    expect(taskStatus({})).toBe(0)
    expect(taskStatusText({}, { status: 0 })).toBe('未开始')
    expect(taskStatusText({}, { status: 1 })).toBe('就绪')
    expect(taskStatusText({}, { status: 2 })).toBe('进行中')
    expect(taskStatusText({}, { status: 3 })).toBe('出错')
    expect(taskStatusText({}, { status: 4 })).toBe('已完成')
    expect(taskStatusText({}, { status: 5 })).toBe('出错')
    expect(taskCanOperate({ status: 1 })).toBe(true)
    expect(taskCanOperate({ status: 4 })).toBe(false)
    expect(taskCanRetry({ status: 5 })).toBe(true)
    expect(taskCanRetry({ status: 3 })).toBe(false)
  })

  it('uses column / button labels from source defaults', () => {
    expect(taskNameLabel({})).toBe('任务名称')
    expect(taskStatusLabel({})).toBe('状态')
    expect(taskRemarkLabel({})).toBe('备注说明')
    expect(taskBtnText({})).toBe('上线')
    expect(taskRetryBtnText({})).toBe('重试')
    expect(taskNameLabel({ taskNameLabel: '名称甲' })).toBe('名称甲')
    expect(taskRemark({ remark: '日志 ${who}' }, { who: '甲' })).toBe('日志 甲')
  })
})
