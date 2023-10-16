import { useContext, useEffect, useState } from 'react'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

import { NewProposalContext } from '../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, { InstructionInput } from './FormCreator'
import { InstructionInputType } from './inputInstructionType'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import * as yup from 'yup'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { getATA } from '@utils/ataTools'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import Checkbox from '@components/inputs/Checkbox'
import tokenPriceService from '@utils/services/tokenPrice'
import { fmtMintAmount } from '@tools/sdk/units'

interface CloseMultiTokenAccountForm {
  wallet: AssetAccount | undefined | null
  tokenAccounts: AssetAccount[]
  fundsDestinationAccount: string
  solRentDestination: string
}

const CloseMultipleTokenAccounts = ({
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
  const [form, setForm] = useState<CloseMultiTokenAccountForm>({
    wallet: null,
    tokenAccounts: [],
    fundsDestinationAccount: '',
    solRentDestination: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const schema = yup.object().shape({
    wallet: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })

    const additionalSerializedInstructions: string[] = []
    const prerequisiteInstructions: TransactionInstruction[] = []
    const mintsOfCurrentlyPushedAtaInstructions: string[] = []
    if (
      isValid &&
      form!.wallet?.governance?.account &&
      wallet?.publicKey &&
      realm
    ) {
      for (const tokenAccount of form.tokenAccounts) {
        const sourceAccount = tokenAccount.pubkey
        //this is the original owner
        const destinationAccount = new PublicKey(form!.fundsDestinationAccount)
        const mintPK = tokenAccount.extensions.mint!.publicKey
        const amount = tokenAccount.extensions.token!.account.amount

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
        if (
          needToCreateAta &&
          !mintsOfCurrentlyPushedAtaInstructions.find(
            (x) => x !== mintPK.toBase58()
          )
        ) {
          const createAtaInstruction = Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
            TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
            mintPK, // mint
            receiverAddress, // ata
            destinationAccount, // owner of token account
            wallet!.publicKey! // fee payer
          )
          mintsOfCurrentlyPushedAtaInstructions.push(mintPK.toBase58())
          prerequisiteInstructions.push(createAtaInstruction)
        }

        if (!amount.isZero()) {
          const transferIx = Token.createTransferInstruction(
            TOKEN_PROGRAM_ID,
            sourceAccount!,
            receiverAddress,
            tokenAccount.extensions.token!.account.owner,
            [],
            amount
          )
          additionalSerializedInstructions.push(
            serializeInstructionToBase64(transferIx)
          )
        }

        const closeInstruction = Token.createCloseAccountInstruction(
          TOKEN_PROGRAM_ID,
          tokenAccount.pubkey,
          new PublicKey(form!.solRentDestination),
          tokenAccount.extensions.token!.account.owner,
          []
        )
        additionalSerializedInstructions.push(
          serializeInstructionToBase64(closeInstruction)
        )
      }
    }
    const obj: UiInstruction = {
      prerequisiteInstructions: prerequisiteInstructions,
      serializedInstruction: '',
      additionalSerializedInstructions: additionalSerializedInstructions,
      chunkBy: 3,
      isValid,
      governance: form!.wallet?.governance,
    }

    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form?.wallet?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  const inputs: InstructionInput[] = [
    {
      label: 'Wallet',
      initialValue: null,
      name: 'wallet',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governance,
      options: governedTokenAccountsWithoutNfts.filter((x) => x.isSol),
      assetType: 'wallet',
      additionalComponent: (
        <div>
          {governedTokenAccountsWithoutNfts
            .filter(
              (x) =>
                x.isToken &&
                (x.extensions.token?.account.owner.toBase58() ===
                  form.wallet?.extensions.transferAddress?.toBase58() ||
                  x.extensions.token?.account.owner.toBase58() ===
                    form.wallet?.governance.pubkey.toBase58())
            )
            .sort((a, b) => {
              const AAmount = fmtMintAmount(
                a.extensions.mint!.account,
                a!.extensions.token!.account.amount
              )

              const BAmount = fmtMintAmount(
                b.extensions.mint!.account,
                b!.extensions.token!.account.amount
              )

              return BAmount.length - AAmount.length
            })
            .map((x) => {
              const info = tokenPriceService.getTokenInfo(
                x.extensions.mint!.publicKey.toBase58()
              )
              const pubkey = x.pubkey.toBase58()
              const tokenName = info?.name ? info.name : ''
              const amount = fmtMintAmount(
                x.extensions.mint!.account,
                x!.extensions.token!.account.amount
              )
              return (
                <div className="mb-4" key={x.pubkey.toBase58()}>
                  <Checkbox
                    label={`${pubkey} ${amount} ${tokenName}`}
                    checked={
                      !!form.tokenAccounts?.find(
                        (toAcc) =>
                          toAcc.pubkey.toBase58() === x.pubkey.toBase58()
                      )
                    }
                    onChange={(e) => {
                      let newTokenAccounts = form.tokenAccounts
                        ? [...form.tokenAccounts]
                        : []
                      if (e.target.checked) {
                        newTokenAccounts = [...newTokenAccounts, x]
                      } else {
                        newTokenAccounts = newTokenAccounts.filter(
                          (toAcc) =>
                            toAcc.pubkey.toBase58() !== x.pubkey.toBase58()
                        )
                      }
                      setForm({
                        ...form,
                        tokenAccounts: newTokenAccounts,
                      })
                    }}
                  ></Checkbox>
                </div>
              )
            })}
        </div>
      ),
    },
    {
      label: 'Token recipient',
      initialValue: '',
      name: 'fundsDestinationAccount',
      type: InstructionInputType.INPUT,
      inputType: 'text',
      hide: form?.wallet?.extensions.amount?.isZero(),
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

export default CloseMultipleTokenAccounts
