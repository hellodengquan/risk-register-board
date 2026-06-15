<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isEdit ? '编辑风险' : '新增风险' }}</h2>
        <button class="modal-close" @click="$emit('close')">×</button>
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

const { calculateScore, getLevelClass, getLevelDesc } = useRisks()

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
  }
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
