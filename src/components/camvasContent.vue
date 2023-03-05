<script lang="ts" setup>
import { ref } from 'vue';
import { userStore } from '@/store';
import { storeToRefs } from 'pinia';

const props = defineProps(['canvasBox']);

const store = userStore();
const { isEditable, typeName, dragType } = storeToRefs(store);

const curSelect = ref('');
const curDblclick = ref('');

const handleSelected = (key: string) => {
  if (!typeName.value.length) curSelect.value = key;
};

const handleDblclick = (key: string, e: MouseEvent) => {
  curDblclick.value = key;
  e.preventDefault;
};

// 根据key找子值
function findObj(key) {
  let stk: Array<any> = [props.canvasBox.value];
  while (stk.length) {
    const arr = stk.shift();
    if (!arr) return null;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].key == key) {
        return arr[i];
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

// 编辑变量双向绑定
function handleChangeItemName(key: string, prop, e: Event) {
  const obj = findObj(key);
  if (obj) {
    obj[prop] = e.target?.innerText;
    emit('change', canvasBox.value);
  }
}
</script>

<template>
  <div class="shapeWrap">
    <div v-for="item in canvasBox" :key="item.key">
      <div
        :class="['shape', 'rect', curSelect == item.key ? 'active' : '', { editable: isEditable }]"
        :style="{
          left: item.style.left,
          top: item.style.top,
          width: item.style.width,
          height: item.style.height,
          zIndex: item.typeName == 'var' ? 2 : 1,
        }"
        :data-key="item.key"
        @mousedown="handleSelected(item.key)"
      >
        <div
          class="content text"
          @dblclick="handleDblclick(item.key, $event)"
          @blur="handleChangeItemName(item.key, 'name', $event)"
          :contenteditable="isEditable"
          @mousedown.stop=""
          :data-key="item.key"
          :style="{ cursor: curDblclick == item.key ? 'text' : '' }"
        >
          {{ item.name }}
        </div>
        <img v-show="isEditable" src="../../public/delete.svg" v-if="curSelect === item.key" @click="handleDel(item.key)" class="delete" />
        <span
          v-show="isEditable"
          v-for="point in getPointList(item)"
          :key="point"
          :style="getPointStyle(point)"
          @mousedown="handleMouseDownPoint(point, $event)"
          @mouseup="handleMouseUpPoint(point, $event)"
          class="point"
        ></span>
        <table>
          <tr v-for="(child, idx) in item.children" :key="child.key">
            <td class="stackFrameVar">
              <div class="varKey">
                <el-button v-if="isEditable" @click="deleteVar(item.children, idx)" class="closeButton" :icon="Close" type="danger" circle></el-button>
                <span @blur="handleChangeItemName(child.key, 'varKey', $event)" class="text" @mousedown.stop="" :contenteditable="isEditable"> {{ child.varKey }}</span
                ><el-button class="changeButton" v-if="isEditable && typeof child.value == 'object'" @click="openDialog(child.key)" plain type="primary" @mousedown.stop="" size="small"
                  >重设数组</el-button
                >
              </div>
            </td>
            <td class="stackFrameValue">
              <div class="typeLabel text" @mousedown.stop="" @blur="handleChangeItemName(child.key, 'type', $event)" :contenteditable="isEditable">{{ child.type }}</div>
              <div v-if="typeof child.value == 'string'" class="cdataElt text">
                <span class="text" @blur="handleChangeItemName(child.key, 'value', $event)" @mousedown.stop="" :contenteditable="isEditable">{{ child.value }} </span
                ><el-button v-if="isEditable" @click="openDialog(child.key)" plain type="primary" @mousedown.stop="" size="small">设为数组</el-button>
              </div>
              <table v-else class="cArrayTbl">
                <tr v-for="(item, index) in child.value" :key="index">
                  <td class="td" v-for="(val, index) in item" :key="index">
                    <span class="cArrayHeader" v-if="val.isIndex">{{ val.value }}</span>
                    <div class="cArrayElt" v-else>
                      <div class="typeLabel text" @blur="handleChangeItemName(val.key, 'type', $event)" @mousedown.stop="" :contenteditable="isEditable">{{ val.type }}</div>
                      <div class="cdataElt text" @blur="handleChangeItemName(val.key, 'value', $event)" @mousedown.stop="" :contenteditable="true">{{ val.value }}</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <el-button v-if="isEditable" plain type="primary" @mousedown.stop="" @click.prevent="addVar(item.key)" class="addVar">添加变量</el-button>
      </div>
    </div>
    <svg class="svg" :style="{ zIndex: typeName == 'arrow' || !isEditable || typeName == 'arrowShow' ? 3 : 'auto' }">
      <defs>
        <marker id="dot" markerUnits="strokeWidth" markerWidth="6" markerHeight="6">
          <circle cx="3" cy="3" r="3" />
        </marker>
        <marker id="triangle" markerUnits="strokeWidth" markerWidth="10" markerHeight="8" refX="0" refY="4" orient="auto">
          <path d="M 0 0 L 10 4 L 0 8 z" fill="#005583" />
        </marker>
      </defs>
      <path
        class="arrow"
        v-for="item in svgArr"
        :key="item.key"
        :d="getCurveSvg(item.style)"
        fill="none"
        stroke="#005583"
        stroke-width="1"
        style="marker-end: url(#triangle); marker-start: url(#dot)"
      ></path>
      <circle
        v-for="item in svgArr"
        :key="item.key"
        :cx="parseFloat(item.style.left) + 10"
        :cy="parseFloat(item.style.top)"
        r="8  "
        fill="rgba(0,0,0,0)"
        v-show="typeName == 'arrowShow' && isEditable"
        @click="deleteArrow(item.key)"
      ></circle>
      <path
        v-show="typeName == 'arrowShow' && isEditable"
        v-for="item in svgArr"
        :key="item.key"
        :d="getDeleteSvg(item.style)"
        @click="deleteArrow(item.key)"
        fill="none"
        stroke="red"
        stroke-width="1"
      ></path>
    </svg>
    <div class="mark-line">
      <div v-for="line in lines" v-show="lineStatus[line].status" :key="line" :ref="line" class="line" :class="line.includes('x') ? 'xline' : 'yline'" :style="lineStatus[line].value"></div>
    </div>
  </div>
</template>
