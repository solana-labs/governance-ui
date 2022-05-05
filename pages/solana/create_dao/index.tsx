import { useEffect } from 'react'
import { ListOfDAOTypes } from '../components/SelectDAOToCreate'
import Hero from 'components_2/Hero'
import Navbar from 'components_2/NavBar'

export default function CreateDaoPage() {
  useEffect(() => {
    if (
      typeof document !== 'undefined' &&
      document.body?.className !== 'bg-[#282933]'
    ) {
      document.body.className = 'bg-[#282933]'
    }
  })

  return (
    <div className="relative pb-20 landing-page">
      <Navbar showWalletButton />
      <Hero
        backgroundImgSrc="/1-Landing-v2/creation-bg-desktop.png"
        backgroundColor="bg-[#282933]"
      >
        <ListOfDAOTypes />
      </Hero>
    </div>
  )
}
