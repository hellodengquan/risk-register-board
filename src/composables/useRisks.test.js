import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import {
  calculateRiskScore,
  getRiskLevelClass,
  getRiskLevelDesc,
  IMPACT_LEVELS,
  PROBABILITY_LEVELS,
  RISK_STATUSES,
  IMPACT_SCORES,
  PROBABILITY_SCORES,
  useRisks
} from './useRisks.js'

describe('纯函数测试', () => {
  describe('calculateRiskScore', () => {
    it('应该正确计算低影响低概率风险值', () => {
      expect(calculateRiskScore(IMPACT_LEVELS.LOW, PROBABILITY_LEVELS.LOW)).toBe(1)
    })

    it('应该正确计算中影响中概率风险值', () => {
      expect(calculateRiskScore(IMPACT_LEVELS.MEDIUM, PROBABILITY_LEVELS.MEDIUM)).toBe(4)
    })

    it('应该正确计算高影响高概率风险值', () => {
      expect(calculateRiskScore(IMPACT_LEVELS.HIGH, PROBABILITY_LEVELS.HIGH)).toBe(9)
    })

    it('应该正确计算严重影响高概率风险值', () => {
      expect(calculateRiskScore(IMPACT_LEVELS.CRITICAL, PROBABILITY_LEVELS.HIGH)).toBe(12)
    })

    it('无效参数应使用默认值 1', () => {
      expect(calculateRiskScore('invalid', 'invalid')).toBe(1)
    })
  })

  describe('getRiskLevelClass', () => {
    it('分数 1-2 应为 level-low', () => {
      expect(getRiskLevelClass(1)).toBe('level-low')
      expect(getRiskLevelClass(2)).toBe('level-low')
    })

    it('分数 3-5 应为 level-medium', () => {
      expect(getRiskLevelClass(3)).toBe('level-medium')
      expect(getRiskLevelClass(5)).toBe('level-medium')
    })

    it('分数 6-8 应为 level-high', () => {
      expect(getRiskLevelClass(6)).toBe('level-high')
      expect(getRiskLevelClass(8)).toBe('level-high')
    })

    it('分数 >=9 应为 level-critical', () => {
      expect(getRiskLevelClass(9)).toBe('level-critical')
      expect(getRiskLevelClass(12)).toBe('level-critical')
    })
  })

  describe('getRiskLevelDesc', () => {
    it('应该返回正确的描述', () => {
      expect(getRiskLevelDesc(1)).toContain('低风险')
      expect(getRiskLevelDesc(4)).toContain('中风险')
      expect(getRiskLevelDesc(7)).toContain('高风险')
      expect(getRiskLevelDesc(10)).toContain('极高风险')
    })
  })
})

