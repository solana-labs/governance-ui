import Tooltip from './Tooltip'
import {
  CheckCircleIcon,
  InformationCircleIcon,
  BanIcon,
} from '@heroicons/react/outline'

type Props = {
  progress?: number
  votesRequired?: number
  showBg?: boolean
}
type GenericProps = {
  voteKindTitle: string
  quorumTitle: string
  tooltip: string
  quorumReachedElement: JSX.Element
}

const QuorumProgress = ({
  progress,
  showBg,
  votesRequired,
  quorumTitle,
  tooltip,
  voteKindTitle,
  quorumReachedElement,
}: Props & GenericProps) => {
  return (
    <div className={`${showBg ? 'bg-bkg-1 p-3' : ''} rounded-md`}>
      <div className="flex items-center">
        <div className="w-full">
          <div className="flex items-center">
            <p className="text-fgd-2 mb-0 mr-1.5">{quorumTitle} Quorum</p>
            <Tooltip content={tooltip}>
              <InformationCircleIcon className="cursor-help h-5 text-fgd-2 w-5" />
            </Tooltip>
          </div>

          {(progress ?? 0) < 100 ? (
            <p className="font-bold mb-0 text-fgd-1">{`${(
              votesRequired ?? 0
            ).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })} ${(progress ?? 0) > 0 ? 'more' : ''} ${voteKindTitle} vote${
              (votesRequired ?? 0) > 1 ? 's' : ''
            } required`}</p>
          ) : (
            { quorumReachedElement }
          )}
        </div>
      </div>
      {/* {progress < 100 ? ( */}
      <div className="bg-bkg-4 h-2 flex flex-grow mt-2.5 rounded w-full">
        <div
          style={{
            width: `${progress}%`,
          }}
          className={`${
            (progress ?? 0) >= 100 ? 'bg-green' : 'bg-fgd-3'
          } flex rounded`}
        ></div>
      </div>
      {/* ) : null} */}
    </div>
  )
}

export const ApprovalProgress = (props: Props) => (
  <QuorumProgress
    tooltip={`Proposals must reach a minimum number of 'Yes' votes before they are eligible to pass. If the minimum is reached but there are more 'No' votes when voting ends the proposal will fail.`}
    quorumTitle="Approval"
    voteKindTitle="Yes"
    quorumReachedElement={
      <div className="flex items-center">
        <CheckCircleIcon className="flex-shrink-0 h-5 mr-1.5 text-green w-5" />
        <p className="font-bold mb-0 text-fgd-1">Required approval achieved</p>
      </div>
    }
    {...props}
  />
)

export const VetoProgress = (props: Props) => (
  <QuorumProgress
    tooltip={`This proposal can be vetoed. If the veto quorum is reached the proposal will fail regardless of the approval quorum.`}
    quorumTitle="Veto"
    voteKindTitle="Veto"
    quorumReachedElement={
      <div className="flex items-center">
        <BanIcon className="flex-shrink-0 h-5 mr-1.5 text-red w-5" />
        <p className="font-bold mb-0 text-fgd-1">Veto achieved</p>
      </div>
    }
    {...props}
  />
)
