import Link from 'next/link'
import React from 'react'

const DemoAnnouncement = () => {
  return (
    <div className='fixed top-0 left-0 h-6 text-sm w-full bg-blue-500 text-primary-foreground z-10 flex items center gap-2 items-center justify-center text-center' >
        <p>🎉 To test the bug reporter check out the Demo application</p>
        <Link href="https://demo.catchframe.app" target='_blank' className='underline font-medium'>
            https://demo.catchframe.app
        </Link>
    </div>
  )
}

export default DemoAnnouncement