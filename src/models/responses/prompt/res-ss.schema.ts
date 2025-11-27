import { LetterSpeakingSuggestionType } from '~/models/schemas/his_ss_user.schema'

export interface ResPromptSpeakingInit {
  init_success: boolean
}

export type ResPromptSpeakingSentencePreview = {
  passed: boolean // true if the user's sentence is correct, false otherwise
  enSentence: string
  user_transcript: string // the user's transcript
  user_phonetics: string // the user's phonetics
  user_suggestions: LetterSpeakingSuggestionType[] // the user's suggestions
  general_feedback: string // the general feedback
}

export interface ResPromptSpeakingCompletion {
  completion_success: boolean
  strong_points: string[]
  common_mistakes: string[]
  advice_for_improvement: string[]
  general_feedback: string
}
