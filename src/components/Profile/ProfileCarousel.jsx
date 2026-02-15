import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { colors } from '@/constants/colors.js';

export function ProfileCarousel({ photos, name, age, telegram_username }) {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [copied, setCopied] = useState(false);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

    useEffect(() => {
        if (!emblaApi) return;

        const onSelect = () => {
            setCurrentPhotoIndex(emblaApi.selectedScrollSnap());
        };

        emblaApi.on('select', onSelect);

        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi]);

    const handleCopyUsername = async () => {
        if (!telegram_username) return;
        
        try {
            await navigator.clipboard.writeText(`@${telegram_username}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy username:', err);
        }
    };

    return (
        <div style={{ position: 'relative', borderRadius: '47px  0 47px 0', boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.4)' }}>
            {/* Indicator Lines at Top */}
            {photos.length > 1 && (
                <div style={{
                    position: 'absolute',
                    top: '2%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5em',
                    zIndex: 10,
                    width: `${Math.min(photos.length * 15, 60)}%`,
                }}>
                    {photos.map((_, index) => (
                        <div
                            key={index}
                            style={{
                                flex: 1,
                                height: '3px',
                                borderRadius: '2px',
                                background: index === currentPhotoIndex ? colors.white : colors.whiteTransparent,
                                transition: 'background 0.3s ease'
                            }}
                        />
                    ))}
                </div>
            )}

            <div
                className="embla"
                ref={emblaRef}
                style={{
                    overflow: 'hidden',
                    width: '100%',
                    borderRadius: '47px  0 47px 0'
                }}
            >
                <div className="embla__container" style={{ display: 'flex' }}>
                    {photos.map((photo, index) => (
                        <div
                            key={index}
                            className="embla__slide"
                            style={{
                                flex: '0 0 100%',
                                minWidth: 0
                            }}
                        >
                            <img
                                src={photo}
                                alt={`Profile ${index + 1}`}
                                style={{
                                    width: '100%',
                                    aspectRatio: '3/4',
                                    objectFit: 'cover',
                                    display: 'block'
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Name and Age */}
            {name && (
                <div style={{
                    position: 'absolute',
                    bottom: telegram_username ? '12%' : '5%',
                    left: '5%',
                    maxWidth: '70%',
                    zIndex: 10,
                    color: colors.white,
                    fontSize: '1.3em',
                    fontWeight: '600',
                    textShadow: `0 1px 4px ${colors.shadowText}`,
                    wordWrap: 'break-word'
                }}>
                    {(() => {
                        const words = name.split(' ');
                        const lastWord = words.pop();
                        return (
                            <>
                                {words.length > 0 && `${words.join(' ')} `}
                                <span style={{ whiteSpace: 'nowrap' }}>
                                    {lastWord}{age != null ? `, ${age}` : ''}
                                </span>
                            </>
                        );
                    })()}
                </div>
            )}

            {/* Telegram Username */}
            {telegram_username && (
                <div 
                    onClick={handleCopyUsername}
                    style={{
                        position: 'absolute',
                        bottom: '5%',
                        left: '5%',
                        maxWidth: '70%',
                        zIndex: 10,
                        color: colors.white,
                        fontSize: '1em',
                        fontWeight: '500',
                        textShadow: `0 1px 4px ${colors.shadowText}`,
                        wordWrap: 'break-word',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'opacity 0.2s ease'
                    }}
                >
                    {copied ? 'Скопировано!' : `@${telegram_username}`}
                </div>
            )}
        </div>
    );
}
