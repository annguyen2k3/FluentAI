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
  SPEAKING = 'speaking'
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
  PRACTICE_WRITING_SENTENCE = 'practice_writing_sentence',
  PRACTICE_WRITING_PARAGRAPH = 'practice_writing_paragraph',
  PRACTICE_SPEAKING_SENTENCE = 'practice_speaking_sentence',
  PRACTICE_SPEAKING_SHADOWING = 'practice_speaking_shadowing',
  PRACTICE_LISTENING_VIDEO = 'practice_listening_video'
}

export enum UserScoreType {
  WRITING_SENTENCE = 'writing_sentence',
  WRITING_PARAGRAPH = 'writing_paragraph',
  SPEAKING_SENTENCE = 'speaking_sentence',
  SPEAKING_SHADOWING = 'speaking_shadowing',
  LISTENING_VIDEO = 'listening_video'
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed'
}

export enum ConfigSystemType {
  PRICING_CREDIT = 'pricing_credit',
  COST_USAGE = 'cost_usage',
  PRACTICE_SCORE = 'practice_score'
}

export enum CreditUsageType {
  writing_sentence_evaluate = 'writing_sentence_evaluate',
  writing_paragraph_evaluate = 'writing_paragraph_evaluate',
  speaking_sentence_evaluate = 'speaking_sentence_evaluate',
  speaking_shadowing_evaluate = 'speaking_shadowing_evaluate'
}
