import { useRef, useCallback } from 'react';
import { X, Plus } from 'lucide-react';
import { colors } from '@/constants/colors.js';

function AutoResizeTextarea({ defaultValue, placeholder, onChange, style }) {
    const ref = useRef(null);

    const handleInput = useCallback((e) => {
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
        onChange?.(e);
    }, [onChange]);

    const handleRef = useCallback((el) => {
        ref.current = el;
        if (el) {
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
        }
    }, []);

    return (
        <textarea
            ref={handleRef}
            defaultValue={defaultValue}
            placeholder={placeholder}
            onInput={handleInput}
            rows={1}
            style={{
                display: 'block',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                border: `1.5px solid ${colors.borderGrey}`,
                borderRadius: '6px',
                outline: 'none',
                backgroundColor: colors.white,
                fontFamily: 'inherit',
                padding: '0.4em 0.5em',
                resize: 'none',
                overflow: 'hidden',
                ...style
            }}
        />
    );
}

export function EditInfoList({ items, onTitleChange, onTextChange, onIconClick, onDeleteItem, onAddItem }) {
    return (
        <div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
            }}>
                {items.map((item, index, arr) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.8em 1.5em',
                            backgroundColor: colors.backgroundGrey,
                            borderBottom: index < arr.length - 1 ? `1px solid ${colors.borderGrey}` : 'none'
                        }}
                    >
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4em' }}>
                            <AutoResizeTextarea
                                defaultValue={item.title}
                                placeholder="Заголовок"
                                onChange={(e) => onTitleChange?.(index, e.target.value)}
                                style={{
                                    fontWeight: '500',
                                    color: colors.textLight,
                                    fontSize: '0.8em',
                                }}
                            />
                            <AutoResizeTextarea
                                defaultValue={item.text}
                                placeholder="Описание"
                                onChange={(e) => onTextChange?.(index, e.target.value)}
                                style={{
                                    fontSize: '0.95em',
                                    color: colors.black,
                                    fontWeight: '500',
                                    lineHeight: '1.4',
                                }}
                            />
                        </div>
                        {item.icon && (
                            <div
                                onClick={() => onIconClick?.(index)}
                                style={{
                                    marginLeft: '1em',
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: `2px solid ${colors.profilePrimary}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.2s',
                                    backgroundColor: colors.white
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0 }}>
                                    {item.icon}
                                </span>
                            </div>
                        )}
                        <div
                            onClick={() => onDeleteItem?.(index)}
                            style={{
                                marginLeft: '0.6em',
                                flexShrink: 0,
                                cursor: 'pointer',
                                opacity: 0.4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <X size={18} color={colors.textDark} strokeWidth={2.5} />
                        </div>
                    </div>
                ))}
                <div
                    onClick={onAddItem}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4em',
                        padding: '0.8em 1.5em',
                        backgroundColor: colors.backgroundGrey,
                        borderTop: `1px solid ${colors.borderGrey}`,
                        cursor: 'pointer',
                        color: colors.profilePrimary,
                        fontWeight: '600',
                        fontSize: '0.9em'
                    }}
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Добавить
                </div>
            </div>
        </div>
    );
}
