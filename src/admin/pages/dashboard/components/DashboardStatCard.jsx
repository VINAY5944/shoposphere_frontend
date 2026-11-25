function DashboardStatCard({ label, value, icon, color }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-lg text-xl ${color}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
    </article>
  );
}

export default DashboardStatCard;
