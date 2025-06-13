import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Check, File } from 'lucide-react';
import styles from './drag-drop.module.css';

const DragDrop = ({
    name,
    value,
    onChange,
    label,
    required,
    touched,
    accept,
    multiple = false, // Add the multiple prop (default is false)
    error,
}) => {
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState('');
    const [fileList, setFileList] = useState(value || []); // Store selected files

    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const fileInputRef = useRef(null);

    // Ensure fileList syncs with parent-provided value prop when it changes
    useEffect(() => {
        if (value) {
            setFileList(value); // Synchronize with parent value
        }
    }, [value]);

    // Handle drag and drop functionality
    const handleDragEnter = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    // const handleDragLeave = () => {
    //     setIsDragging(false);
    // };
    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const simulateUpload = (files) => {
        setIsUploading(true);
        setIsComplete(false);

        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 5;
            setProgress(currentProgress);

            if (currentProgress >= 100) {
                clearInterval(interval);
                setIsComplete(true);
                setIsUploading(false);
            }
        }, 100);
        setFileList(files);
        setFileName(files.map(file => file.name).join(', '));
    };

    // const simulateUpload = (files) => {
    //     const updatedFileList = files?.map((file) => ({
    //         file,
    //         progress: 0,
    //         isComplete: false,
    //     }));
    //     setFileList((prevList) => (multiple ? [...prevList, ...updatedFileList] : updatedFileList)); // For single file, replace the list

    //     // Simulate upload progress for each file
    //     updatedFileList.forEach((fileObj, index) => {
    //         const interval = setInterval(() => {
    //             setFileList((prevList) => {
    //                 // const newList = [];
    //                 const newList = [...prevList];
    //                 const idx = multiple ? index + prevList.length - updatedFileList.length : index; // Adjust index for multiple files
    //                 newList[idx].progress += 5;

    //                 if (newList[idx].progress >= 100) {
    //                     clearInterval(interval);
    //                     newList[idx].isComplete = true;
    //                 }

    //                 return newList;
    //             });
    //         }, 100);
    //     });
    // };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            const files = multiple ? droppedFiles : [droppedFiles[0]];
            simulateUpload(files);
            onChange({ target: { name, value: files } });
            // fileInputRef.current.files = files; // Programmatically set the dropped files in the input element
            // fileInputRef.current.files = droppedFiles; // Programmatically set the dropped files in the input element
        }
        console.log(droppedFiles, e.dataTransfer.files)
    };

    const handleFileSelect = (e) => {
        const selectedFiles = e.target.files;
        // const selectedFiles = Array.from(e.target.files);
        // if (!selectedFiles) return;
        // const value = multiple ? Array.from(selectedFiles) : selectedFiles.length > 0 ? [selectedFiles[0]] : [];
        // // console.log(name,value);
        // onChange({ target: { name, value } });
        // console.log(selectedFiles, typeof selectedFiles)

        if (selectedFiles.length > 0) {
            // const files = multiple ? selectedFiles : [selectedFiles[0]];
            const files = multiple ? Array.from(selectedFiles) : [selectedFiles[0]];
            simulateUpload(files);
            onChange({ target: { name, value: files } });
        }
    };

    const handleReset = () => {
        setProgress(0);
        setFileName('');
        setFileList([]);
        setIsComplete(false);
        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // console.log(value)
    return (
        <div className={styles.fileUpload}>
            <div
                // className={`${styles.uploadArea} ${isDragging ? styles.uploadAreaDragging : ''} ${true ? styles.uploadAreaComplete : ''}`}
                className={`${styles.uploadArea} ${isDragging ? styles.uploadAreaDragging : ''} ${isComplete ? styles.uploadAreaComplete : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className={styles.fileInput}
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    accept={accept}
                    multiple={multiple} // Support multiple file selection
                />

                {!fileName && (
                    <div className={styles.uploadPlaceholder}>
                        <Upload className={styles.uploadIcon} />
                        <p className={styles.uploadText}>
                            Drag and drop your files, or{' '}
                            <button
                                type='button'
                                onClick={() => fileInputRef.current.click()}
                                className={styles.browseButton}
                            >
                                browse
                            </button>
                        </p>
                    </div>
                )}

                {fileName && (
                    <div className={styles.fileInfo}>
                        <div className={styles.fileHeader}>
                            <div className={styles.fileHeaderBox}>
                                <File className={styles.fileIcon} />
                                <button onClick={handleReset} className={styles.resetButton}>
                                    <X />
                                </button>
                            </div>
                            <div className={styles.fileName}>{fileName}</div>
                        </div>

                        <div className={styles.progressSection}>
                            <div className={styles.progressHeader}>
                                <div>
                                    {isComplete ? (
                                        <span className={`${styles.statusBadge} ${styles.complete}`}>Complete</span>
                                    ) : (
                                        <span className={`${styles.statusBadge} ${styles.uploading}`}>Uploading</span>
                                    )}
                                </div>
                                <div className={styles.progressValue}>{progress}%</div>
                            </div>
                            <div className={styles.progressBarContainer}>
                                <div
                                    className={`${styles.progressBar} ${isComplete ? styles.progressBarComplete : ''}`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* {isComplete && (
                            <div className={styles.completeMessage}>
                                <Check className={styles.completeIcon} />
                                <span>Upload complete</span>
                            </div>
                        )} */}
                    </div>
                )}

                {/* {!fileList.length && (
                    <div className={styles.uploadPlaceholder}>
                        <Upload className={styles.uploadIcon} />
                        <p className={styles.uploadText}>
                            Drag and drop your {multiple ? 'files' : 'file'}, or{' '}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className={styles.browseButton}
                            >
                                browse
                            </button>
                        </p>
                    </div>
                )} */}

                {/* {fileList.length > 0 && (
                    <div className={styles.fileInfoContainer}>
                        {fileList.map((fileObj, index) => (
                            <div key={index} className={styles.fileInfo}>
                                <div className={styles.fileHeader}>
                                    <div className={styles.fileHeaderBox}>
                                        <File className={styles.fileIcon} />
                                        <button onClick={() => handleReset(index)} className={styles.resetButton}>
                                            <X />
                                        </button>
                                    </div>
                                    <div className={styles.fileName}>{fileObj.file.name}</div>
                                </div>

                                <div className={styles.progressSection}>
                                    <div className={styles.progressHeader}>
                                        <div>
                                            {fileObj.isComplete ? (
                                                <span className={`${styles.statusBadge} ${styles.complete}`}>Complete</span>
                                            ) : (
                                                <span className={`${styles.statusBadge} ${styles.uploading}`}>Uploading</span>
                                            )}
                                        </div>
                                        <div className={styles.progressValue}>{fileObj.progress}%</div>
                                    </div>
                                    <div className={styles.progressBarContainer}>
                                        <div
                                            className={`${styles.progressBar} ${fileObj.isComplete ? styles.progressBarComplete : ''}`}
                                            style={{ width: `${fileObj.progress}%` }}
                                        />
                                    </div>

                                </div>

                                {fileObj.isComplete && (
                                    <div className={styles.completeMessage}>
                                        <Check className={styles.completeIcon} />
                                        <span>Upload complete</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )} */}
            </div>

            {/* Error message */}
            {touched && error ? (
                <div className="error-message" style={{ marginTop: 5 }} id={name} >{error}</div>
            ) : null}
        </div>
    );
};

export default DragDrop;
