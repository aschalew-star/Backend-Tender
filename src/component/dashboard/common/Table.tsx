import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
}

function Table<T extends { id: number }>({ data, columns, emptyMessage = 'No data available' }: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        </div>
        <p className="text-gray-500 text-lg font-medium">{emptyMessage}</p>
        <p className="text-gray-400 text-sm mt-1">Get started by creating your first item</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wide"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item, index) => (
            <tr 
              key={item.id} 
              className="hover:bg-gray-50/50 transition-colors duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4">
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;