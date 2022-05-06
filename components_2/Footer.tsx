import SocialIcons from './SocialIcons'
import { ReadTheDocsButton } from './Button'
import { NavContent } from './NavBar'

export default function Footer() {
  return (
    <div className="w-full bg-[#201F27] pt-6 md:pt-12 pb-10 md:pb-12">
      <NavContent bgOverride={'bg-[#292833]'} />
      <div className="max-w-[1440px] md:mx-auto mx-4 sm:mt-4 mt-5 border-t md:px-4 border-white/20 md:border-0 ">
        <div className="inline-flex flex-wrap mt-5 md:mt-0 space-x-2 text-sm opacity-70">
          <a href="">© 2022 Realms</a>
          <span>|</span>
          <a href="">Security</a>
          <span>|</span>
          <a href="">Your Privacy</a>
          <span>|</span>
          <a href="">Terms</a>
        </div>
        <div className="flex items-center justify-between pt-7">
          <div className="md:hidden">
            <ReadTheDocsButton />
          </div>
          <div className="">
            <SocialIcons className="flex gap-x-4 md:gap-x-5" />
          </div>
        </div>
      </div>
    </div>
  )
}
