import { MediaType, PartOfSpeech } from "~/constants/enum"

export interface Media {
    url: string
    type: MediaType
}

export interface VocabularyHintType {
    vocabulary_en: string
    translate: string
    type: PartOfSpeech
    sentence_example: {
        en: string
        vi: string
    }
}