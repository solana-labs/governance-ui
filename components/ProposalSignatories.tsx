import {
  ProgramAccount,
  Proposal,
  SignatoryRecord,
} from '@solana/spl-governance'
import { ExternalLinkIcon } from '@heroicons/react/outline'

import { getExplorerUrl } from '@components/explorer/tools'
import { abbreviateAddress } from '@utils/formatting'

interface Props {
  className?: string
  endpoint: string
  proposal: ProgramAccount<Proposal>
  signatories: ProgramAccount<SignatoryRecord>[]
}

export default function ProposalSignatories(props: Props) {
  return (
    <div className={props.className}>
      <h3>
        Signatories - {props.proposal.account.signatoriesCount} /{' '}
        {props.proposal.account.signatoriesSignedOffCount}
      </h3>
      <div>
        {props.signatories
          .filter((s) => s.account.signedOff)
          .map((s) => (
            <a
              className="flex items-center opacity-80 transition-opacity hover:opacity-100 focus:opacity-100"
              href={getExplorerUrl(props.endpoint, s.pubkey)}
              key={s.pubkey.toBase58()}
              target="_blank"
              rel="noreferrer"
            >
              {abbreviateAddress(s.pubkey)}
              <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 w-4 text-primary-light" />
            </a>
          ))}
      </div>
    </div>
  )
}
