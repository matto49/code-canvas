<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "@/utils/store";
import { storeToRefs } from "pinia";
import { IBaseShapeProp } from "@/interface";
import { getCurveSvg, getDeleteSvg, switchVw } from "@/utils/math";
import { findObj } from "@/utils/tool";
import { Close } from "@element-plus/icons-vue";
import BaseBoard from "./BaseBoard.vue";

const mouseAbsPos = ref({
  x: 0,
  y: 0,
});

// 获取baseBoard的DOM
const boardDom = ref<any>(null);
const cardOffset = ref({
  x: 0,
  y: 0,
});

let curPoint = "";

const store = useStore();
const { isEditable, typeName, dragType, canvasContent } = storeToRefs(store);

const curSelect = ref("");

// 拖拽落点生成作用域
const handelDragover = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
};
const handelDrop = (e: DragEvent) => {
  const { offsetX, offsetY } = e;
  const type = dragType.value;
  const width = switchVw("25vw") + 4;
  const height = switchVw("10vw") + 1;
  store.addScope({
    key: Date.now() + "",
    style: {
      left: offsetX - width / 2 + "px",
      top: offsetY - height / 2 + "px",
      width: width + "px",
      height: height + "px",
    },
    typeName: type,
    name: type,
    children: [],
  });
};

// 起始點
let templateDot: any[] = [];

// 记录画布中任一点的点击
const handleMouseDown = () => {
  if (!isEditable.value) return;
  const { x, y } = mouseAbsPos.value;
  if (typeName.value == "arrow") {
    const key = Date.now() + "";
    // 箭头与scope同级，都通过addScope来创建
    store.addScope({
      key,
      style: {
        left: x + "px",
        top: y + "px",
        width: 0,
        height: 0,
      },
      typeName: "arrow",
    });
    curSelect.value = key;
    curPoint = "i";
  }
  templateDot = [x, y];
};

const handleMouseUp = (e) => {
  templateDot = [];
  curPoint = "";
  if (e.target && e.target.getAttribute("data-key") !== curSelect.value) {
    curSelect.value = "";
  }
};

// 记录落点位置实现拖拽
function handleMouseDownPoint(point: string, event: Event) {
  const { x, y } = mouseAbsPos.value;
  templateDot = [x, y];
  event.stopPropagation();
  curPoint = point;
}

// 鼠标移动时发生的变化，用于实现拖拽
const handleMouseChange = (x: number, y: number) => {
  mouseAbsPos.value = { x, y };
  if (curSelect.value.length && templateDot.length) {
    const [x0, y0] = templateDot;
    templateDot = [x, y];
    const obj = findObj(curSelect.value, canvasContent).value;
    let { height, width, left, top } = obj.style;
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
      // 如果类型为arrow且curPoint为"i(initialize)"，则为箭头初次创建，也可以进行箭头的拉伸
      if (obj.typeName == "arrow" && curPoint == "i") {
        width = x0 - left;
        height = y0 - top;
      }
      store.editScopePostion(curSelect.value, {
        left: left + "px",
        top: top + "px",
        height: height + "px",
        width: width + "px",
      });
    }
    // 如果有选中的元素, 则判断为移动当前选中元素
    else {
      store.editScopePostion(curSelect.value, {
        left: left + (x - x0) + "px",
        top: top + (y - y0) + "px",
      });
    }
  }
};

// 选中开始拖拽
const handleSelected = (key: string) => {
  if (!typeName.value.length) curSelect.value = key;
};

const handleDel = (key: string) => {
  store.deleteContentByKey(key);
  curSelect.value = "";
  templateDot = [];
};

