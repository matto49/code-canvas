<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import ToolBar from "./Toolbar.vue";
import CanvasContent from "./CanvasContent.vue";
import { ref, watch } from "vue";
import "element-plus/theme-chalk/index.css";
import { diff } from "../utils/tool";
import { debounce, cloneDeep } from "xijs";
import { storeToRefs } from "pinia";
import { useStore } from "@/utils/store";
import { IBaseShapeProp } from "@/interface/canvas.ts";

const store = useStore();
const { canvasContent } = storeToRefs(store);

const emit = defineEmits(["next", "pre"]);

const props = defineProps([
  "canvasRect",
  "curStep",
  "isNextAble",
  "isPreAble",
  "canEditable",
]);

const recordManager = ref<any>([
  {
    snapshots: [
      {
        rect: [],
        circle: [],
        line: [],
      },
    ],
    curIndex: 0,
    maxLimit: 50,
  },
]);

const handleClear = () => {
  store.editContent([]);
};

const undo = () => {
  // 撤销
  const { snapshots, maxLimit, curIndex } = recordManager.value[props.curStep];
  if (curIndex === 1) return;
  recordManager.value[props.curStep].curIndex--;
  store.editContent(
    cloneDeep(
      recordManager.value[props.curStep].snapshots[
        recordManager.value[props.curStep].curIndex
      ]
    )
  );
};

const redo = () => {
  // 重做
  const { snapshots, maxLimit, curIndex } = recordManager.value[props.curStep];
  if (curIndex >= snapshots.length - 1) {
    return;
  }
  recordManager.value[props.curStep].curIndex++;
  store.editContent(
    recordManager.value[props.curStep].snapshots[
      recordManager.value[props.curStep].curIndex
    ]
  );
};

const pushRecordFn = (state: IBaseShapeProp[], prevState: IBaseShapeProp[]) => {
  const { snapshots, maxLimit, curIndex } = recordManager.value[props.curStep];
  // 如果两个状态相同, 则不推入历史记
  if (!diff(state, snapshots[curIndex])) {
    return;
  }
  // 如果在撤销的过程中重新执行了新的操作, 则覆盖上一个状态
  if (snapshots.length - 1 !== curIndex) {
    snapshots.splice(curIndex + 1, snapshots.length);
  }
  // 超过了最大限制记录
  if (snapshots.length >= maxLimit) {
    snapshots.shift();
  }

  recordManager.value[props.curStep].snapshots.push(cloneDeep(state));
  recordManager.value[props.curStep].curIndex =
    recordManager.value[props.curStep].snapshots.length - 1;
};
function next() {
  if (props.isNextAble) emit("next");
}
function pre() {
  if (props.isPreAble) emit("pre");
}

watch(canvasContent, debounce(pushRecordFn, 300), { deep: true });

watch(
  () => props.canvasRect,
  () => {
    canvasContent.value = [...props.canvasRect];
  },
  {
    immediate: true,
  }
);

watch(
  () => props.curStep,
  () => {
    if (!recordManager.value[props.curStep])
      recordManager.value[props.curStep] = {
        snapshots: [
          {
            rect: [],
            circle: [],
            line: [],
          },
        ],
        curIndex: 0,
        maxLimit: 50,
      };
  }
);
</script>

<template>
  <div class="canvasWrap">
    <CanvasContent></CanvasContent>
    <ToolBar
      :canEditable="props.canEditable"
      @undo="undo"
      @redo="redo"
      @handleClear="handleClear"
    ></ToolBar>
    <el-button
      size="large"
      type="primary"
      plain
      :disabled="!isPreAble"
      class="pre"
      @click="pre"
      >pre</el-button
    >
    <el-button
      size="large"
      type="primary"
      plain
      :disabled="!isNextAble"
      class="next"
      @click="next"
      >next</el-button
    >
  </div>
</template>

<style scoped lang="less">

.canvasWrap {
  position: relative;
  user-select: none;
  .pre {
    position: absolute;
    top: -8vh;
    right: 15vw;
    line-height: 50px;
    width: 70px;
    text-align: center;
    border: 1px solid rgba(0, 0, 0, 0.5);
    &.able:hover {
      background-color: rgba(110, 38, 236, 0.1);
    }
    &:focus {
      color: #409eff;
      background-color: #ecf5ff;
      outline: 0;
      border-color: #a0cfff;
    }
  }
  .next {
    position: absolute;
    top: -8vh;
    right: 5vw;
    line-height: 50px;
    width: 70px;
    text-align: center;
    border: 1px solid rgba(0, 0, 0, 0.5);
    &.able:hover {
      background-color: rgba(110, 38, 236, 0.1);
    }
    &:focus {
      color: #409eff;
      background-color: #ecf5ff;
      outline: 0;
      border-color: #a0cfff;
    }
  }
}
</style>
