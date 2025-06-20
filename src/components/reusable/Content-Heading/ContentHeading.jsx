import React from "react";
import styles from "./content-heading.module.css";

const ContentHeading = ({
  heading,
  subHeading,
  showSubHeading = true,
  breadcrumbs,
  showBreadcrumbs = false,
  rightComponent = null,
  belowHeadingComponent = null,
}) => {
  return (
    <div className={styles.contentHeading}>
      <div className={styles.mainHeadingBlock}>
        <div className={styles.headingContainer}>
          <h1>
            {heading}{" "}
            {showBreadcrumbs && breadcrumbs && (
              <span className={styles.breadcrumbs}> &gt; {breadcrumbs}</span>
            )}
          </h1>
        </div>

        {/* Render component below heading if provided */}
        {belowHeadingComponent && (
          <div className={styles.belowHeadingComponent}>
            {belowHeadingComponent}
          </div>
        )}
      </div>
      {(showSubHeading || rightComponent) && (
        <div className={styles.subHeadingContainer}>
          {showSubHeading &&
            (typeof subHeading === "string" ? (
              <h3>{subHeading}</h3>
            ) : (
              subHeading
            ))}
          {rightComponent && (
            <div className={styles.rightComponent}>{rightComponent}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentHeading;
