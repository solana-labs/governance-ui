import { ProgramAccount as AnchorProgramAccount } from '@project-serum/anchor'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PsyFinanceBurnWriterForQuote } from '@utils/uiTypes/proposalCreationTypes'
import useWallet from '@hooks/useWallet'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { NewProposalContext } from '../../../new'
import { AssetAccount } from '@utils/uiTypes/assets'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import Input from '@components/inputs/Input'
import Tooltip from '@components/Tooltip'
import { Program } from '@project-serum/anchor'
import {
  OptionMarket,
  PsyAmericanIdl,
  PSY_AMERICAN_PROGRAM_ID,
} from '@utils/instructions/PsyFinance'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { getATA } from '@utils/ataTools'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { BN } from 'bn.js'

const formReducer = (
  state: PsyFinanceBurnWriterForQuote,
  action: Partial<PsyFinanceBurnWriterForQuote>
) => ({
  ...state,
  ...action,
})

const BurnWriterTokenForQuote = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { anchorProvider, connection, wallet } = useWallet()
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const { handleSetInstructions } = useContext(NewProposalContext)
  const [options, setOptions] = useState<
    AnchorProgramAccount<OptionMarket>[] | null
  >(null)
  const governedWriterTokenAccounts = useMemo(() => {
    const _accounts: AssetAccount[] = []
    options?.forEach((option) => {
      const govWriterTokenAccount = governedTokenAccountsWithoutNfts.find(
        (gAcct) =>
          gAcct.extensions.token?.account.mint.equals(
            option.account.writerTokenMint
          )
      )
      if (govWriterTokenAccount) {
        _accounts.push(govWriterTokenAccount)
      }
    })
    return _accounts
  }, [governedTokenAccountsWithoutNfts, options])

  const [form, dispatch] = useReducer(formReducer, {
    size: 0,
    writerTokenAccount: undefined,
    quoteDestination: '',
  })

  const shouldBeGoverned = !!(index !== 0 && governance)

  const getInstruction = async () => {
    if (!form.size || !form.writerTokenAccount) {
      throw new Error('Missing input(s)')
    }
    const program = new Program(
      PsyAmericanIdl,
      PSY_AMERICAN_PROGRAM_ID,
      anchorProvider
    )

    const prerequisiteInstructions: TransactionInstruction[] = []

    const optionAccount = options?.find((_option) =>
      _option.account.writerTokenMint.equals(
        form.writerTokenAccount?.extensions.token?.account.mint ??
          PublicKey.default
      )
    )
    if (!optionAccount) {
      throw new Error('Invalid option from writer token account')
    }

    let quoteDestination
    if (form.quoteDestination) {
      quoteDestination = new PublicKey(form.quoteDestination ?? 0)
    } else {
      const { currentAddress, needToCreateAta } = await getATA({
        connection,
        receiverAddress: form.writerTokenAccount!.extensions.token!.account
          .owner,
        mintPK: optionAccount.account.quoteAssetMint,
        wallet,
      })
      if (needToCreateAta) {
        prerequisiteInstructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            optionAccount.account.quoteAssetMint,
            currentAddress,
            form.writerTokenAccount!.extensions.token!.account.owner,
            wallet?.publicKey as PublicKey
          )
        )
      }
      quoteDestination = currentAddress
    }

    const ix = program.instruction.burnWriterForQuote(new BN(form.size), {
      accounts: {
        userAuthority: form.writerTokenAccount.extensions.token!.account.owner,
        optionMarket: optionAccount.publicKey,
        writerTokenMint: optionAccount.account.writerTokenMint,
        writerTokenSrc: form.writerTokenAccount.extensions.token!.publicKey,
        quoteAssetPool: optionAccount.account.quoteAssetPool,
        writerQuoteDest: quoteDestination,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    })

    return {
      serializedInstruction: serializeInstructionToBase64(ix),
      isValid: true,
      prerequisiteInstructions,
      governance: form.writerTokenAccount?.governance,
    }
  }

  useEffect(() => {
    const program = new Program(
      PsyAmericanIdl,
      PSY_AMERICAN_PROGRAM_ID,
      anchorProvider
    )
    ;(async () => {
      const _options = (await program.account.optionMarket.all()) as
        | AnchorProgramAccount<OptionMarket>[]
        | null
      setOptions(_options)
    })()
  }, [anchorProvider])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.writerTokenAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, handleSetInstructions, index])

  return (
    <>
      <GovernedAccountSelect
        label="Writer Token source account"
        governedAccounts={governedWriterTokenAccounts}
        onChange={(value: AssetAccount) => {
          dispatch({
            writerTokenAccount: value,
          })
        }}
        value={form.writerTokenAccount}
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

      {/* Advanced configurations */}

      <Tooltip content="Address the Quote asset will be transferred to. Leaving empty will use (or create) a governed SPL token account for the tokens.">
        <Input
          label="(optional) Quote destination address"
          value={form.quoteDestination}
          onChange={(event) => {
            dispatch({
              quoteDestination: event.target.value,
            })
          }}
          type="string"
        />
      </Tooltip>
    </>
  )
}

export default BurnWriterTokenForQuote
