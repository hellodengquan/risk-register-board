import { ref, computed, watch } from 'vue'

export const RISK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
}

export const STATUS_LABELS = {
  [RISK_STATUSES.TODO]: '待处理',
  [RISK_STATUSES.IN_PROGRESS]: '处理中',
  [RISK_STATUSES.RESOLVED]: '已解决',
  [RISK_STATUSES.CLOSED]: '已关闭'
}

export const STATUS_COLORS = {
  [RISK_STATUSES.TODO]: '#faad14',
  [RISK_STATUSES.IN_PROGRESS]: '#1890ff',
  [RISK_STATUSES.RESOLVED]: '#52c41a',
  [RISK_STATUSES.CLOSED]: '#8c8c8c'
}

export const IMPACT_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

export const IMPACT_LABELS = {
  [IMPACT_LEVELS.LOW]: '低',
  [IMPACT_LEVELS.MEDIUM]: '中',
  [IMPACT_LEVELS.HIGH]: '高',
  [IMPACT_LEVELS.CRITICAL]: '严重'
}

export const IMPACT_COLORS = {
  [IMPACT_LEVELS.LOW]: '#52c41a',
  [IMPACT_LEVELS.MEDIUM]: '#faad14',
  [IMPACT_LEVELS.HIGH]: '#fa8c16',
  [IMPACT_LEVELS.CRITICAL]: '#ff4d4f'
}

export const PROBABILITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
}

export const PROBABILITY_LABELS = {
  [PROBABILITY_LEVELS.LOW]: '低',
  [PROBABILITY_LEVELS.MEDIUM]: '中',
  [PROBABILITY_LEVELS.HIGH]: '高'
}

export const IMPACT_SCORES = {
  [IMPACT_LEVELS.LOW]: 1,
  [IMPACT_LEVELS.MEDIUM]: 2,
  [IMPACT_LEVELS.HIGH]: 3,
  [IMPACT_LEVELS.CRITICAL]: 4
}

export const PROBABILITY_SCORES = {
  [PROBABILITY_LEVELS.LOW]: 1,
  [PROBABILITY_LEVELS.MEDIUM]: 2,
  [PROBABILITY_LEVELS.HIGH]: 3
}

export function calculateRiskScore(impact, probability) {
  const impactScore = IMPACT_SCORES[impact] ?? 1
  const probScore = PROBABILITY_SCORES[probability] ?? 1
  return impactScore * probScore
}

export function getRiskLevelClass(score) {
  if (score >= 9) return 'level-critical'
  if (score >= 6) return 'level-high'
  if (score >= 3) return 'level-medium'
  return 'level-low'
}

export function getRiskLevelDesc(score) {
  if (score >= 9) return '（极高风险，需立即处理）'
  if (score >= 6) return '（高风险，需重点关注）'
  if (score >= 3) return '（中风险，需跟踪）'
  return '（低风险，持续观察）'
}

let idCounter = 1

const generateId = () => `risk_${idCounter++}`

