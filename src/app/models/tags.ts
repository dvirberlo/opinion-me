export enum Tag {
  music = 'music',
  programming = 'programming',
  app = 'app',
  database = 'database',
  web = 'web',
  mobile = 'mobile',
  desktop = 'desktop',
}

export const TagsList = Object.keys(Tag);
console.log(TagsList);
