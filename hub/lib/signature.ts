export function toHex(signature: Uint8Array) {
  return Array.from(signature)
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('');
}

export function toUint8Array(msg: string) {
  return new TextEncoder().encode(msg);
}
