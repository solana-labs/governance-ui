import {
  Program,
  ProgramAccount as AnchorProgramAccount,
} from '@coral-xyz/anchor'
import { useEffect, useMemo, useState } from 'react'
import useWalletDeprecated from '@hooks/useWalletDeprecated'
import { OptionMarket, PSY_AMERICAN_PROGRAM_ID } from './index'
import { PsyAmericanIdl } from './PsyAmericanIdl'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { AssetAccount } from '@utils/uiTypes/assets'

/**
 * Return entire list of PsyOption American options.
 */
export const useOptionAccounts = () => {
  const { anchorProvider } = useWalletDeprecated()
  const [options, setOptions] = useState<
    AnchorProgramAccount<OptionMarket>[] | null
  >(null)

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

  return options
}

/**
 * Governed accounts for writer tokens only.
 */
export const useGovernedWriterTokenAccounts = (
  options: AnchorProgramAccount<OptionMarket>[] | null
) => {
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  return useMemo(() => {
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
}

/**
 * Governed accounts for option tokens only.
 */
export const useGovernedOptionTokenAccounts = (
  options: AnchorProgramAccount<OptionMarket>[] | null
) => {
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  return useMemo(() => {
    const _accounts: AssetAccount[] = []
    options?.forEach((option) => {
      const govOptionTokenAccount = governedTokenAccountsWithoutNfts.find(
        (gAcct) =>
          gAcct.extensions.token?.account.mint.equals(option.account.optionMint)
      )
      if (govOptionTokenAccount) {
        _accounts.push(govOptionTokenAccount)
      }
    })
    return _accounts
  }, [governedTokenAccountsWithoutNfts, options])
}
