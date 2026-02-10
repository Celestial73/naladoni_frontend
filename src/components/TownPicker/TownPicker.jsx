import { useState } from 'react';
import { colors } from '@/constants/colors.js';
import { RUSSIAN_CITIES } from '@/data/russianCities.js';

/**
 * TownPicker Component
 * A reusable component for selecting a town with autocomplete suggestions
 * 
 * @param {string} value - Current town value
 * @param {function} onChange - Callback when town value changes
 * @param {function} onBlur - Optional callback when input loses focus
 * @param {string} placeholder - Placeholder text for the input
 */
export function TownPicker({ value, onChange, onBlur, placeholder = "Введите город" }) {
    const [townSuggestions, setTownSuggestions] = useState([]);
    const [showTownSuggestions, setShowTownSuggestions] = useState(false);

    const handleTownChange = (newValue) => {
        onChange(newValue);

        const filtered = newValue
            ? RUSSIAN_CITIES.filter(city =>
                city.toLowerCase().startsWith(newValue.toLowerCase())
            ).slice(0, 10)
            : [];
        setTownSuggestions(filtered);
        setShowTownSuggestions(newValue.length > 0 && filtered.length > 0);
    };

    const handleTownSelect = (selectedTown) => {
        onChange(selectedTown);
        setShowTownSuggestions(false);
        setTownSuggestions([]);
        // Trigger blur callback when town is selected from dropdown
        if (onBlur) {
            // Use setTimeout to ensure the blur happens after state updates
            setTimeout(() => {
                onBlur();
            }, 0);
        }
    };

    return (
        <div style={{
            position: 'relative',
            zIndex: showTownSuggestions ? 10001 : 10,
            flex: 1,
            minWidth: 0
        }}>
            <input
                type="text"
                value={value || ''}
                onChange={(e) => handleTownChange(e.target.value)}
                onFocus={() => {
                    if (value) {
                        const filtered = RUSSIAN_CITIES.filter(city =>
                            city.toLowerCase().startsWith(value.toLowerCase())
                        ).slice(0, 10);
                        setTownSuggestions(filtered);
                        setShowTownSuggestions(filtered.length > 0);
                    }
                }}
                onBlur={(e) => {
                    setTimeout(() => setShowTownSuggestions(false), 200);
                    if (onBlur) {
                        onBlur(e);
                    }
                }}
                placeholder={placeholder}
                autoComplete="off"
                style={{
                    width: '100%',
                    padding: '0.6em 0.8em',
                    boxSizing: 'border-box',
                    border: `2px solid ${colors.borderGrey}`,
                    borderRadius: '10px',
                    fontSize: '0.95em',
                    outline: 'none',
                    fontFamily: 'inherit'
                }}
            />

            {/* Town autocomplete dropdown */}
            {showTownSuggestions && townSuggestions.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    right: '0',
                    backgroundColor: colors.white,
                    border: `2px solid ${colors.borderGrey}`,
                    borderRadius: '0 0 16px 16px',
                    marginTop: '-8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 10001,
                    boxShadow: '4px 8px 0px rgba(0, 0, 0, 0.15)',
                    opacity: 1
                }}>
                    {townSuggestions.map((city, index) => (
                        <div
                            key={index}
                            onClick={() => handleTownSelect(city)}
                            onMouseDown={(e) => e.preventDefault()}
                            style={{
                                padding: '0.75em 1.2em',
                                cursor: 'pointer',
                                borderBottom: index < townSuggestions.length - 1
                                    ? `1px solid ${colors.borderGrey}`
                                    : 'none',
                                fontSize: '0.9em',
                                color: colors.textDark,
                                fontWeight: '500',
                                transition: 'background 0.15s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = colors.backgroundGrey;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            {city}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

