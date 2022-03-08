import {
  DEFAULT_NATIVE_SOL_MINT,
  DEFAULT_NFT_TREASURY_MINT,
} from '@components/instructions/tools'
import {
  getNativeTreasuryAddress,
  GovernanceAccountType,
} from '@solana/spl-governance'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, ParsedAccountData, PublicKey } from '@solana/web3.js'
import tokenService from '@utils/services/token'
import {
  AccountInfoGen,
  GovernedTokenAccount,
  parseTokenAccountData,
  tryGetMint,
  ukraineDaoTokenAccountsOwnerAddress,
  ukraineDAOGovPk,
} from '@utils/tokens'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import useWalletStore from 'stores/useWalletStore'
import useGovernanceAssets from './useGovernanceAssets'
import useRealm from './useRealm'

export default function handleGovernanceAssetsStore() {
  const route = useRouter()
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
    setGovernedAccounts,
  } = useGovernanceAssetsStore()
  useEffect(() => {
    if (realm) {
      setGovernancesArray(governances)
    }
    if (realm && route.pathname.includes('/params')) {
      setGovernedAccounts(connection, realm)
    }
  }, [JSON.stringify(governances), realm?.pubkey, route.pathname])
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
      //Just for ukraine dao, it will be replaced with good abstraction
      const ukraineGov = tokenGovernances.find(
        (x) => x.pubkey.toBase58() === ukraineDAOGovPk
      )
      if (ukraineGov) {
        const resp = (
          await getProgramAccountsByOwner(
            connection,
            TOKEN_PROGRAM_ID,
            new PublicKey(ukraineDaoTokenAccountsOwnerAddress),
            165,
            32
          )
        )
          .flatMap((x) => x)
          .map((x) => {
            const publicKey = x.pubkey
            const data = Buffer.from(x.account.data)
            const account = parseTokenAccountData(publicKey, data)
            return { publicKey, account }
          })
        for (const tokenAcc of resp) {
          const mint = await tryGetMint(connection, tokenAcc.account.mint)
          const obj = {
            governance: ukraineGov,
            token: tokenAcc,
            mint,
            isNft: false,
            isSol: false,
            transferAddress: tokenAcc.account.address,
            solAccount: null,
          }
          if (mint?.account.decimals) {
            governedTokenAccountsArray.push(obj)
          }
        }
      }
      await tokenService.fetchTokenPrices(
        governedTokenAccountsArray
          .filter((x) => x.mint)
          .map((x) => x.mint!.publicKey.toBase58())
      )
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

const getProgramAccountsByOwner = (
  connection: Connection,
  programId: PublicKey,
  owner: PublicKey,
  dataSize: number,
  offset: number
) => {
  return connection.getProgramAccounts(
    programId, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    {
      filters: [
        {
          dataSize: dataSize, // number of bytes
        },
        {
          memcmp: {
            offset: offset, // number of bytes
            bytes: owner.toBase58(), // base58 encoded string
          },
        },
      ],
    }
  )
}
