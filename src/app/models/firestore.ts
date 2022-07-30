// TODO: it appears that if there is inconsistency between the DB and the model, bad things will happen
export type FireConverter = {
  toFirestore: (value: any) => any;
  fromFirestore: (snapshot: any, options: any | undefined) => any;
};

const toFirestore = (object: any) => {
  Object.keys(object).forEach((k) => {
    const valueField = object[k];
    if (object[k] instanceof Set) object[k] = Array.from(valueField);
    else if (typeof object[k] === 'object' && !Array.isArray(object[k]))
      object[k] = toFirestore(valueField);
  });
  return object;
};

const fillFields = (object: any, example: any): void => {
  Object.keys(object).forEach((k) => {
    if (example[k] instanceof Set) object[k] = new Set(object[k]);
    else if (
      !Array.isArray(example[k]) &&
      typeof example[k] === 'object' &&
      typeof object[k] === 'object'
    )
      fillFields(object[k], example[k]);
  });
};

export const FireConvertTo = <T>(example: T) => {
  return {
    toFirestore,
    fromFirestore: (snapshot: any, options: any | undefined): T => {
      const object = snapshot.data(options);
      fillFields(object, example);
      return object as T;
    },
  };
};

export class Doc<T> {
  constructor(public id: string, public data: T) {}
}

export type Order = {
  field: string;
  direction: 'asc' | 'desc';
};

export enum FireCache {
  ServerOnly,
  Server,
  BalancedRecent,
  CacheOnly,
}

export class Info {
  constructor(public version: number) {}
  public static converter = FireConvertTo(() => new Info(0));
}

export const dateNow = () => Math.trunc(Date.now() / 1000);
