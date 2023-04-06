import { FormCallbacks } from './FormCallbacks';

export type FormProps<P extends object> = P & FormCallbacks<P>;
