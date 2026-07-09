<script setup lang="ts">
const items = [
  { color: '#f1f5f9', label: '城市' },
  { color: '#fbbf24', label: '历史地标' },
  { color: '#fb923c', label: '水利工程' },
  { color: '#22d3ee', label: '支流 / 湖泊' },
]
</script>

<template>
  <div class="legend">
    <div v-for="it in items" :key="it.label" class="row">
      <span class="dot" :style="{ background: it.color }" />
      <span>{{ it.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.legend {
  position: absolute;
  left: 14px;
  bottom: 18px;
  z-index: 10;
  padding: 10px 12px;
  background: rgba(8, 12, 20, 0.72);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: #cfe3f5;
  font-size: 12px;
  pointer-events: none;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
}

.dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 6px currentColor;
}
</style>
