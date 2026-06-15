<template>
  <Transition name="alert">
    <div v-if="error" class="storage-alert" :class="`alert-${error.type}`">
      <div class="alert-icon">
        {{ error.type === 'save' ? '⚠️' : '❌' }}
      </div>
      <div class="alert-content">
        <div class="alert-message">{{ error.message }}</div>
        <div v-if="error.detail" class="alert-detail">
          详细信息：{{ error.detail }}
        </div>
      </div>
      <button class="alert-close" @click="$emit('close')" title="关闭">
        ×
      </button>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  error: {
    type: Object,
    default: null
  }
})

defineEmits(['close'])
</script>

<style scoped>
.storage-alert {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3000;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 8px;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid;
  backdrop-filter: blur(8px);
}

.alert-save {
  background-color: #fffbe6;
  border-color: #ffe58f;
}

.alert-load {
  background-color: #fff1f0;
  border-color: #ffa39e;
}

.alert-icon {
  font-size: 20px;
  line-height: 1.2;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-message {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  line-height: 1.5;
}

.alert-detail {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
  line-height: 1.4;
}

.alert-save .alert-message {
  color: #ad6800;
}

.alert-load .alert-message {
  color: #a8071a;
}

.alert-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #8c8c8c;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  flex-shrink: 0;
  transition: all 0.2s;
}

.alert-close:hover {
  background-color: rgba(0, 0, 0, 0.06);
  color: #262626;
}

.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}

.alert-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.alert-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
