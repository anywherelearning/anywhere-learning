export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Product image skeleton */}
        <div className="animate-pulse">
          <div className="aspect-[3/4] bg-gray-100 rounded-2xl" />
        </div>

        {/* Product details skeleton */}
        <div className="animate-pulse space-y-5">
          <div className="h-3 w-28 bg-gray-100 rounded-full" />
          <div className="h-8 w-3/4 bg-gray-100 rounded-lg" />
          <div className="h-5 w-20 bg-forest/8 rounded" />
          <div className="space-y-2 pt-2">
            <div className="h-3 w-full bg-gray-50 rounded" />
            <div className="h-3 w-5/6 bg-gray-50 rounded" />
            <div className="h-3 w-4/6 bg-gray-50 rounded" />
          </div>
          <div className="h-12 w-full bg-forest/10 rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
}
