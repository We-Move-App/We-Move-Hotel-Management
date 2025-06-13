import { useCallback } from "react";

/**
 * Hook to format ISO date strings to "YYYY-MM-DD".
 * @returns {Function} formatDate
 */
export function useFormattedDate() {
    const formatDate = useCallback((isoDateString) => {
        if (!isoDateString) return "";
        try {
            return new Date(isoDateString).toISOString().split("T")[0];
        } catch (error) {
            console.error("Invalid date string:", isoDateString);
            return "";
        }
    }, []);

    return formatDate;
}
