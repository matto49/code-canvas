
// 获取元素的绝对位置坐标（像对于页面左上角）
export function getElPagePos(element: HTMLElement) {
  //计算x坐标
  let actualLeft = element.offsetLeft + element.clientLeft;
  let actualTop = element.offsetTop + element.clientTop;
  let current = element.offsetParent as HTMLElement;
  while (current !== null) {
    actualLeft += current.offsetLeft + current.clientLeft;
    actualTop += current.offsetTop + current.clientTop;
    current = current.offsetParent as HTMLElement;
  }
  //返回结果
  return { x: actualLeft, y: actualTop };
};

export function getCurveSvg(style: any): string {
  let { height, width, left, top } = style;
  height = parseFloat(height);
  width = parseFloat(width);
  left = parseFloat(left);
  top = parseFloat(top);
  return `M ${left - 3} ${top - 3} M ${left} ${top} q ${width * 0.7} ${height * 0.3} ${width} ${height}`;
}

export function getDeleteSvg(style: any): string {
  let { height, width, left, top } = style;
  height = parseFloat(height);
  width = parseFloat(width);
  left = parseFloat(left);
  top = parseFloat(top);
  return `M ${left + 7} ${top - 3} l 6 6 M ${left + 7} ${top + 3} l 6 -6`;
}

export function switchVw(raw: string): number {
  if (raw.includes('vw')) return (innerWidth * parseFloat(raw)) / 100;
  else if (raw.includes('vh')) return (innerHeight * parseFloat(raw)) / 100;
  else return 0;
}
