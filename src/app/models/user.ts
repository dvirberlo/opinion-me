import { dateNow, FireConvertTo } from './firestore';

type nullableString = string | null;

interface UserDetails {
  displayName: nullableString;
  photoURL: nullableString;
}
export interface UserType extends UserDetails {
  createAt: number;
  email: nullableString;
}

export class User {
  public static now = (
    email: nullableString,
    displayName: nullableString,
    photoURL: nullableString
  ): UserType => {
    return {
      createAt: dateNow(),
      email,
      displayName,
      photoURL,
    };
  };

  public static converter = FireConvertTo<UserType>(User.now('', '', ''));
}

export interface AuthorType extends UserDetails {
  uid: nullableString;
}
export class Author {
  public static fromUser = (user: UserType, uid: string): AuthorType => {
    return { uid, displayName: user.displayName, photoURL: user.photoURL };
  };
}

export interface ProfileType extends UserDetails {
  createAt: number;
}
export class Profile {
  public static fromUser = (user: UserType): ProfileType => {
    return {
      displayName: user.displayName,
      photoURL: user.photoURL,
      createAt: user.createAt,
    };
  };
  public static converter = FireConvertTo<ProfileType>({
    displayName: '',
    photoURL: '',
    createAt: 0,
  });
}
