<script setup lang="ts">
import type { Segment } from '../types/data'

defineProps<{ segments: Segment[]; activeId: string | null }>()
const emit = defineEmits<{ (e: 'select', id: string): void }>()
</script>

<template>
  <nav class="rail" aria-label="河段导航">
    <div class="rail-title">河段导航</div>
    <button
      v-for="s in segments"
      :key="s.id"
      type="button"
      class="seg"
      :class="{ active: s.id === activeId }"
      @click="emit('select', s.id)"
    >
      <span class="seg-title">{{ s.title }}</span>
      <span class="seg-sub">{{ s.subtitle }}</span>
    </button>
  </nav>
</template>

<style scoped>
.rail {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 204px;
  max-height: calc(100vh - 28px);
  overflow-y: auto;
  z-index: 10;
  padding: 8px;
  background: rgba(8, 12, 20, 0.72);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #cfe3f5;
}

.rail-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.55;
  padding: 4px 8px 8px;
}

.seg {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  margin-bottom: 4px;
  border: none;
  border-left: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  color: inherit;
  font: inherit;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.seg:hover {
  background: rgba(255, 255, 255, 0.06);
}

.seg.active {
  background: rgba(34, 211, 238, 0.14);
  border-left-color: #22d3ee;
  color: #ffffff;
}

.seg-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
}

.seg-sub {
  display: block;
  font-size: 11px;
  opacity: 0.65;
  margin-top: 2px;
}
</style>
