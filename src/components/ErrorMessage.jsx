/**
 * ErrorMessage Component
 * Minimal, reusable error message component
 * 
 * @param {Object} props
 * @param {string} props.message - The error message to display
 * @param {string} props.width - Width of the error message (default: '90%')
 * @param {string} props.marginTop - Top margin (default: '1em')
 * @param {string} props.marginBottom - Bottom margin (optional)
 */
export function ErrorMessage({ message, width = '90%', marginTop = '1em', marginBottom }) {
    if (!message) {
        return null;
    }

    return (
        <div style={{
            width,
            marginTop,
            ...(marginBottom && { marginBottom }),
            padding: '0.75em 1em',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            color: '#c0392b',
            fontSize: '0.9em',
            fontWeight: '500',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
            {message}
        </div>
    );
}

