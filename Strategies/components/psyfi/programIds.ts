import { PublicKey } from '@solana/web3.js'
export const MAINNET_PROGRAM_KEYS = {
  PSYFI_V2: new PublicKey('PSYFiYqguvMXwpDooGdYV6mju92YEbFobbvW617VNcq'),
  PSYSTAKE: new PublicKey('pSystkitWgLkzprdAvraP8DSBiXwee715wiSXGJe8yr'),
}

export const DEVNET_PROGRAM_KEYS = {
  PSYFI_V2: new PublicKey('95q3X9ADJv5hWt93oSaPqABPnP1rqfmjgrnto9v83LPK'),
  PSYSTAKE: new PublicKey('5LrZkBFgDkFiKEePeT2N9VuKfd2k8Rrad9PG6mKGbCRk'),
}

export const EURO_PRIMITIVE_PROGRAM_ID = new PublicKey(
  'FASQhaZQT53W9eT9wWnPoBFw8xzZDey9TbMmJj6jCQTs'
)
