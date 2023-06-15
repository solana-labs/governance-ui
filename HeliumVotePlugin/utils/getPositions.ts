import { BN, Program } from '@coral-xyz/anchor'
import { Metaplex } from '@metaplex-foundation/js'
import { Connection, PublicKey, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js'
import { registrarKey, positionKey } from '@helium/voter-stake-registry-sdk'
import {
  PROGRAM_ID,
  EPOCH_LENGTH,
  init,
  delegatedPositionKey,
} from '@helium/helium-sub-daos-sdk'
import { tryGetMint } from '@utils/tokens'
import { calcPositionVotingPower } from './calcPositionVotingPower'
import { HeliumVsrClient } from '../sdk/client'
import {
  Registrar,
  PositionWithMeta,
  PositionV0,
  DelegatedPositionV0,
} from '../sdk/types'
import { chunks } from '@utils/helpers'
import { HNT_MINT } from '@helium/spl-utils'

export interface GetPositionsArgs {
  realmPk: PublicKey
  walletPk: PublicKey
  communityMintPk: PublicKey
  client: HeliumVsrClient
  connection: Connection
}

export interface GetPositionsReturn {
  positions: PositionWithMeta[]
  amountLocked: BN
  votingPower: BN
}

export const getPositions = async (
  args: GetPositionsArgs
): Promise<GetPositionsReturn> => {
  const { realmPk, walletPk, communityMintPk, client, connection } = args
  const positions: PositionWithMeta[] = []
  let amountLocked = new BN(0)
  let votingPower = new BN(0)
  const clock = await connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY)
  const now = new BN(Number(clock!.data.readBigInt64LE(8 * 4)))
  const isHNT = communityMintPk.equals(HNT_MINT)
  const metaplex = new Metaplex(connection)
  const registrarPk = registrarKey(realmPk, communityMintPk)[0]
  const registrar = (await client.program.account.registrar.fetch(
    registrarPk
  )) as Registrar
  const mintCfgs = registrar.votingMints
  const mints = {}
  for (const mcfg of mintCfgs) {
    const mint = await tryGetMint(connection, mcfg.mint)
    mints[mcfg.mint.toBase58()] = mint
  }

  const nfts = (
    await metaplex.nfts().findAllByOwner({ owner: walletPk })
  ).filter((nft) => nft.collection?.address.equals(registrar.collection))
  const posKeys = nfts.map((nft) => positionKey((nft as any).mintAddress)[0])
  const positionAccInfos = (
    await Promise.all(
      chunks(posKeys, 99).map((chunk) =>
        connection.getMultipleAccountsInfo(chunk)
      )
    )
  ).flat()

  const delegatedPosKeys = posKeys.map(
    (posKey) => delegatedPositionKey(posKey)[0]
  )

  const delegatedPositionAccs = isHNT
    ? await (async () => {
        const idl = await Program.fetchIdl(PROGRAM_ID, client.program.provider)
        const hsdProgram = await init(
          client.program.provider as any,
          PROGRAM_ID,
          idl
        )

        return (
          await Promise.all(
            chunks(delegatedPosKeys, 99).map((chunk) =>
              connection.getMultipleAccountsInfo(chunk)
            )
          )
        )
          .flat()
          .map((delegatedPos) =>
            delegatedPos
              ? (hsdProgram.coder.accounts.decode(
                  'DelegatedPositionV0',
                  delegatedPos.data
                ) as DelegatedPositionV0)
              : null
          )
      })()
    : []

  positions.push(
    ...positionAccInfos.map((posAccInfo, idx) => {
      const pos = client.program.coder.accounts.decode(
        'PositionV0',
        posAccInfo!.data
      ) as PositionV0

      const isDelegated = !!delegatedPositionAccs[idx]
      const delegatedSubDao = isDelegated
        ? delegatedPositionAccs[idx]?.subDao
        : null
      const hasRewards = isDelegated
        ? delegatedPositionAccs[idx]!.lastClaimedEpoch.add(new BN(1)).lt(
            now.div(new BN(EPOCH_LENGTH))
          )
        : false

      const posVotingPower = calcPositionVotingPower({
        position: pos,
        registrar,
        unixNow: now,
      })

      amountLocked = amountLocked.add(pos.amountDepositedNative)
      votingPower = votingPower.add(posVotingPower)

      return {
        ...pos,
        pubkey: posKeys[idx],
        isDelegated,
        delegatedSubDao,
        hasRewards,
        hasGenesisMultiplier: pos.genesisEnd.gt(now),
        votingPower: posVotingPower,
        votingMint: {
          ...mintCfgs[pos.votingMintConfigIdx],
          mint: mints[mintCfgs[pos.votingMintConfigIdx].mint.toBase58()],
        },
      } as PositionWithMeta
    })
  )

  return {
    positions,
    amountLocked,
    votingPower,
  }
}
