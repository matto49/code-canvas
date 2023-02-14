<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import BaseBoard from './BaseBoard.vue';
import { ref, onMounted, watch, defineEmits, defineProps, computed } from 'vue';
import { Close } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import 'element-plus/theme-chalk/index.css';
import { diff } from '../utils/tool';
import { debounce, cloneDeep } from 'xijs';
import { getCurveSvg, getDeleteSvg } from '../utils/math';
const rectTypes = ['memorySpace'];
const emit = defineEmits(['next', 'change', 'pre']);
// 编辑/展示 edit/show
const status = ref('edit');
interface Arr {
  isIndex: boolean;
  value: string;
  type?: string;
  key: string;
}
interface Var {
  varKey: string;
  value: string | Array<Array<Arr>>;
  type: string;
  key: string;
}
interface IBaseShapeProp {
  key: string;
  style: any;
  typeName: string;
  name?: string;
  children?: Var[];
}
const typeName = ref('');
const dragType = ref('');
const arrayCnt = ref('');
const defaultName = ref('');
const boardDom = ref<any>(null);
const curDblclick = ref('');
const cardOffset = ref({
  x: 0,
  y: 0,
});
const mouseAbsPos = ref({
  x: 0,
  y: 0,
});
const props = defineProps(['canvasRect', 'curStep', 'isNextAble', 'isPreAble']);
function switchVw(raw: string): number {
  if (raw.includes('vw')) return (innerWidth * parseFloat(raw)) / 100;
  else if (raw.includes('vh')) return (innerHeight * parseFloat(raw)) / 100;
  else return 0;
}
const defaultSize = {
  var: {
    width: switchVw('5vw'),
    height: switchVw('5vw'),
  },
  memorySpace: {
    width: switchVw('25vw') + 4,
    height: switchVw('10vw') + 1,
  },
  array: {
    width: switchVw('25vw') + 4,
    height: switchVw('5vw'),
  },
};
const curSelect = ref('');
let curPoint = '';
// 起始點
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
let arrowShow = ref(false);
//
const handleShapeClick = (name: string) => {
  if (typeName.value == name) typeName.value = '';
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
  if (dragType.value == 'array') {
    const lineCnt = Math.ceil(parseInt(arrayCnt.value) / 5);
    height = height * (lineCnt + 1) + lineCnt;
    const varSize = switchVw('5vw');
    for (let row = 0; row < lineCnt; row++) {
      for (let col = 0; col < 5; col++) {
        if (row * 5 + col > parseInt(arrayCnt.value)) break;
        canvasBox.value.push({
          key: Date.now() + row * 10 + col + 1 + '',
          style: {
            left: offsetX - width / 2 + varSize * col + col + 'px',
            top: offsetY - height / 2 + varSize * row + row * 0.5 + 'px',
            width: varSize + 'px',
            height: varSize + 'px',
          },
          typeName: 'val',
          name: defaultName.value,
        });
      }
    }
  } else {
    canvasBox.value.push({
      key: Date.now() + '',
      style: {
        left: offsetX - width / 2 + 'px',
        top: offsetY - height / 2 + 'px',
        width: width + 'px',
        height: height + 'px',
      },
      typeName: type,
      name: type,
    });
  }
};
const handleMouseChange = (x: number, y: number) => {
  mouseAbsPos.value = { x, y };
  if (curSelect.value.length && templateDot.length && !curDblclick.value.length) {
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
          const hasLeft = curPoint.includes('l');
          const hasRight = curPoint.includes('r');
          const hasTop = curPoint.includes('t');
          const hasBottom = curPoint.includes('b');
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
          if (v.typeName == 'arrow' && curPoint == 'i') {
            width = x0 - left;
            height = y0 - top;
            console.log(width, height);
          }
          return {
            ...v,
            style: {
              ...v.style,
              left: left + 'px',
              top: top + 'px',
              height: height + 'px',
              width: width + 'px',
            },
          };
        }
        // 如果有选中的元素, 则判断为移动当前选中元素
        else {
          return {
            ...v,
            style: {
              ...v.style,
              left: left + (x - x0) + 'px',
              top: top + (y - y0) + 'px',
            },
          };
        }
      }
      return v;
    });
    // showLine();
  }
};

