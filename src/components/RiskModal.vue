<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isEdit ? '编辑风险' : '新增风险' }}</h2>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      
      <div v-if="hasConflict" class="conflict-alert">
        <div class="conflict-icon">⚠️</div>
        <div class="conflict-content">
          <div class="conflict-title">检测到冲突</div>
          <div class="conflict-desc">此风险项已在其他标签页被修改，继续保存可能会覆盖他人的更改。</div>
          <div class="conflict-actions">
            <button class="btn btn-sm btn-default" @click="refreshFromRemote">
              刷新为最新版本
            </button>
            <button class="btn btn-sm btn-primary" @click="dismissConflict">
              继续编辑
            </button>
          </div>
        </div>
      </div>
      
      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label>风险标题 <span class="required">*</span></label>
          <input 
            type="text" 
            v-model="form.title" 
            placeholder="请输入风险标题"
            required
          />
        </div>
        
        <div class="form-group">
          <label>风险描述</label>
          <textarea 
            v-model="form.description" 
            placeholder="请详细描述风险内容"
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>影响程度 <span class="required">*</span></label>
            <select v-model="form.impact" required>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="critical">严重</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>发生概率 <span class="required">*</span></label>
            <select v-model="form.probability" required>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>负责人</label>
            <input 
              type="text" 
              v-model="form.owner" 
              placeholder="请输入负责人姓名"
            />
          </div>
          
          <div class="form-group">
            <label>状态</label>
            <select v-model="form.status">
              <option value="todo">待处理</option>
              <option value="in_progress">处理中</option>
              <option value="resolved">已解决</option>
              <option value="closed">已关闭</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label>应对措施</label>
          <textarea 
            v-model="form.mitigation" 
            placeholder="请描述风险应对措施"
            rows="2"
          ></textarea>
        </div>
        
        <div class="risk-preview" v-if="form.impact && form.probability">
          <span class="preview-label">风险值预估：</span>
          <span class="preview-score" :class="riskLevelClass">{{ riskScore }}</span>
          <span class="preview-desc">{{ riskLevelDesc }}</span>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-default" @click="$emit('close')">
            取消
          </button>
          <button type="submit" class="btn btn-primary">
            {{ isEdit ? '保存' : '创建' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { 
  IMPACT_LEVELS, 
  PROBABILITY_LEVELS, 
  RISK_STATUSES,
  useRisks
} from '../composables/useRisks.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  risk: {
    type: Object,
    default: null
  },
  initialStatus: {
    type: String,
    default: 'todo'
  }
})

const emit = defineEmits(['close', 'submit'])

const { risks, calculateScore, getLevelClass, getLevelDesc, getRiskById } = useRisks()

const isEdit = computed(() => !!props.risk)

const form = ref({
  title: '',
  description: '',
  impact: IMPACT_LEVELS.MEDIUM,
  probability: PROBABILITY_LEVELS.MEDIUM,
  status: RISK_STATUSES.TODO,
  owner: '',
  mitigation: ''
})

const baselineLastEditedAt = ref(null)
const hasConflict = ref(false)
const conflictDismissed = ref(false)

const riskScore = computed(() => calculateScore(form.value.impact, form.value.probability))
const riskLevelClass = computed(() => getLevelClass(riskScore.value))
const riskLevelDesc = computed(() => getLevelDesc(riskScore.value))

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    impact: IMPACT_LEVELS.MEDIUM,
    probability: PROBABILITY_LEVELS.MEDIUM,
    status: props.initialStatus || RISK_STATUSES.TODO,
    owner: '',
    mitigation: ''
  }
  baselineLastEditedAt.value = null
  hasConflict.value = false
  conflictDismissed.value = false
}

const fillForm = () => {
  if (props.risk) {
    form.value = {
      title: props.risk.title,
      description: props.risk.description || '',
      impact: props.risk.impact,
      probability: props.risk.probability,
      status: props.risk.status,
      owner: props.risk.owner || '',
      mitigation: props.risk.mitigation || ''
    }
    baselineLastEditedAt.value = props.risk.lastEditedAt || null
    hasConflict.value = false
    conflictDismissed.value = false
  }
}

const checkConflict = () => {
  if (!isEdit.value || !props.risk || !baselineLastEditedAt.value || conflictDismissed.value) {
    return
  }
  const current = getRiskById(props.risk.id)
  if (!current) {
    hasConflict.value = true
    return
  }
  const baselineTime = new Date(baselineLastEditedAt.value).getTime()
  const currentTime = new Date(current.lastEditedAt || 0).getTime()
  hasConflict.value = currentTime > baselineTime
}

const refreshFromRemote = () => {
  if (!props.risk) return
  const current = getRiskById(props.risk.id)
  if (current) {
    form.value = {
      title: current.title,
      description: current.description || '',
      impact: current.impact,
      probability: current.probability,
      status: current.status,
      owner: current.owner || '',
      mitigation: current.mitigation || ''
    }
    baselineLastEditedAt.value = current.lastEditedAt || null
  }
  hasConflict.value = false
  conflictDismissed.value = false
}

const dismissConflict = () => {
  hasConflict.value = false
  conflictDismissed.value = true
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.risk) {
      fillForm()
    } else {
      resetForm()
    }
  }
})

watch(() => props.risk, (newRisk) => {
  if (newRisk && props.visible) {
    fillForm()
  }
}, { deep: true })

watch(risks, () => {
  if (isEdit.value && props.visible) {
    checkConflict()
  }
}, { deep: true })

onMounted(() => {
  if (props.visible) {
    if (props.risk) {
      fillForm()
    } else {
      resetForm()
    }
  }
})

const onSubmit = () => {
  if (!form.value.title.trim()) {
    return
  }
  emit('submit', {
    ...form.value,
    title: form.value.title.trim()
  })
}
</script>

<style scoped>
.required {
  color: #ff4d4f;
}

.conflict-alert {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.conflict-icon {
  font-size: 18px;
  line-height: 1.4;
  flex-shrink: 0;
}

.conflict-content {
  flex: 1;
  min-width: 0;
}

.conflict-title {
  font-size: 14px;
  font-weight: 600;
  color: #ad6800;
  margin-bottom: 4px;
}

.conflict-desc {
  font-size: 12px;
  color: #d48806;
  line-height: 1.5;
  margin-bottom: 10px;
}

.conflict-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
  height: auto;
  line-height: 1.5;
}

.risk-preview {
  background-color: #fafafa;
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-label {
  font-size: 14px;
  color: #666;
}

.preview-score {
  font-size: 18px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 12px;
}

.preview-score.level-low {
  background-color: #f6ffed;
  color: #52c41a;
}

.preview-score.level-medium {
  background-color: #fffbe6;
  color: #faad14;
}

.preview-score.level-high {
  background-color: #fff2e8;
  color: #fa8c16;
}

.preview-score.level-critical {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.preview-desc {
  font-size: 13px;
  color: #999;
}
</style>
