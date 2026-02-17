/**
 * ActionButton Component
 * Reusable action button with distinctive styling
 * 
 * @param {Object} props
 * @param {string} props.children - Button text/content
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {string} props.backgroundColor - Background color (default: eventPrimary)
 * @param {string} props.color - Text color (default: white)
 * @param {string} props.width - Button width (default: '100%')
 * @param {string} props.fontSize - Font size (default: '1.1em')
 * @param {string} props.borderRadius - Border radius (default: '20px 0 20px 0')
 * @param {string} props.letterSpacing - Letter spacing (optional)
 * @param {object} props.style - Additional custom styles
 */
export function ActionButton({
    children,
    onClick,
    disabled = false,
    backgroundColor,
    color = '#fff',
    width = '100%',
    fontSize = '1.1em',
    borderRadius = '20px 0 20px 0',
    letterSpacing,
    style = {},
    ...props
}) {
    const handleMouseDown = (e) => {
        if (!disabled) {
            e.currentTarget.style.transform = 'scale(0.95)';
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
                width,
                padding: '1em',
                backgroundColor,
                color,
                border: 'none',
                borderRadius,
                fontSize,
                fontWeight: '700',
                fontFamily: "'Uni Sans', sans-serif",
                fontStyle: 'italic',
                cursor: disabled ? 'not-allowed' : 'pointer',
                boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                transition: 'transform 0.1s',
                opacity: disabled ? 0.6 : 1,
                ...(letterSpacing && { letterSpacing }),
                ...style
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {children}
        </button>
    );
}