const handleMouseDown = () => {
  if (!isEditable.value) return;
  const { x, y } = mouseAbsPos.value;
  if (typeName.value == 'arrow') {
    const key = Date.now() + '';
    canvasBox.value.push({
      key,
      style: {
        left: x + 'px',
        top: y + 'px',
        width: 0,
        height: 0,
      },
      typeName: 'arrow',
    });
    curSelect.value = key;
    curPoint = 'i';
  }
  templateDot = [x, y];
};

const handleMouseUp = () => {
  templateDot = [];
  curPoint = '';
};

const handleSelected = (key: string) => {
  if (!typeName.value.length) curSelect.value = key;
};
const handleDblclick = (key: string, e: MouseEvent) => {
  curDblclick.value = key;
  e.preventDefault;
};
const handleClearSelect = (e: any) => {
  if (e.target && e.target.getAttribute('data-key') !== curSelect.value) {
    curSelect.value = '';
    curDblclick.value = '';
  }
  clearLine();
};
const handleDel = (key: string) => {
  canvasBox.value = canvasBox.value.filter((v) => v.key !== key);
  curSelect.value = '';
  templateDot = [];
};

const handleClear = () => {
  canvasBox.value = [];
  emit('change', canvasBox.value);
};

const undo = () => {
  // 撤销
  const { snapshots, maxLimit, curIndex } = recordManager.value[props.curStep];
  if (curIndex === 0) return;
  recordManager.value[props.curStep].curIndex--;
  canvasBox.value = cloneDeep(recordManager.value[props.curStep].snapshots[recordManager.value[props.curStep].curIndex]);
  emit('change', canvasBox.value);
};

const redo = () => {
  // 重做
  const { snapshots, maxLimit, curIndex } = recordManager.value[props.curStep];
  if (curIndex >= snapshots.length - 1) {
    return;
  }
  recordManager.value[props.curStep].curIndex++;
  canvasBox.value = recordManager.value[props.curStep].snapshots[recordManager.value[props.curStep].curIndex];
  emit('change', canvasBox.value);
};

const layerVisible = ref(false);

const toggleLayer = (e: any) => {
  if (e.target.className.indexOf('toolItem') < 0) return;
  layerVisible.value = !layerVisible.value;
};

const handleDelItem = (key: string) => {
  canvasBox.value = canvasBox.value.filter((v) => v.key !== key);
};

