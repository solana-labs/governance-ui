import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import React, { useContext, useEffect, useReducer, useState } from 'react'
import Input from '@components/inputs/Input'
import Tooltip from '@components/Tooltip'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { AssetAccount } from '@utils/uiTypes/assets'
import {
  PsyFinanceMintAmericanOptionsForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintInfo,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { BN } from 'bn.js'
import {
  createProgram,
  deriveOptionKeyFromParams,
  getOptionByKey,
  instructions,
} from '@mithraic-labs/psy-american'
import BigNumber from 'bignumber.js'
import { tryGetMint } from '@utils/tokens'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { PSY_AMERICAN_PROGRAM_ID } from '@utils/instructions/PsyFinance'
import useWallet from '@hooks/useWallet'
import { getATA } from '@utils/ataTools'
import { getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'

const formReducer = (
  state: PsyFinanceMintAmericanOptionsForm,
  action: Partial<PsyFinanceMintAmericanOptionsForm>
) => ({
  ...state,
  ...action,
})

const MintAmericanOptions = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { anchorProvider, connection, wallet } = useWallet()
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const { handleSetInstructions } = useContext(NewProposalContext)
  const [underlyingMintInfo, setUnderlyingMintInfo] = useState<MintInfo | null>(
    null
  )
  const [form, dispatch] = useReducer(formReducer, {
    contractSize: 1,
    expirationUnixTimestamp: 0,
    optionTokenDestinationAccount: '',
    quoteMint: '',
    size: 0,
    strike: 0,
    underlyingAccount: undefined,
    underlyingMint: undefined,
    writerTokenDestinationAccount: '',
  })

  const shouldBeGoverned = !!(index !== 0 && governance)

  const getInstruction = async (): Promise<UiInstruction> => {
    if (
      !underlyingMintInfo ||
      !form.quoteMint ||
      !form.strike ||
      !form.contractSize ||
      !form.underlyingMint
    ) {
      throw Error('Missing input(s)')
    }
    const program = createProgram(PSY_AMERICAN_PROGRAM_ID, anchorProvider)
    const quoteMint = new PublicKey(form.quoteMint)
    const quoteMintInfo = await tryGetMint(connection.current, quoteMint)
    if (!quoteMintInfo) {
      throw Error('Could not find the MintInfo for the Quote asset')
    }
    const prerequisiteInstructions: TransactionInstruction[] = []

    // derive option params needed for instruction
    const underlyingAmountPerContract = getMintNaturalAmountFromDecimalAsBN(
      form.contractSize,
      underlyingMintInfo.decimals
    )
    const quoteAmountPerContract = getMintNaturalAmountFromDecimalAsBN(
      new BigNumber(form.strike).multipliedBy(form.contractSize).toNumber(),
      quoteMintInfo.account.decimals
    )
    const optionParams = {
      programId: PSY_AMERICAN_PROGRAM_ID,
      underlyingMint: form.underlyingMint,
      quoteMint,
      underlyingAmountPerContract,
      quoteAmountPerContract,
      expirationUnixTimestamp: new BN(form.expirationUnixTimestamp),
    }

    const [optionKey] = await deriveOptionKeyFromParams(optionParams)
    const optionMetadata = await getOptionByKey(program, optionKey)
    let optionMintKey = optionMetadata?.optionMint
    let writerMintKey = optionMetadata?.writerTokenMint
    let underlyingAssetPoolKey = optionMetadata?.underlyingAssetPool
    if (!optionMetadata) {
      const {
        tx,
        optionMintKey: _optionMintKey,
        writerMintKey: _writerMintKey,
        underlyingAssetPoolKey: _underlyingAssetPoolKey,
      } = await instructions.initializeOptionInstruction(program, {
        ...optionParams,
      })
      optionMintKey = _optionMintKey
      writerMintKey = _writerMintKey
      underlyingAssetPoolKey = _underlyingAssetPoolKey
      prerequisiteInstructions.push(tx)
    }

    let optionDestination
    if (form.optionTokenDestinationAccount) {
      optionDestination = new PublicKey(form.optionTokenDestinationAccount ?? 0)
    } else {
      const { currentAddress, needToCreateAta } = await getATA({
        connection,
        receiverAddress: form.underlyingAccount!.extensions.token!.account
          .owner,
        mintPK: optionMintKey!,
        wallet,
      })
      if (needToCreateAta) {
        prerequisiteInstructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            optionMintKey!,
            currentAddress,
            form.underlyingAccount!.extensions.token!.account.owner,
            wallet?.publicKey as PublicKey
          )
        )
      }
      optionDestination = currentAddress
    }

    let writerDestination
    if (form.writerTokenDestinationAccount) {
      writerDestination = new PublicKey(form.writerTokenDestinationAccount)
    } else {
      const { currentAddress, needToCreateAta } = await getATA({
        connection,
        receiverAddress: form.underlyingAccount!.extensions.token!.account
          .owner,
        mintPK: writerMintKey!,
        wallet,
      })
      if (needToCreateAta) {
        prerequisiteInstructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            writerMintKey!,
            currentAddress,
            form.underlyingAccount!.extensions.token!.account.owner,
            wallet?.publicKey as PublicKey
          )
        )
      }
      writerDestination = currentAddress
    }

    const ix = program.instruction.mintOptionV2(new BN(form.size ?? 0), {
      accounts: {
        userAuthority: form.underlyingAccount!.extensions.token!.account.owner,
        underlyingAssetMint: form.underlyingMint,
        underlyingAssetPool: underlyingAssetPoolKey!,
        underlyingAssetSrc: form.underlyingAccount!.pubkey,
        optionMint: optionMintKey!,
        mintedOptionDest: optionDestination,
        writerTokenMint: writerMintKey!,
        mintedWriterTokenDest: writerDestination,
        optionMarket: optionKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    })

    return {
      serializedInstruction: serializeInstructionToBase64(ix),
      isValid: true,
      prerequisiteInstructions,
      governance: form.underlyingAccount?.governance,
    }
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.underlyingAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, handleSetInstructions, index])

  return (
    <>
      <Tooltip content="Account that will be debited as collateral for the options.">
        <GovernedAccountSelect
          label="Underlying source account"
          governedAccounts={governedTokenAccountsWithoutNfts}
          onChange={(value: AssetAccount) => {
            dispatch({
              underlyingAccount: value,
              underlyingMint: value.extensions.mint?.publicKey,
            })
            setUnderlyingMintInfo(value.extensions.mint?.account ?? null)
          }}
          value={form.underlyingAccount}
          shouldBeGoverned={shouldBeGoverned}
          governance={governance}
          type="token"
        />
      </Tooltip>
      <Tooltip content="Mint of the asset your DAO would like to receive when an option holder exercises.">
        <Input
          label="Quote asset mint"
          value={form.quoteMint}
          onChange={(event) => {
            dispatch({
              quoteMint: event.target.value,
            })
          }}
          type="string"
        />
      </Tooltip>
      <Tooltip content="The amount collateral used to write each option (i.e. a contract for 1 SOL vs 100 SOL)">
        <Input
          label="Underlying per contract"
          value={form.contractSize}
          type="number"
          onChange={(event) =>
            dispatch({
              contractSize: parseFloat(event.target.value),
            })
          }
        />
      </Tooltip>
      <Input
        label="Strike"
        value={form.strike}
        type="number"
        onChange={(event) =>
          dispatch({
            strike: parseFloat(event.target.value),
          })
        }
      />
      <Tooltip content="Date in unix seconds for option expiration">
        <Input
          label="Expiration"
          value={form.expirationUnixTimestamp}
          type="number"
          onChange={(event) =>
            dispatch({
              expirationUnixTimestamp: parseInt(event.target.value),
            })
          }
        />
      </Tooltip>

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

      <Tooltip content="Address the option tokens will be minted to. Leaving empty will use (or create) a governed SPL token account for the options.">
        <Input
          label="(optional) Option destination address"
          value={form.optionTokenDestinationAccount}
          onChange={(event) => {
            dispatch({
              optionTokenDestinationAccount: event.target.value,
            })
          }}
          type="string"
        />
      </Tooltip>
      <Tooltip content="Address the writer tokens will be minted to. Leaving empty will use (or create) a governed SPL token account for the options.">
        <Input
          label="(optional, NOT recommended) Writer token destination address"
          value={form.writerTokenDestinationAccount}
          onChange={(event) => {
            dispatch({
              writerTokenDestinationAccount: event.target.value,
            })
          }}
          type="string"
        />
      </Tooltip>
    </>
  )
}

export default MintAmericanOptions
