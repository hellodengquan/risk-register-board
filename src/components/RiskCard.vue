<template>
  <div 
    class="risk-card"
    :class="{ 'risk-card-dragging': isDragging }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @click="$emit('edit', risk)"
  >
    <div class="risk-card-header">
      <span class="risk-id">{{ risk.id }}</span>
      <div class="risk-actions" @click.stop>
        <button class="action-btn" @click="$emit('edit', risk)" title="编辑">✏️</button>
        <button class="action-btn" @click="$emit('delete', risk.id)" title="删除">🗑️</button>
      </div>
    </div>
    
    <h3 class="risk-title">{{ risk.title }}</h3>
    
    <p class="risk-description" v-if="risk.description">
      {{ risk.description }}
    </p>
    
    <div class="risk-metrics">
      <div class="metric-item">
        <span class="metric-label">影响</span>
        <span class="metric-value" :style="{ color: impactColor }">
          {{ impactLabel }}
        </span>
      </div>
      <div class="metric-item">
        <span class="metric-label">概率</span>
        <span class="metric-value">{{ probabilityLabel }}</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">风险值</span>
        <span class="metric-value risk-score" :class="riskLevelClass">
          {{ riskScore }}
        </span>
      </div>
    </div>
    
    <div class="risk-footer">
      <div class="risk-owner" v-if="risk.owner">
        👤 {{ risk.owner }}
      </div>
      <div class="risk-date">
        {{ formatDate(risk.updatedAt) }}
      </div>
    </div>
    
    <div class="risk-status-bar" :style="{ backgroundColor: statusColor }"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  IMPACT_LABELS, 
  IMPACT_COLORS, 
  PROBABILITY_LABELS,
  STATUS_COLORS 
} from '../composables/useRisks.js'

const props = defineProps({
  risk: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'dragstart', 'dragend'])

const isDragging = ref(false)

const impactLabel = computed(() => IMPACT_LABELS[props.risk.impact] || '未知')
const impactColor = computed(() => IMPACT_COLORS[props.risk.impact] || '#999')
const probabilityLabel = computed(() => PROBABILITY_LABELS[props.risk.probability] || '未知')
const statusColor = computed(() => STATUS_COLORS[props.risk.status] || '#999')

const riskScore = computed(() => {
  const impactScores = { low: 1, medium: 2, high: 3, critical: 4 }
  const probScores = { low: 1, medium: 2, high: 3 }
  const impact = impactScores[props.risk.impact] || 1
  const prob = probScores[props.risk.probability] || 1
  return impact * prob
})

const riskLevelClass = computed(() => {
  const score = riskScore.value
  if (score >= 9) return 'level-critical'
  if (score >= 6) return 'level-high'
  if (score >= 3) return 'level-medium'
  return 'level-low'
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const onDragStart = (e) => {
  isDragging.value = true
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', props.risk.id)
  emit('dragstart', props.risk)
}

const onDragEnd = () => {
  isDragging.value = false
  emit('dragend')
}
</script>

<style scoped>
.risk-card {
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8e8e8;
}

.risk-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.risk-card-dragging {
  opacity: 0.5;
  transform: rotate(3deg);
}

.risk-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.risk-id {
  font-size: 12px;
  color: #999;
  font-family: monospace;
}

.risk-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.risk-card:hover .risk-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 2px 4px;
  border-radius: 4px;
}

.action-btn:hover {
  background-color: #f0f0f0;
}

.risk-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  line-height: 1.4;
}

.risk-description {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.risk-metrics {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  padding: 8px;
  background-color: #fafafa;
  border-radius: 6px;
}

.metric-item {
  flex: 1;
  text-align: center;
}

.metric-label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-bottom: 2px;
}

.metric-value {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.risk-score {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.level-low {
  background-color: #f6ffed;
  color: #52c41a;
}

.level-medium {
  background-color: #fffbe6;
  color: #faad14;
}

.level-high {
  background-color: #fff2e8;
  color: #fa8c16;
}

.level-critical {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.risk-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.risk-owner {
  display: flex;
  align-items: center;
  gap: 4px;
}

.risk-status-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #1890ff;
}
</style>
