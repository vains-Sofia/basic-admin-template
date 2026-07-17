import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

export interface TableDimensionOptions {
  containerRef: Ref<HTMLElement | null>
  tableAreaRef: Ref<HTMLElement | null>
  paginationRef: Ref<HTMLElement | null>
  minHeight: () => number
  extraGap: () => number
}

function toPixels(value: string | undefined): number {
  const pixels = Number.parseFloat(value ?? '')
  return Number.isFinite(pixels) ? pixels : 0
}

export function useTableDimensions(options: TableDimensionOptions) {
  const width = ref(0)
  const adaptiveHeight = ref(options.minHeight())
  let observer: ResizeObserver | undefined

  function measure(): void {
    const tableArea = options.tableAreaRef.value
    if (!tableArea) return

    const rect = tableArea.getBoundingClientRect()
    const paginationHeight = options.paginationRef.value?.offsetHeight ?? 0
    const containerStyle = options.containerRef.value
      ? window.getComputedStyle(options.containerRef.value)
      : undefined
    const containerBottomInset =
      toPixels(containerStyle?.paddingBottom) + toPixels(containerStyle?.borderBottomWidth)
    const viewportBottomGap = toPixels(
      containerStyle?.getPropertyValue('--basic-table-viewport-bottom-gap'),
    )
    width.value = Math.max(1, Math.floor(tableArea.clientWidth || rect.width))
    adaptiveHeight.value = Math.max(
      options.minHeight(),
      Math.floor(
        window.innerHeight -
          rect.top -
          paginationHeight -
          containerBottomInset -
          viewportBottomGap -
          options.extraGap(),
      ),
    )
  }

  onMounted(async () => {
    await nextTick()
    measure()
    window.addEventListener('resize', measure)

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure)
      if (options.containerRef.value) observer.observe(options.containerRef.value)
      if (options.tableAreaRef.value) observer.observe(options.tableAreaRef.value)
      if (options.paginationRef.value) observer.observe(options.paginationRef.value)
    }
  })

  watch(
    [options.containerRef, options.tableAreaRef, options.paginationRef],
    async ([container, tableArea, pagination]) => {
      await nextTick()
      observer?.disconnect()
      if (container) observer?.observe(container)
      if (tableArea) observer?.observe(tableArea)
      if (pagination) observer?.observe(pagination)
      measure()
    },
    { flush: 'post' },
  )

  onBeforeUnmount(() => {
    window.removeEventListener('resize', measure)
    observer?.disconnect()
  })

  return { width, adaptiveHeight, measure }
}
