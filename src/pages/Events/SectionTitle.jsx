import { colors } from '@/constants/colors.js';

/**
 * SectionTitle Component
 * Reusable component for displaying section titles with customizable size and alignment
 * 
 * @param {Object} props
 * @param {string} props.children - The text content to display
 * @param {string} props.fontSize - Font size (default: '2em')
 * @param {'left' | 'right' | 'center'} props.align - Text alignment (default: 'left')
 */
export function SectionTitle({ children, fontSize = '2em', align = 'left' }) {
    // Determine margin based on alignment
    const marginStyle = align === 'left' 
        ? { marginLeft: '5%' }
        : align === 'right'
        ? { marginRight: '5%' }
        : {}; // center has no margin

    return (
        <div style={{
            ...marginStyle,
            marginBottom: '0.2em',
            position: 'relative',
            textAlign: align,
            zIndex: 1,
            fontSize,
            fontWeight: '900',
            fontFamily: "'Uni Sans', sans-serif",
            color: colors.white,
            fontStyle: "italic",
            textShadow: '3px 4px 0px rgba(0, 0, 0, 0.5)'
        }}>
            {children}
        </div>
    );
}

