import { AnalysisEvidence } from '~/domain/models/entities/analysis-evidence'
import { KeyEvent } from '~/domain/models/entities/key-event'

export type KeyEventWire = {
  title: string
  link: string
  publishedAt: string
}

export type EvidenceWire = KeyEventWire & {
  providerName: string
}

export const toKeyEvents = (keyEvents: KeyEventWire[] | null | undefined): KeyEvent[] =>
  (keyEvents ?? []).map(keyEvent => new KeyEvent(keyEvent.title, keyEvent.link, new Date(keyEvent.publishedAt)))

export const toAnalysisEvidence = (evidence: EvidenceWire[] | null | undefined): AnalysisEvidence[] =>
  (evidence ?? []).map(item => new AnalysisEvidence(item.title, item.link, new Date(item.publishedAt), item.providerName))
