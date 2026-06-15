<template>
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <h1>📋 风险登记看板</h1>
          <p class="subtitle">项目风险管理与跟踪</p>
        </div>
        <div class="header-actions">
          <div class="stats-bar">
            <div class="stat-item">
              <span class="stat-value total">{{ stats.total }}</span>
              <span class="stat-label">总计</span>
            </div>
            <div class="stat-item">
              <span class="stat-value high-risk">{{ stats.highRiskCount }}</span>
              <span class="stat-label">高风险</span>
            </div>
          </div>
          <button class="btn btn-primary add-risk-btn" @click="openAddModal">
            + 新增风险
          </button>
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <div class="kanban-board">
        <KanbanColumn
          v-for="column in columns"
          :key="column.status"
          :title="column.title"
          :status="column.status"
          :risks="risksByStatus[column.status] || []"
          @add="openAddModalWithStatus"
          @edit="openEditModal"
          @delete="handleDelete"
          @drop="handleDrop"
        />
      </div>
    </main>
    
    <RiskModal
      v-if="modalVisible"
      :visible="modalVisible"
      :risk="editingRisk"
      :initial-status="modalInitialStatus"
      @close="closeModal"
      @submit="handleSubmit"
    />
    
    <div class="confirm-modal" v-if="confirmVisible">
      <div class="modal-overlay" @click.self="cancelDelete">
        <div class="confirm-content">
          <h3>确认删除</h3>
          <p>确定要删除这个风险项吗？此操作无法撤销。</p>
          <div class="confirm-actions">
            <button class="btn btn-default" @click="cancelDelete">取消</button>
            <button class="btn btn-danger" @click="confirmDelete">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import KanbanColumn from './components/KanbanColumn.vue'
import RiskModal from './components/RiskModal.vue'
import { useRisks, RISK_STATUSES, STATUS_LABELS } from './composables/useRisks.js'

const { risksByStatus, stats, addRisk, updateRisk, deleteRisk, moveRisk } = useRisks()

const columns = [
  { status: RISK_STATUSES.TODO, title: STATUS_LABELS[RISK_STATUSES.TODO] },
  { status: RISK_STATUSES.IN_PROGRESS, title: STATUS_LABELS[RISK_STATUSES.IN_PROGRESS] },
  { status: RISK_STATUSES.RESOLVED, title: STATUS_LABELS[RISK_STATUSES.RESOLVED] },
  { status: RISK_STATUSES.CLOSED, title: STATUS_LABELS[RISK_STATUSES.CLOSED] }
]

const modalVisible = ref(false)
const editingRisk = ref(null)
const modalInitialStatus = ref(RISK_STATUSES.TODO)
const confirmVisible = ref(false)
const deletingId = ref(null)

const openAddModal = () => {
  editingRisk.value = null
  modalInitialStatus.value = RISK_STATUSES.TODO
  modalVisible.value = true
}

const openAddModalWithStatus = (status) => {
  editingRisk.value = null
  modalInitialStatus.value = status
  modalVisible.value = true
}

const openEditModal = (risk) => {
  editingRisk.value = risk
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
  editingRisk.value = null
}

const handleSubmit = (formData) => {
  if (editingRisk.value) {
    updateRisk(editingRisk.value.id, formData)
  } else {
    addRisk(formData)
  }
  closeModal()
}

const handleDelete = (id) => {
  deletingId.value = id
  confirmVisible.value = true
}

const confirmDelete = () => {
  if (deletingId.value) {
    deleteRisk(deletingId.value)
  }
  cancelDelete()
}

const cancelDelete = () => {
  confirmVisible.value = false
  deletingId.value = null
}

const handleDrop = ({ riskId, newStatus }) => {
  moveRisk(riskId, newStatus)
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px 24px;
  flex-shrink: 0;
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.subtitle {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stats-bar {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 0 16px;
  border-right: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-right: none;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-value.total {
  color: #1890ff;
}

.stat-value.high-risk {
  color: #ff4d4f;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.add-risk-btn {
  padding: 10px 20px;
  font-size: 14px;
}

.app-main {
  flex: 1;
  padding: 24px;
  overflow: hidden;
}

.kanban-board {
  display: flex;
  gap: 16px;
  height: calc(100vh - 140px);
  max-width: 1600px;
  margin: 0 auto;
}

.confirm-modal .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-content {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.confirm-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.confirm-content p {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 1200px) {
  .kanban-board {
    overflow-x: auto;
    padding-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 12px 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .app-main {
    padding: 16px;
  }
  
  .kanban-board {
    height: calc(100vh - 200px);
  }
}
</style>
