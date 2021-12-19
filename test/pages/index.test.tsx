/**
 * @jest-environment jsdom
 */
import React from 'react'
import Home from '../../pages/index'
import { render } from '@testing-library/react'

describe('Home page', () => {
  it('renders', () => {
    render(<Home />)
    expect(true).toBe(true)
  })
})
