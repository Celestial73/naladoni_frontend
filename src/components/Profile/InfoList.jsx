import { colors } from '@/constants/colors.js';

export function InfoList({ items }) {
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
                            padding: '1em 2em',
                            backgroundColor: colors.backgroundGrey,
                            borderBottom: index < arr.length - 1 ? `1px solid ${colors.borderGrey}` : 'none'
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: '400', color: colors.textLight, fontSize: '0.8em', marginBottom: '0.4em' }}>{item.title}</div>
                            <div style={{ fontSize: '0.95em', color: colors.black, fontWeight: '500', lineHeight: '1.4' }}>{item.text}</div>
                        </div>
                        {item.icon && (
                            <div style={{ marginLeft: '1.5em', flexShrink: 0 }}>
                                {item.icon}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
