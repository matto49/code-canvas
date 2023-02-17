import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/list' },
  { path: '/login', component: () => import('../components/login.vue') },
  { path: '/edit', component: () => import('../components/Edit.vue') },
  { path: '/list', component: () => import('../components/List.vue') },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
  const role = localStorage.getItem('role');
  console.log(role)
  if (to.path == '/' && role) {
    next('/list');
  } else if (to.path != '/login') {
    if (!role) {
      next('/login');
    } else {
      next();
    }
  } else {
    next()
  }
});
export default router;
