export default function LecturaSkeletonCard() {
  return (
    <div className="flex gap-3 p-3 bg-white rounded-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="w-[68px] h-[88px] rounded-[12px] shrink-0 shimmer" />
      <div className="flex-1 flex flex-col gap-2 py-0.5">
        <div className="h-4 w-14 shimmer rounded-[6px]" />
        <div className="h-4 w-full shimmer rounded-[6px] mt-0.5" />
        <div className="h-4 w-4/5 shimmer rounded-[6px]" />
        <div className="h-3 w-2/5 shimmer rounded-[6px] mt-0.5" />
      </div>
    </div>
  )
}
