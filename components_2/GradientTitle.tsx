const GradientTitle = (props) => (
  <div>
    <h1 className="md:text-3xl font-thin">
      <span className="bg-gradient-to-r from-realms-theme-lightblue to-realms-theme-turquoise bg-clip-text text-transparent">
        {props.children}
      </span>
    </h1>
  </div>
)

export default GradientTitle

export const GradientText = (props) => (
  <span className="bg-gradient-to-r from-realms-theme-lightblue to-realms-theme-turquoise bg-clip-text text-transparent">
    {props.children}
  </span>
)
