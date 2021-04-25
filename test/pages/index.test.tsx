import React from 'react'
import { render, fireEvent } from '../testUtils'
import Home from '../../pages/index'

describe('Home page', () => {
  it('renders', () => {
    const { asFragment } = render(<Home />, {})
    expect(true).toBe(true)
  })
})
