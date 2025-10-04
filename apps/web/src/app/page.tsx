import { auth } from '@/auth'
import { DEFAULT_REDIRECT } from '@/lib/routes'
import { redirect } from 'next/navigation'
import React from 'react'

const HomePage =  async () => {
  const session = await auth()
  if (session) redirect(DEFAULT_REDIRECT)

  return (
    <div>HomePage</div>
  )
}

export default HomePage