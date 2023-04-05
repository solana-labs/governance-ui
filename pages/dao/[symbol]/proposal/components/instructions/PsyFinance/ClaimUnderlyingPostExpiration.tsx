import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PsyFinanceClaimUnderlyingPostExpiration } from '@utils/uiTypes/proposalCreationTypes'
import useWalletDeprecated from '@hooks/useWalletDeprecated'
import { useContext, useEffect, useReducer } from 'react'
import { NewProposalContext } from '../../../new'
import { AssetAccount } from '@utils/uiTypes/assets'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import Input from '@components/inputs/Input'
import Tooltip from '@components/Tooltip'
import { Program } from '@coral-xyz/anchor'
import {
  PsyAmericanIdl,
  PSY_AMERICAN_PROGRAM_ID,
  useGovernedWriterTokenAccounts,
  useOptionAccounts,
} from '@utils/instructions/PsyFinance'
import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { getATA } from '@utils/ataTools'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { BN } from 'bn.js'

const formReducer = (
  state: PsyFinanceClaimUnderlyingPostExpiration,
  action: Partial<PsyFinanceClaimUnderlyingPostExpiration>
) => ({
  ...state,
  ...action,
})

const ClaimUnderlyingPostExpiration = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { anchorProvider, connection, wallet } = useWalletDeprecated()
  const { handleSetInstructions } = useContext(NewProposalContext)
  const options = useOptionAccounts()
  const governedWriterTokenAccounts = useGovernedWriterTokenAccounts(options)

  const [form, dispatch] = useReducer(formReducer, {
    size: 0,
    writerTokenAccount: undefined,
    underlyingDestination: '',
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

    let underlyingDestination
    if (form.underlyingDestination) {
      underlyingDestination = new PublicKey(form.underlyingDestination ?? 0)
    } else {
      const { currentAddress, needToCreateAta } = await getATA({
        connection,
        receiverAddress: form.writerTokenAccount!.extensions.token!.account
          .owner,
        mintPK: optionAccount.account.underlyingAssetMint,
        wallet,
      })
      if (needToCreateAta) {
        prerequisiteInstructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            optionAccount.account.underlyingAssetMint,
            currentAddress,
            form.writerTokenAccount!.extensions.token!.account.owner,
            wallet?.publicKey as PublicKey
          )
        )
      }
      underlyingDestination = currentAddress
    }

    const ix = program.instruction.closePostExpiration(new BN(form.size), {
      accounts: {
        userAuthority: form.writerTokenAccount.extensions.token!.account.owner,
        optionMarket: optionAccount.publicKey,
        writerTokenMint: optionAccount.account.writerTokenMint,
        writerTokenSrc: form.writerTokenAccount.extensions.token!.account
          .address,
        underlyingAssetPool: optionAccount.account.underlyingAssetPool,
        underlyingAssetDest: underlyingDestination,
        tokenProgram: TOKEN_PROGRAM_ID,
        clock: SYSVAR_CLOCK_PUBKEY,
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

      <Tooltip content="Address the Underlying asset will be transferred to. Leaving empty will use (or create) a governed SPL token account for the tokens.">
        <Input
          label="(optional) Underlying destination address"
          value={form.underlyingDestination}
          onChange={(event) => {
            dispatch({
              underlyingDestination: event.target.value,
            })
          }}
          type="string"
        />
      </Tooltip>
    </>
  )
}

export default ClaimUnderlyingPostExpiration
