<!-- 弃用了 -->
<script lang="ts" setup>
// 贴近适应
let lines = ref(["xt", "xb", "yl", "yr"]);
let lineStatus = ref({
  xt: {
    status: false,
    value: {
      top: "",
    },
  },
  xb: {
    status: false,
    value: {
      top: "",
    },
  },
  yl: {
    status: false,
    value: {
      left: "",
    },
  },
  yr: {
    status: false,
    value: {
      left: "",
    },
  },
});
let lineCnt = new Map();
function clearLine() {
  for (let line in lineStatus.value) {
    lineStatus.value[line].status = false;
  }
}

// 展示线，弃用惹
function showLine() {
  clearLine();
  canvasContent.value.forEach((currentItem) => {
    if (currentItem.key == curSelect.value) {
      canvasContent.value.forEach((item) => {
        let cnt = 0;
        if (lineCnt.has(item.key)) cnt = lineCnt.get(item.key);
        else lineCnt.set(item.key, 0);
        if (cnt < 3) {
          if (currentItem != item) {
            const conditions = [
              {
                // yll就是只y方向的线，选中的元素左边与场上的元素的左边对齐了
                type: "yll",
                isNear: isNear(
                  parseFloat(item.style.left),
                  parseFloat(currentItem.style.left)
                ),
                value: parseFloat(item.style.left),
              },
              {
                // 选中的左边与场上的右边
                type: "ylr",
                isNear: isNear(
                  parseFloat(item.style.left) + parseFloat(item.style.width),
                  parseFloat(currentItem.style.left)
                ),
                value:
                  parseFloat(item.style.left) +
                  parseFloat(item.style.width) +
                  1,
              },
              {
                type: "yrl",
                isNear: isNear(
                  parseFloat(item.style.left),
                  parseFloat(currentItem.style.left) +
                    parseFloat(currentItem.style.width)
                ),
                value:
                  parseFloat(item.style.left) -
                  parseFloat(currentItem.style.width) -
                  1.5,
              },
              {
                type: "yrr",
                isNear: isNear(
                  parseFloat(item.style.left) + parseFloat(item.style.width),
                  parseFloat(currentItem.style.left) +
                    parseFloat(currentItem.style.width)
                ),
                value:
                  parseFloat(item.style.left) +
                  parseFloat(item.style.width) -
                  parseFloat(currentItem.style.width),
              },
              {
                type: "xtt",
                isNear: isNear(
                  parseFloat(item.style.top),
                  parseFloat(currentItem.style.top)
                ),
                value: parseFloat(item.style.top),
              },
              {
                type: "xtb",
                isNear: isNear(
                  parseFloat(item.style.top) + parseFloat(item.style.height),
                  parseFloat(currentItem.style.top)
                ),
                value:
                  parseFloat(item.style.top) +
                  parseFloat(item.style.height) +
                  1.5,
              },
              {
                type: "xbt",
                isNear: isNear(
                  parseFloat(item.style.top),
                  parseFloat(currentItem.style.top) +
                    parseFloat(currentItem.style.height)
                ),
                value:
                  parseFloat(item.style.top) -
                  parseFloat(currentItem.style.height) -
                  1,
              },
              {
                type: "xbb",
                isNear: isNear(
                  parseFloat(item.style.top) + parseFloat(item.style.height),
                  parseFloat(currentItem.style.top) +
                    parseFloat(currentItem.style.height)
                ),
                value:
                  parseFloat(item.style.top) +
                  parseFloat(item.style.height) -
                  parseFloat(currentItem.style.height),
              },
            ];
            conditions.forEach((condition) => {
              if (condition.isNear) {
                lineCnt.set(item.key, lineCnt.get(item.key) + 1);
                const type = condition.type;
                if (/(xt|xb)/.test(type)) {
                  currentItem.style.top = condition.value + "px";
                  if (/xt/.test(type)) {
                    lineStatus.value.xt = {
                      status: true,
                      value: {
                        top: condition.value + "px",
                      },
                    };
                  }
                  if (/xb/.test(type)) {
                    lineStatus.value.xb = {
                      status: true,
                      value: {
                        top:
                          condition.value +
                          parseFloat(currentItem.style.height) +
                          1 +
                          "px",
                      },
                    };
                  }
                }
                if (/(yl|yr)/.test(type)) {
                  currentItem.style.left = condition.value + "px";
                  if (/yl/.test(type)) {
                    lineStatus.value.yl = {
                      status: true,
                      value: {
                        left: condition.value + "px",
                      },
                    };
                  }
                  if (/yr/.test(type)) {
                    lineStatus.value.yr = {
                      status: true,
                      value: {
                        left:
                          condition.value +
                          parseFloat(currentItem.style.width) +
                          1.5 +
                          "px",
                      },
                    };
                  }
                }
              }
            });
          }
        } else
          setTimeout(() => {
            lineCnt.set(item.key, 0);
          }, 100);
      });
    }
  });
}
function isNear(value1: number, value2: number) {
  return Math.abs(value1 - value2) < 8;
}
</script>
<template>
  <div class="mark-line">
    <div
      v-for="line in lines"
      v-show="lineStatus[line].status"
      :key="line"
      :ref="line"
      class="line"
      :class="line.includes('x') ? 'xline' : 'yline'"
      :style="lineStatus[line].value"
    ></div>
  </div>
</template>
<style lang="less" scoped>
.mark-line {
  position: relative;
  height: 100%;
}
.line {
  background: #59c7f9;
  position: absolute;
  z-index: 1000;
}

.xline {
  width: 100%;
  height: 1px;
}

.yline {
  width: 0.5px;
  height: 100%;
}
.arrow {
  position: absolute;
  z-index: 4;
}
</style>
