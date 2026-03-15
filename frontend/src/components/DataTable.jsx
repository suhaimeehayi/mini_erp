import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

function DataTable({ data = [], columns, actions = [], loading = false, onSort }) {

  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // =========================
  // Sort
  // =========================

  const sortedData = useMemo(() => {

    if (onSort) return data; // Sort handled by parent

    if (!sortKey) return data;

    return [...data].sort((a, b) => {

      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;

      return 0;

    });

  }, [data, sortKey, sortDirection, onSort]);

  const handleSort = (key) => {

    if (onSort) {
      const direction = sortKey === key && sortDirection === "asc" ? "desc" : "asc";
      setSortKey(key);
      setSortDirection(direction);
      onSort(key, direction);
    } else {
      if (sortKey === key) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortKey(key);
        setSortDirection("asc");
      }
    }

  };

  // =========================
  // Loading Skeleton
  // =========================

  const SkeletonRow = () => (
    <tr className="border-t">
      {columns.map((col) => (
        <td key={col.key} className="p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
      ))}
    </tr>
  );

  // =========================
  // Render Sort Icon
  // =========================

  const renderSortIcon = (key) => {

    if (sortKey !== key) return <ArrowUpDown size={14} className="text-gray-400" />;

    return sortDirection === "asc"
      ? <ArrowUp size={14} />
      : <ArrowDown size={14} />;

  };

  return (

    <div className="bg-white border rounded-xl shadow-sm">

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-50">

            <tr>

              {columns.map((col) => (

                (() => {
                  const sortKeyValue = col.sortKey || col.key;

                  return (

                    <th
                      key={col.key}
                      onClick={() => handleSort(sortKeyValue)}
                      className="p-4 text-left text-gray-900 font-semibold cursor-pointer select-none"
                    >

                      <div className="flex items-center gap-2">

                        {col.label}

                        {renderSortIcon(sortKeyValue)}

                      </div>

                    </th>
                  );
                })()

              ))}

              {actions.length > 0 && (
                <th className="p-4 text-left">
                  Action
                </th>
              )}

            </tr>

          </thead>

          <tbody>

            {loading
              ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              : sortedData.map((item) => (

                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 transition"
                >

                  {columns.map((col) => (

                    <td key={col.key} className="p-4">

                      {col.render
                        ? col.render(item)
                        : item[col.key]}

                    </td>

                  ))}

                  {actions.length > 0 && (

                    <td className="flex gap-2 p-4">

                      {actions.map((action, index) => (

                        <button
                          key={index}
                          onClick={() => action.onClick(item)}
                          className={action.className}
                        >
                          {action.label}
                        </button>

                      ))}

                    </td>

                  )}

                </tr>

              ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default DataTable;