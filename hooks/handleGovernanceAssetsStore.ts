import {
  DEFAULT_NATIVE_SOL_MINT,
  DEFAULT_NFT_TREASURY_MINT,
} from '@components/instructions/tools'
import {
  getNativeTreasuryAddress,
  GovernanceAccountType,
} from '@solana/spl-governance'
import { ParsedAccountData } from '@solana/web3.js'
import { AccountInfoGen, GovernedTokenAccount } from '@utils/tokens'
import { useEffect } from 'react'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import useWalletStore from 'stores/useWalletStore'
import useGovernanceAssets from './useGovernanceAssets'
import useRealm from './useRealm'

export default function handleGovernanceAssetsStore() {
  const { governances, tokenMints, realmTokenAccounts, realm } = useRealm()
  const connection = useWalletStore((s) => s.connection.current)
  const { getGovernancesByAccountTypes } = useGovernanceAssets()
  const tokenGovernances = getGovernancesByAccountTypes([
    GovernanceAccountType.TokenGovernanceV1,
    GovernanceAccountType.TokenGovernanceV2,
  ])
  const {
    setGovernancesArray,
    setGovernedTokenAccounts,
  } = useGovernanceAssetsStore()
  useEffect(() => {
    setGovernancesArray(governances)
  }, [JSON.stringify(governances)])
  useEffect(() => {
    async function prepareTokenGovernances() {
      const governedTokenAccountsArray: GovernedTokenAccount[] = []

      for (const gov of tokenGovernances) {
        const realmTokenAccount = realmTokenAccounts.find(
          (x) =>
            x.publicKey.toBase58() === gov.account.governedAccount.toBase58()
        )
        const mint = tokenMints.find(
          (x) =>
            realmTokenAccount?.account.mint.toBase58() ===
            x.publicKey.toBase58()
        )
        const isNft = mint?.publicKey.toBase58() === DEFAULT_NFT_TREASURY_MINT
        const isSol = mint?.publicKey.toBase58() === DEFAULT_NATIVE_SOL_MINT
        let transferAddress = realmTokenAccount
          ? realmTokenAccount.publicKey
          : null
        let solAccount: null | AccountInfoGen<Buffer | ParsedAccountData> = null
        if (isNft) {
          transferAddress = gov.pubkey
        }
        if (isSol) {
          const solAddress = await getNativeTreasuryAddress(
            realm!.owner,
            gov.pubkey
          )
          transferAddress = solAddress
          const resp = await connection.getParsedAccountInfo(solAddress)
          const mintRentAmount = await connection.getMinimumBalanceForRentExemption(
            0
          )
          if (resp.value) {
            solAccount = resp.value as AccountInfoGen<
              Buffer | ParsedAccountData
            >
            solAccount.lamports =
              solAccount.lamports !== 0
                ? solAccount.lamports - mintRentAmount
                : solAccount.lamports
          }
        }
        const obj = {
          governance: gov,
          token: realmTokenAccount,
          mint,
          isNft,
          isSol,
          transferAddress,
          solAccount,
        }
        governedTokenAccountsArray.push(obj)
      }
      setGovernedTokenAccounts(governedTokenAccountsArray)
    }
    prepareTokenGovernances()
  }, [
    JSON.stringify(tokenMints),
    JSON.stringify(realmTokenAccounts),
    JSON.stringify(tokenGovernances),
    JSON.stringify(governances),
  ])
}
