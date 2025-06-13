import React from 'react'
import styles from './tableheader.module.css';
import SearchBar from '../SearchBar/SearchBar';

const TableHeader = () => {
    return (
        <div className={styles.tableHeaderBox}>
            {/* <div className={styles.title}>Transaction History</div> */}
            <SearchBar onSearch={(searchQuery) => { console.log(searchQuery) }} />
        </div>
    )
}

export default TableHeader