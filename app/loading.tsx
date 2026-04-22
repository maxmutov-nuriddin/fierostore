import { SkeletonBlock } from "@/components/SkeletonBlock";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <SkeletonBlock className="h-[60svh] w-full rounded-[2.4rem]" />
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <SkeletonBlock className="aspect-[4/5] w-full rounded-[2rem]" />
            <SkeletonBlock className="h-4 w-2/3" />
            <SkeletonBlock className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
