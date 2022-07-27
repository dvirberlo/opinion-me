import { FireConvertTo } from './firestore';
import { User } from './user';

type nullableString = string | null;

class UserDetails {
  constructor(
    public displayName: nullableString,
    public photoURL: nullableString
  ) {}
}

export class Author extends UserDetails {
  constructor(
    public uid: nullableString,
    displayName: nullableString,
    photoURL: nullableString
  ) {
    super(displayName, photoURL);
  }

  public static fromUser(user: User, uid: string): Author {
    return new Author(uid, user.displayName, user.photoURL);
  }
}

export class Profile extends UserDetails {
  constructor(
    displayName: nullableString,
    photoURL: nullableString,
    public createAt: number
  ) {
    super(displayName, photoURL);
  }

  public static fromUser(user: User): Profile {
    return new Profile(user.displayName, user.photoURL, user.createAt);
  }

  public static converter = FireConvertTo<Profile>(
    () => new Profile('', '', 0)
  );
}
