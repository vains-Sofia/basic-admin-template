// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import QrCode from '../index'

const qrCodeMock = vi.hoisted(() => {
  const append = vi.fn()
  const update = vi.fn()
  const download = vi.fn(() => Promise.resolve())
  const Constructor = vi.fn(function QrCodeStylingMock() {
    return { append, update, download }
  })

  return { append, update, download, Constructor }
})

vi.mock('qr-code-styling', () => ({ default: qrCodeMock.Constructor }))

describe('QrCode', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates and reactively updates the styled QR code', async () => {
    const wrapper = mount(QrCode, {
      props: {
        data: 'https://example.com/initial',
        size: 240,
        imageSize: 0.25,
        dotsType: 'rounded',
      },
    })

    expect(qrCodeMock.Constructor).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 240,
        height: 240,
        data: 'https://example.com/initial',
        imageOptions: { imageSize: 0.25 },
        dotsOptions: { color: '#000000', type: 'rounded' },
      }),
    )
    expect(qrCodeMock.append).toHaveBeenCalledWith(expect.any(HTMLElement))

    await wrapper.setProps({ data: 'https://example.com/updated', imageSize: 0.3 })

    expect(qrCodeMock.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: 'https://example.com/updated',
        imageOptions: { imageSize: 0.3 },
      }),
    )
  })

  it('renders loading before expired state and handles refresh', async () => {
    const onRefresh = vi.fn()
    const wrapper = mount(QrCode, {
      props: {
        data: 'content',
        loading: true,
        expired: true,
        loadingText: '正在生成',
        onRefresh,
      },
    })

    expect(wrapper.text()).toContain('正在生成')
    expect(wrapper.text()).not.toContain('二维码已失效')

    await wrapper.setProps({ loading: false })
    await nextTick()
    await wrapper.get('.qr-code__expired-content .el-button').trigger('click')

    expect(onRefresh).toHaveBeenCalledOnce()
  })

  it('exposes download with a selectable file extension', async () => {
    const wrapper = mount(QrCode, { props: { data: 'content' } })

    await (
      wrapper.vm as unknown as {
        download: (name: string, extension: 'png') => Promise<void>
      }
    ).download('invite-code', 'png')

    expect(qrCodeMock.download).toHaveBeenCalledWith({
      name: 'invite-code',
      extension: 'png',
    })
  })
})
