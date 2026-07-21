// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ImageCropper from '../index'

const cropperMock = vi.hoisted(() => {
  const addStyles = vi.fn()
  const destroy = vi.fn()
  const centerImage = vi.fn()
  const zoom = vi.fn()
  const rotate = vi.fn()
  const scale = vi.fn()
  const getTransform = vi.fn(() => [1, 0, 0, 1, 0, 0])
  const change = vi.fn()
  const centerSelection = vi.fn()
  const toCanvas = vi.fn()

  const canvas = {
    $addStyles: addStyles,
    getBoundingClientRect: () => ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 600,
      bottom: 420,
      width: 600,
      height: 420,
      toJSON: () => ({}),
    }),
  }
  const image = {
    $ready: vi.fn(() => Promise.resolve(document.createElement('img'))),
    $center: centerImage,
    $zoom: zoom,
    $rotate: rotate,
    $scale: scale,
    $getTransform: getTransform,
  }
  const selection = {
    x: 0,
    y: 0,
    width: 300,
    height: 300,
    movable: false,
    resizable: false,
    zoomable: false,
    outlined: false,
    aspectRatio: 0,
    initialAspectRatio: 0,
    $change: change,
    $center: centerSelection,
    $toCanvas: toCanvas,
  }

  change.mockImplementation((x, y, width, height) => {
    Object.assign(selection, { x, y, width, height })
    return selection
  })
  centerSelection.mockReturnValue(selection)
  const Constructor = vi.fn(function CropperMock() {
    return {
      getCropperCanvas: () => canvas,
      getCropperImage: () => image,
      getCropperSelection: () => selection,
      destroy,
    }
  })

  return {
    Constructor,
    addStyles,
    destroy,
    centerImage,
    zoom,
    rotate,
    scale,
    getTransform,
    change,
    centerSelection,
    toCanvas,
  }
})

vi.mock('cropperjs', () => ({ default: cropperMock.Constructor }))

describe('ImageCropper', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    cropperMock.getTransform.mockReturnValue([1, 0, 0, 1, 0, 0])
    cropperMock.toCanvas.mockResolvedValue({
      toBlob: (callback: BlobCallback) => callback(new Blob(['cropped'], { type: 'image/png' })),
    })
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:crop-result'),
      revokeObjectURL: vi.fn(),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('initializes the cropper and emits the configured output', async () => {
    const updateBlob = vi.fn()
    const updateUrl = vi.fn()
    const wrapper = mount(ImageCropper, {
      props: {
        modelValue: '/avatar.png',
        width: 400,
        height: 300,
        aspectRatio: 4 / 3,
        'onUpdate:blob': updateBlob,
        'onUpdate:url': updateUrl,
      },
    })

    await flushPromises()
    vi.runAllTimers()
    await flushPromises()
    expect(cropperMock.Constructor).toHaveBeenCalledOnce()
    expect(cropperMock.centerImage).toHaveBeenCalledWith('cover')
    expect(cropperMock.change).toHaveBeenCalledWith(0, 0, 400, 300, 4 / 3)
    expect(cropperMock.toCanvas).toHaveBeenCalledWith({ width: 400, height: 300 })
    expect(updateBlob).toHaveBeenCalledWith(expect.any(Blob))
    expect(updateUrl).toHaveBeenCalledWith('blob:crop-result')
  })

  it('emits selected files through v-model', async () => {
    const updateModelValue = vi.fn()
    const wrapper = mount(ImageCropper, { props: { 'onUpdate:modelValue': updateModelValue } })
    const file = new File(['image'], 'avatar.png', { type: 'image/png' })
    const input = wrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', { configurable: true, value: [file] })

    await input.trigger('change')

    expect(updateModelValue).toHaveBeenCalledWith(file)
  })

  it('keeps the cropped area at its source resolution by default', async () => {
    cropperMock.getTransform.mockReturnValue([0.5, 0, 0, 0.5, 0, 0])
    mount(ImageCropper, {
      props: { modelValue: '/large-image.png', width: 400, height: 300 },
    })

    await flushPromises()
    vi.runAllTimers()
    await flushPromises()

    expect(cropperMock.toCanvas).toHaveBeenLastCalledWith({ width: 800, height: 600 })
  })

  it('supports fixed-size output when preserving resolution is disabled', async () => {
    cropperMock.getTransform.mockReturnValue([0.5, 0, 0, 0.5, 0, 0])
    mount(ImageCropper, {
      props: {
        modelValue: '/large-image.png',
        width: 400,
        height: 300,
        preserveResolution: false,
      },
    })

    await flushPromises()
    vi.runAllTimers()
    await flushPromises()

    expect(cropperMock.toCanvas).toHaveBeenLastCalledWith({ width: 400, height: 300 })
  })

  it('renders a quick preview before the debounced high-resolution result', async () => {
    cropperMock.getTransform.mockReturnValue([0.5, 0, 0, 0.5, 0, 0])
    const wrapper = mount(ImageCropper, {
      props: { modelValue: '/large-image.png', width: 400, height: 300 },
    })

    await flushPromises()
    vi.runAllTimers()
    await flushPromises()
    cropperMock.toCanvas.mockClear()

    await wrapper.get('button[aria-label="放大"]').trigger('click')
    vi.advanceTimersByTime(0)
    await flushPromises()
    expect(cropperMock.toCanvas).toHaveBeenLastCalledWith({ width: 400, height: 300 })

    vi.advanceTimersByTime(119)
    await flushPromises()
    expect(cropperMock.toCanvas).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1)
    await flushPromises()
    expect(cropperMock.toCanvas).toHaveBeenLastCalledWith({ width: 800, height: 600 })
  })

  it('provides image transform controls and releases object URLs', async () => {
    const file = new File(['image'], 'avatar.png', { type: 'image/png' })
    const wrapper = mount(ImageCropper, { props: { modelValue: file } })

    await flushPromises()
    await wrapper.get('button[aria-label="放大"]').trigger('click')
    await wrapper.get('button[aria-label="向右旋转"]').trigger('click')
    await wrapper.get('button[aria-label="水平翻转"]').trigger('click')

    expect(cropperMock.zoom).toHaveBeenCalledWith(0.1)
    expect(cropperMock.rotate).toHaveBeenCalledWith('90deg')
    expect(cropperMock.scale).toHaveBeenCalledWith(-1, 1)

    wrapper.unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:crop-result')
  })
})
