<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from "./components/HelloWorld.vue";
import codeEdit from "./components/codeEdit.vue";
import canvasBoard from "./components/CanvaBoard.vue";
import { reactive, ref, unref, watch, toRaw } from "vue";
const canvasRect = reactive(new Array(100).fill([]));
const selection = reactive({});
let line = ref(1);
function next() {
  line.value += 1;
  click(line.value);
}
let canvas = ref(null);
function focus(lineCnt) {
  canvasRect[lineCnt - 1] = canvasRect[line.value - 1];
  line.value = lineCnt;
}
function changeCanvas(rectData) {
  const value = rectData.map((item) => toRaw(item));
  canvasRect[line.value - 1] = value;
}
function click(line) {
  const lineDom = document.querySelectorAll(".cm-line");
  for (let i = 0; i < lineDom.length; i++) {
    lineDom[i].classList.remove("cm-activeLine");
  }
  // cntDom[line].classList.add("cm-activeLineGutter");
  if (line <= lineDom.length) lineDom[line - 1].classList.add("cm-activeLine");
}
</script>
<script>
let id = 1;
export default {
  name: "simple",
  display: "Simple",
  order: 0,
  data() {
    return {
      list: [
        { name: "John", id: 0 },
        { name: "Joao", id: 1 },
        { name: "Jean", id: 2 },
      ],
    };
  },
};
</script><style scoped>
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
    <codeEdit class="code" @focus="focus"></codeEdit>
    <canvasBoard
      :canvasRect="toRaw(canvasRect[line - 1])"
      :line="toRaw(line)"
      @next="next"
      @change="changeCanvas"
      class="canvas"
      ref="canvas"
    ></canvasBoard>
  </div>
</template>

<style>
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
</style>
