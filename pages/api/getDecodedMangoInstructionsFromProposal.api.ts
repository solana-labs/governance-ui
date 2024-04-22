import { NextApiRequest, NextApiResponse } from 'next'
import { withSentry } from '@sentry/nextjs'
import { Connection } from '@solana/web3.js'
import {
  ProposalTransaction,
  getGovernanceAccounts,
  getProposal,
  pubkeyFilter,
} from '@solana/spl-governance'
import { PublicKey } from '@metaplex-foundation/js'
import { MANGO_V4_ID } from '@blockworks-foundation/mango-v4'
import { MANGO_BOOST_PROGRAM_ID } from '@hooks/useMangoV4'
import { getClient } from '@utils/mangoV4Tools'
import { BN, BorshInstructionCoder } from '@coral-xyz/anchor'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!process.env.BACKEND_MAINNET_RPC)
    return res.status(500).json('BACKEND_MAINNET_RPC not provided in env')
  const conn = new Connection(process.env.BACKEND_MAINNET_RPC, 'recent')

  const proposalPk = req.query.proposal
  if (!proposalPk) {
    return res.status(403).json('Please provide proposal param')
  }
  const proposal = await getProposal(conn, new PublicKey(proposalPk))
  const results = await getGovernanceAccounts(
    conn,
    proposal.owner,
    ProposalTransaction,
    [pubkeyFilter(1, proposal.pubkey)!]
  )

  const decodedMangoInstruction = await Promise.all(
    results
      .flatMap((x) => x.account.instructions)
      .filter(
        (x) =>
          x?.programId.equals(MANGO_V4_ID['mainnet-beta']) ||
          x?.programId.equals(MANGO_BOOST_PROGRAM_ID)
      )
      .map((x) => getDataObjectFlattened(conn, x.data))
  )
  console.log(decodedMangoInstruction)
  res.status(200).json([...decodedMangoInstruction])
}

export default withSentry(handler)

async function getDataObjectFlattened<T>(
  connection: Connection,
  data: Uint8Array
) {
  try {
    const client = await getClient(connection)
    const decodedInstructionData = new BorshInstructionCoder(
      client.program.idl
    ).decode(Buffer.from(data))?.data as any

    //   console.log(
    //     client.program.idl.instructions.map((ix) => {
    //       const sh = sighash('global', ix.name)
    //       return {
    //         name: ix.name,
    //         sh: `${sh[0]}${sh[1]}`,
    //       }
    //     })
    //   )

    const args = {}
    for (const key of Object.keys(decodedInstructionData)) {
      const val = decodedInstructionData[key]
      if (val !== null) {
        if (
          typeof val === 'object' &&
          !Array.isArray(val) &&
          !(val instanceof BN) &&
          !(val instanceof PublicKey)
        ) {
          for (const innerKey of Object.keys(val)) {
            const innerVal = val[innerKey]
            args[`${key}.${innerKey}`] = innerVal
          }
        } else {
          args[key] = `${val}`
        }
      }
    }
    return args as T
  } catch (e) {
    return {} as T
  }
}
