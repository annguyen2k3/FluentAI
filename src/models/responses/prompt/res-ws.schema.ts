import { SentenceWriteType } from '~/models/schemas/ws-list.schema'

export interface ResPromptWritingInit {
  init_success: boolean
}

export type TranslationTokenState =
  | 'original'
  | 'removed'
  | 'suggested'
  | 'added'

export interface TranslationToken {
  text: string
  state: TranslationTokenState
}

export interface ResPromptWritingTranslation {
  passed: boolean // true if the user's translation is correct, false otherwise
  sentence_original: string // the original sentence in Vietnamese
  user_translation: string // the user's translation
  final_sentence: string // the final sentence is ai suggested, after the user's translation is compared with the original sentence
  tokens: TranslationToken[] // the tokens of the final sentence
  suggested_improvements: string[] // the suggested improvements for the user's translation
  general_feedback: string // the general feedback for the user's translation
}

export interface ResPromptWritingCompletion {
  completion_success: boolean
  strong_points: string[]
  common_mistakes: string[]
  advice_for_improvement: string[]
  general_feedback: string
}

export interface ResPromptWSPreviewTopic {
  passed: boolean
  description: string
  list: SentenceWriteType[]
}
