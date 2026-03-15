export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header skeleton */}
      <div className="text-center mb-10 animate-pulse">
        <div className="h-8 w-48 bg-forest/8 rounded-lg mx-auto mb-3" />
        <div className="h-4 w-72 bg-gray-100 rounded mx-auto" />
      </div>

      {/* Category filter skeleton */}
      <div className="flex gap-2 justify-center mb-10 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-24 bg-gray-100 rounded-full" />
        ))}
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-gray-100 rounded-2xl mb-3" />
            <div className="h-4 w-3/4 bg-gray-100 rounded mb-2" />
            <div className="h-3 w-1/2 bg-gray-50 rounded mb-3" />
            <div className="h-4 w-16 bg-forest/8 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
