export default function Chevron({ props }) {
  return (
    <>
      <img
        src="/img/realms-web/icons/chevron.svg"
        className={`h-6 ml-5 mt-1 default-transition w-4 ${
          props ? 'transform' : 'rotate-180'
        }`}
      />
    </>
  )
}
