import React, { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import styles from "./searchbar.module.css";

const SearchBar = ({ onSearch, ...props }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (onSearch) onSearch(value.trim());
    }, 400);
  };

  const handleSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (onSearch) onSearch(searchQuery.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };


  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className={styles.searchBarContainer} style={props.styles}>
      <input
        type="text"
        className={styles.searchInput}
        value={searchQuery}
        onChange={handleInputChange}
        placeholder="Search"
        onKeyDown={handleKeyDown}
      />
      <FiSearch className={styles.searchIcon} onClick={handleSearch} />
    </div>
  );
};

export default SearchBar;
