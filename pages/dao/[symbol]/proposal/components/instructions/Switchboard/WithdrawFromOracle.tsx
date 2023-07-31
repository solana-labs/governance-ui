/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import InstructionForm, { InstructionInput } from '../FormCreator'
import { InstructionInputType } from '../inputInstructionType'
import { NewProposalContext } from '../../../new'
import {
  AggregatorAccount,
  SwitchboardProgram,
} from '@switchboard-xyz/solana.js'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  Token,
} from '@solana/spl-token'
import { WSOL_MINT } from '@components/instructions/tools'

interface TokenAddBankForm {
  governedAccount: AssetAccount | null
  oraclePublicKey: string
}

const WithdrawFromOracle = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const { assetAccounts } = useGovernanceAssets()
  const solAccounts = assetAccounts.filter((x) => x.type === AccountType.SOL)
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<TokenAddBankForm>({
    governedAccount: null,
    oraclePublicKey: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    const prerequisiteInstructions: TransactionInstruction[] = []
    const prerequsieInstructionsSigners: Keypair[] = []
    const additionalSerializedInstructions: string[] = []
    let serializedInstruction = ''
    if (
      isValid &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const program = await SwitchboardProgram.load(
        connection.cluster === 'devnet' ? 'devnet' : 'mainnet-beta',
        connection.current
      )
      const [oracle, oracleAccountData] = await AggregatorAccount.load(
        program,
        form.oraclePublicKey
      )

      const [leaseAccount] = await oracle.getLeaseAccount(
        oracleAccountData.queuePubkey
      )

      const wsolAddress = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(WSOL_MINT),
        form.governedAccount.extensions.transferAddress!,
        true
      )
      const wsolAccount = await connection.current.getAccountInfo(wsolAddress)

      if (!wsolAccount) {
        const createWsolacc = await Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          new PublicKey(WSOL_MINT),
          wsolAddress,
          form.governedAccount.extensions.transferAddress!,
          wallet.publicKey
        )
        prerequisiteInstructions.push(createWsolacc)
      }

      const ix = await leaseAccount.withdrawInstruction(
        form.governedAccount.extensions.transferAddress!,
        {
          withdrawWallet: wsolAddress!,
          amount: 'all',
          unwrap: false,
        }
      )
      const closeWSOLAccountIx = Token.createCloseAccountInstruction(
        TOKEN_PROGRAM_ID,
        wsolAddress,
        form.governedAccount.extensions.transferAddress!,
        form.governedAccount.extensions.transferAddress!,
        []
      )

      additionalSerializedInstructions.push(
        serializeInstructionToBase64(ix!.ixns[0])
      )

      additionalSerializedInstructions.push(
        serializeInstructionToBase64(closeWSOLAccountIx)
      )

      serializedInstruction = ''
    }
    const obj: UiInstruction = {
      prerequisiteInstructions: prerequisiteInstructions,
      prerequisiteInstructionsSigners: prerequsieInstructionsSigners,
      serializedInstruction: serializedInstruction,
      additionalSerializedInstructions: additionalSerializedInstructions,
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })
  const inputs: InstructionInput[] = [
    {
      label: 'Governance',
      initialValue: form.governedAccount,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governance,
      options: solAccounts,
    },
    {
      label: 'Oracle PublicKey',
      initialValue: form.oraclePublicKey,
      type: InstructionInputType.INPUT,
      inputType: 'text',
      name: 'oraclePublicKey',
    },
  ]

  return (
    <>
      {form && (
        <InstructionForm
          outerForm={form}
          setForm={setForm}
          inputs={inputs}
          setFormErrors={setFormErrors}
          formErrors={formErrors}
        ></InstructionForm>
      )}
    </>
  )
}

export default WithdrawFromOracle
