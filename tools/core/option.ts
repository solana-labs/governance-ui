// Rust style Option with typeScript twist inspired by https://gist.github.com/s-panferov/575da5a7131c285c0539

export interface Option<T> {
  map<U>(fn: (a: T) => U): Option<U>
  isSome(): this is Some<T>
  isNone(): this is None<T>
  unwrap(): T
  tryUnwrap(): T | undefined
}

export function some<T>(value: T) {
  return new Some<T>(value)
}

export function none<T>() {
  return new None<T>()
}

export function option<T>(value: T | undefined) {
  return value ? some(value) : none<T>()
}

export class Some<T> implements Option<T> {
  value: T

  map<U>(fn: (a: T) => U): Option<U> {
    return new Some(fn(this.value))
  }

  constructor(value: T) {
    this.value = value
  }

  isSome(): this is Some<T> {
    return true
  }

  isNone(): this is None<T> {
    return false
  }

  unwrap(): T {
    return this.value
  }

  tryUnwrap(): T | undefined {
    return this.unwrap()
  }

  toString(): string {
    return `Some(${this.value})`
  }
}

export class None<T> implements Option<T> {
  map<U>(_fn: (a: T) => U): Option<U> {
    return new None<U>()
  }

  isSome(): this is Some<T> {
    return false
  }

  isNone(): this is None<T> {
    return true
  }

  unwrap(): T {
    throw new Error('None has no value')
  }

  tryUnwrap(): T | undefined {
    return undefined
  }

  public toString(): string {
    return 'None'
  }
}
