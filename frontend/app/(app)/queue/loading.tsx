export default function QueueLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading queue">
      <div className="space-y-3">
        <div className="skeleton h-3 w-32" />
        <div className="skeleton h-10 w-56" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[23rem_minmax(0,1fr)]">
        <div className="skeleton h-[34rem] rounded-xl" />
        <div className="space-y-3">
          <div className="skeleton h-28 rounded-xl" />
          {[0, 1, 2, 3].map((item) => <div key={item} className="skeleton h-20 rounded-lg" />)}
        </div>
      </div>
    </div>
  );
}