// 编辑变量双向绑定
function handleChangeItemName(key: string, prop, e: FocusEvent) {
  const elm = e.target as HTMLInputElement;
  store.editContentByKey(key, prop, elm.innerText);
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
  canvasContent.value.forEach((item) => {
    if (item.key == curSelect.value) {
      height = parseFloat(item.style.height) + 10;
      width = parseFloat(item.style.width) + 20;
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

// 添加/删除变量
function addVar(key: string) {
  store.addVarByKey(key, {
    varKey: "var",
    value: "?",
    type: "int",
    key: Date.now() + "",
  });
}
function deleteVar(key) {
  store.deleteContentByKey(key);
}

// 用于储存点击元素的key
let key = ref("");
function openDialog(keyVal) {
  arrDialogVisible.value = true;
  key.value = keyVal;
}

// 数组
const svgArr = computed(() => {
  return canvasContent.value.filter((item) => item.typeName == "arrow");
});

// 更改值为arr
function createArr() {
  // 找到对应的作用域
  const obj = findObj(key.value, canvasContent).value;
  // 10个一行 变量序列一行，变量值一行
  let length = Math.floor(arrDialogCnt.value / 10) * 2;
  let value = new Array(length).fill([0]).map(() => new Array(10).fill(0));
  // 最后一行不满10个
  const leftLength = arrDialogCnt.value % 10;
  value.push(new Array(leftLength).fill(0));
  value.push(new Array(leftLength).fill(0));
  for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < value[i].length; j++) {
      // 依次改为序列号和变量值
      if (i % 2 == 0) {
        value[i][j] = {
          isIndex: true,
          value: i * 5 + j,
          key: obj.key + i + j,
        };
      } else {
        value[i][j] = {
          isIndex: false,
          type: arrDialogType.value,
          value: arrDialogValue.value,
          key: obj.key + i + j,
        };
      }
    }
  }
  store.editContentByKey(key.value, "type", "array");
  store.editContentByKey(key.value, "value", value);
  arrDialogVisible.value = false;
}

// 数组初始化设置的dialog
let arrDialogVisible = ref(false);
let arrDialogType = ref("int");
let arrDialogCnt = ref(1);
let arrDialogValue = ref("?");

onMounted(() => {
  const board = boardDom?.value?.boardDom;
  const { offsetTop, offsetLeft } = board;
  cardOffset.value.x = offsetLeft;
  cardOffset.value.y = offsetTop;
});
</script>

<template>
  <BaseBoard
    msg="几何画板"
    ref="boardDom"
    :onMouseChange="handleMouseChange"
    @dragover="handelDragover"
    @drop="handelDrop"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
  >
    <div class="shapeWrap">
      <div v-for="item in canvasContent" :key="item.key">
        <div
          v-if="item.typeName == 'memorySpace'"
          :class="[
            'shape',
            'rect',
            curSelect == item.key ? 'active' : '',
            { editable: isEditable },
          ]"
          :style="{
            left: item.style.left,
            top: item.style.top,
            width: item.style.width,
            height: item.style.height,
            zIndex: item.typeName == 'var' ? 2 : 1,
          }"
          :data-key="item.key"
          @mousedown="handleSelected(item.key)"
        >
          <div
            class="content text"
            @blur="handleChangeItemName(item.key, 'name', $event)"
            :contenteditable="isEditable"
            @mousedown.stop=""
            :data-key="item.key"
          >
            {{ item.name }}
          </div>
          <img
            v-show="isEditable"
            src="../../public/delete.svg"
            v-if="curSelect === item.key"
            @click="handleDel(item.key)"
            class="delete"
          />
          <span
            v-show="isEditable"
            v-for="point in getPointList(item)"
            :key="point"
            :style="getPointStyle(point)"
            @mousedown="handleMouseDownPoint(point, $event)"
            class="point"
          ></span>
          <table>
            <tr v-for="child in item.children" :key="child.key">
              <td class="stackFrameVar">
                <div class="varKey">
                  <el-button
                    v-if="isEditable"
                    @click="deleteVar(child.key)"
                    class="closeButton"
                    :icon="Close"
                    type="danger"
                    circle
                  ></el-button>
                  <span
                    @blur="handleChangeItemName(child.key, 'varKey', $event)"
                    class="text"
                    @mousedown.stop=""
                    :contenteditable="isEditable"
                  >
                    {{ child.varKey }}</span
                  ><el-button
                    class="changeButton"
                    v-if="isEditable && typeof child.value == 'object'"
                    @click="openDialog(child.key)"
                    plain
                    type="primary"
                    @mousedown.stop=""
                    size="small"
                    >重设数组</el-button
                  >
                </div>
              </td>
              <td class="stackFrameValue">
                <div
                  class="typeLabel text"
                  @mousedown.stop=""
                  @blur="handleChangeItemName(child.key, 'type', $event)"
                  :contenteditable="isEditable"
                >
                  {{ child.type }}
                </div>
                <div
                  v-if="typeof child.value == 'string'"
                  class="cdataElt text"
                >
                  <span
                    class="text"
                    @blur="handleChangeItemName(child.key, 'value', $event)"
                    @mousedown.stop=""
                    :contenteditable="isEditable"
                    >{{ child.value }} </span
                  ><el-button
                    v-if="isEditable"
                    @click="openDialog(child.key)"
                    plain
                    type="primary"
                    @mousedown.stop=""
                    size="small"
                    >设为数组</el-button
                  >
                </div>
                <table v-else class="cArrayTbl">
                  <tr v-for="(item, index) in child.value" :key="index">
                    <td class="td" v-for="(val, index) in item" :key="index">
                      <span class="cArrayHeader" v-if="val.isIndex">{{
                        val.value
                      }}</span>
                      <div class="cArrayElt" v-else>
                        <div
                          class="typeLabel text"
                          @blur="handleChangeItemName(val.key, 'type', $event)"
                          @mousedown.stop=""
                          :contenteditable="isEditable"
                        >
                          {{ val.type }}
                        </div>
                        <div
                          class="cdataElt text"
                          @blur="handleChangeItemName(val.key, 'value', $event)"
                          @mousedown.stop=""
                          :contenteditable="true"
                        >
                          {{ val.value }}
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <el-button
            v-if="isEditable"
            plain
            type="primary"
            @mousedown.stop=""
            @click.prevent="addVar(item.key)"
            class="addVar"
            >添加变量</el-button
          >
        </div>
      </div>
      <svg
        class="svg"
        :style="{
          zIndex:
            typeName == 'arrow' || !isEditable || typeName == 'arrowShow'
              ? 3
              : 'auto',
        }"
      >
        <defs>
          <marker
            id="dot"
            markerUnits="strokeWidth"
            markerWidth="6"
            markerHeight="6"
          >
            <circle cx="3" cy="3" r="3" />
          </marker>
          <marker
            id="triangle"
            markerUnits="strokeWidth"
            markerWidth="10"
            markerHeight="8"
            refX="0"
            refY="4"
            orient="auto"
          >
            <path d="M 0 0 L 10 4 L 0 8 z" fill="#005583" />
          </marker>
        </defs>
        <path
          class="arrow"
          v-for="item in svgArr"
          :key="item.key"
          :d="getCurveSvg(item.style)"
          fill="none"
          stroke="#005583"
          stroke-width="1"
          style="marker-end: url(#triangle); marker-start: url(#dot)"
        ></path>
        <circle
          v-for="item in svgArr"
          :key="item.key"
          :cx="parseFloat(item.style.left) + 10"
          :cy="parseFloat(item.style.top)"
          r="8  "
          fill="rgba(0,0,0,0)"
          v-show="typeName == 'arrowShow' && isEditable"
          @click="deleteVar(item.key)"
        ></circle>
        <path
          v-show="typeName == 'arrowShow' && isEditable"
          v-for="item in svgArr"
          :key="item.key"
          :d="getDeleteSvg(item.style)"
          @click="deleteVar(item.key)"
          fill="none"
          stroke="red"
          stroke-width="1"
        ></path>
      </svg>
    </div>
    <el-dialog width="30%" v-model="arrDialogVisible">
      变量类型：<el-input v-model="arrDialogType"></el-input>
      变量个数：<el-input v-model="arrDialogCnt"></el-input>
      变量初始值：<el-input v-model="arrDialogValue"></el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="arrDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="createArr"> Confirm </el-button>
        </span>
      </template>
    </el-dialog>
  </BaseBoard>
