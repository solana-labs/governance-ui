import React, { useContext, useEffect, useState } from 'react'
import {
  ProgramAccount,
  serializeInstructionToBase64,
  Governance,
  getGovernance,
} from '@solana/spl-governance'
import { SwitchboardAdmitOracleForm } from '@utils/uiTypes/proposalCreationTypes'
import { PublicKey } from '@solana/web3.js'
import Input from '@components/inputs/Input'
import * as sbv2 from '@switchboard-xyz/switchboard-v2'
import useWalletStore from 'stores/useWalletStore'
import * as anchor from '@coral-xyz/anchor'
import sbIdl from 'SwitchboardVotePlugin/switchboard_v2.json'
import gonIdl from 'SwitchboardVotePlugin/gameofnodes.json'
import {
  SWITCHBOARD_ID,
  SWITCHBOARD_ADDIN_ID,
  SWITCHBOARD_GRANT_AUTHORITY,
  grantPermissionTx,
} from 'SwitchboardVotePlugin/SwitchboardQueueVoterClient'
import { NewProposalContext } from '../../../new'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

const SwitchboardAdmitOracle = ({
  index,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [form, setForm] = useState<SwitchboardAdmitOracleForm>({
    oraclePubkey: undefined,
    queuePubkey: undefined,
  })
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { handleSetInstructions } = useContext(NewProposalContext)

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: SWITCHBOARD_GRANT_AUTHORITY,
        getInstruction,
      },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  async function getInstruction(): Promise<UiInstruction> {
    const options = anchor.AnchorProvider.defaultOptions()
    const provider = new anchor.AnchorProvider(
      connection.current,
      (wallet as unknown) as anchor.Wallet,
      options
    )

    const switchboardProgram = new anchor.Program(
      sbIdl as anchor.Idl,
      SWITCHBOARD_ID,
      provider
    )

    const addinProgram = new anchor.Program(
      gonIdl as anchor.Idl,
      SWITCHBOARD_ADDIN_ID,
      provider
    )

    const [addinState] = await PublicKey.findProgramAddress(
      [Buffer.from('state')],
      addinProgram.programId
    )

    let qPk
    if (form === undefined) {
      qPk = PublicKey.default
    } else {
      qPk = form.queuePubkey
    }
    let oPk
    if (form === undefined) {
      oPk = PublicKey.default
    } else {
      oPk = form.oraclePubkey
    }
    const p = sbv2.PermissionAccount.fromSeed(
      switchboardProgram,
      addinState,
      new PublicKey(qPk),
      new PublicKey(oPk)
    )[0]
    console.log('P:')
    console.log(p)

    const grantTx = await grantPermissionTx(
      addinProgram,
      SWITCHBOARD_GRANT_AUTHORITY,
      SWITCHBOARD_ID,
      p.publicKey
    )

    const gov = await getGovernance(
      connection.current,
      SWITCHBOARD_GRANT_AUTHORITY
    )
    return {
      serializedInstruction: serializeInstructionToBase64(
        grantTx.instructions[0]
      ),
      isValid: true,
      governance: gov,
    }
  }

  return (
    <>
      <Input
        label="Oracle Pubkey"
        type="text"
        value={(() => {
          let oPk
          if (form === undefined) {
            oPk = PublicKey.default
          } else {
            oPk = form.oraclePubkey
          }
          return oPk
        })()}
        onChange={(text) => {
          setForm({
            ...form,
            ['oraclePubkey']: new PublicKey(text.target.value),
          })
        }}
      />
      <Input
        label="Queue Pubkey"
        type="text"
        value={(() => {
          let qPk
          if (form === undefined) {
            qPk = PublicKey.default
          } else {
            qPk = form.queuePubkey
          }
          return qPk
        })()}
        onChange={(text) => {
          setForm({
            ...form,
            ['queuePubkey']: new PublicKey(text.target.value),
          })
        }}
      />
    </>
  )
}

export default SwitchboardAdmitOracle
