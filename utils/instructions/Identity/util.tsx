import * as yup from 'yup'
import { DidSolIdentifier, Wallet } from '@identity.com/sol-did-client'
import { PublicKey } from '@solana/web3.js'
import Tooltip from '@components/Tooltip'
import { InformationCircleIcon } from '@heroicons/react/outline'
import React from 'react'
import { Governance, ProgramAccount, Realm } from '@solana/spl-governance'
import { AssetAccount } from '@utils/uiTypes/assets'
import {
  InstructionInput,
  InstructionInputType,
} from 'pages/dao/[symbol]/proposal/components/instructions/FormCreator'

const MAX_ALIAS_LENGTH = 32 // the key alias is used as the key id, so it must be a valid URI fragment

export const SchemaComponents = {
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  did: yup
    .string()
    .required('DID is required')
    .test('didTest', 'DID validation error', function (didString: string) {
      try {
        DidSolIdentifier.parse(didString)
      } catch (e) {
        return this.createError({
          message: `Invalid DID - DID must be of the form did:sol:<KEY>`,
        })
      }

      return true
    }),
  key: yup
    .string()
    .required('Key is required')
    .test('keyTest', 'Key validation error', function (key: string) {
      try {
        new PublicKey(key)
      } catch (e) {
        return this.createError({
          message: `Invalid key`,
        })
      }

      return true
    }),
  alias: yup
    .string()
    .required('Alias is required')
    .test('aliasTest', 'Alias validation error', function (alias: string) {
      if (alias.length > MAX_ALIAS_LENGTH) {
        return this.createError({
          message: `Alias must have fewer than ${MAX_ALIAS_LENGTH} characters`,
        })
      }
      return true
    }),
}

export const governanceInstructionInput = (
  realm: ProgramAccount<Realm> | undefined,
  governance: ProgramAccount<Governance> | undefined,
  assetAccounts: AssetAccount[],
  shouldBeGoverned: false | ProgramAccount<Governance> | null
): InstructionInput => ({
  label: 'Governance',
  initialValue: null,
  name: 'governedAccount',
  type: InstructionInputType.GOVERNED_ACCOUNT,
  shouldBeGoverned,
  governance,
  options: assetAccounts.filter(
    (x) =>
      x.governance.pubkey.toBase58() === realm?.account.authority?.toBase58()
  ),
})

export const instructionInputs: Record<string, InstructionInput> = {
  did: {
    label: 'DID',
    initialValue: 'did:sol:',
    inputType: 'text',
    name: 'did',
    type: InstructionInputType.INPUT,
    additionalComponent: (
      <Tooltip content="The DID to add the key to - the governed account must be registered on the DID">
        <InformationCircleIcon className="w-4 h-4 ml-1"></InformationCircleIcon>
        <a
          href="https://docs.identity.com/docs/overview#dids"
          target="_blank"
          rel="noreferrer"
          className="text-xs"
        >
          What is a DID?
        </a>
      </Tooltip>
    ),
  },
  key: {
    label: 'Key',
    initialValue: '',
    inputType: 'text',
    name: 'key',
    type: InstructionInputType.INPUT,
    additionalComponent: (
      <Tooltip content="The key to add to the DID">
        <span>
          <InformationCircleIcon className="w-4 h-4 ml-1"></InformationCircleIcon>
        </span>
      </Tooltip>
    ),
  },
  alias: {
    label: 'Alias',
    initialValue: '',
    inputType: 'text',
    name: 'alias',
    type: InstructionInputType.INPUT,
    additionalComponent: (
      <Tooltip content="The key alias on the DID">
        <span>
          <InformationCircleIcon className="w-4 h-4 ml-1"></InformationCircleIcon>
        </span>
      </Tooltip>
    ),
  },
}

// Given a governed account, return a Wallet that can be passed into the sol-did-client
// The eventual signer of the transaction is the governed account PDA, so passing this as the
// wallet into the sol-did-client ensures the correct public key is set as the signer in the instructions.
// The transactions are not signed now, but only after voting, so the signTransaction functions are no-ops.
export const governedAccountToWallet = (
  governedAccount: AssetAccount
): Wallet => ({
  publicKey: governedAccount.governance.pubkey,
  // noop signers, as we use this just to pass the public key
  signTransaction: async (tx) => tx,
  signAllTransactions: async (txs) => txs,
})
