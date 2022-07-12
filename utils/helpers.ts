import { u8 } from 'buffer-layout';
import { BN } from '@blockworks-foundation/mango-client';
import { fetchGistFile } from './github';

export function capitalize(str?: string) {
  return str ? str?.charAt(0).toUpperCase() + str?.slice(1) : str;
}

export function chunks<T>(array: T[], size: number): T[][] {
  const result: Array<T[]> = [];
  let i, j;
  for (i = 0, j = array.length; i < j; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

//SanitizedObject class helps prevent prototype pollution with creating obj without prototype
export class SanitizedObject {
  constructor(obj) {
    return Object.assign(Object.create(null), obj);
  }
}

export async function resolveProposalDescription(descriptionLink: string) {
  try {
    const url = new URL(descriptionLink);
    return (await fetchGistFile(url.toString())) ?? descriptionLink;
  } catch {
    return descriptionLink;
  }
}

// Anchor instruction adds a 7 byte discriminator prefix on instruction data
export const ANCHOR_DISCRIMINATOR_LAYOUT = Array.from(new Array(7)).map(u8);

export const BN_ZERO = new BN(0);
