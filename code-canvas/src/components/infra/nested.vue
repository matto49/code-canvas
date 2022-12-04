<template>
  <draggable
    class="dragArea"
    :list="list"
    tag="ul"
    :group="{ name: 'g1' }"
    item-key="name"
  >
    <template #item="{ element: item }">
      <li
        :key="item.key"
        :class="['shape', curSelect === item.key ? 'active' : '']"
        :style="{
          left: 0,
          top: 0,
          width: item.style.width,
          height: item.style.height,
          visibility: item.isInOthers ? 'hidden' : 'visible',
          position: item.isInOthers ? 'absolute' : 'relative',
        }"
        :data-key="item.key"
      >
        <span
          v-if="curSelect === item.key"
          @click="handleDel(item.key)"
          class="delete"
          >x</span
        >
        <span class="type">{{ item.typeName }}</span>
        <nestedDraggable :list="item.children" />
      </li>
    </template>
  </draggable>
</template>
<script setup>
import { inject, ref } from "vue";
import draggable from "vuedraggable";
import nestedDraggable from "./nested.vue";
const props = defineProps({ list: Array });
const curSelect = ref("");
const handleSelectedInject = inject("handleSelected");
const handleEnterInject = inject("handleEnter");
const handleOutInject = inject("handleOut");
const handleDelInject = inject("handleDel");
function handleSelected(key) {
  console.log("select", key);
  handleSelectedInject(key);
}
function handleEnter(item) {
  handleEnterInject(item);
}
function handleOut(item) {
  handleOutInject(item);
}
function handleDel(key) {
  handleDelInject(key);
}
</script>
<style scoped lang="less">
.dragArea {
  position: relative;
  z-index: 10;
  min-height: 50px;
  outline: 1px dashed;
}
.shape {
  // position: relative;
  border: 1px solid #646cff;
  background-color: transparent;
  z-index: 10;
  overflow: hidden;
  min-height: 50px;
  outline: 1px dashed;
  .type {
    user-select: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  &.active {
    cursor: move;
    span {
      user-select: none;
      text-align: center;
      line-height: 18px;
    }
    .delete {
      border-radius: 50%;
      background-color: rgba(255, 0, 0, 0.8);
      position: absolute;
      right: 0px;
      top: 0px;
      color: #fff;
      cursor: pointer;
      width: 20px;
      height: 20px;
    }
  }
}
</style>
