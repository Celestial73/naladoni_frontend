import { Plus, X } from 'lucide-react';
import { colors } from '@/constants/colors.js';

const MAX_IMAGES = 3;
const CARD_WIDTH = `calc((100% - ${MAX_IMAGES - 1} * 2vw) / ${MAX_IMAGES})`;

export function PhotoEditRow({ images = [], onAddClick, onDeleteClick }) {
    const items = images.slice(0, MAX_IMAGES);
    const showAddButton = items.length < MAX_IMAGES;

    return (
        <div style={{
            display: 'flex',
            gap: '2vw',
            width: '100%',
            justifyContent: 'center'
        }}>
            {items.map((image, index) => (
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
                        src={image}
                        alt={`Image ${index + 1}`}
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
