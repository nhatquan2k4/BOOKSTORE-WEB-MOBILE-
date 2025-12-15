import type { ReactNode } from 'react';

interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (value: any, item: T) => ReactNode;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onView?: (item: T) => void;
}

function Table<T extends { id: string | number }>({
    columns,
    data,
    onEdit,
    onDelete,
    onView,
}: TableProps<T>) {
    const getValue = (item: T, key: string): any => {
        return (item as any)[key];
    };

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={String(column.key)}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {column.label}
                            </th>
                        ))}
                        {(onEdit || onDelete || onView) && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length + 1}
                                className="px-6 py-8 text-center text-gray-500"
                            >
                                Không có dữ liệu
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                {columns.map((column) => (
                                    <td
                                        key={String(column.key)}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        {column.render
                                            ? column.render(getValue(item, String(column.key)), item)
                                            : getValue(item, String(column.key))}
                                    </td>
                                ))}
                                {(onEdit || onDelete || onView) && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            {onView && (
                                                <button
                                                    onClick={() => onView(item)}
                                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                                >
                                                    Xem
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(item)}
                                                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                                                >
                                                    Sửa
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(item)}
                                                    className="text-red-600 hover:text-red-900 font-medium"
                                                >
                                                    Xóa
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
