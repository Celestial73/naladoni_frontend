import { AnimatePresence, motion } from 'framer-motion';
import { colors } from '@/constants/colors.js';

export function MessagePopup({ isOpen, messageText, onMessageTextChange, onSend, onCancel }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100,
                        padding: '0 5%'
                    }}
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            backgroundColor: colors.white,
                            borderRadius: '47px 0 47px 0',
                            padding: '2em 1.5em',
                            width: '100%',
                            maxWidth: '400px',
                            boxShadow: `10px 14px 0px ${colors.feedPrimaryDark}`
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            fontSize: '1.4em',
                            fontWeight: '900',
                            fontFamily: "'Uni Sans', sans-serif",
                            fontStyle: 'italic',
                            color: colors.feedPrimary,
                            marginBottom: '0.3em'
                        }}>
                            СООБЩЕНИЕ
                        </div>
                        <div style={{
                            fontSize: '0.85em',
                            color: colors.textLight,
                            marginBottom: '1em',
                            lineHeight: '1.4'
                        }}>
                            Представьтесь организатору события
                        </div>

                        {/* Bio-style textarea with left border */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'stretch'
                        }}>
                            <div style={{
                                width: '3px',
                                borderRadius: '2px',
                                backgroundColor: colors.feedPrimary,
                                flexShrink: 0
                            }} />
                            <textarea
                                value={messageText}
                                onChange={(e) => onMessageTextChange(e.target.value)}
                                placeholder="Напишите сообщение..."
                                rows={4}
                                style={{
                                    flex: 1,
                                    marginLeft: '0.75em',
                                    padding: '0.6em',
                                    fontSize: '0.95em',
                                    lineHeight: '1.5',
                                    color: colors.textDark,
                                    border: `2px solid ${colors.borderGrey}`,
                                    borderRadius: '10px',
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    backgroundColor: colors.backgroundGrey,
                                    minHeight: '5em'
                                }}
                            />
                        </div>

                        {/* Action buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '0.75em',
                            marginTop: '1.5em'
                        }}>
                            <button
                                onClick={onCancel}
                                style={{
                                    flex: 1,
                                    padding: '0.8em',
                                    borderRadius: '14px',
                                    border: `2px solid ${colors.borderGrey}`,
                                    backgroundColor: colors.white,
                                    color: colors.textDark,
                                    fontSize: '0.95em',
                                    fontWeight: '700',
                                    fontFamily: "'Uni Sans', sans-serif",
                                    fontStyle: 'italic',
                                    cursor: 'pointer',
                                    boxShadow: '4px 6px 0px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                ОТМЕНА
                            </button>
                            <button
                                onClick={onSend}
                                disabled={!messageText.trim()}
                                style={{
                                    flex: 1,
                                    padding: '0.8em',
                                    borderRadius: '14px',
                                    border: 'none',
                                    backgroundColor: messageText.trim() ? colors.feedPrimary : colors.defaultChip,
                                    color: colors.white,
                                    fontSize: '0.95em',
                                    fontWeight: '700',
                                    fontFamily: "'Uni Sans', sans-serif",
                                    fontStyle: 'italic',
                                    cursor: messageText.trim() ? 'pointer' : 'not-allowed',
                                    opacity: messageText.trim() ? 1 : 0.5,
                                    boxShadow: messageText.trim()
                                        ? '4px 6px 0px rgba(0, 0, 0, 0.25)'
                                        : 'none',
                                    letterSpacing: '0.03em'
                                }}
                            >
                                ОТПРАВИТЬ
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

