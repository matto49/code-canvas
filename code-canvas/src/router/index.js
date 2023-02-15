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
// router.beforeEach((to, from, next) => {
//   const role = localStorage.getItem('role');
//   if (to.path == '/' && role) {
//     console.log('???');
//     next({
//       path: '/list',
//     });
//   } else if (to.path != '/login') {
//     if (!role || role != 'ADMIN') {
//       console.log('???');
//       next({
//         path: '/login',
//       });
//     } else {
//       next();
//     }
//   }
// });
export default router;
