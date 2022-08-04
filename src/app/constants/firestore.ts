import { Order } from '../models/firestore';

export const CLIENT_VERSION: number = 4;

export const INFO_PATH: string = 'info/0';

export const USERS_PATH: string = 'users';
export const MAX_USERNAME_LENGTH: number = 32;

export const PROFILES_PATH: string = 'profiles';

export const NOTIFICATIONS_PATH: string = 'notifications';

export const POSTS_PATH: string = 'posts';
export const POSTS_ORDER: Order = { field: 'date', direction: 'desc' };

export const REPLIES_SUB_PATH: string = 'replies';
export const getRepliesPath = (postId: string): string =>
  `${POSTS_PATH}/${postId}/${REPLIES_SUB_PATH}`;
export const REPLIES_ORDER: Order = { field: 'date', direction: 'desc' };

export const RECENT_MILLIS: number = 1000 * 60 * 2; // = 2 seconds
