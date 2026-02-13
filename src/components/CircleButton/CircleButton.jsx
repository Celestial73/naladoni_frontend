import { colors } from '@/constants/colors.js';

/**
 * Reusable circular floating action button component
 * 
 * @param {React.ReactNode} icon - Icon element (e.g., <Plus size={24} color={colors.eventPrimary} />)
 * @param {Function} onClick - Click handler
 * @param {boolean} disabled - Whether the button is disabled
 * @param {string} position - Position: 'top-left', 'top-right', or 'custom'
 * @param {number} size - Button size in pixels (default: 42)
 * @param {string} backgroundColor - Background color (default: white)
 * @param {object} style - Additional custom styles
 * @param {string} top - Custom top position (e.g., '1em')
 * @param {string} right - Custom right position (e.g., '1em')
 * @param {string} left - Custom left position (e.g., '1em')
 * @param {number} zIndex - Z-index value (default: 10)
 * @param {string} boxShadow - Custom box shadow (default: standard shadow)
 */
export function CircleButton({
    icon,
    onClick,
    disabled = false,
    position = 'top-right',
    size = 42,
    backgroundColor = colors.white,
    style = {},
    top,
    right,
    left,
    zIndex = 10,
    boxShadow,
    ...props
}) {
    // Default box shadow
    const defaultBoxShadow = boxShadow || (size >= 50 ? '0 4px 8px rgba(0, 0, 0, 0.25)' : '0 2px 6px rgba(0, 0, 0, 0.2)');
    
    // Determine position styles
    const positionStyles = {};
    if (position === 'top-left') {
        positionStyles.top = top || '1em';
        positionStyles.left = left || '1em';
        positionStyles.right = 'auto';
    } else if (position === 'top-right') {
        positionStyles.top = top || '1em';
        positionStyles.right = right || '1em';
        positionStyles.left = 'auto';
    } else {
        // Custom position - use provided values
        if (top !== undefined) positionStyles.top = top;
        if (right !== undefined) positionStyles.right = right;
        if (left !== undefined) positionStyles.left = left;
    }

    const handleMouseDown = (e) => {
        if (!disabled) {
            e.currentTarget.style.transform = 'scale(0.92)';
        }
    };

    const handleMouseUp = (e) => {
        e.currentTarget.style.transform = 'scale(1)';
    };

    const handleMouseLeave = (e) => {
        e.currentTarget.style.transform = 'scale(1)';
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                position: 'fixed',
                ...positionStyles,
                zIndex,
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                backgroundColor,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: disabled ? 'not-allowed' : 'pointer',
                boxShadow: defaultBoxShadow,
                opacity: disabled ? 0.6 : 1,
                transition: 'transform 0.1s',
                ...style
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {icon}
        </button>
    );
}

