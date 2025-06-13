import React from 'react'
import styles from './files-list.module.css';
import { formatFileSize } from '../../../utils/helperFunctions'
import { TiDelete } from "react-icons/ti";
import { CiFileOn } from "react-icons/ci";

const FilesList = ({ files, fileProgress, removeFile, minRequiredFiles = 0 }) => {
    return (
        <>
            {
                files && files.length >= 1 && <div className={styles.filesList}>
                    {
                        minRequiredFiles && (files.length < minRequiredFiles) && <div className={styles.error}>Select at least {minRequiredFiles} files.</div>
                    }
                    {
                        files?.map((file, index) => (
                            <div key={file.name || file.fileName || file._id || index} className={styles.fileBox}>
                                <div className={styles.fileInfo}>
                                    <CiFileOn className={styles.fileIcon} />
                                    <div className={styles.fileDetails}>
                                        <p className={styles.fileName}>{file.name || file.fileName}</p>
                                        {
                                            file.name && !file.fileUrl && <p className={styles.fileSize}>{formatFileSize(file.size)}</p>
                                        }
                                        {/* {
                                        JSON.stringify(file)
                                       } */}
                                    </div>
                                </div>
                                <div className={styles.fileActions}>
                                    {
                                        fileProgress[file.name] > 0 && fileProgress[file.name] < 100 && (<div className={styles.progressContainer}>
                                            <div
                                                className={styles.progressBar}
                                                style={{ width: `${fileProgress[file.name]}%` }}
                                            />
                                        </div>)
                                    }
                                    {/* {
                                        fileProgress[file.name] >= 100 ? '' : <div className={styles.progressContainer}>
                                            <div
                                                className={styles.progressBar}
                                                style={{ width: `${fileProgress[file.name] || 0}%` }}
                                            />
                                        </div>
                                    } */}
                                    <TiDelete className={styles.deleteBtn} onClick={() => removeFile(index, file.name)} />
                                </div>
                            </div>
                        ))
                    }
                </div>
            }
        </>
    )
}

export default FilesList