const pushRecordFn = (state: IBaseShapeProp[], prevState: IBaseShapeProp[]) => {
  console.log('push', state);
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
  recordManager.value[props.curStep].curIndex = recordManager.value[props.curStep].snapshots.length - 1;
  emit('change', canvasBox.value);
};
function next() {
  if (props.isNextAble) emit('next');
}
function pre() {
  if (props.isPreAble) emit('pre');
}
// 拉伸
const pointList = ['lt', 't', 'r', 'rb', 'b', 'lb', 'l'];
const cursor = {
  // 每个点对应的初始角度
  lt: 'nw-resize',
  t: 'n-resize',
  rt: 'ne-resize',
  r: 'e-resize',
  rb: 'se-resize',
  b: 's-resize',
  lb: 'sw-resize',
  l: 'w-resize',
};
function getPointList(item: IBaseShapeProp) {
  if (curSelect.value && item.key == curSelect.value) return pointList;
  else return [];
}
function getPointStyle(item: string) {
  const hasLeft = item.includes('l');
  const hasRight = item.includes('r');
  const hasTop = item.includes('t');
  const hasBottom = item.includes('b');
  let left = 0;
  let top = 0;
  let height = 0;
  let width = 0;
  canvasBox.value.forEach((item) => {
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
    left: left - 4 + 'px',
    top: top - 4 + 'px',
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
  curPoint = '';
}
// 贴近适应
let lines = ref(['xt', 'xb', 'yl', 'yr']);
let lineStatus = ref({
  xt: {
    status: false,
    value: {
      top: '',
    },
  },
  xb: {
    status: false,
    value: {
      top: '',
    },
  },
  yl: {
    status: false,
    value: {
      left: '',
    },
  },
  yr: {
    status: false,
    value: {
      left: '',
    },
  },
});
let lineCnt = new Map();
function clearLine() {
  for (let line in lineStatus.value) {
    lineStatus.value[line].status = false;
  }
}
// 展示线，弃用惹
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
                type: 'yll',
                isNear: isNear(parseFloat(item.style.left), parseFloat(currentItem.style.left)),
                value: parseFloat(item.style.left),
              },
              {
                // 选中的左边与场上的右边
                type: 'ylr',
                isNear: isNear(parseFloat(item.style.left) + parseFloat(item.style.width), parseFloat(currentItem.style.left)),
                value: parseFloat(item.style.left) + parseFloat(item.style.width) + 1,
              },
              {
                type: 'yrl',
                isNear: isNear(parseFloat(item.style.left), parseFloat(currentItem.style.left) + parseFloat(currentItem.style.width)),
                value: parseFloat(item.style.left) - parseFloat(currentItem.style.width) - 1.5,
              },
              {
                type: 'yrr',
                isNear: isNear(parseFloat(item.style.left) + parseFloat(item.style.width), parseFloat(currentItem.style.left) + parseFloat(currentItem.style.width)),
                value: parseFloat(item.style.left) + parseFloat(item.style.width) - parseFloat(currentItem.style.width),
              },
              {
                type: 'xtt',
                isNear: isNear(parseFloat(item.style.top), parseFloat(currentItem.style.top)),
                value: parseFloat(item.style.top),
              },
              {
                type: 'xtb',
                isNear: isNear(parseFloat(item.style.top) + parseFloat(item.style.height), parseFloat(currentItem.style.top)),
                value: parseFloat(item.style.top) + parseFloat(item.style.height) + 1.5,
              },
              {
                type: 'xbt',
                isNear: isNear(parseFloat(item.style.top), parseFloat(currentItem.style.top) + parseFloat(currentItem.style.height)),
                value: parseFloat(item.style.top) - parseFloat(currentItem.style.height) - 1,
              },
              {
                type: 'xbb',
                isNear: isNear(parseFloat(item.style.top) + parseFloat(item.style.height), parseFloat(currentItem.style.top) + parseFloat(currentItem.style.height)),
                value: parseFloat(item.style.top) + parseFloat(item.style.height) - parseFloat(currentItem.style.height),
              },
            ];
            conditions.forEach((condition) => {
              if (condition.isNear) {
                lineCnt.set(item.key, lineCnt.get(item.key) + 1);
                const type = condition.type;
                if (/(xt|xb)/.test(type)) {
                  currentItem.style.top = condition.value + 'px';
                  if (/xt/.test(type)) {
                    lineStatus.value.xt = {
                      status: true,
                      value: {
                        top: condition.value + 'px',
                      },
                    };
                  }
                  if (/xb/.test(type)) {
                    lineStatus.value.xb = {
                      status: true,
                      value: {
                        top: condition.value + parseFloat(currentItem.style.height) + 1 + 'px',
                      },
                    };
                  }
                }
                if (/(yl|yr)/.test(type)) {
                  currentItem.style.left = condition.value + 'px';
                  if (/yl/.test(type)) {
                    lineStatus.value.yl = {
                      status: true,
                      value: {
                        left: condition.value + 'px',
                      },
                    };
                  }
                  if (/yr/.test(type)) {
                    lineStatus.value.yr = {
                      status: true,
                      value: {
                        left: condition.value + parseFloat(currentItem.style.width) + 1.5 + 'px',
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
// 进入编辑模式
let isEditable = ref(false);
// 编辑变量双向绑定
function handleChangeItemName(key: string, prop, e: Event) {
  const obj = findObj(key);
  if (obj) {
    obj[prop] = e.target?.innerText;
    emit('change', canvasBox.value);
  }
}
// 数组初始化设置的dialog
let arrDialogVisible = ref(false);
let arrDialogType = ref('int');
let arrDialogCnt = ref(1);
let arrDialogValue = ref('?');
// 用于储存点击元素的key
let key = ref('');
function openDialog(keyVal) {
  arrDialogVisible.value = true;
  key.value = keyVal;
}
function deleteArrow(key) {
  const idx = canvasBox.value.findIndex((item) => item.key == key);
  canvasBox.value.splice(idx, 1);
}
// 删除变量
function deleteVar(arr, idx) {
  arr.splice(idx, 1);
}
// 更改值为arr
function createArr() {
  const obj = findObj(key.value);
  if (!obj) return;
  obj.type = 'array';
  // 10个一行
  let length = Math.floor(arrDialogCnt.value / 10) * 2;
  let value = new Array(length).fill([0]).map(() => new Array(10).fill(0));
  const leftLength = arrDialogCnt.value % 10;
  value.push(new Array(leftLength).fill(0));
  value.push(new Array(leftLength).fill(0));
  for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < value[i].length; j++) {
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
  obj.value = value;
  arrDialogVisible.value = false;
}
// // 变更arr长度
// function changeLength(key) {
//   ElMessageBox.prompt('请输入数组长度', 'Tip', {
//     confirmButtonText: 'OK',
//     cancelButtonText: 'Cancel',
//   }).then(({ value }) => {
//     const arr = findObj(key).value;
//     const length = parseInt(value);
//     console.log(arr);
//     // while (arr.length * 10 > length + 1) arr.pop();
//     while (arr.length * 5 <= length) arr.push([],[]);
//     console.log(arr);
//     while (arr[arr.length - 1].length > length % 10) arr[arr.length - 1].pop();
//     while (arr[arr.length - 1].length < length % 10) arr[arr.length - 1].push('?');
//     console.log(arr);
//   });
// }
// 根据key找子值
function findObj(key) {
  let stk: Array<any> = [canvasBox.value];
  while (stk.length) {
    const arr = stk.shift();
    if (!arr) return null;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].key == key) {
        return arr[i];
      } else {
        if (arr[i].children) {
          stk.push(arr[i].children);
        }
      }
    }
  }
  return null;
}
// 添加变量
function addVar(key: string) {
  canvasBox.value.some((item) => {
    if (item.key == key) {
      if (!item.children)
        item.children = [
          {
            varKey: 'var',
            value: '?',
            type: 'int',
            key: Date.now() + '',
          },
        ];
      else
        item.children.push({
          varKey: 'var',
          value: '?',
          type: 'int',
          key: Date.now() + '',
        });
    }
  });
}
const svgArr = computed(() => {
  return canvasBox.value.filter((item) => item.typeName == 'arrow');
});
watch(canvasBox, debounce(pushRecordFn, 300), { deep: true });
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
  board.addEventListener('mousedown', handleMouseDown, false);
  board.addEventListener('mouseup', handleMouseUp, false);
});
</script>

<template>
  <div class="canvaWrap" @click="handleClearSelect">
    <BaseBoard msg="几何画板" ref="boardDom" :onMouseChange="handleMouseChange" @dragover="handelDragover" @drop="handelDrop">
      <!-- <div class="static-area">栈区</div>
      <div class="heap">堆区</div>
      <div class="show">展示区</div> -->
      <div class="shapeWrap">
        <div v-for="item in canvasBox" :key="item.key">
          <div
            v-if="item.typeName != 'arrow'"
            :class="['shape', 'rect', curSelect == item.key ? 'active' : '', { editable: isEditable }]"
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
              @dblclick="handleDblclick(item.key, $event)"
              @blur="handleChangeItemName(item.key, 'name', $event)"
              :contenteditable="isEditable"
              @mousedown.stop=""
              :data-key="item.key"
              :style="{ cursor: curDblclick == item.key ? 'text' : '' }"
            >
              {{ item.name }}
            </div>
            <img v-show="isEditable" src="../../public/delete.svg" v-if="curSelect === item.key" @click="handleDel(item.key)" class="delete" />
            <span
              v-show="isEditable"
              v-for="point in getPointList(item)"
              :key="point"
              :style="getPointStyle(point)"
              @mousedown="handleMouseDownPoint(point, $event)"
              @mouseup="handleMouseUpPoint(point, $event)"
              class="point"
            ></span>
            <table>
              <tr v-for="(child, idx) in item.children" :key="child.key">
                <td class="stackFrameVar">
                  <div class="varKey">
                    <el-button v-if="isEditable" @click="deleteVar(item.children, idx)" class="closeButton" :icon="Close" type="danger" circle></el-button>
                    <span @blur="handleChangeItemName(child.key, 'varKey', $event)" class="text" @mousedown.stop="" :contenteditable="isEditable"> {{ child.varKey }}</span
                    ><el-button class="changeButton" v-if="isEditable && typeof child.value == 'object'" @click="openDialog(child.key)" plain type="primary" @mousedown.stop="" size="small"
                      >重设数组</el-button
                    >
                  </div>
                </td>
                <td class="stackFrameValue">
                  <div class="typeLabel text" @mousedown.stop="" @blur="handleChangeItemName(child.key, 'type', $event)" :contenteditable="isEditable">{{ child.type }}</div>
                  <div v-if="typeof child.value == 'string'" class="cdataElt text">
                    <span class="text" @blur="handleChangeItemName(child.key, 'value', $event)" @mousedown.stop="" :contenteditable="isEditable">{{ child.value }} </span
                    ><el-button v-if="isEditable" @click="openDialog(child.key)" plain type="primary" @mousedown.stop="" size="small">设为数组</el-button>
                  </div>
                  <table v-else class="cArrayTbl">
                    <tr v-for="(item, index) in child.value" :key="index">
                      <td class="td" v-for="(val, index) in item" :key="index">
                        <span class="cArrayHeader" v-if="val.isIndex">{{ val.value }}</span>
                        <div class="cArrayElt" v-else>
                          <div class="typeLabel text" @blur="handleChangeItemName(val.key, 'type', $event)" @mousedown.stop="" :contenteditable="isEditable">{{ val.type }}</div>
                          <div class="cdataElt text" @blur="handleChangeItemName(val.key, 'value', $event)" @mousedown.stop="" :contenteditable="true">{{ val.value }}</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <el-button v-if="isEditable" plain type="primary" @mousedown.stop="" @click.prevent="addVar(item.key)" class="addVar">添加变量</el-button>
          </div>
        </div>
        <svg class="svg" :style="{ zIndex: typeName == 'arrow' || !isEditable || arrowShow ? 3 : 'auto' }">
          <defs>
            <marker id="dot" markerUnits="strokeWidth" markerWidth="6" markerHeight="6">
              <circle cx="3" cy="3" r="3" />
            </marker>
            <marker id="triangle" markerUnits="strokeWidth" markerWidth="10" markerHeight="8" refX="0" refY="4" orient="auto">
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
          <path v-show="arrowShow && isEditable" v-for="item in svgArr" :key="item.key" :d="getDeleteSvg(item.style)" @click="deleteArrow(item.key)" fill="none" stroke="red" stroke-width="1"></path>
        </svg>
        <div class="mark-line">
          <div v-for="line in lines" v-show="lineStatus[line].status" :key="line" :ref="line" class="line" :class="line.includes('x') ? 'xline' : 'yline'" :style="lineStatus[line].value"></div>
        </div>
      </div>
    </BaseBoard>
    <el-button class="toolbar" @click="isEditable = true" v-if="!isEditable">进入编辑模式</el-button>
    <div v-if="isEditable" class="toolbar">
      <el-button v-for="item in rectTypes" :key="item" draggable="true" @dragstart="handleDragStart(item)">
        <span>{{ item }}</span>
      </el-button>
      <!-- <div :class="['toolItem', 'rect', 'array', typeName == 'array' ? 'active' : '']">
        <span @click="handleShapeClick('array')" :draggable="typeName == 'array'" @dragstart="handleDragStart('array')">array</span>
        <div v-if="typeName == 'array'">
          <input v-model="arrayCnt" placeholder="变量数" @click.stop="null" />
          <input v-model="defaultName" placeholder="默认值" @click.stop="null" />
        </div>
      </div> -->
      <el-button @click="arrowShow = !arrowShow" :class="arrowShow ? 'active' : ''">
        <span>箭头置于顶部</span>
      </el-button>
      <el-button @click="handleShapeClick('arrow')" :class="typeName == 'arrow' ? 'active' : ''">
        <span>开始创建箭头</span>
      </el-button>
      <el-button @click="undo">
        <span>撤销</span>
      </el-button>
      <el-button @click="redo">
        <span>重做</span>
      </el-button>
      <el-button @click="handleClear">
        <span>清空</span>
      </el-button>
      <el-button @click="isEditable = false">退出编辑模式</el-button>
      <!-- <div class="toolItem" :class="['toolItem']">
        <span>下载</span>
      </div> -->
    </div>
    <el-button size="large" type="primary" plain :disabled="!isPreAble" class="pre" @click="pre">pre</el-button>
    <el-button size="large" type="primary" plain :disabled="!isNextAble" class="next" @click="next">next</el-button>
    <el-dialog width="30%" v-model="arrDialogVisible">
      变量类型：<el-input v-model="arrDialogType"></el-input> 变量个数：<el-input v-model="arrDialogCnt"></el-input> 变量初始值：<el-input v-model="arrDialogValue"></el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="arrDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="createArr"> Confirm </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
.canvaWrap {
  position: relative;
  user-select: none;
  // text-align: center;
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
      .text {
        cursor: text;
        &:focus {
          outline: none;
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
  .arrow {
    position: absolute;
    z-index: 4;
  }
}
</style>
