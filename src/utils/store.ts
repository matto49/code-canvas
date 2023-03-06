import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { findObj } from '@/utils/tool';
import { Scope } from '@/interface/canvas.ts';

export const useStore = defineStore('canvas', () => {
  const isEditable = ref(false);
  const typeName = ref('');
  const dragType = ref('');

  const canvasContent = ref<Scope[]>([]);
  const curSelect = ref('');

  function addScope(content: Scope) {
    canvasContent.value.push(content);
  }

  function editContent(value: Scope[]) {
    canvasContent.value = value;
  }

  // 仅修改style中的部分内容
  function editScopePostion(key: string, style: object) {
    const obj = findObj(key, canvasContent);
    if (obj)
      obj.value.style = {
        ...obj.value.style,
        ...style,
      };
  }

  function addVarByKey(key: string, value: object) {
    const obj = findObj(key, canvasContent);
    obj?.value.children.push(value);
  }

  function editContentByKey(key: string, prop: string, value: any) {
    const obj = findObj(key, canvasContent);
    if (obj) {
      obj.value[prop] = value;
    }
  }

  function deleteContentByKey(key: string) {
    const obj = findObj(key, canvasContent);
    obj?.preArr.splice(obj.index, 1);
    // curSelect.value = '';
    // templateDot = [];
  }

  return { isEditable, typeName, canvasContent, dragType, editContent, addScope, editContentByKey, editScopePostion, deleteContentByKey, addVarByKey, curSelect };
});
