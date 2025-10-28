import Map from '@/components/Map/Map'

export default function Home() {
  return (
    <main className="h-screen w-screen flex flex-col">
      <header className="bg-white shadow-sm z-10 px-4 py-3 sm:px-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          まち口コミ帳
        </h1>
      </header>
      <div className="flex-1 relative">
        <Map
          className="w-full h-full"
          places={[]}
          onMarkerClick={(place) => {
            console.log('Marker clicked:', place)
          }}
        />
      </div>
    </main>
  )
}
