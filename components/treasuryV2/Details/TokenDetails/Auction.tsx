interface Props {
  className: string | undefined
}

export default function Auction(props: Props) {
  return (
    <div className={props.className}>
      <header className="mb-3">
        <div className="text-fgd-1 text-lg font-bold">Auction</div>
      </header>
      <section className="overflow-y-auto flex-grow space-y-4"></section>
    </div>
  )
}
