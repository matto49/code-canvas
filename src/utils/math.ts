const generateRectangleMeta = (startPos: [number, number], w: number, h: number) => {
    if (
      startPos &&
      Array.isArray(startPos) &&
      startPos.length >= 2 &&
      typeof w === "number" &&
      typeof h === "number"
    ) {
      const [a0, b0] = startPos;
      const a1 = a0 + w;
      const b1 = b0 + h;
      return {
        startPos,
        w,
        h,
        endPos: [a1, b1],
        pos: [
          [a0, b0],
          [a1, b0],
          [a1, b1],
          [a0, b1],
        ],
      };
    } else {
      throw new Error("Please pass in the correct parameters");
    }
  };
  
  const generateCircleMeta = (pos: [number, number], r: number = 1) => {
    if (pos && Array.isArray(pos) && pos.length) {
      const [x, y] = pos;
      return {
        startPos: [x - r, y - r],
        pos,
        r,
      };
    } else {
      throw new Error("Please pass in the correct parameters");
    }
  };
  
  const generateLineMeta = (pos: [[number, number], [number, number]]) => {
    if (pos && Array.isArray(pos) && pos.length >= 2) {
      const [A, B] = pos;
      const dx = B[0] - A[0];
      const dy = B[1] - A[1];
      const l = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      const tanAB = dy / dx;
      const AB = (Math.atan(tanAB) * 180) / Math.PI;
      return {
        startPos: A,
        endPos: B,
        angle: AB,
        l,
      };
    } else {
      throw new Error("Please pass in the correct parameters");
    }
  };
  


  // 获取元素的绝对位置坐标（像对于页面左上角）
const getElPagePos = (element: HTMLElement) => {
    //计算x坐标
    let actualLeft = element.offsetLeft;
    let actualTop = element.offsetTop;
    let current = element.offsetParent as HTMLElement;
    while (current !== null){
      actualLeft += current.offsetLeft;
      actualTop += (current.offsetTop + current.clientTop);
      current = current.offsetParent as HTMLElement;
    }
    //返回结果
    return {x: actualLeft, y: actualTop}
  }

  export function getCurveSvg(style:any):string {
    let {height,width,left,top} = style
    height = parseFloat(height)
    width = parseFloat(width)
    left = parseFloat(left)
    top = parseFloat(top)
    return `M ${left-3} ${top-3} M ${left} ${top} q ${width * 0.7} ${height * 0.3} ${width} ${height}`
  }
  export function getDeleteSvg(style:any):string {
    let {height,width,left,top} = style
    height = parseFloat(height)
    width = parseFloat(width)
    left = parseFloat(left)
    top = parseFloat(top)
    return `M ${left+7} ${top-3} l 6 6 M ${left+7} ${top+3} l 6 -6`
  }
  export {
    generateRectangleMeta,
    generateCircleMeta,
    generateLineMeta,
    getElPagePos
  }
