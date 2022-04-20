const Chevron = (open) => {
  return (
    <div>
      <img
        src="/img/realms-web/icons/chevron.svg"
        className={`h-6 transition-all w-4 ${
          open ? 'transform rotate-360' : 'transform rotate-180'
        }`}
      />
    </div>
  )
}

export default Chevron
