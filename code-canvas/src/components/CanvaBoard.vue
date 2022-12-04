<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import BaseBoard from "./BaseBoard.vue";
import { ref, onMounted, watch, defineEmits, defineProps } from "vue";
import { diff } from "../utils/tool";
import { debounce, cloneDeep } from "xijs";
const emit = defineEmits(["next", "change"]);
interface IBaseShapeProp {
  key: string;
  style: any;
  typeName: string;
}
const typeName = ref("");
const boardDom = ref<any>(null);
const cardOffset = ref({
  x: 0,
  y: 0,
});
const mouseAbsPos = ref({
  x: 0,
  y: 0,
});
const curSelect = ref("");
let templateDot: any[] = [];

const canvasBox = ref<IBaseShapeProp[]>([]);
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
const handleShapeClick = (name: string) => {
  if (typeName.value == name) typeName.value = "";
  else typeName.value = name;
};

const handleMouseChange = (x: number, y: number) => {
  mouseAbsPos.value = { x, y };
  // 如果有选中的元素, 则判断为移动当前选中元素
  if (curSelect.value && templateDot.length) {
    const [x0, y0] = templateDot;
    // canvasBox.value = canvasBox.value.map((v) => {
    //   if (v.key === curSelect.value) {
    //     const { left, top } = v.style;
    //     templateDot = [x, y];
    //     return {
    //       ...v,
    //       style: {
    //         ...v.style,
    //         left: parseFloat(left) + (x - x0) + "px",
    //         top: parseFloat(top) + (y - y0) + "px",
    //       },
    //     };
    //   }
    //   return v;
    // });
    return;
  }
  // 否则则生成元素
  const [a1, b1, key] = templateDot;
  if (typeName.value && templateDot.length) {
    let dx = x - a1;
    let dy = y - b1;
    let curIndex = canvasBox.value.findIndex((v) => v.key === key);
    if (curIndex > -1) {
      canvasBox.value[curIndex] = {
        ...canvasBox.value[curIndex],
        style: {
          left: (dx > 0 ? a1 : x) + "px",
          top: (dy > 0 ? b1 : y) + "px",
          width: Math.abs(dx) + "px",
          height: Math.abs(dy) + "px",
        },
      };
    }
  }
};

const handleMouseDown = () => {
  const { x, y } = mouseAbsPos.value;
  templateDot = [x, y];
  if (!curSelect.value && typeName.value.length) {
    templateDot[2] = Date.now() + "";
    canvasBox.value.push({
      key: templateDot[2],
      typeName: typeName.value,
      style: {}
    });
  }
};

const handleMouseUp = () => {
  const { x, y } = mouseAbsPos.value;
  // if (typeName.value) {
  //   canvasBox.value = canvasBox.value.filter((v) => {
  //     return parseInt(v.style.height) > 40 && parseInt(v.style.width) > 50;
  //   });
  //   templateDot = [];
  //   return;
  // }
  // 重置
  templateDot = [];
};

const handleSelected = (key: string) => {
  console.log(key);
  if (!typeName.value.length) curSelect.value = key;
};
const handleClearSelect = (e: any) => {
  if (e.target && e.target.getAttribute("data-key") !== curSelect.value) {
    curSelect.value = "";
  }
};
const handleDel = (key: string) => {
  canvasBox.value = canvasBox.value.filter((v) => v.key !== key);
  curSelect.value = "";
  templateDot = [];
};

const handleClear = () => {
  canvasBox.value = [];
  emit("change", canvasBox.value);
};

const undo = () => {
  // 撤销
  const { snapshots, maxLimit, curIndex } = recordManager.value[props.line - 1];
  if (curIndex === 0) return;
  recordManager.value[props.line - 1].curIndex--;
  canvasBox.value = cloneDeep(
    recordManager.value[props.line - 1].snapshots[
      recordManager.value[props.line - 1].curIndex
    ]
  );
  emit("change", canvasBox.value);
};

const redo = () => {
  // 重做
  const { snapshots, maxLimit, curIndex } = recordManager.value[props.line - 1];
  if (curIndex >= snapshots.length - 1) {
    return;
  }
  recordManager.value[props.line - 1].curIndex++;
  canvasBox.value =
    recordManager.value[props.line - 1].snapshots[
      recordManager.value[props.line - 1].curIndex
    ];
  emit("change", canvasBox.value);
};

const layerVisible = ref(false);

const toggleLayer = (e: any) => {
  if (e.target.className.indexOf("toolItem") < 0) return;
  layerVisible.value = !layerVisible.value;
};

const handleDelItem = (key: string) => {
  canvasBox.value = canvasBox.value.filter((v) => v.key !== key);
};

