import { useRouter } from 'next/router'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown/react-markdown.min'
import { ChevronLeftIcon } from '@heroicons/react/solid'
import useProposal from '../../hooks/useProposal'

const Proposal = () => {
  const router = useRouter()
  const { pk } = router.query

  const { proposal, description, instructions } = useProposal(pk as string)

  console.log('proposal data', { proposal, instructions })

  return (
    <>
      <Link href="/dao/MNGO">
        <a className="flex text-xl">
          <ChevronLeftIcon className="h-6 w-6 top-1 mr-1" />
          &nbsp; back
        </a>
      </Link>

      <div className="m-10">
        <h1>{proposal?.info.name}</h1>
        {description && <ReactMarkdown>{description}</ReactMarkdown>}
      </div>
    </>
  )
}

export default Proposal
