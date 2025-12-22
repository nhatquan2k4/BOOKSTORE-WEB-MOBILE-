import { Eye, Edit2, Trash2 } from 'lucide-react';

interface TableActionsProps<T> {
    item: T;
    onView?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
}

function TableActions<T>({ item, onView, onEdit, onDelete }: TableActionsProps<T>) {
    return (
        <div className="flex gap-2">
            {onView && (
                <button
                    onClick={() => onView(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Xem chi tiết"
                >
                    <Eye size={18} />
                </button>
            )}
            {onEdit && (
                <button
                    onClick={() => onEdit(item)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                >
                    <Edit2 size={18} />
                </button>
            )}
            {onDelete && (
                <button
                    onClick={() => onDelete(item)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa"
                >
                    <Trash2 size={18} />
                </button>
            )}
        </div>
    );
}

export default TableActions;
