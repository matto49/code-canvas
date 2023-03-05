<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, watch } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import type { UploadUserFile } from 'element-plus';
import { useRouter } from 'vue-router';
const router = useRouter();
const props = defineProps(['canEditable', 'code']);
const code = ref(`int main({
  
})`);
const emit = defineEmits(['focus', 'save']);
const extensions = [cpp(), javascript(), java()];
// Codemirror EditorView instance ref
const view = shallowRef();
function change(e) {
  let textArr: String[] = [];
  // 根据代码长度不同，e.state.doc有俩种数值
  if (e.state.doc.children) {
    e.state.doc.children.forEach((item: String[]) => textArr.push(...item));
  } else {
    textArr.push(...e.state.doc.text);
  }
  emit('focus', getLine(e.state.selection.main.from, textArr));
}
function getLine(cnt, text) {
  let temp = cnt + 1;
  let res = 0;
  while (temp > 0 && text) {
    // +1是因为temp的idx算入\n，但是text数组每一项中没有\n
    temp -= text[res].length + 1;
    res++;
  }
  return res;
}
const input = ref<UploadUserFile[]>([]);
watch(input, () => {
  const reader = new FileReader();
  if (input.value && input.value[0].raw) reader.readAsText(input.value[0].raw);
  reader.onload = () => {
    code.value = reader.result as string;
  };
});
watch(
  () => props.code,
  () => {
    code.value = props.code;
  }
);
const isEditable = ref(true);
const title = ref('hello,world!');
function handleTitle(e) {
  title.value = e.target.innerText;
}
</script>
<template>
  <div>
    <div class="topblank"></div>
    <div class="top-container">
      <el-upload action="#" v-if="props.canEditable" :auto-upload="false" v-model:file-list="input" :show-file-list="false" class="upload-demo" :limit="1">
        <el-button type="primary" plain>选择文件</el-button>
      </el-upload>
      <el-button @click="router.push('/list')" plain type="primary">返回</el-button>
      <el-button v-if="props.canEditable" @click="emit('save', code, title)" plain type="primary">保存</el-button>
    </div>
    <div class="title">
      <div class="text" :contenteditable="props.canEditable" @blur="handleTitle">hello world!</div>
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
  margin-top: 3vh;
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
.title {
  text-align: center;
  margin: 10px;
}
.code-container {
  display: flex;
}
.code-content {
  background-color: #fff;
}
.text {
  cursor: text;
  &:focus {
    outline: none;
  }
}
</style>
