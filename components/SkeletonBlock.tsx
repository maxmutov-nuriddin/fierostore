export function SkeletonBlock({
  className = ""
}: {
  className?: string;
}) {
  return <div className={`animate-pulse rounded-[1.8rem] bg-zinc-200/70 ${className}`} />;
}
