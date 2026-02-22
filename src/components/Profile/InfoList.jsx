import { colors } from '@/constants/colors.js';
import { motion } from 'framer-motion';

export function InfoList({ items }) {
    return (
        <div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
            }}>
                {items.map((item, index, arr) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
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
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
