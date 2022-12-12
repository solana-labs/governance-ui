import { Application } from '@verify-wallet/constants'
import VerifyPage from '@verify-wallet/components'

const MatchdayVerifyPage = () => {
  const parsedLocationHash = new URLSearchParams(
    window.location.search.substring(1)
  )

  return (
    <VerifyPage
      application={Application.MATCHDAY}
      discordCode={parsedLocationHash.get('code')}
    />
  )
}

export default MatchdayVerifyPage