</template>
<style lang="less">
.shapeWrap {
  height: 80vh;
  > div {
    height: 0;
    width: 0;
  }
  .svg {
    position: absolute;
    z-index: auto;
    left: 0;
    top: 0;
    width: 80vw;
    height: 80vh;
  }
  .shape {
    // position: relative;
    border: 1px solid rgba(0, 0, 0);
    background-color: transparent;
    z-index: 1;
    position: relative;
    background-color: #fff;
    user-select: none;
    padding-top: 10px;
    padding-left: 20px;
    &.editable {
      cursor: move;
    }
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
        // text-align: center;
      }
    }
    .varKey {
      position: relative;
      .closeButton {
        position: absolute;
        right: 0px;
        top: -10px;
        height: 12px;
        width: 12px;
      }
      .changeButton {
        position: absolute;
        right: -10px;
        top: 30px;
        width: 55px;
      }
    }
    tr {
      vertical-align: middle;
      display: table-row;
      .stackFrameVar {
        position: relative;
        text-align: right;
        padding-right: 8px;
        padding-top: 3px;
        padding-bottom: 3px;
      }
      .stackFrameValue {
        text-align: left;
        border-bottom: 1px solid #aaaaaa;
        border-left: 1px solid #aaaaaa;
        vertical-align: middle;
        padding-top: 3px;
        padding-left: 3px;
        padding-bottom: 3px;
        .typeLabel {
          font-size: 10pt;
          position: relative;
        }
        .cdataElt {
          font-size: 10pt;
          position: relative;
          .el-button {
            height: 16px;
            line-height: 14px;
            border: none;
          }
        }
        .cArrayTbl {
          background-color: #ffffc6;
          padding-left: 0px;
          padding-top: 0px;
          padding-bottom: 0px;
          font-size: 8pt;
          color: #777;
          text-align: left;
          border: 0px solid black;
          border-spacing: 0px;
          .td {
            text-align: center;
            padding: 0;
            .cMultidimArrayHeader {
              padding-left: 5px;
              padding-top: 0px;
              padding-bottom: 2px;
              font-size: 6pt;
              color: #777;
              border-bottom: 0px solid black;
            }
            .cArrayElt {
              border-bottom: 1px solid #888;
              border-left: 1px solid #888;
              border-top: 0px solid black;
              color: black;
              padding-top: 2px;
              padding-bottom: 4px;
              padding-left: 5px;
              padding-right: 4px;
              vertical-align: top;
              position: relative;
            }
          }
        }
      }
    }
    .addVar {
      margin: 20px 50px;
    }
  }
}
</style>
