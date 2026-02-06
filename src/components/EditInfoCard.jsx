import { EditInfoList } from '@/components/EditInfoList.jsx';
import { colors } from '@/constants/colors.js';
import { Plus } from 'lucide-react';

export function EditInfoCard({ bio, funFacts, interests, onIconClick, onAddInterest, style }) {
    return (
        <div style={{
            width: '90%',
            marginTop: '2em',
            position: 'relative',
            zIndex: 1,
            backgroundColor: colors.white,
            borderRadius: '47px 0 47px 0',
            padding: '1.5em',
            boxSizing: 'border-box',
            boxShadow: `10px 14px 0px ${colors.profilePrimaryDark}`,
            ...style
        }}>
            {/* Bio input with left border */}
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch'
            }}>
                <div style={{
                    width: '3px',
                    borderRadius: '2px',
                    backgroundColor: colors.profilePrimary,
                    flexShrink: 0
                }} />
                <textarea
                    defaultValue={bio}
                    placeholder="Расскажите о себе..."
                    rows={5}
                    style={{
                        flex: 1,
                        marginLeft: '0.75em',
                        padding: '0.5em',
                        fontSize: '0.95em',
                        lineHeight: '1.5',
                        color: colors.textDark,
                        border: `1px solid ${colors.borderGrey}`,
                        borderRadius: '8px',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        backgroundColor: colors.backgroundGrey,
                        minHeight: '5em'
                    }}
                />
            </div>

            {/* Fun Facts */}
            <div style={{ marginTop: '1.25em', marginLeft: '-1.5em', marginRight: '-1.5em' }}>
                <EditInfoList items={funFacts} onIconClick={onIconClick} />
            </div>

            {/* Interests */}
            {interests && interests.length > 0 && (
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '0.5em',
                    marginTop: '1.25em'
                }}>
                    {interests.map((interest, index) => (
                        <div
                            key={index}
                            style={{
                                backgroundColor: interest.color || colors.defaultChip,
                                color: colors.white,
                                padding: '0.3em 0.5em',
                                borderRadius: '20px',
                                fontSize: '0.85em',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <input
                                type="text"
                                defaultValue={interest.label}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    background: 'rgba(255,255,255,0.25)',
                                    color: colors.white,
                                    fontFamily: 'inherit',
                                    fontSize: '1em',
                                    fontWeight: '500',
                                    padding: '0.15em 0.5em',
                                    borderRadius: '12px',
                                    width: `${Math.max(interest.label.length * 0.6 + 1.5, 3)}em`,
                                    minWidth: '3em',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    ))}
                    <div
                        onClick={onAddInterest}
                        style={{
                            backgroundColor: '#ccc',
                            color: colors.white,
                            padding: '0.45em 1em',
                            borderRadius: '20px',
                            fontSize: '0.85em',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Plus size={16} strokeWidth={2.5} />
                    </div>
                </div>
            )}
        </div>
    );
}

