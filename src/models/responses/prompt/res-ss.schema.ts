import { LetterSpeakingSuggestionType } from '~/models/schemas/his_ss_user.schema'

export type ResPromptSpeakingSentencePreview = {
  passed: boolean // true if the user's sentence is correct, false otherwise
  enSentence: string
  user_transcript: string // the user's transcript
  user_phonetics: string // the user's phonetics
  user_suggestions: LetterSpeakingSuggestionType[] // the user's suggestions
  general_feedback: string // the general feedback
}
