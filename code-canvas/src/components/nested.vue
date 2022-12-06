<template>
  <draggable
    class="dragArea"
    tag="ul"
    :list="tasks"
    :group="{ name: 'g1' }"
    item-key="name"
  >
    <template #item="{ element }">
      <li
        class="li"
        :style="{
          left: 0,
          top: 0,
          width: element.style.width,
          height: element.style.height,
          visibility: element.isInOthers ? 'hidden' : 'visible',
          position: element.isInOthers ? 'absolute' : 'relative',
        }"
      >
        {{ element.typeName }}
        <nested-draggable :tasks="element.children" />
      </li>
    </template>
  </draggable>
</template>
<script>
import draggable from "vuedraggable";

export default {
  props: {
    tasks: {
      required: true,
      type: Array,
    },
  },
  components: {
    draggable,
  },
  name: "nested-draggable",
};
</script>
<style scoped>
.dragArea {
  position: relative;
  z-index: 10;
  border: 1px solid #646cff;
}
.li {
  border: 1px solid #646cff;
}
</style>
