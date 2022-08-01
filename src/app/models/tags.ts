// the keys are kept lowercased for better search performance
export enum Tag {
  music = 'music',
  programming = 'programming',
  app = 'app',
  database = 'database',
  web = 'web',
  mobile = 'mobile',
  desktop = 'desktop',
  art = 'art',
  design = 'design',
  marketing = 'marketing',
  business = 'business',
  finance = 'finance',
  science = 'science',
  math = 'math',
  statistics = 'statistics',
  physics = 'physics',
  chemistry = 'chemistry',
  biology = 'biology',
  history = 'history',
  geography = 'geography',
  philosophy = 'philosophy',
}

export const TagsList = Object.keys(Tag);
