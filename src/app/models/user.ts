import { dateNow, FireConvertTo } from './firestore';

type nullableString = string | null;

interface UserDetails {
  displayName: nullableString;
  photoURL: nullableString;
}
export interface User extends UserDetails {
  createAt: number;
  email: nullableString;
}

export const UserNow = (
  email: nullableString,
  displayName: nullableString,
  photoURL: nullableString
): User => {
  return {
    createAt: dateNow(),
    email,
    displayName,
    photoURL,
  };
};

export const UserConverter = FireConvertTo<User>(UserNow('', '', ''));

export interface Author extends UserDetails {
  uid: nullableString;
}
export const AuthorFromUser = (user: User, uid: string): Author => {
  return { uid, displayName: user.displayName, photoURL: user.photoURL };
};

export interface Profile extends UserDetails {
  createAt: number;
}
export const ProfileFromUser = (user: User): Profile => {
  return {
    displayName: user.displayName,
    photoURL: user.photoURL,
    createAt: user.createAt,
  };
};
export const ProfileConverter = FireConvertTo<Profile>({
  displayName: '',
  photoURL: '',
  createAt: 0,
});
