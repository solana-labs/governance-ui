export default function assertUnreachable(_: never): never {
  throw new Error('An unreachability assertion was reached')
}
