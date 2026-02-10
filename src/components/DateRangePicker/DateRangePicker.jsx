import { useState, useEffect, memo, useMemo, useCallback, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { colors } from '@/constants/colors.js';
import { formatDate, normalizeDate } from '@/utils/dateFormatter.js';

/**
 * DateRangePicker Component
 * Allows users to select a date range (start and end dates)
 * 
 * @param {Date|null} startDate - Start date value (controlled)
 * @param {Date|null} endDate - End date value (controlled)
 * @param {Function} onStartDateChange - Callback when start date changes
 * @param {Function} onEndDateChange - Callback when end date changes
 * @param {Function} onClear - Optional callback when dates are cleared
 * @param {Function} onClose - Optional callback when calendar closes
 */
export const DateRangePicker = memo(function DateRangePicker({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onClear,
    onClose
}) {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState('start'); // 'start' or 'end'
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    
    // Internal state for dates being selected (not propagated until picker closes)
    const [tempStartDate, setTempStartDate] = useState(() => startDate);
    const [tempEndDate, setTempEndDate] = useState(() => endDate);
    
    // Refs must be declared at the top level, in the same order every render
    const prevStartDateRef = useRef(startDate);
    const prevEndDateRef = useRef(endDate);
    const isPropagatingRef = useRef(false);
    const prevShowDatePickerRef = useRef(false);
    const isClearingRef = useRef(false);
    
    // Sync internal state when props change externally (but not when we're propagating)
    useEffect(() => {
        if (!isPropagatingRef.current) {
            const startChanged = prevStartDateRef.current !== startDate;
            const endChanged = prevEndDateRef.current !== endDate;
            
            if (startChanged || endChanged) {
                if (startChanged) {
                    setTempStartDate(startDate);
                    prevStartDateRef.current = startDate;
                }
                if (endChanged) {
                    setTempEndDate(endDate);
                    prevEndDateRef.current = endDate;
                }
            }
        } else {
            // Update refs even when propagating to track the new values
            prevStartDateRef.current = startDate;
            prevEndDateRef.current = endDate;
        }
    }, [startDate, endDate]);

    const calendarYear = calendarMonth.getFullYear();
    const calendarMonthIndex = calendarMonth.getMonth();

    // Helper functions
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const isDateInRange = (date) => {
        // Use temp dates when picker is open, otherwise use prop dates
        const currentStart = showDatePicker ? tempStartDate : startDate;
        const currentEnd = showDatePicker ? tempEndDate : endDate;
        
        if (!currentStart && !currentEnd) return false;
        const normalizedDate = normalizeDate(date);
        if (!normalizedDate) return false;
        
        const normalizedStart = currentStart ? normalizeDate(currentStart) : null;
        const normalizedEnd = currentEnd ? normalizeDate(currentEnd) : null;
        
        if (normalizedStart && normalizedEnd) {
            return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
        } else if (normalizedStart) {
            return normalizedDate >= normalizedStart;
        } else if (normalizedEnd) {
            return normalizedDate <= normalizedEnd;
        }
        return false;
    };

    const isDateSelected = (date) => {
        // Use temp dates when picker is open, otherwise use prop dates
        const currentStart = showDatePicker ? tempStartDate : startDate;
        const currentEnd = showDatePicker ? tempEndDate : endDate;
        
        const normalizedDate = normalizeDate(date);
        if (!normalizedDate) return false;
        const normalizedStart = currentStart ? normalizeDate(currentStart) : null;
        const normalizedEnd = currentEnd ? normalizeDate(currentEnd) : null;
        return (normalizedStart && normalizedDate.getTime() === normalizedStart.getTime()) ||
               (normalizedEnd && normalizedDate.getTime() === normalizedEnd.getTime());
    };

    const handleDateClick = useCallback((day, month, year) => {
        const clickedDate = normalizeDate(new Date(year, month, day));
        
        if (datePickerMode === 'start') {
            // If end date is set and clicked date is after it, swap them
            if (tempEndDate && clickedDate > normalizeDate(tempEndDate)) {
                setTempEndDate(tempStartDate);
                setTempStartDate(clickedDate);
            } else {
                setTempStartDate(clickedDate);
            }
            setDatePickerMode('end');
        } else {
            // If start date is set and clicked date is before it, swap them
            if (tempStartDate && clickedDate < normalizeDate(tempStartDate)) {
                setTempStartDate(tempEndDate);
                setTempEndDate(clickedDate);
            } else {
                setTempEndDate(clickedDate);
            }
            // If both dates are set, close the picker
            if (tempStartDate || clickedDate) {
                setShowDatePicker(false);
            }
        }
    }, [datePickerMode, tempStartDate, tempEndDate]);
    
    // Propagate changes to parent when picker closes
    useEffect(() => {
        const wasOpen = prevShowDatePickerRef.current;
        const isNowClosed = !showDatePicker && wasOpen;
        
        prevShowDatePickerRef.current = showDatePicker;
        
        if (isNowClosed) {
            // Picker was just closed, propagate the changes
            const startChanged = tempStartDate !== startDate;
            const endChanged = tempEndDate !== endDate;
            
            if (startChanged || endChanged) {
                isPropagatingRef.current = true;
                
                // Use requestAnimationFrame to ensure this happens after render
                requestAnimationFrame(() => {
                    if (startChanged) {
                        onStartDateChange(tempStartDate);
                    }
                    if (endChanged) {
                        onEndDateChange(tempEndDate);
                    }
                    
                    // Reset flag after state updates
                    setTimeout(() => {
                        isPropagatingRef.current = false;
                    }, 0);
                });
            }
            
            // Call onClose callback when calendar closes (but not when clearing)
            if (onClose && !isClearingRef.current) {
                onClose();
            }
            // Reset clearing flag after processing
            if (isClearingRef.current) {
                isClearingRef.current = false;
            }
        }
    }, [showDatePicker, tempStartDate, tempEndDate, startDate, endDate, onStartDateChange, onEndDateChange, onClose]);

    const handleClear = () => {
        isClearingRef.current = true;
        setTempStartDate(null);
        setTempEndDate(null);
        setShowDatePicker(false);
        // Immediately propagate null values to parent so display updates right away
        onStartDateChange(null);
        onEndDateChange(null);
        // Changes will also be propagated via the useEffect when picker closes, but values are already null
        if (onClear) {
            onClear();
        }
    };

    // Memoize calendar days calculation - must be called unconditionally (Rules of Hooks)
    const calendarDays = useMemo(() => {
        const daysInMonth = getDaysInMonth(calendarMonth);
        const firstDay = getFirstDayOfMonth(calendarMonth);
        // Adjust for Monday as first day (0 = Sunday, so we shift)
        const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;
        const days = [];
        
        // Empty cells for days before month starts
        for (let i = 0; i < firstDayAdjusted; i++) {
            days.push(
                <div key={`empty-${i}`} style={{ padding: '0.5em' }} />
            );
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(calendarYear, calendarMonthIndex, day);
            const isInRange = isDateInRange(date);
            const isSelected = isDateSelected(date);
            const isToday = formatDate(date) === formatDate(new Date());
            
            days.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(day, calendarMonthIndex, calendarYear)}
                    style={{
                        padding: '0.5em',
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        backgroundColor: isSelected 
                            ? colors.feedPrimary 
                            : isInRange 
                            ? 'rgba(53, 104, 255, 0.2)' 
                            : 'transparent',
                        color: isSelected 
                            ? colors.white 
                            : isToday 
                            ? colors.feedPrimary 
                            : colors.textDark,
                        fontWeight: isSelected || isToday ? '600' : '400',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        if (!isSelected) {
                            e.currentTarget.style.backgroundColor = isInRange 
                                ? 'rgba(53, 104, 255, 0.3)' 
                                : colors.backgroundGrey;
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isSelected) {
                            e.currentTarget.style.backgroundColor = isInRange 
                                ? 'rgba(53, 104, 255, 0.2)' 
                                : 'transparent';
                        }
                    }}
                >
                    {day}
                </div>
            );
        }
        
        return days;
    }, [calendarMonth, calendarYear, calendarMonthIndex, showDatePicker, tempStartDate, tempEndDate, startDate, endDate, handleDateClick]);

    // Close date picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDatePicker && !event.target.closest('[data-date-picker]')) {
                setShowDatePicker(false);
            }
        };
        if (showDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showDatePicker]);

    return (
        <div 
            data-date-picker
            style={{
                position: 'relative',
                zIndex: 10
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6em'
            }}>
                <Calendar size={18} color={colors.feedPrimary} style={{ flexShrink: 0 }} />
                <div
                    onClick={() => {
                        const willOpen = !showDatePicker;
                        setShowDatePicker(willOpen);
                        if (willOpen) {
                            // Initialize temp dates from props when opening
                            setTempStartDate(startDate);
                            setTempEndDate(endDate);
                            setDatePickerMode('start');
                        }
                    }}
                    style={{
                        flex: 1,
                        padding: '0.6em 0.8em',
                        boxSizing: 'border-box',
                        border: `2px solid ${colors.borderGrey}`,
                        borderRadius: '10px',
                        fontSize: '0.95em',
                        cursor: 'pointer',
                        minHeight: '2.5em',
                        display: 'flex',
                        alignItems: 'center',
                        color: (showDatePicker ? (tempStartDate || tempEndDate) : (startDate || endDate)) ? colors.textDark : '#999'
                    }}
                >
                    {(() => {
                        const displayStart = showDatePicker ? tempStartDate : startDate;
                        const displayEnd = showDatePicker ? tempEndDate : endDate;
                        if (displayStart && displayEnd) {
                            return `${formatDate(displayStart)} - ${formatDate(displayEnd)}`;
                        } else if (displayStart) {
                            return `С ${formatDate(displayStart)}`;
                        } else if (displayEnd) {
                            return `До ${formatDate(displayEnd)}`;
                        }
                        return 'Выберите даты';
                    })()}
                </div>
            </div>
            {((showDatePicker ? (tempStartDate || tempEndDate) : (startDate || endDate))) && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClear();
                    }}
                    style={{
                        marginTop: '0.5em',
                        padding: '0.3em 0.6em',
                        fontSize: '0.8em',
                        backgroundColor: colors.backgroundGrey,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: colors.textDark
                    }}
                >
                    Очистить
                </button>
            )}

            {/* Date picker calendar */}
            {showDatePicker && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    right: '0',
                    marginTop: '0.5em',
                    backgroundColor: colors.white,
                    border: `2px solid ${colors.borderGrey}`,
                    borderRadius: '16px',
                    padding: '1em',
                    zIndex: 1000,
                    boxShadow: '4px 8px 0px rgba(0, 0, 0, 0.15)'
                }}>
                    {/* Calendar header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1em'
                    }}>
                        <button
                            onClick={() => {
                                setCalendarMonth(new Date(calendarYear, calendarMonthIndex - 1, 1));
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.2em',
                                cursor: 'pointer',
                                color: colors.feedPrimary,
                                padding: '0.2em 0.5em'
                            }}
                        >
                            ‹
                        </button>
                        <div style={{
                            fontSize: '1em',
                            fontWeight: '600',
                            color: colors.textDark
                        }}>
                            {new Date(calendarYear, calendarMonthIndex).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                        </div>
                        <button
                            onClick={() => {
                                setCalendarMonth(new Date(calendarYear, calendarMonthIndex + 1, 1));
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.2em',
                                cursor: 'pointer',
                                color: colors.feedPrimary,
                                padding: '0.2em 0.5em'
                            }}
                        >
                            ›
                        </button>
                    </div>

                    {/* Calendar grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '0.3em'
                    }}>
                        {/* Day headers */}
                        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, idx) => (
                            <div key={idx} style={{
                                textAlign: 'center',
                                fontSize: '0.85em',
                                fontWeight: '600',
                                color: colors.textLight,
                                padding: '0.5em'
                            }}>
                                {day}
                            </div>
                        ))}
                        
                        {/* Calendar days */}
                        {calendarDays}
                    </div>

                    {/* Mode indicator */}
                    <div style={{
                        marginTop: '1em',
                        padding: '0.5em',
                        fontSize: '0.85em',
                        color: colors.textLight,
                        textAlign: 'center'
                    }}>
                        {datePickerMode === 'start' ? 'Выберите начальную дату' : 'Выберите конечную дату'}
                    </div>
                </div>
            )}
        </div>
    );
});

