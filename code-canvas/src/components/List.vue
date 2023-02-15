<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
const router = useRouter();
const list = ref([
  { name: '代码1', content: 'int a = 123;' },
  { name: '代码2', content: 'int a = 123;' },
  { name: '代码3', content: 'int a = 123;' },
]);

defineProps({
  msg: String,
});

const count = ref(0);
</script>

<template>
  <div class="container">
    <el-card class="item" v-for="item in list" :key="item">
      <template #header>
        <div class="card-header">
          <span> {{ item.name }}</span>
          <el-button @click="router.push({ path: '/edit', query: { name: item.name } })" class="button" text>进入代码演示界面</el-button>
        </div>
      </template>
      <div class="code">{{ item.content }}</div>
    </el-card>
    <el-button @click="router.push({ path: '/edit', query: { canEditable: true } })" size="large" type="primary">添加新代码</el-button>
  </div>
</template>

<style scoped lang="less">
.container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: auto;
  .item {
    margin: 10px;
  }
  .code {
    display: -webkit-box;
    white-space: pre-wrap;
    font-size: 12px;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }
}
</style>
