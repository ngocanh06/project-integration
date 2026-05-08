import React from 'react';
import './SearchBar.css';

const SearchBar = ({ value, onChange, placeholder }) => {
    return (
        <div className="search-bar">
            <input 
                type="text" 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                placeholder={placeholder || "Tìm kiếm..."}
            />
            <span className="search-icon">🔍</span>
        </div>
    );
};

export default SearchBar;
