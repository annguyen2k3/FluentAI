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
  WRITE_PARAGRAPH = 'write_paragraph'
}

export enum PromptWritingType {
  INITIALIZATION = 'initialization',
  TRANSLATION = 'translation',
  COMPLETION = 'completion',
  PREVIEW_TOPIC = 'preview_topic',
  PREVIEW_CONTENT = 'preview_content'
}

export enum AdminRole {
  ADMIN = 'root_admin'
}
