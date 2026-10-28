import type { IDocumentPrintProxy } from '~/domain/interface/i-document-print-proxy'

export class BrowserDocumentPrintProxy implements IDocumentPrintProxy {
  private isRestorePending = false

  printDocument(documentTitle: string): void {
    if (!this.isRestorePending) {
      const originalTitle = document.title
      this.isRestorePending = true
      window.addEventListener('afterprint', () => {
        document.title = originalTitle
        this.isRestorePending = false
      }, { once: true })
    }
    document.title = documentTitle
    window.print()
  }
}
