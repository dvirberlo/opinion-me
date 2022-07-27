import { dateNow, FireConvertTo } from './firestore';

type nullableString = string | null;

export class User {
  constructor(
    public createAt: number,
    public email: nullableString,
    public displayName: nullableString,
    public photoURL: nullableString
  ) {}

  public static now = (
    email: nullableString,
    displayName: nullableString,
    photoURL: nullableString
  ): User => {
    return new User(dateNow(), email, displayName, photoURL);
  };

  public static converter = FireConvertTo<User>(() => new User(0, '', '', ''));
}
