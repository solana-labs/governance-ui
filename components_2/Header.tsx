export const H2 = (props) => {
  return (
    <>
      <h1 className="text-[24px] md:text-[36px] font-normal tracking-tight leading-[26.4px] md:leading-[39.6px]">
        {props.children}
      </h1>
    </>
  )
}

export default H2

export const GradientH2 = (props) => {
  return (
    <>
      <H2>
        <span className="bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] bg-clip-text text-transparent">
          {props.children}
        </span>
      </H2>
    </>
  )
}

export const H1 = (props) => {
  return (
    <>
      <h1 className="text-[40px] md:text-[70px] font-medium leading-[44px] md:leading-[70px]">
        {props.children}
      </h1>
    </>
  )
}

export const H3 = (props) => {
  return (
    <>
      <h2 className="text-[20px] md:text-[24px] font-normal leading-[22px] md:leading-[26.4px]">
        {props.children}
      </h2>
    </>
  )
}

export const H4 = (props) => {
  return (
    <>
      <h3 className="text-[16px]  md:text-[20px] font-normal leading-[17.6px] md:leading-[22px]">
        {props.children}
      </h3>
    </>
  )
}
