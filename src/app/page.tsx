import { Suspense } from 'react'
import HomeClient from './HomeClient'

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomeClient />
    </Suspense>
  )
}

function LoadingFallback() {
  return (
    <main className="h-screen w-screen flex items-center justify-center bg-washi-beige">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-washi-green mx-auto"></div>
        <p className="mt-4 text-washi-green font-bold">読み込み中...</p>
      </div>
    </main>
  )
}