describe('useRisks composable 测试', () => {
  let composable

  beforeEach(() => {
    composable = useRisks()
    composable.reset()
  })

  describe('初始化', () => {
    it('应该初始化示例数据', () => {
      expect(composable.risks.value.length).toBe(5)
      expect(composable.stats.value.total).toBe(5)
    })

    it('应该正确按状态分组', () => {
      expect(composable.risksByStatus.value.todo.length).toBe(2)
      expect(composable.risksByStatus.value.in_progress.length).toBe(1)
      expect(composable.risksByStatus.value.resolved.length).toBe(1)
      expect(composable.risksByStatus.value.closed.length).toBe(1)
    })

    it('应该正确统计高风险数量', () => {
      expect(composable.stats.value.highRiskCount).toBe(3)
    })
  })

  describe('addRisk', () => {
    it('应该添加风险项', () => {
      const initialCount = composable.risks.value.length
      
      const newRisk = composable.addRisk({
        title: '新风险',
        description: '测试描述',
        impact: IMPACT_LEVELS.MEDIUM,
        probability: PROBABILITY_LEVELS.MEDIUM
      })

      expect(composable.risks.value.length).toBe(initialCount + 1)
      expect(newRisk.title).toBe('新风险')
      expect(newRisk.id).toBeTruthy()
      expect(newRisk.createdAt).toBeTruthy()
      expect(newRisk.updatedAt).toBeTruthy()
    })

    it('应该使用传入的 status', () => {
      const newRisk = composable.addRisk({
        title: '指定状态的风险',
        impact: IMPACT_LEVELS.LOW,
        probability: PROBABILITY_LEVELS.LOW,
        status: RISK_STATUSES.IN_PROGRESS
      })

      expect(newRisk.status).toBe(RISK_STATUSES.IN_PROGRESS)
      expect(composable.risksByStatus.value.in_progress).toContainEqual(
        expect.objectContaining({ id: newRisk.id })
      )
    })

    it('未指定 status 应默认 TODO', () => {
      const newRisk = composable.addRisk({
        title: '默认状态风险',
        impact: IMPACT_LEVELS.LOW,
        probability: PROBABILITY_LEVELS.LOW
      })

      expect(newRisk.status).toBe(RISK_STATUSES.TODO)
    })

    it('应该支持负责人和应对措施', () => {
      const newRisk = composable.addRisk({
        title: '完整信息风险',
        impact: IMPACT_LEVELS.HIGH,
        probability: PROBABILITY_LEVELS.HIGH,
        owner: '测试人',
        mitigation: '应对方案'
      })

      expect(newRisk.owner).toBe('测试人')
      expect(newRisk.mitigation).toBe('应对方案')
    })
  })

  describe('updateRisk', () => {
    it('应该更新风险项', () => {
      const risk = composable.risks.value[0]
      const originalUpdatedAt = risk.updatedAt

      const updated = composable.updateRisk(risk.id, {
        title: '更新后的标题',
        owner: '新负责人'
      })

      expect(updated).not.toBeNull()
      expect(updated.title).toBe('更新后的标题')
      expect(updated.owner).toBe('新负责人')
      expect(updated.updatedAt).not.toBe(originalUpdatedAt)
    })

    it('不存在的 ID 应返回 null', () => {
      const result = composable.updateRisk('non_existent_id', { title: 'test' })
      expect(result).toBeNull()
    })
  })

  describe('deleteRisk', () => {
    it('应该删除风险项', () => {
      const risk = composable.risks.value[0]
      const initialCount = composable.risks.value.length

      const result = composable.deleteRisk(risk.id)

      expect(result).toBe(true)
      expect(composable.risks.value.length).toBe(initialCount - 1)
      expect(composable.getRiskById(risk.id)).toBeUndefined()
    })

    it('不存在的 ID 应返回 false', () => {
      const result = composable.deleteRisk('non_existent_id')
      expect(result).toBe(false)
    })
  })

  describe('moveRisk', () => {
    it('应该移动风险到新状态并更新时间', () => {
      const risk = composable.risks.value[0]
      const originalUpdatedAt = risk.updatedAt
      expect(risk.status).toBe(RISK_STATUSES.TODO)

      const moved = composable.moveRisk(risk.id, RISK_STATUSES.IN_PROGRESS)

      expect(moved.status).toBe(RISK_STATUSES.IN_PROGRESS)
      expect(moved.updatedAt).not.toBe(originalUpdatedAt)
    })

    it('移动到相同状态不应更新时间', () => {
      const risk = composable.risks.value[0]
      const originalUpdatedAt = risk.updatedAt

      const moved = composable.moveRisk(risk.id, risk.status)

      expect(moved).toBe(risk)
      expect(moved.updatedAt).toBe(originalUpdatedAt)
    })

    it('不存在的 ID 应返回 null', () => {
      const result = composable.moveRisk('non_existent_id', RISK_STATUSES.IN_PROGRESS)
      expect(result).toBeNull()
    })
  })

  describe('getRiskById', () => {
    it('应该根据 ID 获取风险项', () => {
      const risk = composable.risks.value[0]
      const found = composable.getRiskById(risk.id)
      expect(found).toBe(risk)
    })

    it('不存在的 ID 应返回 undefined', () => {
      expect(composable.getRiskById('non_existent_id')).toBeUndefined()
    })
  })

  describe('计算方法', () => {
    it('calculateScore 应该与纯函数一致', () => {
      expect(composable.calculateScore(IMPACT_LEVELS.HIGH, PROBABILITY_LEVELS.HIGH))
        .toBe(calculateRiskScore(IMPACT_LEVELS.HIGH, PROBABILITY_LEVELS.HIGH))
    })

    it('getLevelClass 应该与纯函数一致', () => {
      expect(composable.getLevelClass(6)).toBe(getRiskLevelClass(6))
    })

    it('getLevelDesc 应该与纯函数一致', () => {
      expect(composable.getLevelDesc(6)).toBe(getRiskLevelDesc(6))
    })
  })

  describe('localStorage 持久化', () => {
    it('数据变更应该保存到 localStorage', async () => {
      const STORAGE_KEY = 'risk_register_board_risks'
      localStorage.removeItem(STORAGE_KEY)
      
      composable.addRisk({
        title: '持久化测试风险',
        impact: IMPACT_LEVELS.MEDIUM,
        probability: PROBABILITY_LEVELS.MEDIUM
      })

      await nextTick()

      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored)
      expect(parsed.length).toBe(6)
      expect(parsed[5].title).toBe('持久化测试风险')
    })

    it('应该从 localStorage 恢复数据', async () => {
      const STORAGE_KEY = 'risk_register_board_risks'
      
      const testData = [{
        id: 'test_1',
        title: '本地存储测试',
        impact: IMPACT_LEVELS.HIGH,
        probability: PROBABILITY_LEVELS.HIGH,
        status: RISK_STATUSES.IN_PROGRESS,
        owner: '测试',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: '',
        mitigation: ''
      }]
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(testData))
      
      composable.reset()
      
      expect(composable.risks.value.length).toBe(1)
      expect(composable.risks.value[0].title).toBe('本地存储测试')
    })

    it('localStorage 异常应优雅降级', () => {
      const STORAGE_KEY = 'risk_register_board_risks'
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      composable.reset()

      expect(composable.risks.value.length).toBe(5)
    })
  })

  describe('ID 生成', () => {
    it('应该生成唯一递增的 ID', () => {
      const risk1 = composable.addRisk({ title: '风险1', impact: 'low', probability: 'low' })
      const risk2 = composable.addRisk({ title: '风险2', impact: 'low', probability: 'low' })

      expect(risk1.id).not.toBe(risk2.id)
      expect(risk1.id).toMatch(/risk_\d+/)
      expect(risk2.id).toMatch(/risk_\d+/)
    })
  })

  describe('统计功能', () => {
    it('stats 应该正确更新', () => {
      const initialStats = composable.stats.value

      composable.addRisk({
        title: '严重高概率风险',
        impact: IMPACT_LEVELS.CRITICAL,
        probability: PROBABILITY_LEVELS.HIGH
      })

      const newStats = composable.stats.value
      expect(newStats.total).toBe(initialStats.total + 1)
      expect(newStats.highRiskCount).toBe(initialStats.highRiskCount + 1)
    })
  })
})
