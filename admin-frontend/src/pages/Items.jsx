import { useState } from 'react';
import { Edit, Trash2, Eye, Plus, Search, Download, Printer, MoreVertical } from 'lucide-react';

export default function Items() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Mock data giống ảnh
    const mockItems = [
        { id: 9, itemId: 2, name: 'Mouse 3', category: 'Mouse', location: 'Room 3', quantity: 100, addedAt: '19-02-2018' },
        { id: 8, itemId: 8, name: 'Keyboard 3', category: 'Keyboard', location: 'Room 3', quantity: 100, addedAt: '19-02-2018' },
        { id: 7, itemId: 7, name: 'Monitor 3', category: 'Monitor', location: 'Room 3', quantity: 100, addedAt: '19-02-2018' },
        { id: 6, itemId: 6, name: 'Mouse 2', category: 'Mouse', location: 'Room 2', quantity: 100, addedAt: '19-02-2018' },
        { id: 5, itemId: 5, name: 'Keyboard 2', category: 'Keyboard', location: 'Room 2', quantity: 90, addedAt: '19-02-2018' },
        { id: 4, itemId: 4, name: 'Monitor 2', category: 'Monitor', location: 'Room 2', quantity: 90, addedAt: '19-02-2018' },
        { id: 3, itemId: 3, name: 'Mouse 1', category: 'Mouse', location: 'Room 1', quantity: 80, addedAt: '19-02-2018' },
        { id: 2, itemId: 2, name: 'Keyboard 1', category: 'Keyboard', location: 'Room 1', quantity: 88, addedAt: '19-02-2018' },
        { id: 1, itemId: 1, name: 'Monitor 1', category: 'Monitor', location: 'Room 1', quantity: 88, addedAt: '19-02-2018' },
    ];

    const filteredItems = mockItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="page-content">
            <div className="items-header">
                <h1 className="page-title">Items</h1>
                <div className="header-actions">
                    <button className="btn-icon" title="Export">
                        <Download size={20} />
                    </button>
                    <button className="btn-icon" title="Print">
                        <Printer size={20} />
                    </button>
                    <button className="btn-icon" title="Settings">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            <div className="table-container">
                <div className="table-header-bar">
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="table-search"
                    />
                    <button className="btn-primary">
                        <Plus size={18} />
                        Add Item
                    </button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th style={{ width: '80px' }}>Id</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Location</th>
                            <th style={{ width: '100px' }}>Quantity</th>
                            <th style={{ width: '120px' }}>Added at</th>
                            <th style={{ width: '120px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{startIndex + index + 1}</td>
                                    <td>{item.itemId}</td>
                                    <td>{item.name}</td>
                                    <td>{item.category}</td>
                                    <td>{item.location}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.addedAt}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn-icon" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button className="btn-icon" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="empty-state">
                                    <div className="empty-state-title">No items found</div>
                                    <div className="empty-state-text">Try adjusting your search</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="btn-icon"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="pagination-info">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="btn-icon"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
