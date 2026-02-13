import { MapPin } from 'lucide-react';
import { colors } from '@/constants/colors.js';
import { TownPicker } from '@/components/TownPicker/TownPicker.jsx';
import { DateRangePicker } from '@/components/DateRangePicker/DateRangePicker.jsx';

export function FeedFilters({
    filtersEnabled,
    onToggleFilters,
    town,
    onTownChange,
    onTownBlur,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onDateRangeClear,
    onDateRangeClose
}) {
    return (
        <>
            {/* Filter toggle switch */}
            <div style={{
                width: '90%',
                marginTop: '1.2em',
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: filtersEnabled ? '0.5em' : '0'
            }}>
                <div style={{
                    backgroundColor: colors.white,
                    borderRadius: '16px',
                    padding: '0.75em 1.2em',
                    boxSizing: 'border-box',
                    boxShadow: '4px 6px 0px rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75em',
                    opacity: filtersEnabled ? 1 : 0.9
                }}>
                    <span style={{
                        fontSize: '0.95em',
                        fontWeight: '500',
                        color: colors.textDark,
                        fontFamily: "Montserrat, sans-serif",
                        fontStyle: ''
                    }}>
                        Фильтры
                    </span>
                    <div
                        onClick={onToggleFilters}
                        style={{
                            width: '48px',
                            height: '26px',
                            borderRadius: '13px',
                            backgroundColor: filtersEnabled ? colors.feedPrimary : colors.borderGrey,
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <div style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: colors.white,
                            position: 'absolute',
                            top: '2px',
                            left: filtersEnabled ? '24px' : '2px',
                            transition: 'left 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }} />
                    </div>
                </div>
            </div>

            {/* Filters container - single card */}
            {filtersEnabled && (
                <div style={{
                    width: '90%',
                    marginTop: '0.5em',
                    position: 'relative',
                    zIndex: 10
                }}>
                    <div style={{
                        backgroundColor: colors.white,
                        borderRadius: '20px 0 20px 0',
                        padding: '1em',
                        boxSizing: 'border-box',
                        boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1em'
                    }}>
                        {/* Town filter */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6em'
                        }}>
                            <MapPin size={18} color={colors.feedPrimary} style={{ flexShrink: 0 }} />
                            <TownPicker
                                value={town}
                                onChange={onTownChange}
                                onBlur={onTownBlur}
                            />
                        </div>

                        {/* Date filter */}
                        <DateRangePicker
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={onStartDateChange}
                            onEndDateChange={onEndDateChange}
                            onClear={onDateRangeClear}
                            onClose={onDateRangeClose}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

