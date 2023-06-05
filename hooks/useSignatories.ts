import { useEffect, useState } from 'react'
import { pipe } from 'fp-ts/function'
import { matchW } from 'fp-ts/TaskEither'
import {
  Proposal,
  ProgramAccount,
  RpcContext,
  SignatoryRecord,
} from '@solana/spl-governance'

import useRpcContext from '@hooks/useRpcContext'
import { getSignatories } from '@models/proposal'
import { fromOption } from 'fp-ts/Either'
import { useRealmQuery } from './queries/realm'

export default function useSignatories(
  proposal?: Pick<ProgramAccount<Proposal>, 'pubkey'>
) {
  const { getRpcContext } = useRpcContext()
  const [signatories, setSignatories] = useState<
    ProgramAccount<SignatoryRecord>[]
  >([])
  const [context, setContext] = useState<RpcContext | null>(null)
  const realm = useRealmQuery().data?.result

  useEffect(() => {
    setContext(getRpcContext() ?? null)
  }, [getRpcContext, realm])

  useEffect(() => {
    if (context && proposal) {
      pipe(
        () =>
          getSignatories({
            connection: context.connection,
            programId: context.programId,
            proposalPk: proposal.pubkey,
          }).then(fromOption(() => new Error('Could not fetch signatories'))),
        matchW((reason) => {
          console.log(reason)
          setSignatories([])
        }, setSignatories)
      )()
    }
  }, [context, proposal])

  return signatories
}
