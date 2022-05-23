import { useTheme } from 'next-themes'
import NotifiLogoFullDark from './NotifiLogoFullDark'
import NotifiLogoFullLight from './NotifiLogoFullLight '

const NotifiFullLogo = () => {
  const { theme } = useTheme()
  return theme === 'Dark' ? (
    <NotifiLogoFullLight height={'35'} />
  ) : (
    <NotifiLogoFullDark height={'35'} />
  )
}

export default NotifiFullLogo
