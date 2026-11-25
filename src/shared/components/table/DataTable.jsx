
function DataTable({
  columns = [],
  data = [],
  rowKey = "id",
  loading = false,
  emptyMessage = "No records found",
  tableClassName = "",
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-10">
        <p className="text-sm text-gray-500">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table
        className={`w-full border-collapse text-left text-sm ${tableClassName}`}
      >
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="whitespace-nowrap px-5 py-3 font-semibold text-gray-700"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length || 1}
                className="px-5 py-10 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row[rowKey] ?? index}
                className="hover:bg-gray-50"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="whitespace-nowrap px-5 py-4 text-gray-600"
                  >
                    {column.render
                      ? column.render(row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
