import '@testing-library/jest-dom/extend-expect'
import fetch from 'fetch-vcr'
import { join } from 'path'

jest.mock('next/router', () => require('next-router-mock'))

fetch.configure({
  fixturePath: join(__dirname, '__vcrs__'),
  // mode: 'record
})

global.fetch = fetch
