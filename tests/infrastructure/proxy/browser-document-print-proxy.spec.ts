import { afterEach, describe, expect, it, vi } from 'vitest'
import { BrowserDocumentPrintProxy } from '~/infrastructure/proxy/browser-document-print-proxy'

describe('BrowserDocumentPrintProxy', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.title = ''
  })

  it('opens the print dialog with the document title as the default file name', () => {
    document.title = '標的資訊面分析操作台'
    const titlesWhilePrinting: string[] = []
    vi.spyOn(window, 'print').mockImplementation(() => {
      titlesWhilePrinting.push(document.title)
    })

    new BrowserDocumentPrintProxy().printDocument('台股-2330-分析-2026-10-28')

    expect(titlesWhilePrinting).toEqual(['台股-2330-分析-2026-10-28'])
  })

  it('restores the original title once printing is over', () => {
    document.title = '標的資訊面分析操作台'
    vi.spyOn(window, 'print').mockImplementation(() => undefined)
    const proxy = new BrowserDocumentPrintProxy()

    proxy.printDocument('台股-2330-分析-2026-10-28')
    window.dispatchEvent(new Event('afterprint'))
    proxy.printDocument('美股-AAPL-分析-2026-10-27')
    window.dispatchEvent(new Event('afterprint'))

    expect(document.title).toBe('標的資訊面分析操作台')
  })

  it('leaves later title changes alone after the print is over', () => {
    vi.spyOn(window, 'print').mockImplementation(() => undefined)

    new BrowserDocumentPrintProxy().printDocument('台股-2330-分析-2026-10-28')
    window.dispatchEvent(new Event('afterprint'))
    document.title = '分析事件'
    window.dispatchEvent(new Event('afterprint'))

    expect(document.title).toBe('分析事件')
  })
})
