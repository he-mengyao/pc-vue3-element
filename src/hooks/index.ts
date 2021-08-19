import { ref, onMounted, Ref, onUnmounted } from 'vue'

export const useClickOutside = (dom: Ref<HTMLElement | null>) => {
  let isClickoutside = ref<boolean>(false)
  let handelClick = ((e: MouseEvent) => {
    if (dom.value) isClickoutside.value = dom.value.contains(e.target as HTMLElement) ? true : false
    else return
  })
  onMounted(() => {
    window.addEventListener('click', handelClick)
  })
  onUnmounted(() => {
    window.removeEventListener('click', handelClick)
  })
  return { isClickoutside }

}