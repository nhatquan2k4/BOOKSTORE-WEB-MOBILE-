import { useState, useCallback, useRef, useEffect } from 'react';

interface CrudService<T, CreateDto, UpdateDto> {
    getAll: (params?: any) => Promise<{ items: T[]; totalCount: number; pageNumber: number; pageSize: number }>;
    create: (data: CreateDto) => Promise<T>;
    update: (id: string, data: UpdateDto) => Promise<T>;
    delete: (id: string) => Promise<any>;
}

interface UseCrudOperationsOptions<T> {
    entityName: string; // e.g., "tác giả", "nhà xuất bản"
    onSuccess?: (action: 'create' | 'update' | 'delete', data?: T) => void;
    onError?: (action: 'create' | 'update' | 'delete', error: any) => void;
}

export function useCrudOperations<T extends { id: string }, CreateDto = any, UpdateDto = any>(
    service: CrudService<T, CreateDto, UpdateDto>,
    options: UseCrudOperationsOptions<T>
) {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Use ref to store latest options without triggering re-renders
    const optionsRef = useRef(options);
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    const fetchItems = useCallback(async (params?: any) => {
        try {
            setLoading(true);
            setError(null);
            const response = await service.getAll(params);
            setItems(response.items);
            setTotalCount(response.totalCount);
        } catch (err: any) {
            const errorMsg = err.message || `Không thể tải danh sách ${optionsRef.current.entityName}`;
            setError(errorMsg);
            optionsRef.current.onError?.('create', err);
        } finally {
            setLoading(false);
        }
    }, [service]);

    const handleCreate = useCallback(async (data: CreateDto) => {
        try {
            const created = await service.create(data);
            optionsRef.current.onSuccess?.('create', created);
            return created;
        } catch (err: any) {
            optionsRef.current.onError?.('create', err);
            throw err;
        }
    }, [service]);

    const handleUpdate = useCallback(async (id: string, data: UpdateDto) => {
        try {
            const updated = await service.update(id, data);
            optionsRef.current.onSuccess?.('update', updated);
            return updated;
        } catch (err: any) {
            optionsRef.current.onError?.('update', err);
            throw err;
        }
    }, [service]);

    const handleDelete = useCallback(async (id: string, itemName?: string) => {
        const confirmMsg = itemName 
            ? `Bạn có chắc muốn xóa ${optionsRef.current.entityName} "${itemName}"?`
            : `Bạn có chắc muốn xóa ${optionsRef.current.entityName} này?`;
            
        if (window.confirm(confirmMsg)) {
            try {
                await service.delete(id);
                
                // Xóa item khỏi list ngay lập tức để UI cập nhật
                setItems(prevItems => prevItems.filter(item => item.id !== id));
                setTotalCount(prev => prev - 1);
                
                optionsRef.current.onSuccess?.('delete');
            } catch (err: any) {
                optionsRef.current.onError?.('delete', err);
                alert(`Không thể xóa ${optionsRef.current.entityName}`);
            }
        }
    }, [service]);

    return {
        items,
        loading,
        error,
        currentPage,
        setCurrentPage,
        totalCount,
        searchTerm,
        setSearchTerm,
        fetchItems,
        handleCreate,
        handleUpdate,
        handleDelete,
    };
}
