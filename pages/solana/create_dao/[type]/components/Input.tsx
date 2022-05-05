import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: string
  error: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = '', ...props }, ref) => {
    let className =
      'block w-full px-2 py-4 m-0 font-sans text-2xl font-light transition ease-in-out bg-transparent border-b border-solid form-control placeholder:font-sans md:text-3xl hover:bg-white/5 focus:bg-transparent bg-clip-padding text-white/90 placeholder:text-white/30 focus:text-white focus:outline-none'
    if (error) {
      className += ` border-[#cb676f]/50 focus:border-red`
    } else {
      className += ` border-white/20 focus:border-white/50`
    }

    return (
      <div>
        <input type="text" className={className} ref={ref} {...props} />
        <div
          className={`${
            error ? 'visibile' : 'invisible'
          } pt-2 text-base md:text-lg text-red`}
        >
          {error}
        </div>
      </div>
    )
  }
)

export default Input
