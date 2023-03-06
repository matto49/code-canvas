import { Scope } from '@/interface';
import { Ref } from 'vue';

export const diff = (a: any, b: any) => {
  let result = false;
  try {
    const aa = JSON.stringify(a);
    const bb = JSON.stringify(b);
    result = aa !== bb;
  } catch (err) {
    console.log(err);
  }
  return result;
};

// 根据key寻找canvasContent中对应的obj
// 后改为返回上一级数组和它自己，便于做删除操作
export function findObj(key: string, ref: Ref<Scope>) {
  let stk: Array<any> = [ref.value];
  while (stk.length) {
    const arr = stk.shift();
    if (!arr) return null;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].key == key) {
        return {
          preArr: arr,
          value: arr[i],
          index: i,
        };
      } else {
        if (arr[i].children) {
          stk.push(arr[i].children);
        } else if (arr[i].value instanceof Array) {
          // 值为数组的情况
          stk.push(...arr[i].value);
        }
      }
    }
  }
  return null;
}
