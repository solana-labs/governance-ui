import '@testing-library/jest-dom/extend-expect'
import fetch from 'node-fetch'

jest.mock('next/router', () => require('next-router-mock'))

global.fetch = fetch
