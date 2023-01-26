import { BN } from '@project-serum/anchor'
import { keypairIdentity, Metaplex } from '@metaplex-foundation/js'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { registrarKey, positionKey } from '@helium/voter-stake-registry-sdk'
import { tryGetMint } from '@utils/tokens'
import { chunks } from './chunks'
import { calcPositionVotingPower } from './calcPositionVotingPower'
import { HeliumVsrClient } from '../sdk/client'
import { Registrar, Position } from '../sdk/types'

export interface GetPositionsArgs {
  realmPk: PublicKey
  walletPk: PublicKey
  communityMintPk: PublicKey
  client: HeliumVsrClient
  connection: Connection
}

export interface GetPositionsReturn {
  positions: Position[]
  amountLocked: BN
  votingPower: BN
}

export const getPositions = async (
  args: GetPositionsArgs
): Promise<GetPositionsReturn> => {
  const { realmPk, walletPk, communityMintPk, client, connection } = args
  const positions: Position[] = []
  const amountLocked: BN = new BN(0)
  const votingPower: BN = new BN(0)

  const keypair = Keypair.generate()
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

  const nfts = await metaplex.nfts().findAllByOwner({ owner: walletPk })
  const posKeys = nfts
    .filter((nft) => nft.collection?.address.equals(registrar.collection))
    .map((nft) => positionKey(nft.address)[0])

  const positionAccountInfos = (
    await Promise.all(
      chunks(posKeys, 100).map((chunk) =>
        connection.getMultipleAccountsInfo(chunk)
      )
    )
  ).flatMap((c) => c)

  positions.push(
    ...positionAccountInfos
      .map(
        (pos) =>
          client.program.coder.accounts.decode(
            'PositionV0',
            pos!.data
          ) as Position
      )
      .filter((pos) => {
        const lockup = pos.lockup
        const lockupKind = Object.keys(lockup.kind)[0]
        return ['constant', 'cliff'].includes(lockupKind)
      })
  )

  amountLocked.add(
    positions.reduce(
      (acc, pos) => acc.add(pos.amountDepositedNative),
      amountLocked
    )
  )

  votingPower.add(
    positions.reduce(
      (acc, pos) =>
        acc.add(
          calcPositionVotingPower({
            position: pos,
            registrar,
          })
        ),
      votingPower
    )
  )

  return {
    positions,
    amountLocked,
    votingPower,
  }
}
