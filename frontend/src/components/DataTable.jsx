import React from 'react';
import './DataTable.css';

const getItemId = (item, index) => {
    return item.DividendID ?? item.EmployeeID ?? item.DepartmentID ?? item.PositionID ?? item.id ?? index;
};

const DataTable = ({ columns, data, selectable = true, selectedIds = [], onToggleSelect, onSelectAll }) => {
    const isAllSelected = data.length > 0 && selectedIds.length === data.length;

    return (
        <div className="table-container">
            <table className="modern-table">
                <thead>
                    <tr>
                        {selectable && (
                            <th className="checkbox-cell">
                                <input 
                                    type="checkbox" 
                                    checked={isAllSelected}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                />
                            </th>
                        )}
                        {columns.map((col) => (
                            <th key={col.key}>{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((item, index) => {
                            const itemId = getItemId(item, index);
                            const isSelected = selectedIds.includes(itemId);
                            return (
                                <tr key={itemId} style={{ backgroundColor: isSelected ? '#eff6ff' : '' }}>
                                    {selectable && (
                                        <td className="checkbox-cell">
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => onToggleSelect(itemId)}
                                            />
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td key={col.key}>
                                            {col.render ? col.render(item) : item[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ textAlign: 'center', padding: '20px' }}>
                                Không có dữ liệu
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
