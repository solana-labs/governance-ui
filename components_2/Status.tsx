import NavBar from './NavBar'

type Props = { inView: boolean }

function Status({ inView }: Props) {
  return (
    <div style={{ position: 'sticky', top: 0 }}>
      <div>
        {!inView ? (
          <span role="img" aria-label="In view">
            <NavBar />
          </span>
        ) : (
          <span
            role="img"
            aria-label="Outside the viewport"
            className="absolute"
          >
            ❌
          </span>
        )}
      </div>
    </div>
  )
}

export default Status
