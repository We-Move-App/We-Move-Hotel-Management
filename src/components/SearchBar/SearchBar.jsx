import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';  // Import search icon from react-icons
import styles from './searchbar.module.css';

const SearchBar = ({ onSearch, ...props }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className={styles.searchBarContainer} style={props.styles}>
      <input
        type="text"
        className={styles.searchInput}
        value={searchQuery}
        onChange={handleInputChange}
        placeholder="Search..."
      />
      <FiSearch className={styles.searchIcon} onClick={handleSearch} />
    </div>
  );
};

export default SearchBar;
