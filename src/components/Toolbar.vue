<script setup lang="ts">
import { useStore } from "@/utils/store";

const store = useStore();

const props = defineProps(["canEditable"]);

const types = ["memorySpace"];

const handleShapeClick = (name: string) => {
  if (store.typeName == name) store.typeName = "";
  else store.typeName = name;
};
</script>

<template>
  <div>
    <el-button
      size="large"
      class="toolbar"
      @click="store.isEditable = true"
      v-if="props.canEditable && !store.isEditable"
      >进入编辑模式</el-button
    >
    <div v-if="store.isEditable" class="toolbar">
      <el-button
        v-for="item in types"
        :key="item"
        draggable="true"
        @dragstart="store.dragType = item"
      >
        <span>{{ item }}</span>
      </el-button>
      <el-button
        @click="handleShapeClick('arrowShow')"
        :class="store.typeName == 'arrowShow' ? 'active' : ''"
      >
        <span>显示/删除箭头</span>
      </el-button>
      <el-button
        @click="handleShapeClick('arrow')"
        :class="store.typeName == 'arrow' ? 'active' : ''"
      >
        <span>开始创建箭头</span>
      </el-button>
      <el-button @click="$emit('undo')">
        <span>撤销</span>
      </el-button>
      <el-button @click="$emit('redo')">
        <span>重做</span>
      </el-button>
      <el-button @click="$emit('handleClear')">
        <span>清空</span>
      </el-button>
      <el-button @click="store.isEditable = false">退出编辑模式</el-button>
    </div>
  </div>
</template>

<style lang="less">
.el-button {
  &:active {
    color: #606266;
    background-color: #ffffff;
    outline: 0;
    border-color: #dcdfe6;
  }
  &:focus {
    color: #606266;
    background-color: #ffffff;
    outline: 0;
    border-color: #dcdfe6;
  }
  &.active {
    color: #409eff;
    background-color: #ecf5ff;
  }
}
.toolbar {
  position: absolute;
  top: -7vh;
  left: 16px;
  height: 5vh;
  padding: 0 10px;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.5);
  border-radius: 3px;
  display: flex;
  align-items: center;
  &.active {
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
  }
  .rect {
    cursor: grab;
  }
  .array {
    cursor: pointer;
    input {
      border: none;
      height: 28px;
      width: 50px;
      font-size: 12px;
      text-align: center;
    }
  }
}
</style>
