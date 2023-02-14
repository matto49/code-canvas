<script setup>
import { ref, shallowRef, defineProps, defineEmits, computed, onMounted } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState, EditorSelection } from '@codemirror/state';
const code = ref(`int main({
  
})`);
const emit = defineEmits(['focus']);
const extensions = [cpp()];
// Codemirror EditorView instance ref
const view = shallowRef();
const handleReady = (payload) => {
  view.value = payload.view;
};

// Status is available at all times via Codemirror EditorView
const getCodemirrorStates = () => {
  const state = view.value.state;
  const ranges = state.selection.ranges;
  const selected = ranges.reduce((r, range) => r + range.to - range.from, 0);
  const cursor = ranges[0].anchor;
  const length = state.doc.length;
  const lines = state.doc.lines;
  // more state info ...
  // return ...
};
function change(e) {
  emit('focus', getLine(e.state.selection.main.from, e.state.doc.text));
}
function getLine(cnt, text) {
  let temp = cnt + 1;
  let res = 0;
  while (temp > 0) {
    temp -= text[res].length + 1;
    res++;
  }
  return res;
}
const input = ref(null);
onMounted(() => {
  input.value.addEventListener('change', () => {
    const reader = new FileReader();
    reader.readAsText(input.value.files[0]);
    reader.onload = () => {
      code.value = reader.result;
    };
  });
});
</script>
<template>
  <div>
    <div class="topblank"></div>
    <div class="top-container">
      <div class="input">
        <label for="input">选择文件</label>
        <input id="input" type="file" ref="input" />
      </div>
      <el-button plain type="primary">保存</el-button>
    </div>
    <div class="code-container">
      <div class="leftblank"></div>
      <codemirror
        :disabled="true"
        v-model="code"
        class="code-content"
        placeholder="Code goes here..."
        :style="{
          height: '80vh',
          width: '27vw',
          marginLeft: '3vw',
          border: '1px solid rgba(0,0,0,0.4)',
        }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="2"
        :extensions="extensions"
        @update="change"
      />
    </div>
  </div>
</template>
<style lang="less">
.top-container {
  margin-top: 5vh;
  display: flex;
  justify-content: space-around;
  .input {
    line-height: 3vh;
    margin-bottom: 2vh;
    label {
      margin-left: 5vw;
      background: linear-gradient(to bottom, #eee, #ccc);
      padding: 5px;
    }
    #input {
      display: none;
    }
  }
}
.code-container {
  display: flex;
}
.code-content {
  background-color: #fff;
}
</style>
