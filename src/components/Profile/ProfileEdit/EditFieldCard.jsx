import { colors } from '@/constants/colors.js';

export function EditFieldCard({ title, placeholder, value, onChange, style, flipped }) {
    return (
        <div style={{
            backgroundColor: colors.white,
            borderRadius: flipped ? '0 20px 0 20px' : '20px 0 20px 0',
            padding: '1em',
            boxSizing: 'border-box',
            boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
            ...style
        }}>
            <div style={{
                fontSize: '1.2em',
                fontWeight: '700',
                fontFamily: "'Uni Sans', sans-serif",
                fontStyle: 'italic',
                color: colors.textLight,
                marginBottom: '0.5em',
                marginLeft: '0.5em'
            }}>
                {title}
            </div>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                style={{
                    width: '100%',
                    padding: '0.5em',
                    boxSizing: 'border-box',
                    border: `2px solid ${colors.borderGrey}`,
                    borderRadius: '10px',
                    fontSize: '0.9em',
                    outline: 'none',
                    fontFamily: 'inherit'
                }}
            />
        </div>
    );
}

