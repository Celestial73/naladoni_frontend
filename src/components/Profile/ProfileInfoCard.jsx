import { InfoList } from '@/components/Profile/InfoList.jsx';
import { colors } from '@/constants/colors.js';

export function ProfileInfoCard({ bio, items, interests, accentColor }) {
    const accent = accentColor || colors.profilePrimary;
    return (
        <div style={{
            backgroundColor: colors.white,
            borderRadius: '47px 0 47px 0',
            padding: '1.5em',
            marginTop: '2%',
            width: '90%',
            boxSizing: 'border-box',
            boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden'
        }}>
            {/* Bio text with left border */}
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch'
            }}>
                <div style={{
                    width: '3px',
                    borderRadius: '2px',
                    backgroundColor: accent,
                    flexShrink: 0
                }} />
                <div style={{
                    paddingLeft: '0.75em',
                    fontSize: '0.95em',
                    lineHeight: '1.5',
                    color: colors.textDark
                }}>
                    {bio}
                </div>
            </div>

            {/* Fun Facts */}
            <div style={{ marginTop: '1.25em', marginLeft: '-1.5em', marginRight: '-1.5em' }}>
                <InfoList items={items} />
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
                                padding: '0.45em 1em',
                                borderRadius: '20px',
                                fontSize: '0.85em',
                                fontWeight: '500',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {interest.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
