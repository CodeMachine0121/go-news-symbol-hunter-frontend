import type { IDocumentPrintProxy } from '~/domain/interface/i-document-print-proxy'

export class BrowserDocumentPrintProxy implements IDocumentPrintProxy {
  printDocument(documentTitle: string): void {
    const originalTitle = document.title
    document.title = documentTitle
    window.addEventListener('afterprint', () => {
      document.title = originalTitle
    }, { once: true })
    window.print()
  }
}