const pushRecordFn = (state: IBaseShapeProp[], prevState: IBaseShapeProp[]) => {
  const { snapshots, maxLimit, curIndex } = recordManager.value[props.line - 1];
  // 如果两个状态相同, 则不推入历史记录
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

  recordManager.value[props.line - 1].snapshots.push(cloneDeep(state));
  recordManager.value[props.line - 1].curIndex =
    recordManager.value[props.line - 1].snapshots.length - 1;
  emit("change", canvasBox.value);
};
function next() {
  emit("next");
}
watch(canvasBox, debounce(pushRecordFn, 300), { deep: true });
const props = defineProps(["canvasRect", "line"]);
watch(
  () => props.canvasRect,
  () => {
    canvasBox.value = [...props.canvasRect];
  },
  {
    immediate: true,
  }
);
watch(
  () => props.line,
  () => {
    if (!recordManager.value[props.line - 1])
      recordManager.value[props.line - 1] = {
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
onMounted(() => {
  const board = boardDom?.value?.boardDom;
  const { offsetTop, offsetLeft } = board;
  cardOffset.value.x = offsetLeft;
  cardOffset.value.y = offsetTop;
  board.addEventListener("mousedown", handleMouseDown, false);
  board.addEventListener("mouseup", handleMouseUp, false);
});
</script>

<template>
  <div class="canvaWrap" @click="handleClearSelect">
    <BaseBoard msg="几何画板" ref="boardDom" :onMouseChange="handleMouseChange">
      <div class="static">栈区</div>
      <div class="heap">堆区</div>
      <div class="show">展示区</div>
      <div class="shapeWrap">
        <div
          v-for="item in canvasBox"
          :key="item.key"
          :class="['shape', 'rect', curSelect === item.key ? 'active' : '']"
          :style="{
            left: item.style.left,
            top: item.style.top,
            width: item.style.width,
            height: item.style.height,
          }"
          :data-key="item.key"
          @mousedown="handleSelected(item.key)"
        >
          <span
            v-if="curSelect === item.key"
            @click="handleDel(item.key)"
            class="delete"
            >x</span
          >
          <span class="type">{{ item.typeName }}</span>
        </div>
      </div>
    </BaseBoard>
    <!-- <div class="miniMap">
      <img :src="miniImg" alt="" v-show="miniImg" />
    </div> -->
    <div class="toolbar">
      <div
        :class="['toolItem', typeName === item ? 'active' : '']"
        @click="handleShapeClick(item)"
        v-for="item in rectTypes"
        :key="item"
      >
        <!-- <svg width="20" height="16" :style="{marginTop:'6px'}">
          <rect
            x="0"
            y="0"
            width="20"
            height="16"
            style="fill: transparent; stroke: black; stroke-width: 2"
          />
        </svg> -->
        <span>{{ item }}</span>
      </div>
      <!-- <div
        class="toolItem"
        :class="['toolItem', curShape === 'circle' ? 'active' : '']"
        @click="handleShapeClick('circle')"
      >
        <svg width="22" height="22">
          <circle
            cx="11"
            cy="11"
            r="10"
            stroke="#fff"
            stroke-width="1"
            fill="transparent"
          />
        </svg>
      </div>
      <div
        class="toolItem"
        :class="['toolItem', curShape === 'line' ? 'active' : '']"
        @click="handleShapeClick('line')"
      >
        <svg width="22" height="22">
          <line
            x1="2"
            y1="2"
            x2="20"
            y2="20"
            style="stroke: rgb(255, 255, 255); stroke-width: 1"
          />
        </svg>
      </div> -->
      <!-- <div class="toolItem" :class="['toolItem']" @click="toggleLayer">
        <span class="toolItem-text">图层</span>
        <div v-show="layerVisible" class="layerWrap">
          <h3>图层管理</h3>
          <div v-for="item in canvasBox.rect" :key="item.key" class="layerItem">
            <span @click.stop="handleSelected(item.key)">{{ item.key }}</span>
            <span @click="handleDelItem(item.key)"> 删除 </span>
          </div>
        </div>
      </div> -->
      <div class="toolItem" :class="['toolItem']" @click="undo">
        <span>撤销</span>
      </div>
      <div class="toolItem" :class="['toolItem']" @click="redo">
        <span>重做</span>
      </div>
      <div class="toolItem" :class="['toolItem']" @click="handleClear">
        <span>清空</span>
      </div>
      <!-- <div class="toolItem" :class="['toolItem']">
        <span>下载</span>
      </div> -->
    </div>
    <div class="next" @click="next">next</div>
  </div>
</template>

<style scoped lang="less">
.canvaWrap {
  position: relative;
  user-select: none;
  text-align: center;
  //   color: @primary;
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
    .toolItem {
      height: 28px;
      width: 50px;
      margin: 4px 6px 6px;
      border-radius: 4px;
      text-align: center;
      font-size: 12px;
      color: black;
      cursor: pointer;
      border: 1px solid rgba(0, 0, 0, 0.5);
      span {
        line-height: 28px;
      }
      &.active {
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
      }
      svg {
        vertical-align: middle;
      }
    }
  }
  .static {
    position: absolute;
    line-height: 80vh;
    width: 23vw;
    border: 1px solid rgba(0, 0, 0, 0.5);
  }
  .heap {
    position: absolute;
    line-height: 33vh;
    left: 25vw;
    width: 33vw;
    border: 1px solid rgba(0, 0, 0, 0.5);
  }
  .show {
    position: absolute;
    line-height: 45vh;
    left: 25vw;
    top: 35vh;
    width: 33vw;
    border: 1px solid rgba(0, 0, 0, 0.5);
  }
  .shapeWrap {
    height: 80vh;
    .shape {
      // position: relative;
      border: 1px solid #646cff;
      background-color: transparent;
      z-index: 10;
      overflow: hidden;
      min-height: 50px;
      outline: 1px dashed;
      position: relative;
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
  }

  .miniMap {
    position: absolute;
    bottom: 16px;
    right: 30px;
    width: 200px;
    height: 120px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    background: #fff;
    img {
      width: 100%;
    }
  }

  .layerWrap {
    position: absolute;
    left: 60px;
    padding-top: 10px;
    padding-bottom: 10px;
    width: 160px;
    background: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    color: #888;
    .layerItem {
      &:hover {
        background-color: rgba(110, 38, 236, 0.1);
        color: white;
      }
      span:last-child {
        margin-left: 20px;
      }
    }
  }
  .next {
    position: absolute;
    top: -7vh;
    right: 5vw;
    line-height: 50px;
    width: 70px;
    text-align: center;
    border: 1px solid rgba(0, 0, 0, 0.5);
  }
}
</style>
