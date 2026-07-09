<script setup lang="ts">
import { computed } from 'vue'
import type { Poi, PoiCategory } from '../types/data'

const props = defineProps<{ poi: Poi | null }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const CATEGORY_LABEL: Record<PoiCategory, string> = {
  city: '城市',
  landmark: '历史地标',
  engineering: '水利工程',
  water: '支流 / 湖泊',
}

const latText = computed(() => (props.poi ? `${props.poi.lat.toFixed(3)}°N` : ''))
const lonText = computed(() => (props.poi ? `${props.poi.lon.toFixed(3)}°E` : ''))
</script>

<template>
  <transition name="panel">
    <aside v-if="poi" class="panel">
      <button class="close" type="button" aria-label="关闭" @click="emit('close')">×</button>
      <div class="tag">{{ CATEGORY_LABEL[poi.category] }}</div>
      <h2>{{ poi.name }}</h2>
      <p v-if="poi.nameEn" class="en">{{ poi.nameEn }}</p>
      <p class="coords">{{ latText }}　{{ lonText }}</p>
      <p v-if="poi.description" class="desc">{{ poi.description }}</p>
    </aside>
  </transition>
</template>

<style scoped>
.panel {
  position: absolute;
  top: 92px;
  right: 16px;
  z-index: 11;
  width: 320px;
  max-width: calc(100vw - 32px);
  padding: 16px 18px 18px;
  background: rgba(8, 12, 20, 0.82);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(34, 211, 238, 0.25);
  border-radius: 14px;
  color: #e6f7ff;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
}

.close {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 26px;
  height: 26px;
  line-height: 22px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: #cfe3f5;
  font-size: 18px;
  cursor: pointer;
}
.close:hover {
  background: rgba(255, 255, 255, 0.16);
}

.tag {
  display: inline-block;
  font-size: 11px;
  letter-spacing: 0.5px;
  color: #22d3ee;
  background: rgba(34, 211, 238, 0.12);
  padding: 2px 8px;
  border-radius: 999px;
  margin-bottom: 8px;
}

.panel h2 {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
}

.en {
  margin: 2px 0 0;
  font-size: 12px;
  opacity: 0.6;
  font-style: italic;
}

.coords {
  margin: 8px 0 0;
  font-size: 11px;
  opacity: 0.5;
  font-variant-numeric: tabular-nums;
}

.desc {
  margin: 10px 0 0;
  font-size: 13.5px;
  line-height: 1.7;
  color: #d4e8f6;
}

.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
</style>
