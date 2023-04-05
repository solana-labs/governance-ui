export type FormCallbacks<V extends object> = {
  [K in keyof V as `on${Capitalize<K extends string ? K : never>}Change`]+?: (
    value: V[K],
  ) => void;
};
