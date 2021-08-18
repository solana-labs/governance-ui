import { useRouter } from 'next/router'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/solid'

const Proposal = () => {
  const router = useRouter()
  const { pk } = router.query

  const title = 'Proposal Title'
  const description = `
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed fermentum orci dolor, interdum molestie sem sodales vitae. Nulla bibendum augue id sapien consequat blandit. Nulla scelerisque id nulla iaculis dapibus. Etiam dictum tortor id lobortis fermentum. Etiam eget elit luctus, ullamcorper neque a, gravida nibh. Nunc non ipsum nunc. Sed egestas tristique arcu in finibus.

  Morbi quis dignissim turpis, sit amet facilisis velit. Suspendisse ac varius tellus. Phasellus vitae finibus eros. Praesent nec metus purus. In cursus at mauris vitae mollis. Nunc at volutpat nisi. Maecenas lacinia velit eu tortor euismod, sed finibus sem laoreet.
  
  Suspendisse dignissim sagittis mi nec porttitor. Fusce feugiat quis ipsum a cursus. Aliquam erat volutpat. Fusce a felis ultrices diam tincidunt placerat sed id lorem. Duis in convallis nisi, non posuere justo. Cras tellus lorem, malesuada ac porttitor sit amet, interdum quis orci. Nam quis odio tellus. Mauris sit amet est vitae diam efficitur pellentesque vitae sit amet est. Aliquam in quam nec dui consectetur fermentum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Ut ac ullamcorper eros, id ornare tellus. Etiam dapibus mollis urna, non imperdiet lectus lacinia at. Fusce ante est, tempus sed augue quis, ornare faucibus ipsum. Cras vitae felis eu tortor commodo hendrerit sit amet sed felis.
  `

  return (
    <>
      <Link href="/dao/MNGO">
        <a className="flex text-xl">
          <ChevronLeftIcon className="h-6 w-6 top-1 mr-1" />
          &nbsp; back
        </a>
      </Link>

      <div className="m-10">
        <h1>{title}</h1>
        <p>{description}</p>
        <span>{pk.toString()}</span>
      </div>
    </>
  )
}

export default Proposal
