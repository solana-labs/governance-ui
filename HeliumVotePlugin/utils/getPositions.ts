import { BN } from '@coral-xyz/anchor'
import { keypairIdentity, Metaplex } from '@metaplex-foundation/js'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { registrarKey, positionKey } from '@helium/voter-stake-registry-sdk'
import { delegatedPositionKey } from '@helium/helium-sub-daos-sdk'
import { tryGetMint } from '@utils/tokens'
import { calcPositionVotingPower } from './calcPositionVotingPower'
import { HeliumVsrClient } from '../sdk/client'
import { Registrar, Position, PositionWithMeta } from '../sdk/types'
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
  let amountLocked: BN = new BN(0)
  let votingPower: BN = new BN(0)

  const keypair = Keypair.generate()
  const now = new BN(Math.round(new Date().getTime() / 1000))
  const metaplex = new Metaplex(connection).use(keypairIdentity(keypair))
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

  const delegatedPositionAccInfos = communityMintPk.equals(HNT_MINT)
    ? (
        await Promise.all(
          chunks(delegatedPosKeys, 99).map((chunk) =>
            connection.getMultipleAccountsInfo(chunk)
          )
        )
      ).flat()
    : []

  positions.push(
    ...positionAccInfos
      .map(
        (pos) =>
          client.program.coder.accounts.decode(
            'PositionV0',
            pos!.data
          ) as Position
      )
      .map((pos, idx) => {
        return {
          ...pos,
          pubkey: posKeys[idx],
          isDelegated: !!delegatedPositionAccInfos[idx],
          hasGenesisMultiplier: pos.genesisEnd.gt(now),
          votingPower: calcPositionVotingPower({
            position: pos,
            registrar,
          }),
          votingMint: {
            ...mintCfgs[pos.votingMintConfigIdx],
            mint: mints[mintCfgs[pos.votingMintConfigIdx].mint.toBase58()],
          },
        } as PositionWithMeta
      })
      .filter((pos) => {
        const lockup = pos.lockup
        const lockupKind = Object.keys(lockup.kind)[0]
        return ['constant', 'cliff'].includes(lockupKind)
      })
  )

  amountLocked = positions.reduce(
    (acc, pos) => acc.add(pos.amountDepositedNative),
    new BN(0)
  )

  votingPower = positions.reduce(
    (acc, pos) =>
      acc.add(
        calcPositionVotingPower({
          position: pos,
          registrar,
        })
      ),
    new BN(0)
  )

  return {
    positions,
    amountLocked,
    votingPower,
  }
}
