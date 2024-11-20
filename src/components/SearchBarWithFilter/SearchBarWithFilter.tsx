/**
 * @author Dakota Soares
 * @version 1.1
 * @description Error Popup Component
 */

import React from 'react';
import './SearchBarWithFilter.css';

interface SearchBarWithFilterProps {
  columns: string[];
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filter: string) => void;
}

const SearchBarWithFilter: React.FC<SearchBarWithFilterProps> = ({
  columns,
  onSearch,
  onFilterChange,
}) => {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search..."
        onChange={(e) => onSearch(e.target.value)}
      />
      <select
        className="search-filter-dropdown"
        onChange={(e) => onFilterChange(e.target.value)}
      >
        {columns.map((col, index) => (
          <option key={index} value={col}>
            {col}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SearchBarWithFilter;
