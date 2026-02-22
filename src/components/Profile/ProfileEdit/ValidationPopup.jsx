import { ActionButton } from '@/components/ActionButton/ActionButton.jsx';
import { colors } from '@/constants/colors.js';

export function ValidationPopup({ isOpen, message, onClose, accentColor }) {
    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '5%'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '700px',
                    backgroundColor: colors.white,
                    borderRadius: '24px',
                    padding: '2em 1.5em',
                    boxShadow: '0 18px 48px rgba(0, 0, 0, 0.35)',
                    textAlign: 'center'
                }}
            >
                <div style={{
                    fontSize: '1.6em',
                    fontWeight: '900',
                    marginBottom: '0.7em',
                    color: colors.textDark
                }}>
                    ВНИМАНИЕ
                </div>
                <div style={{
                    fontSize: '1.1em',
                    lineHeight: 1.5,
                    color: colors.textDark,
                    marginBottom: '1.2em'
                }}>
                    {message}
                </div>
                <ActionButton
                    onClick={onClose}
                    backgroundColor={accentColor}
                    color={colors.white}
                    width="100%"
                    fontSize="1.1em"
                    borderRadius="16px"
                >
                    Извините, пожалуйста. 
                </ActionButton>
            </div>
        </div>
    );
}
