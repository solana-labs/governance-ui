import Checkbox from '@components/inputs/Checkbox'
import Input from '@components/inputs/Input'
import { MANGO_INSTRUCTION_FORWARDER } from '@components/instructions/tools'
import { BN } from '@coral-xyz/anchor'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { useCallback, useState } from 'react'

export function wrapWithForwarder(
  ix: TransactionInstruction,
  executableBy: PublicKey,
  executableUntilUnixTs: number
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      {
        pubkey: executableBy,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: ix.programId,
        isSigner: false,
        isWritable: false,
      },
      ...ix.keys,
    ],
    programId: new PublicKey(MANGO_INSTRUCTION_FORWARDER),
    data: Buffer.concat([
      new BN(executableUntilUnixTs).toArrayLike(Buffer, 'le', 8),
      ix.data,
    ]),
  })
}

export const useForwarderProgramHelpers = () => {
  const [form, setForm] = useState<ForwarderProgramForm>({
    useExecutableBy: false,
    wallet: '',
    timestamp: '',
  })

  const withForwarderWrapper = useCallback(
    (ix: TransactionInstruction) => {
      if (form.useExecutableBy) {
        return wrapWithForwarder(
          ix,
          new PublicKey(form.wallet),
          Number(form.timestamp)
        )
      } else {
        return ix
      }
    },
    [form]
  )
  return { form, setForm, withForwarderWrapper }
}

type ForwarderProgramForm = {
  useExecutableBy: boolean
  wallet: string
  timestamp: string
}

const ForwarderProgram = ({
  form,
  setForm,
}: ReturnType<typeof useForwarderProgramHelpers>) => {
  const isInvalidPubkey = form.wallet && !tryParsePublicKey(form.wallet)
  return (
    <div className="space-y-2">
      <div className="my-4">
        <Checkbox
          checked={form.useExecutableBy}
          onChange={(e) => {
            setForm({
              ...form,
              useExecutableBy: e.target.checked,
            })
          }}
          label={'Use executable by'}
        />
      </div>
      {form.useExecutableBy && (
        <>
          <Input
            label="Wallet pk"
            value={form.wallet}
            type="text"
            onChange={(evt) =>
              setForm({
                ...form,
                wallet: evt.target.value,
              })
            }
            error={isInvalidPubkey ? 'Invalid publickey' : ''}
          />
          <Input
            label="Executable until unix timestamp"
            value={form.timestamp}
            type="text"
            onChange={(evt) =>
              setForm({
                ...form,
                timestamp: evt.target.value,
              })
            }
          />
        </>
      )}
    </div>
  )
}

export default ForwarderProgram
