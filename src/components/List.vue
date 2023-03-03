<script setup>
import { useRouter } from 'vue-router';
import { getList } from '../api';
import { onMounted, ref } from 'vue';
const router = useRouter();
const list = ref([]);
const role = ref(localStorage.getItem('role'));
onMounted(async () => {
  const { frames } = (await getList()).data;
  list.value = frames;
});
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
      <div class="code">{{ item.code }}</div>
    </el-card>
    <el-button class="button" v-if="role == 'admin'" @click="router.push({ path: '/edit', query: { canEditable: true } })" size="large" type="primary">添加新代码</el-button>
  </div>
</template>

<style scoped lang="less">
.container {
  // height: 100vh;
  width: calc(100% - 100px);
  display: grid;
  padding: 50px;
  grid-template-columns: 1fr 1fr;
  .item {
    margin: 10px 50px;
  }
  .code {
    display: -webkit-box;
    white-space: pre-wrap;
    font-size: 12px;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 5;
    overflow: hidden;
  }
  .button {
    align-self: center;
    justify-self: center;
    width: 100px;
  }
}
</style>
