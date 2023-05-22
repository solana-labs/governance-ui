import { useContext, useEffect, useState } from 'react'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import useWalletStore from 'stores/useWalletStore'

import { NewProposalContext } from '../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from './FormCreator'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import * as yup from 'yup'
import { getValidatedPublickKey } from '@utils/validations'
import { PublicKey } from '@solana/web3.js'
import { getATA } from '@utils/ataTools'
import { sendTransactionsV3, SequenceType } from '@utils/sendTransactions'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

export interface CloseTokenAccountForm {
  governedAccount: AssetAccount | undefined
  fundsDestinationAccount: string
  solRentDestination: string
}

const CloseTokenAccount = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const realm = useRealmQuery().data?.result
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const [form, setForm] = useState<CloseTokenAccountForm>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
    fundsDestinationAccount: yup
      .string()
      .test(
        'fundsDestinationAccountTest',
        'Funds destination address validation error',
        function (val: string) {
          if (form?.governedAccount?.extensions.amount?.isZero()) {
            return true
          }
          if (val) {
            try {
              return !!getValidatedPublickKey(val)
            } catch (e) {
              console.log(e)
              return this.createError({
                message: `${e}`,
              })
            }
          } else {
            return this.createError({
              message: `Funds destination address is required`,
            })
          }
        }
      ),
    solRentDestination: yup
      .string()
      .test(
        'solRentDestinationTest',
        'Sol rent destination address validation error',
        function (val: string) {
          if (val) {
            try {
              return !!getValidatedPublickKey(val)
            } catch (e) {
              console.log(e)
              return this.createError({
                message: `${e}`,
              })
            }
          } else {
            return this.createError({
              message: `Sol rent destination address  is required`,
            })
          }
        }
      ),
  })
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstructionClose = ''
    const additionalSerializedInstructions: string[] = []
    if (
      isValid &&
      form!.governedAccount?.governance?.account &&
      wallet?.publicKey &&
      realm
    ) {
      if (!form!.governedAccount.extensions.token!.account.amount?.isZero()) {
        const sourceAccount = form!.governedAccount.extensions.token?.publicKey
        //this is the original owner
        const destinationAccount = new PublicKey(form!.fundsDestinationAccount)
        const mintPK = form!.governedAccount.extensions.mint!.publicKey
        const amount = form!.governedAccount.extensions.token!.account.amount

        //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
        const {
          currentAddress: receiverAddress,
          needToCreateAta,
        } = await getATA({
          connection: connection,
          receiverAddress: destinationAccount,
          mintPK,
          wallet: wallet!,
        })
        //we push this createATA instruction to transactions to create right before creating proposal
        //we don't want to create ata only when instruction is serialized
        if (needToCreateAta) {
          const createAtaInstruction = Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
            TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
            mintPK, // mint
            receiverAddress, // ata
            destinationAccount, // owner of token account
            wallet!.publicKey! // fee payer
          )
          //ata needs to be created before otherwise simulations will throw errors.
          //createCloseAccountInstruction has check if ata is existing its not like in transfer where we can run
          //simulation without created ata and we create it on the fly before proposal
          await sendTransactionsV3({
            connection: connection.current,
            wallet: wallet,
            transactionInstructions: [
              {
                instructionsSet: [
                  {
                    transactionInstruction: createAtaInstruction,
                  },
                ],
                sequenceType: SequenceType.Parallel,
              },
            ],
          })
        }
        const transferIx = Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          sourceAccount!,
          receiverAddress,
          form!.governedAccount!.extensions!.token!.account.owner,
          [],
          amount
        )
        additionalSerializedInstructions.push(
          serializeInstructionToBase64(transferIx)
        )
      }

      const closeInstruction = Token.createCloseAccountInstruction(
        TOKEN_PROGRAM_ID,
        form!.governedAccount.extensions.token!.publicKey!,
        new PublicKey(form!.solRentDestination),
        form!.governedAccount.extensions.token!.account.owner!,
        []
      )
      serializedInstructionClose = serializeInstructionToBase64(
        closeInstruction
      )
      additionalSerializedInstructions.push(serializedInstructionClose)
    }
    const obj: UiInstruction = {
      prerequisiteInstructions: [],
      serializedInstruction: '',
      additionalSerializedInstructions: additionalSerializedInstructions,
      isValid,
      governance: form!.governedAccount?.governance,
    }

    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form?.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])
  const inputs: InstructionInput[] = [
    {
      label: 'Token account',
      initialValue: null,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governance,
      options: governedTokenAccountsWithoutNfts.filter((x) => !x.isSol),
      assetType: 'token',
    },
    {
      label: 'Token recipient',
      initialValue: '',
      name: 'fundsDestinationAccount',
      type: InstructionInputType.INPUT,
      inputType: 'text',
      hide: form?.governedAccount?.extensions.amount?.isZero(),
    },
    {
      label: 'Sol recipient',
      initialValue:
        governedTokenAccountsWithoutNfts
          .find((x) => x.isSol)
          ?.extensions.transferAddress?.toBase58() ||
        wallet?.publicKey?.toBase58(),
      name: 'solRentDestination',
      type: InstructionInputType.INPUT,
      inputType: 'text',
    },
  ]
  return (
    <>
      <InstructionForm
        outerForm={form}
        setForm={setForm}
        inputs={inputs}
        setFormErrors={setFormErrors}
        formErrors={formErrors}
      ></InstructionForm>
    </>
  )
}

export default CloseTokenAccount
