<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import BaseBoard from "./BaseBoard.vue";
import { ref, onMounted, watch, defineEmits, defineProps } from "vue";
import { diff } from "../utils/tool";
import { debounce, cloneDeep } from "xijs";
const rectTypes = ["var", "static"];
const emit = defineEmits(["next", "change"]);
interface IBaseShapeProp {
  key: string;
  style: any;
  typeName: string;
  name: string;
  father: string;
}
const typeName = ref("");
const dragType = ref("");
const arrayCnt = ref("");
const defaultName = ref("");
const boardDom = ref<any>(null);
const curDblclick = ref("");
const cardOffset = ref({
  x: 0,
  y: 0,
});
const mouseAbsPos = ref({
  x: 0,
  y: 0,
});
function switchVw(raw: string): number {
  if (raw.includes("vw")) return (innerWidth * parseFloat(raw)) / 100;
  else if (raw.includes("vh")) return (innerHeight * parseFloat(raw)) / 100;
  else return 0;
}
const defaultSize = {
  var: {
    width: switchVw("5vw"),
    height: switchVw("5vw"),
  },
  static: {
    width: switchVw("25vw") + 4,
    height: switchVw("10vw") + 1,
  },
  array: {
    width: switchVw("25vw") + 4,
    height: switchVw("5vw"),
  },
};
const curSelect = ref("");
let curPoint = "";
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
// 弃用
const handleShapeClick = (name: string) => {
  if (typeName.value == name) typeName.value = "";
  else typeName.value = name;
};
const handleDragStart = (name: string) => {
  dragType.value = name;
};
const handelDragover = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
};
const handelDrop = (e: DragEvent) => {
  const { offsetX, offsetY } = e;
  const type = dragType.value;
  let { width, height } = defaultSize[type];
  if (dragType.value == "array") {
    const lineCnt = Math.ceil(parseInt(arrayCnt.value) / 5);
    height = height * (lineCnt + 1) + lineCnt;
    canvasBox.value.push({
      key: Date.now() + "",
      style: {
        left: offsetX - width / 2 + "px",
        top: offsetY - height / 2 + "px",
        width: width + "px",
        height: height + "px",
      },
      typeName: "static",
      name: "static",
      father: "",
    });
    const varSize = switchVw("5vw");
    for (let row = 0; row < lineCnt; row++) {
      for (let col = 0; col < 5; col++) {
        if (row * 5 + col > parseInt(arrayCnt.value)) break;
        canvasBox.value.push({
          key: Date.now() + row * 10 + col + 1 + "",
          style: {
            left: offsetX - width / 2 + varSize * col + col + "px",
            top: offsetY - height / 2 + varSize * row + row * 0.5 + "px",
            width: varSize + "px",
            height: varSize + "px",
          },
          typeName: "val",
          name: defaultName.value,
          father: "",
        });
      }
    }
  } else {
    canvasBox.value.push({
      key: Date.now() + "",
      style: {
        left: offsetX - width / 2 + "px",
        top: offsetY - height / 2 + "px",
        width: width + "px",
        height: height + "px",
      },
      typeName: type,
      name: type,
      father: "",
    });
  }
};
const handleMouseChange = (x: number, y: number) => {
  mouseAbsPos.value = { x, y };
  if (
    curSelect.value.length &&
    templateDot.length &&
    !curDblclick.value.length
  ) {
    const [x0, y0] = templateDot;
    canvasBox.value = canvasBox.value.map((v) => {
      templateDot = [x, y];
      if (v.key === curSelect.value) {
        let { height, width, left, top } = v.style;
        left = parseFloat(left);
        top = parseFloat(top);
        height = parseFloat(height);
        width = parseFloat(width);
        // 如果有选中的点，判断为拉伸元素
        if (curPoint.length) {
          const hasLeft = curPoint.includes("l");
          const hasRight = curPoint.includes("r");
          const hasTop = curPoint.includes("t");
          const hasBottom = curPoint.includes("b");
          if (hasLeft) {
            left += x - x0;
            width += x0 - x;
          }
          if (hasRight) width += x - x0;
          if (hasTop) {
            top += y - y0;
            height += y0 - y;
          }
          if (hasBottom) height += y - y0;
          return {
            ...v,
            style: {
              ...v.style,
              left: left + "px",
              top: top + "px",
              height: height + "px",
              width: width + "px",
            },
          };
        }
        // 如果有选中的元素, 则判断为移动当前选中元素
        else {
          return {
            ...v,
            style: {
              ...v.style,
              left: left + (x - x0) + "px",
              top: top + (y - y0) + "px",
            },
          };
        }
      }
      return v;
    });
    showLine();
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
  curPoint = "";
};

const handleMouseUp = () => {
  templateDot = [];
};

const handleSelected = (key: string) => {
  if (!typeName.value.length) curSelect.value = key;
};
const handleDblclick = (key: string, e: MouseEvent) => {
  curDblclick.value = key;
  e.preventDefault;
};
const handleClearSelect = (e: any) => {
  if (e.target && e.target.getAttribute("data-key") !== curSelect.value) {
    curSelect.value = "";
    curDblclick.value = "";
  }
  clearLine();
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

// 拉伸
const pointList = ["lt", "t", "r", "rb", "b", "lb", "l"];
const cursor = {
  // 每个点对应的初始角度
  lt: "nw-resize",
  t: "n-resize",
  rt: "ne-resize",
  r: "e-resize",
  rb: "se-resize",
  b: "s-resize",
  lb: "sw-resize",
  l: "w-resize",
};
function getPointList(item: IBaseShapeProp) {
  if (curSelect.value && item.key == curSelect.value) return pointList;
  else return [];
}
function getPointStyle(item: string) {
  const hasLeft = item.includes("l");
  const hasRight = item.includes("r");
  const hasTop = item.includes("t");
  const hasBottom = item.includes("b");
  let left = 0;
  let top = 0;
  let height = 0;
  let width = 0;
  canvasBox.value.forEach((item) => {
    if (item.key == curSelect.value) {
      height = parseFloat(item.style.height);
      width = parseFloat(item.style.width);
    }
  });
  if (item.length == 2) {
    if (hasRight) left = width;
    if (hasBottom) top = height;
  } else {
    if (hasLeft || hasRight) {
      top = height / 2;
      if (hasRight) left = width;
    }
    if (hasTop || hasBottom) {
      left = width / 2;
      if (hasBottom) top = height;
    }
  }
  return {
    left: left - 4 + "px",
    top: top - 4 + "px",
    cursor: cursor[item],
  };
}
function handleMouseDownPoint(point: string, event: Event) {
  const { x, y } = mouseAbsPos.value;
  templateDot = [x, y];
  event.stopPropagation();
  curPoint = point;
}
function handleMouseUpPoint(point: string, event: Event) {
  event.stopPropagation();
  curPoint = "";
}
// 贴近适应
let lines = ref(["xt", "xb", "yl", "yr"]);
let lineStatus = ref({
  xt: {
    status: false,
    value: {
      top: "",
    },
  },
  xb: {
    status: false,
    value: {
      top: "",
    },
  },
  yl: {
    status: false,
    value: {
      left: "",
    },
  },
  yr: {
    status: false,
    value: {
      left: "",
    },
  },
});
let lineCnt = new Map();
function clearLine() {
  for (let line in lineStatus.value) {
    lineStatus.value[line].status = false;
  }
}
function showLine() {
  clearLine();
  canvasBox.value.forEach((currentItem) => {
    if (currentItem.key == curSelect.value) {
      canvasBox.value.forEach((item) => {
        let cnt = 0;
        if (lineCnt.has(item.key)) cnt = lineCnt.get(item.key);
        else lineCnt.set(item.key, 0);
        if (cnt < 3) {
          if (currentItem != item) {
            const conditions = [
              {
                // yll就是只y方向的线，选中的元素左边与场上的元素的左边对齐了
                type: "yll",
                isNear: isNear(
                  parseFloat(item.style.left),
                  parseFloat(currentItem.style.left)
                ),
                value: parseFloat(item.style.left),
              },
              {
                // 选中的左边与场上的右边
                type: "ylr",
                isNear: isNear(
                  parseFloat(item.style.left) + parseFloat(item.style.width),
                  parseFloat(currentItem.style.left)
                ),
                value:
                  parseFloat(item.style.left) +
                  parseFloat(item.style.width) +
                  1,
              },
              {
                type: "yrl",
                isNear: isNear(
                  parseFloat(item.style.left),
                  parseFloat(currentItem.style.left) +
                    parseFloat(currentItem.style.width)
                ),
                value:
                  parseFloat(item.style.left) -
                  parseFloat(currentItem.style.width) -
                  1.5,
              },
              {
                type: "yrr",
                isNear: isNear(
                  parseFloat(item.style.left) + parseFloat(item.style.width),
                  parseFloat(currentItem.style.left) +
                    parseFloat(currentItem.style.width)
                ),
                value:
                  parseFloat(item.style.left) +
                  parseFloat(item.style.width) -
                  parseFloat(currentItem.style.width),
              },
              {
                type: "xtt",
                isNear: isNear(
                  parseFloat(item.style.top),
                  parseFloat(currentItem.style.top)
                ),
                value: parseFloat(item.style.top),
              },
              {
                type: "xtb",
                isNear: isNear(
                  parseFloat(item.style.top) + parseFloat(item.style.height),
                  parseFloat(currentItem.style.top)
                ),
                value:
                  parseFloat(item.style.top) +
                  parseFloat(item.style.height) +
                  1.5,
              },
              {
                type: "xbt",
                isNear: isNear(
                  parseFloat(item.style.top),
                  parseFloat(currentItem.style.top) +
                    parseFloat(currentItem.style.height)
                ),
                value:
                  parseFloat(item.style.top) -
                  parseFloat(currentItem.style.height) -
                  1,
              },
              {
                type: "xbb",
                isNear: isNear(
                  parseFloat(item.style.top) + parseFloat(item.style.height),
                  parseFloat(currentItem.style.top) +
                    parseFloat(currentItem.style.height)
                ),
                value:
                  parseFloat(item.style.top) +
                  parseFloat(item.style.height) -
                  parseFloat(currentItem.style.height),
              },
            ];
            conditions.forEach((condition) => {
              if (condition.isNear) {
                lineCnt.set(item.key, lineCnt.get(item.key) + 1);
                const type = condition.type;
                if (/(xt|xb)/.test(type)) {
                  currentItem.style.top = condition.value + "px";
                  if (/xt/.test(type)) {
                    lineStatus.value.xt = {
                      status: true,
                      value: {
                        top: condition.value + "px",
                      },
                    };
                  }
                  if (/xb/.test(type)) {
                    lineStatus.value.xb = {
                      status: true,
                      value: {
                        top:
                          condition.value +
                          parseFloat(currentItem.style.height) +
                          1 +
                          "px",
                      },
                    };
                  }
                }
                if (/(yl|yr)/.test(type)) {
                  currentItem.style.left = condition.value + "px";
                  if (/yl/.test(type)) {
                    lineStatus.value.yl = {
                      status: true,
                      value: {
                        left: condition.value + "px",
                      },
                    };
                  }
                  if (/yr/.test(type)) {
                    lineStatus.value.yr = {
                      status: true,
                      value: {
                        left:
                          condition.value +
                          parseFloat(currentItem.style.width) +
                          1.5 +
                          "px",
                      },
                    };
                  }
                }
              }
            });
          }
        } else
          setTimeout(() => {
            lineCnt.set(item.key, 0);
          }, 100);
      });
    }
  });
}
function isNear(value1: number, value2: number) {
  return Math.abs(value1 - value2) < 8;
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
          handleMouseUp,
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
    <BaseBoard
      msg="几何画板"
      ref="boardDom"
      :onMouseChange="handleMouseChange"
      @dragover="handelDragover"
      @drop="handelDrop"
    >
      <div class="static-area">栈区</div>
      <div class="heap">堆区</div>
      <div class="show">展示区</div>
      <div class="shapeWrap">
        <div
          v-for="item in canvasBox"
          :key="item.key"
          :class="['shape', 'rect', curSelect == item.key ? 'active' : '']"
          :style="{
            left: item.style.left,
            top: item.style.top,
            width: item.style.width,
            lineHeight: item.style.height,
            zIndex: item.typeName == 'var' ? 2 : 1,
          }"
          :data-key="item.key"
        >
          <img
            src="../../public//delete.svg"
            v-if="curSelect === item.key"
            @click="handleDel(item.key)"
            class="delete"
          />
          <span
            v-for="point in getPointList(item)"
            :key="point"
            :style="getPointStyle(point)"
            @mousedown="handleMouseDownPoint(point, $event)"
            @mouseup="handleMouseUpPoint(point, $event)"
            class="point"
          ></span>
          <div
            class="content"
            @dblclick="handleDblclick(item.key, $event)"
            :contenteditable="curDblclick == item.key ? 'true' : 'false'"
            :data-key="item.key"
            @mousedown="handleSelected(item.key)"
            :style="{ cursor: curDblclick == item.key ? 'text' : '' }"
          >
            {{ item.name }}
          </div>
        </div>
        <div class="mark-line">
          <div
            v-for="line in lines"
            v-show="lineStatus[line].status"
            :key="line"
            :ref="line"
            class="line"
            :class="line.includes('x') ? 'xline' : 'yline'"
            :style="lineStatus[line].value"
          ></div>
        </div>
      </div>
    </BaseBoard>
    <div class="toolbar">
      <div
        :class="['toolItem', 'rect']"
        v-for="item in rectTypes"
        :key="item"
        draggable="true"
        @dragstart="handleDragStart(item)"
      >
        <span>{{ item }}</span>
      </div>
      <div
        :class="[
          'toolItem',
          'rect',
          'array',
          typeName == 'array' ? 'active' : '',
        ]"
      >
        <span
          @click="handleShapeClick('array')"
          :draggable="typeName == 'array'"
          @dragstart="handleDragStart('array')"
          >array</span
        >
        <div v-if="typeName == 'array'">
          <input v-model="arrayCnt" placeholder="变量数" @click.stop="null" />
          <input
            v-model="defaultName"
            placeholder="默认值"
            @click.stop="null"
          />
        </div>
      </div>
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
  .static-area {
    background-color: rgba(250, 250, 250);
    position: absolute;
    line-height: 80vh;
    width: 28vw;
    border: 1px solid rgba(0, 0, 0, 0.5);
    // background-image: url("../../public/grid.svg");
  }
  .heap {
    background-color: rgba(250, 250, 250);
    position: absolute;
    line-height: 33vh;
    left: 31vw;
    width: 28vw;
    border: 1px solid rgba(0, 0, 0, 0.5);
    // background-image: url("../../public/grid.svg");
  }
  .show {
    background-color: rgba(250, 250, 250);
    position: absolute;
    line-height: 45vh;
    left: 31vw;
    top: 35vh;
    width: 28vw;
    border: 1px solid rgba(0, 0, 0, 0.5);
    // background-image: url("../../public/grid.svg");
  }
  .shapeWrap {
    height: 80vh;
    .shape {
      // position: relative;
      border: 1px solid rgba(0, 0, 0);
      background-color: transparent;
      z-index: 1;
      position: absolute;
      cursor: move;
      background-color: #fff;
      user-select: none;
      .type {
        user-select: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      .point {
        position: absolute;
        background: #fff;
        border: 1px solid #59c7f9;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        z-index: 2;
      }
      .content {
        width: 100%;
        height: 100%;
      }
      &.active {
        span {
          user-select: none;
          text-align: center;
          line-height: 18px;
        }
        .delete {
          color: red;
          position: absolute;
          right: -6px;
          top: -6px;
          border: 1px solid #59c7f9;
          border-radius: 50%;
          line-height: 12px;
          width: 12px;
          cursor: pointer;
          text-align: center;
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
  .mark-line {
    position: relative;
    height: 100%;
  }
  .line {
    background: #59c7f9;
    position: absolute;
    z-index: 1000;
  }

  .xline {
    width: 100%;
    height: 1px;
  }

  .yline {
    width: 0.5px;
    height: 100%;
  }
}
</style>
