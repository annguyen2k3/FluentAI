import { VocabularyHintType } from '~/models/Other'

export interface ResPromptWritingParagraphInit {
  init_success: boolean
}

export type ParagraphTranslationTokenState =
  | 'original'
  | 'removed'
  | 'suggested'
  | 'added'

export interface ParagraphTranslationToken {
  text: string
  state: ParagraphTranslationTokenState
}

export interface ResPromptWritingParagraphTranslation {
  passed: boolean
  sentence_original: string
  user_translation: string
  final_sentence: string
  tokens: ParagraphTranslationToken[]
  suggested_improvements: string[]
  general_feedback: string
}

export interface ResPromptWritingParagraphCompletion {
  completion_success: boolean
  strong_points: string[]
  common_mistakes: string[]
  advice_for_improvement: string[]
  general_feedback: string
}

export interface ResPromptWritingParagraphPreviewTopic {
  passed: boolean
  description: string
  title: string
  content: string
  hint: VocabularyHintType[]
}