const createSampleRisks = () => {
  const resetCounter = () => { idCounter = 1 }
  resetCounter()
  
  return [
    {
      id: generateId(),
      title: '需求变更频繁',
      description: '客户需求经常变动，导致开发返工和进度延误',
      impact: IMPACT_LEVELS.HIGH,
      probability: PROBABILITY_LEVELS.HIGH,
      status: RISK_STATUSES.TODO,
      owner: '张三',
      createdAt: new Date('2024-01-10').toISOString(),
      updatedAt: new Date('2024-01-10').toISOString(),
      mitigation: ''
    },
    {
      id: generateId(),
      title: '技术债务累积',
      description: '历史代码质量不佳，新功能开发难度增加',
      impact: IMPACT_LEVELS.MEDIUM,
      probability: PROBABILITY_LEVELS.MEDIUM,
      status: RISK_STATUSES.IN_PROGRESS,
      owner: '李四',
      createdAt: new Date('2024-01-08').toISOString(),
      updatedAt: new Date('2024-01-12').toISOString(),
      mitigation: '计划重构核心模块'
    },
    {
      id: generateId(),
      title: '人员流动风险',
      description: '核心开发人员可能离职，影响项目进度',
      impact: IMPACT_LEVELS.CRITICAL,
      probability: PROBABILITY_LEVELS.LOW,
      status: RISK_STATUSES.TODO,
      owner: '王五',
      createdAt: new Date('2024-01-05').toISOString(),
      updatedAt: new Date('2024-01-05').toISOString(),
      mitigation: ''
    },
    {
      id: generateId(),
      title: '第三方接口不稳定',
      description: '外部依赖的API经常超时或返回错误',
      impact: IMPACT_LEVELS.HIGH,
      probability: PROBABILITY_LEVELS.MEDIUM,
      status: RISK_STATUSES.RESOLVED,
      owner: '赵六',
      createdAt: new Date('2024-01-02').toISOString(),
      updatedAt: new Date('2024-01-15').toISOString(),
      mitigation: '增加熔断和降级机制，已上线验证'
    },
    {
      id: generateId(),
      title: '性能瓶颈',
      description: '系统在高并发下响应变慢',
      impact: IMPACT_LEVELS.MEDIUM,
      probability: PROBABILITY_LEVELS.LOW,
      status: RISK_STATUSES.CLOSED,
      owner: '孙七',
      createdAt: new Date('2023-12-20').toISOString(),
      updatedAt: new Date('2024-01-10').toISOString(),
      mitigation: '优化数据库查询，增加缓存层'
    }
  ]
}

const STORAGE_KEY = 'risk_register_board_risks'

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      if (Array.isArray(data) && data.length > 0) {
        const maxId = Math.max(...data.map(r => {
          const match = r.id?.match(/risk_(\d+)/)
          return match ? parseInt(match[1], 10) : 0
        }))
        idCounter = maxId + 1
        return data
      }
    }
  } catch (e) {
    console.warn('Failed to load risks from localStorage:', e)
  }
  return createSampleRisks()
}

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to save risks to localStorage:', e)
  }
}

const risks = ref(loadFromStorage())

watch(risks, (newVal) => {
  saveToStorage(newVal)
}, { deep: true })

export function useRisks() {
  const risksByStatus = computed(() => {
    const grouped = {}
    Object.values(RISK_STATUSES).forEach(status => {
      grouped[status] = risks.value.filter(r => r.status === status)
    })
    return grouped
  })

  const stats = computed(() => {
    const total = risks.value.length
    const byStatus = {}
    Object.values(RISK_STATUSES).forEach(status => {
      byStatus[status] = risks.value.filter(r => r.status === status).length
    })
    const highRiskCount = risks.value.filter(r => 
      r.impact === IMPACT_LEVELS.HIGH || r.impact === IMPACT_LEVELS.CRITICAL
    ).length
    return { total, byStatus, highRiskCount }
  })

  const addRisk = (riskData) => {
    const now = new Date().toISOString()
    const newRisk = {
      id: generateId(),
      ...riskData,
      status: riskData.status || RISK_STATUSES.TODO,
      createdAt: now,
      updatedAt: now
    }
    risks.value.push(newRisk)
    return newRisk
  }

  const updateRisk = (id, updates) => {
    const index = risks.value.findIndex(r => r.id === id)
    if (index !== -1) {
      risks.value[index] = {
        ...risks.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      return risks.value[index]
    }
    return null
  }

  const deleteRisk = (id) => {
    const index = risks.value.findIndex(r => r.id === id)
    if (index !== -1) {
      risks.value.splice(index, 1)
      return true
    }
    return false
  }

  const moveRisk = (id, newStatus) => {
    const risk = risks.value.find(r => r.id === id)
    if (!risk) return null
    
    if (risk.status === newStatus) {
      return risk
    }
    
    return updateRisk(id, { status: newStatus })
  }

  const getRiskById = (id) => {
    return risks.value.find(r => r.id === id)
  }

  const calculateScore = (impact, probability) => calculateRiskScore(impact, probability)
  const getLevelClass = (score) => getRiskLevelClass(score)
  const getLevelDesc = (score) => getRiskLevelDesc(score)

  const reset = () => {
    risks.value = loadFromStorage()
  }

  return {
    risks,
    risksByStatus,
    stats,
    addRisk,
    updateRisk,
    deleteRisk,
    moveRisk,
    getRiskById,
    calculateScore,
    getLevelClass,
    getLevelDesc,
    reset
  }
}
