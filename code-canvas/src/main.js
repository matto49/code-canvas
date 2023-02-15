import { createApp } from 'vue'
import { basicSetup } from 'codemirror'
import VueCodemirror from 'vue-codemirror'
import App from './App.vue'
import ElementPlus from 'element-plus'
import router from './router'

const app = createApp(App).use(VueCodemirror, {
  // optional default global options
  autofocus: true,
  disabled: false,
  indentWithTab: true,
  tabSize: 2,
  placeholder: 'Code goes here...',
  extensions: [basicSetup]
  // ...
}).use(ElementPlus, { size: 'small', zIndex: 3000 }).use(router).mount('#app')
