import Modal from "./Modal"
import Button, { SecondaryButton } from './Button'
import { useEffect, useState } from "react"
import { useRouter } from "next/router"

const TermsPopupModal = () => {
  const [openModal, setOpenModal] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])
  
  useEffect(() => {
    if (localStorage) {
      const isTermAccepted = typeof window !== "undefined" ?
        localStorage.getItem("accept-terms") === "true" :
        false
      
      if (isTermAccepted) {
        setOpenModal(false)
      }
    }
  })

  const acceptTerms = () => {
    localStorage.setItem("accept-terms", "true")
    setOpenModal(false)
  }

  const rejectTerms = () => {
    localStorage.setItem("accept-terms", "false")
    router.push("https://realms.today#terms-rejected")
  }

  return (
    <>
    {isClient && openModal ? 
      (<Modal isOpen={openModal && isClient} onClose={() => setOpenModal(false)} bgClickClose={false} hideClose={true}>
        <p className="text-justify">
          The operating entity of this site and owner of the related intellectual property has 
          changed. The new operator is Realms Today Ltd. (the New Operator). We have accordingly 
          amended the Terms and the Private Policy governing the relationship between our users 
          and the New Operator. By clicking "accept", you represent and warrant that you agree to 
          the revised Terms and Private Policy.
        </p>
        <div className="flex gap-4 mt-4 justify-center">
          <Button onClick={acceptTerms}>Accept</Button>
          <SecondaryButton onClick={rejectTerms}>Reject</SecondaryButton>
        </div>
      </Modal>) : null
      }
    </>) 
}

export default TermsPopupModal;