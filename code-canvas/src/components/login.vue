<script setup>
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../api';
const name = ref('');
const pwd = ref('');
const router = useRouter();
async function loginAcc() {
  try {
    const res = await login({
      username: name.value,
      password: pwd.value,
    });
    ElMessage({
      message: '登录成功',
      type: 'success',
    });
    localStorage.setItem('role', 'admin');
    router.push({ path: '/list' });
  } catch (err) {
    ElMessage({
      message: '账户不匹配',
      type: 'error',
    });
  }
}
defineProps({
  msg: String,
});

const count = ref(0);
</script>

<template>
  <div class="container">
    <div class="login">
      <div>
        <el-input placeholder="请输入用户名" v-model="name" clearable class="input_style" size="large"></el-input>
      </div>
      <div>
        <el-input placeholder="请输入密码" v-model="pwd" show-password class="input_style" size="large"></el-input>
      </div>
      <div class="login-container">
        <el-button type="primary" @click="loginAcc" class="login_style">登录</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.container {
  margin: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  .login {
    margin: auto;
  }
}
.input_style {
  width: 400px;
  height: 70px;
  line-height: 70px;
  font-size: 30px;
  margin-bottom: 10px;
}
.login-container {
  display: flex;
  justify-content: center;
  margin: 20px;
}
.login_style {
  width: 200px;
  height: 50px;
  font-size: 30px;
}
</style>
