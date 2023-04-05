import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PsyFinanceExerciseOption } from '@utils/uiTypes/proposalCreationTypes'
import useWalletDeprecated from '@hooks/useWalletDeprecated'
import { useContext, useEffect, useMemo, useReducer } from 'react'
import { NewProposalContext } from '../../../new'
import { AssetAccount } from '@utils/uiTypes/assets'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import Input from '@components/inputs/Input'
import { Program } from '@coral-xyz/anchor'
import {
  PsyAmericanIdl,
  PSY_AMERICAN_PROGRAM_ID,
  useGovernedOptionTokenAccounts,
  useOptionAccounts,
} from '@utils/instructions/PsyFinance'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { getATA } from '@utils/ataTools'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { BN } from 'bn.js'
import useGovernanceAssets from '@hooks/useGovernanceAssets'

const formReducer = (
  state: PsyFinanceExerciseOption,
  action: Partial<PsyFinanceExerciseOption>
) => ({
  ...state,
  ...action,
})

const ExerciseOption = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { anchorProvider, connection, wallet } = useWalletDeprecated()
  const { handleSetInstructions } = useContext(NewProposalContext)
  const options = useOptionAccounts()
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const governedOptionTokenAccounts = useGovernedOptionTokenAccounts(options)

  const [form, dispatch] = useReducer(formReducer, {
    size: 0,
    optionTokenAccount: undefined,
    quoteAssetAccount: undefined,
  })
  const selectedOptionAccount = useMemo(
    () =>
      options?.find((optionAcct) =>
        optionAcct.account.optionMint.equals(
          form.optionTokenAccount?.extensions.token?.account.mint ??
            PublicKey.default
        )
      ),
    [form.optionTokenAccount?.extensions.token?.account.mint, options]
  )
  const quoteAssetAccounts = useMemo(
    () =>
      governedTokenAccountsWithoutNfts.filter((govAcct) =>
        govAcct.extensions.token?.account.mint.equals(
          selectedOptionAccount?.account.quoteAssetMint ?? PublicKey.default
        )
      ),
    [
      governedTokenAccountsWithoutNfts,
      selectedOptionAccount?.account.quoteAssetMint,
    ]
  )

  const shouldBeGoverned = !!(index !== 0 && governance)

  const getInstruction = async () => {
    if (!form.size || !form.optionTokenAccount || !form.quoteAssetAccount) {
      throw new Error('Missing input(s)')
    }
    const program = new Program(
      PsyAmericanIdl,
      PSY_AMERICAN_PROGRAM_ID,
      anchorProvider
    )

    const prerequisiteInstructions: TransactionInstruction[] = []

    if (!selectedOptionAccount) {
      throw new Error('Invalid option from writer token account')
    }

    const {
      currentAddress: underlyingDestination,
      needToCreateAta,
    } = await getATA({
      connection,
      receiverAddress: form.optionTokenAccount!.extensions.token!.account.owner,
      mintPK: selectedOptionAccount.account.underlyingAssetMint,
      wallet,
    })
    if (needToCreateAta) {
      prerequisiteInstructions.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          selectedOptionAccount.account.underlyingAssetMint,
          underlyingDestination,
          form.optionTokenAccount!.extensions.token!.account.owner,
          wallet?.publicKey as PublicKey
        )
      )
    }

    const ix = program.instruction.exerciseOptionV2(new BN(form.size), {
      accounts: {
        userAuthority: form.optionTokenAccount.extensions.token!.account.owner,
        optionAuthority: form.optionTokenAccount.extensions.token!.account
          .owner,
        optionMarket: selectedOptionAccount.publicKey,
        optionMint: selectedOptionAccount.account.optionMint,
        exerciserOptionTokenSrc: form.optionTokenAccount.extensions.token!
          .account.address,
        underlyingAssetPool: selectedOptionAccount.account.underlyingAssetPool,
        underlyingAssetDest: underlyingDestination,
        quoteAssetPool: selectedOptionAccount.account.quoteAssetPool,
        quoteAssetSrc: form.quoteAssetAccount.extensions.token!.account.address,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    })

    return {
      serializedInstruction: serializeInstructionToBase64(ix),
      isValid: true,
      prerequisiteInstructions,
      governance: form.optionTokenAccount?.governance,
    }
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.optionTokenAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, handleSetInstructions, index])

  return (
    <>
      <GovernedAccountSelect
        label="Option Token source account"
        governedAccounts={governedOptionTokenAccounts}
        onChange={(value: AssetAccount) => {
          dispatch({
            optionTokenAccount: value,
          })
        }}
        value={form.optionTokenAccount}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
        type="token"
      />
      <GovernedAccountSelect
        label="Quote Asset source account"
        governedAccounts={quoteAssetAccounts}
        onChange={(value: AssetAccount) => {
          dispatch({
            quoteAssetAccount: value,
          })
        }}
        value={form.quoteAssetAccount}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
        type="token"
      />
      <Input
        label="Amount (must be integer)"
        value={form.size}
        type="number"
        onChange={(event) =>
          dispatch({
            size: parseInt(event.target.value),
          })
        }
      />
    </>
  )
}

export default ExerciseOption
