<script setup lang="ts">
import { ref, onMounted, onUnmounted, toRef } from 'vue';
import { useMouse } from '../hooks/mouse';
import { getElPagePos } from '../utils/math';

const props = defineProps<{
  msg: string;
  onMouseChange: (x: number, y: number) => void;
}>();
const onMouseChange = toRef(props, 'onMouseChange');
const cardOffset = ref({ x: 0, y: 0 });
const boardDom = ref<any>(null);

const { x, y } = useMouse(window, (x, y) => {
  onMouseChange && onMouseChange.value(x - cardOffset.value.x, y - cardOffset.value.y);
});

onMounted(() => {
  const { x, y } = getElPagePos(boardDom.value);
  cardOffset.value.x = x;
  cardOffset.value.y = y;
});

defineExpose({ boardDom });
</script>

<template>
  <section>
    <div class="card" ref="boardDom">
      <slot></slot>
    </div>
  </section>
</template>

<style scoped>
section .card {
  position: relative;
  height: 100%;
  width: 100%;
  border-radius: 2px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  background-image: radial-gradient(rgba(9, 89, 194, 0.3) 6%, transparent 0);
  background-size: 10px 10px;
  background-position: 0 0, 2px 2px;
}
</style>
