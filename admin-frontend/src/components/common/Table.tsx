import type { ReactNode } from 'react';
import TableActions from './TableActions';

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
    loading?: boolean;
}

function Table<T extends { id: string | number }>({
    columns,
    data = [],
    onEdit,
    onDelete,
    onView,
    loading = false,
}: TableProps<T>) {
    const getValue = (item: T, key: string): any => {
        return (item as any)[key];
    };

    // Safety check
    const safeData = Array.isArray(data) ? data : [];

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
                    {loading ? (
                        <tr>
                            <td
                                colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)}
                                className="px-6 py-8 text-center text-gray-500"
                            >
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-3">Đang tải...</span>
                                </div>
                            </td>
                        </tr>
                    ) : safeData.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)}
                                className="px-6 py-8 text-center text-gray-500"
                            >
                                Không có dữ liệu
                            </td>
                        </tr>
                    ) : (
                        safeData.map((item) => (
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
                                        <TableActions
                                            item={item}
                                            onView={onView}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                        />
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
