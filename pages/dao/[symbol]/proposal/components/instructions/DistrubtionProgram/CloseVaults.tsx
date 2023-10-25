import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as yup from 'yup'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  Governance,
  SYSTEM_PROGRAM_ID,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { NewProposalContext } from '../../../new'
import InstructionForm, { InstructionInput } from '../FormCreator'
import { InstructionInputType } from '../inputInstructionType'
import {
  Distribution,
  MangoMintsRedemptionClient,
} from '@blockworks-foundation/mango-mints-redemption'
import { AnchorProvider } from '@coral-xyz/anchor'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import EmptyWallet from '@utils/Mango/listingTools'
import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js'
import { tryGetTokenAccount } from '@utils/tokens'
import Button from '@components/Button'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  Token,
} from '@solana/spl-token'
import { validateInstruction } from '@utils/instructionTools'

interface CloseVaultsForm {
  governedAccount: AssetAccount | null
  distributionNumber: number
}

type Vault = {
  publicKey: PublicKey
  amount: bigint
  mintIndex: number
  mint: PublicKey
}

const CloseVaults = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletOnePointOh()
  const { assetAccounts } = useGovernanceAssets()
  const solAccounts = assetAccounts.filter((x) => x.type === AccountType.SOL)
  const connection = useLegacyConnectionContext()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<CloseVaultsForm>({
    governedAccount: null,
    distributionNumber: 0,
  })
  const [client, setClient] = useState<MangoMintsRedemptionClient>()
  const [distribution, setDistribution] = useState<Distribution>()
  const [vaults, setVaults] = useState<{ [pubkey: string]: Vault }>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const schema = useMemo(
    () =>
      yup.object().shape({
        governedAccount: yup
          .object()
          .nullable()
          .required('Program governed account is required'),
      }),
    []
  )
  const getInstruction = useCallback(async () => {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    const mintsOfCurrentlyPushedAtaInstructions: string[] = []
    const additionalSerializedInstructions: string[] = []
    const prerequisiteInstructions: TransactionInstruction[] = []
    if (
      isValid &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey &&
      vaults
    ) {
      for (const v of Object.values(vaults)) {
        const ataAddress = await Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          v.mint,
          form.governedAccount.extensions.transferAddress!,
          true
        )

        const depositAccountInfo = await connection.current.getAccountInfo(
          ataAddress
        )
        if (
          !depositAccountInfo &&
          !mintsOfCurrentlyPushedAtaInstructions.find(
            (x) => x === v.mint.toBase58()
          )
        ) {
          // generate the instruction for creating the ATA
          prerequisiteInstructions.push(
            Token.createAssociatedTokenAccountInstruction(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              TOKEN_PROGRAM_ID,
              v.mint,
              ataAddress,
              form.governedAccount.extensions.transferAddress!,
              wallet.publicKey
            )
          )
          mintsOfCurrentlyPushedAtaInstructions.push(v.mint.toBase58())
        }

        const ix = await client?.program.methods
          .vaultClose()
          .accounts({
            distribution: distribution?.publicKey,
            vault: v.publicKey,
            mint: v.mint,
            destination: ataAddress,
            authority: form.governedAccount.extensions.transferAddress,
            systemProgram: SYSTEM_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .instruction()
        additionalSerializedInstructions.push(serializeInstructionToBase64(ix!))
      }
      serializedInstruction = ''
    }
    const obj: UiInstruction = {
      additionalSerializedInstructions,
      prerequisiteInstructions,
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }, [
    client?.program.methods,
    connection,
    distribution?.publicKey,
    form,
    schema,
    vaults,
    wallet?.publicKey,
  ])
  const handleSelectDistribution = async (number: number) => {
    const distribution = await client?.loadDistribution(number)
    setDistribution(distribution)
  }
  const fetchVaults = async () => {
    if (!client || !distribution) return
    const v: any = {}
    for (let i = 0; i < distribution.metadata!.mints.length; i++) {
      const mint = distribution.metadata!.mints[i]
      const vaultAddress = distribution.findVaultAddress(
        new PublicKey(mint.address)
      )
      try {
        const tokenAccount = await tryGetTokenAccount(
          connection.current,
          vaultAddress
        )

        v[vaultAddress.toString()] = {
          publicKey: vaultAddress,
          amount: tokenAccount?.account.amount,
          mint: tokenAccount?.account.mint,
          mintIndex: i,
        }
      } catch {
        v[vaultAddress.toString()] = { amount: -1, mintIndex: i }
      }
    }
    setVaults(v)
  }
  useEffect(() => {
    if (distribution) {
      fetchVaults()
    }
  }, [distribution])
  useEffect(() => {
    const client = new MangoMintsRedemptionClient(
      new AnchorProvider(
        connection.current,
        new EmptyWallet(Keypair.generate()),
        { skipPreflight: true }
      )
    )
    setClient(client)
  }, [])
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form, getInstruction, handleSetInstructions, index, vaults])

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
      label: 'Distribution Number',
      initialValue: form.distributionNumber,
      type: InstructionInputType.INPUT,
      additionalComponent: (
        <div>
          <Button
            onClick={() => handleSelectDistribution(form.distributionNumber)}
          >
            Load
          </Button>
        </div>
      ),
      inputType: 'number',
      name: 'distributionNumber',
    },
  ]

  return (
    <>
      {form && (
        <>
          <InstructionForm
            outerForm={form}
            setForm={setForm}
            inputs={inputs}
            setFormErrors={setFormErrors}
            formErrors={formErrors}
          ></InstructionForm>
          {distribution && vaults && (
            <div className="border-t border-th-bkg-2 px-6 py-3">
              <span className="mr-4 mb-3 flex flex-col whitespace-nowrap text-th-fgd-3">
                Vaults to close
              </span>
              <span className="flex flex-col font-mono text-th-fgd-2">
                <div>
                  {vaults
                    ? Object.entries(vaults).map(([address, vault]) => {
                        return (
                          <div key={address} className="flex justify-between">
                            <p>{address}</p>{' '}
                            <p>
                              {
                                distribution.metadata!.mints[vault.mintIndex]
                                  .properties?.name
                              }
                            </p>{' '}
                            <span>
                              {vault.amount > -1
                                ? vault.amount.toString()
                                : 'Deleted'}
                            </span>
                          </div>
                        )
                      })
                    : 'Loading...'}
                </div>
              </span>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default CloseVaults
