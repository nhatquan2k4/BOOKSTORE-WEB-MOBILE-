import { Edit, Trash2, Eye } from 'lucide-react';

export default function DataTable({
    columns,
    data,
    onEdit,
    onDelete,
    onView,
    loading = false
}) {
    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    if (!data || data.length === 0) {
        return <div className="no-data">Không có dữ liệu</div>;
    }

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key}>{col.label}</th>
                        ))}
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={row.id || index}>
                            {columns.map((col) => (
                                <td key={col.key}>
                                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                                </td>
                            ))}
                            <td>
                                <div className="action-buttons">
                                    {onView && (
                                        <button
                                            onClick={() => onView(row)}
                                            className="btn-icon btn-view"
                                            title="Xem"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    )}
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(row)}
                                            className="btn-icon btn-edit"
                                            title="Sửa"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(row)}
                                            className="btn-icon btn-delete"
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
