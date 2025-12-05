export enum GenderType {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export enum TokenType {
  AccessToken,
  RefreshToken
}

export enum VerifyEmailType {
  RESISTER,
  FORGOT_PASSWORD
}

export enum MediaType {
  Image,
  Video,
  Audio
}

export enum PartOfSpeech {
  NOUN = 'noun', // danh từ
  VERB = 'verb', // động từ
  ADJECTIVE = 'adjective', // tính từ
  ADVERB = 'adverb', // trạng từ
  PRONOUN = 'pronoun', // đại từ
  PREPOSITION = 'preposition', // giới từ
  CONJUNCTION = 'conjunction', // liên từ
  INTERJECTION = 'interjection', // cụm từ
  OTHER = 'other' // từ khác
}

export enum PromptFeature {
  WRITE_SENTENCE = 'write_sentence',
  WRITE_PARAGRAPH = 'write_paragraph',
  SPEAKING = 'speaking',
  TRANSLATE = 'translate'
}

export enum PromptFeatureType {
  INITIALIZATION = 'initialization',
  TRANSLATION = 'translation',
  COMPLETION = 'completion',
  PREVIEW_TOPIC = 'preview_topic',
  PREVIEW_CONTENT = 'preview_content',
  SPEAKING_PREVIEW = 'speaking_preview'
}

export enum AdminRole {
  ADMIN = 'root_admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked'
}

export enum StatusLesson {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum HistoryUserType {
  PRACTICE_SPEAKING_SENTENCE = 'practice_speaking_sentence',
  PRACTICE_SPEAKING_SHADOWING = 'practice_speaking_shadowing',
  PRACTICE_LISTENING_VIDEO = 'practice_listening_video'
}
