import Button from '@components/Button'
import AdvancedOptionsDropdown from '@components/NewRealmWizard/components/AdvancedOptionsDropdown'

interface Props {
  className?: string
}

export default function AuctionSize({ className }: Props) {
  return (
    <section className={className}>
      <h4 className="mb-3">Size</h4>
      <div className="flex space-x-3">
        <Button className="w-1/3">Small Auction</Button>
        <Button className="w-1/3">Medium Auction</Button>
        <Button className="w-1/3">Large Auction</Button>
      </div>

      <AdvancedOptionsDropdown className="mt-5">asd</AdvancedOptionsDropdown>
    </section>
  )
}
