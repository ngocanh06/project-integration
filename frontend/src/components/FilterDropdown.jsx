import React from 'react';
import './FilterDropdown.css';

const FilterDropdown = ({ options, value, onChange, label }) => {
    return (
        <div className="filter-dropdown">
            {label && <label>{label}</label>}
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="">Tất cả</option>
                {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                        {opt.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default FilterDropdown;
