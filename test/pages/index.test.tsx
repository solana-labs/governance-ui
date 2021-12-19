/**
 * @jest-environment jsdom
 */
import React from 'react'
import Home from '../../pages/index'
import { render, waitFor } from '@testing-library/react'
import singletonRouter from 'next/router'

const originalRealm = process.env.REALM

describe('Home page redirects to', () => {
  afterEach(() => {
    process.env.REALM = originalRealm
  })

  test('/realms when process.env.REALM is not set', async () => {
    delete process.env.REALM
    render(<Home />)

    await waitFor(() => {
      expect(singletonRouter).toMatchObject({
        pathname: '/realms',
      })
    })
  })

  test(`/dao/MNGO when process.env.REALM = 'MNGO'`, async () => {
    process.env.REALM = 'MNGO'
    render(<Home />)

    await waitFor(() => {
      expect(singletonRouter).toMatchObject({
        pathname: '/dao/MNGO',
      })
    })
  })

  test.todo(`/realms when process.env.REALM is not a valid realm symbol`)
})
