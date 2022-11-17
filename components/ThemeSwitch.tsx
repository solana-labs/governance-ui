// import { useEffect, useState } from 'react'
// import { useTheme } from 'next-themes'
// import { MoonIcon, SunIcon } from '@heroicons/react/outline'

// const ThemeSwitch = () => {
//   const { theme, setTheme } = useTheme()
//   const [mounted, setMounted] = useState(false)

//   useEffect(() => setMounted(true), [])

//   return mounted ? (
//     theme === 'Dark' ? (
//       <button
//         className="bg-bkg-2 default-transition flex items-center justify-center h-10 rounded-full w-10 hover:bg-bkg-3"
//         onClick={() => setTheme('Light')}
//       >
//         <SunIcon className="h-5 text-fgd-1 w-5" />
//       </button>
//     ) : (
//       <button
//         className="bg-bkg-2 default-transition flex items-center justify-center h-10 rounded-full w-10 hover:bg-bkg-3"
//         onClick={() => setTheme('Dark')}
//       >
//         <MoonIcon className="h-5 text-fgd-1 w-5" />
//       </button>
//     )
//   ) : null
// }

// export default ThemeSwitch
export {}
