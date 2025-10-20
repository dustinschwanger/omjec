'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import BackToTop from './BackToTop'

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return <main>{children}</main>
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <BackToTop />
    </>
  )
}
