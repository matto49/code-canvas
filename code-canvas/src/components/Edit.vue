<script setup>
import { useRoute } from 'vue-router';
import { getCanvas, addCanvas } from '../api';
import { ElMessage } from 'element-plus';
import codeEdit from './codeEdit.vue';
import canvasBoard from './CanvaBoard.vue';
import { getList } from '../api';
import { cloneDeep } from 'xijs';
import { reactive, ref, unref, watch, toRaw, onMounted } from 'vue';
import router from '../router';
const route = useRoute();
let canvasRect = reactive([
  {
    rect: [],
    lineCnt: 1,
  },
]);
// 是否可用编辑
const canEditable = ref(false);
const selection = reactive({});
// pre按钮是否可用
const isPreAble = ref(false);
// next按钮是否可用
const isNextAble = ref(false);
// 用于判断是否可以执行next
let maxStep = 0;
let curStep = ref(0);
function pre() {
  curStep.value--;
  // 仅当next到底了，才能进行下一步操作
  click(canvasRect[curStep.value].lineCnt);
  isNextAble.value = true;
  console.log(curStep.value, 'pre', maxStep);
  if (curStep.value == 0) isPreAble.value = false;
}
function next() {
  curStep.value++;
  maxStep = Math.max(curStep.value, maxStep);
  click(canvasRect[curStep.value].lineCnt);
  isPreAble.value = true;
  if (curStep.value == maxStep) isNextAble.value = false;
}
let preLine = 1;
let code = ref('');
function focus(lineCnt) {
  if (!canEditable.value) {
    click(canvasRect[curStep.value].lineCnt);
    return;
  }
  // focus事件大量触发，只有在lineCnt发生变化时才处理
  if (lineCnt == preLine || curStep.value != maxStep) {
    click(canvasRect[curStep.value].lineCnt);
    return;
  }
  curStep.value++;
  maxStep = Math.max(curStep.value, maxStep);
  isPreAble.value = true;
  isNextAble.value = false;
  preLine = lineCnt;
  canvasRect[curStep.value] = cloneDeep(canvasRect[curStep.value - 1]);
  canvasRect[curStep.value].lineCnt = lineCnt;
  // canvasRect[curStep.value].lineCnt = lineCnt;
  // console.log(canvasRect);
}
function changeCanvas(rectData) {
  const value = rectData.map((item) => toRaw(item));
  canvasRect[curStep.value].rect = value;
}
function click(line) {
  const lineDom = document.querySelectorAll('.cm-line');
  for (let i = 0; i < lineDom.length; i++) {
    lineDom[i].classList.remove('cm-activeLine');
  }
  if (line <= lineDom.length) lineDom[line - 1].classList.add('cm-activeLine');
}
async function save(code_body, name) {
  const layers = canvasRect.map((item) => {
    return {
      line_number: item.lineCnt,
      json_body: JSON.stringify(item.rect),
    };
  });
  try {
    const res = await addCanvas({ layers, code_body, name });
    ElMessage({
      message: '保存成功',
      type: 'success',
    });
    router.push('/list');
  } catch (err) {
    ElMessage({
      message: '保存失败',
      type: 'warning',
    });
  }
}
onMounted(async () => {
  const query = route.query;
  console.log(query)
  if (query.canEditable) canEditable.value = true;
  console.log(query);
  if (query.name) {
    const { data } = await getCanvas({ name: query.name });
    code.value = data.code_body;
    const { layers } = data;
    canvasRect = layers.map((item) => {
      return {
        lineCnt: item.line_number,
        rect: JSON.parse(item.json_body),
      };
    });
    maxStep = canvasRect.length - 1;
    isNextAble.value = true;
  }
});
</script>
<script>
let id = 1;
export default {
  name: 'simple',
  display: 'Simple',
  order: 0,
  data() {
    return {
      list: [
        { name: 'John', id: 0 },
        { name: 'Joao', id: 1 },
        { name: 'Jean', id: 2 },
      ],
    };
  },
};
</script>
<style scoped>
.buttons {
  margin-top: 35px;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.not-draggable {
  cursor: no-drop;
}
</style>
<template>
  <div class="container">
    <codeEdit class="code" @focus="focus" :code="code" :canEditable="canEditable" @save="save"></codeEdit>
    <canvasBoard
      :canvasRect="canvasRect[curStep].rect"
      :curStep="curStep"
      :isPreAble="isPreAble"
      :isNextAble="isNextAble"
      :canEditable="canEditable"
      @next="next"
      @pre="pre"
      @change="changeCanvas"
      class="canvas"
      ref="canvas"
    ></canvasBoard>
  </div>
</template>

<style lang="scss">
html {
  background-color: #f5f5f5;
}
.container {
  display: flex;
}
.code {
  width: 30vw;
}
.canvas {
  margin-left: 5vw;
  width: 60vw;
  margin-top: 10vh;
}
.ͼ2 .cm-activeLineGutter {
  background: none;
}
.el-button {
  &:focus {
    color: #409eff;
    background-color: #ecf5ff;
    outline: 0;
    border-color: #a0cfff;
  }
}
</style>
