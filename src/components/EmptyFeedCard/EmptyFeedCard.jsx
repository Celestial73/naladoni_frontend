import { RefreshCw } from 'lucide-react';
import { colors } from '@/constants/colors.js';

export function EmptyFeedCard({ onRefresh, onResetSkips, fetching }) {
    return (
        <div style={{
            width: '90%',
            backgroundColor: colors.white,
            borderRadius: '47px 0 47px 0',
            padding: '2em 1.5em',
            boxSizing: 'border-box',
            boxShadow: `10px 14px 0px ${colors.feedPrimaryDark}`,
            textAlign: 'center'
        }}>
            <div style={{
                fontSize: '1.8em',
                fontWeight: '900',
                fontFamily: "'Uni Sans', sans-serif",
                fontStyle: 'italic',
                color: colors.feedPrimary,
                marginBottom: '0.3em'
            }}>
                КОНЕЦ...
            </div>
            <div style={{
                fontSize: '0.95em',
                color: colors.textLight,
                lineHeight: '1.5',
                marginBottom: '1.5em'
            }}>
                Вы просмотрели все события в этом городе, или их тупо НЕТ. Загляните позже!
            </div>
            <div style={{
                display: 'flex',
                gap: '0.75em',
                justifyContent: 'center',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={onRefresh}
                    disabled={fetching}
                    style={{
                        padding: '0.8em 2em',
                        backgroundColor: colors.feedPrimary,
                        color: colors.white,
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '1em',
                        fontWeight: '700',
                        fontFamily: "'Uni Sans', sans-serif",
                        fontStyle: 'italic',
                        cursor: fetching ? 'not-allowed' : 'pointer',
                        opacity: fetching ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5em',
                        letterSpacing: '0.03em'
                    }}
                >
                    <RefreshCw size={18} />
                    {fetching ? 'ОБНОВЛЕНИЕ...' : 'ОБНОВИТЬ'}
                </button>
                <button
                    onClick={onResetSkips}
                    disabled={fetching}
                    style={{
                        padding: '0.8em 2em',
                        backgroundColor: colors.white,
                        color: colors.feedPrimary,
                        border: `2px solid ${colors.feedPrimary}`,
                        borderRadius: '16px',
                        fontSize: '1em',
                        fontWeight: '700',
                        fontFamily: "'Uni Sans', sans-serif",
                        fontStyle: 'italic',
                        cursor: fetching ? 'not-allowed' : 'pointer',
                        opacity: fetching ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5em',
                        letterSpacing: '0.03em'
                    }}
                >
                    ПОКАЗАТЬ ПРОПУЩЕННЫЕ
                </button>
            </div>
        </div>
    );
}

