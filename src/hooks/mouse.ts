import { ref } from 'vue'
import { useEventListener } from './event'

export function useMouse(target: HTMLElement | Window | string, callback?: (x: number, y:number) => void) {
  const x = ref(0)
  const y = ref(0)
  useEventListener(target, 'mousemove', (event:Event) => {
    const { pageX, pageY } = event as MouseEvent;
    x.value = pageX
    y.value = pageY
    callback && callback(pageX, pageY)
  })
  return { x, y }
}
