// TODO: it appears that if there is inconsistency between the DB and the model, bad things will happen
export type FireConverter = {
  toFirestore: (value: any) => any;
  fromFirestore: (snapshot: any, options: any | undefined) => any;
};

const toFirestore = (value: any) => {
  const output: any = { ...value };
  // Extract value of each field
  Object.keys(value).forEach((k) => {
    const valueField = value[k];
    if (output[k] instanceof Set) output[k] = Array.from(valueField);
    else if (typeof output[k] === 'object' && !Array.isArray(output[k]))
      output[k] = toFirestore(valueField);
  });
  return output;
};

const fillFields = (
  model: any,
  values: any,
  anyObjects?: string[],
  isAnyObject: boolean = false
): void => {
  // Extract value of each field
  Object.keys(values).forEach((k) => {
    const valueField = values[k];
    if (model[k] instanceof Set) model[k] = new Set(valueField);
    else if (
      typeof valueField === 'object' &&
      (typeof model[k] === 'object' || anyObjects?.includes(k)) &&
      !Array.isArray(model[k])
    )
      fillFields(model[k], valueField, anyObjects, anyObjects?.includes(k));
    // add only if key is in model and they are the same type
    else if (
      isAnyObject ||
      (k in model && typeof model[k] === typeof valueField)
    )
      model[k] = valueField;
  });
};

export const FireConvertTo = <T>(
  dummyModel: () => T,
  anyObjects?: string[]
) => {
  return {
    toFirestore,
    fromFirestore: (snapshot: any, options: any | undefined): T => {
      const model = dummyModel();
      fillFields(model, snapshot.data(options), anyObjects);
      return model as T;
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
