<template>
  <div 
    class="kanban-column"
    :class="{ 'drag-over': isDragOver }"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div class="column-header">
      <div class="column-title">
        <span class="status-dot" :style="{ backgroundColor: statusColor }"></span>
        <h2>{{ title }}</h2>
        <span class="count-badge">{{ risks.length }}</span>
      </div>
      <button 
        class="add-btn" 
        @click="$emit('add', status)"
        title="添加风险"
      >
        +
      </button>
    </div>
    
    <div class="column-body">
      <RiskCard
        v-for="risk in risks"
        :key="risk.id"
        :risk="risk"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @dragstart="onCardDragStart"
        @dragend="onCardDragEnd"
      />
      
      <div v-if="risks.length === 0" class="empty-column">
        <span>暂无风险项</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import RiskCard from './RiskCard.vue'
import { STATUS_COLORS } from '../composables/useRisks.js'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  risks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['add', 'edit', 'delete', 'drop'])

const isDragOver = ref(false)

const statusColor = STATUS_COLORS[props.status] || '#999'

const onDragOver = (e) => {
  e.dataTransfer.dropEffect = 'move'
  isDragOver.value = true
}

const onDragLeave = () => {
  isDragOver.value = false
}

const onDrop = (e) => {
  isDragOver.value = false
  const riskId = e.dataTransfer.getData('text/plain')
  if (riskId) {
    emit('drop', { riskId, newStatus: props.status })
  }
}

const onCardDragStart = (risk) => {
  // 可以添加额外的拖拽开始逻辑
}

const onCardDragEnd = () => {
  isDragOver.value = false
}
</script>

<style scoped>
.kanban-column {
  flex: 1;
  min-width: 280px;
  background-color: #f0f2f5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  transition: background-color 0.2s;
}

.kanban-column.drag-over {
  background-color: #e6f7ff;
}

.column-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.column-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #1890ff;
}

.column-title h2 {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.count-badge {
  background-color: #d9d9d9;
  color: #666;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.add-btn {
  width: 28px;
  height: 28px;
  border: none;
  background-color: transparent;
  font-size: 20px;
  cursor: pointer;
  border-radius: 6px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.add-btn:hover {
  background-color: #e8e8e8;
  color: #1890ff;
}

.column-body {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  overflow-x: hidden;
}

.empty-column {
  text-align: center;
  padding: 30px 10px;
  color: #bbb;
  font-size: 13px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  margin: 10px;
}

.column-body::-webkit-scrollbar {
  width: 6px;
}

.column-body::-webkit-scrollbar-track {
  background: transparent;
}

.column-body::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 3px;
}

.column-body::-webkit-scrollbar-thumb:hover {
  background-color: #bfbfbf;
}
</style>
