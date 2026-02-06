import { Plus, X } from 'lucide-react';
import { colors } from '@/constants/colors.js';

const MAX_PHOTOS = 3;
const CARD_WIDTH = `calc((100% - ${MAX_PHOTOS - 1} * 2vw) / ${MAX_PHOTOS})`;

export function PhotoEditRow({ photos = [], onAddClick, onDeleteClick }) {
    const items = photos.slice(0, MAX_PHOTOS);
    const showAddButton = items.length < MAX_PHOTOS;

    return (
        <div style={{
            display: 'flex',
            gap: '2vw',
            width: '100%',
            justifyContent: 'center'
        }}>
            {items.map((photo, index) => (
                <div
                    key={index}
                    style={{
                        width: CARD_WIDTH,
                        flexShrink: 0,
                        position: 'relative',
                        aspectRatio: '3/4',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '4px 6px 0px rgba(0, 0, 0, 0.25)'
                    }}
                >
                    <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                        }}
                    />
                    <div
                        onClick={() => onDeleteClick?.(index)}
                        style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={14} color={colors.white} strokeWidth={2.5} />
                    </div>
                </div>
            ))}

            {showAddButton && (
                <div
                    onClick={onAddClick}
                    style={{
                        width: CARD_WIDTH,
                        flexShrink: 0,
                        aspectRatio: '3/4',
                        borderRadius: '16px',
                        backgroundColor: '#ccc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '4px 6px 0px rgba(0, 0, 0, 0.25)'
                    }}
                >
                    <Plus size={36} color={colors.white} strokeWidth={3} />
                </div>
            )}
        </div>
    );
}
