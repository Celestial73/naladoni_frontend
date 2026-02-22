import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X as XIcon } from 'lucide-react';
import { SectionTitle } from '@/pages/Events/SectionTitle.jsx';
import { ErrorMessage } from '@/components/ErrorMessage.jsx';
import { colors } from '@/constants/colors.js';

/**
 * PendingRequestsList Component
 * Displays a list of pending event participation requests
 * 
 * @param {Object} props
 * @param {Array} props.pendingRequests - Array of pending request objects
 * @param {string|null} props.errorRequests - Error message if any
 * @param {string|null} props.processingAction - ID of currently processing action
 * @param {Function} props.onAcceptRequest - Handler for accepting a request
 * @param {Function} props.onRejectRequest - Handler for rejecting a request
 */
export function PendingRequestsList({
    pendingRequests,
    errorRequests,
    processingAction,
    onAcceptRequest,
    onRejectRequest
}) {
    const navigate = useNavigate();

    return (
        <div style={{
            width: '90%',
            marginTop: '2em',
            position: 'relative',
            zIndex: 1
        }}>
            <div style={{
                width: '100%',
                marginBottom: '1em',
                position: 'relative'
            }}>
                <SectionTitle align="left" fontSize="2em">
                    ЗАПРОСЫ НА УЧАСТИЕ
                    {pendingRequests.length > 0 && (
                        <span style={{
                            marginLeft: '0.5em',
                            fontSize: '0.8em',
                            backgroundColor: colors.white,
                            color: colors.eventPrimary,
                            padding: '0.2em 0.6em',
                            borderRadius: '12px',
                            textShadow: 'none'
                        }}>
                            {pendingRequests.length}
                        </span>
                    )}
                </SectionTitle>
            </div>

            {errorRequests && (
                <ErrorMessage message={errorRequests} width="100%" marginTop="0" marginBottom="1em" />
            )}

            {pendingRequests.length > 0 ? (
                <div style={{
                    width: '100%',
                    backgroundColor: colors.white,
                    borderRadius: '20px 0 20px 0',
                    boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                    overflow: 'hidden'
                }}>
                    {pendingRequests.map((request, index) => {
                        // Extract user and profile from new API structure
                        const user = request.user || {};
                        const profile = request.profile || {};
                        const profileUser = profile.user || {};
                        
                        // Get display name from profile
                        const userName = profile.profile_name || profileUser.telegram_name || user.telegram_username || 'Пользователь';
                        
                        // Get avatar - prefer profile images, then profile.user.image_url
                        const userAvatar = (profile.images && profile.images[0]) || profileUser.image_url || profile.image_url || null;
                        
                        const isProcessing = processingAction === request.id;

                        return (
                            <motion.div
                                key={request.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                style={{
                                    padding: '1.2em',
                                    borderBottom: index < pendingRequests.length - 1 ? `1px solid ${colors.borderGrey}` : 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1em'
                                }}
                            >
                                {/* User Info - Clickable */}
                                <div 
                                    onClick={() => {
                                        // Map user data to profile format from new API structure
                                        const userData = {
                                            profile_name: profile.profile_name || profileUser.telegram_name || 'Пользователь',
                                            age: profile.age,
                                            images: profile.images || (profileUser.image_url ? [profileUser.image_url] : []) || [],
                                            bio: profile.bio || '',
                                            interests: profile.interests || [],
                                            custom_fields: profile.custom_fields || [],
                                            background_color: profile.background_color,
                                            telegram_username: user.telegram_username || profileUser.telegram_username || null,
                                        };
                                        
                                        // Use user ID from request.user.id
                                        const userId = user.id || profileUser.id || `user-${Date.now()}`;
                                        navigate(`/user/${userId}`, { state: { userData } });
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1em',
                                        cursor: 'pointer',
                                        transition: 'opacity 0.15s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '0.8';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                >
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        backgroundColor: colors.backgroundGrey
                                    }}>
                                        {userAvatar ? (
                                            <img
                                                src={userAvatar}
                                                alt={userName}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: colors.textLight,
                                                fontSize: '24px',
                                                fontWeight: '700'
                                            }}>
                                                {(userName || '?')[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '1em',
                                            fontWeight: '600',
                                            color: colors.textDark,
                                            marginBottom: '0.2em',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {userName}
                                        </div>
                                        {request.text && (
                                            <div style={{
                                                fontSize: '0.9em',
                                                color: colors.textLight,
                                                lineHeight: '1.4',
                                                fontStyle: 'italic'
                                            }}>
                                                "{request.text}"
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{
                                    display: 'flex',
                                    gap: '0.75em'
                                }}>
                                    <button
                                        onClick={() => onAcceptRequest(request.id)}
                                        disabled={isProcessing}
                                        style={{
                                            flex: 1,
                                            padding: '0.6em',
                                            backgroundColor: colors.eventPrimary,
                                            color: colors.white,
                                            border: 'none',
                                            borderRadius: '14px',
                                            fontSize: '0.9em',
                                            fontWeight: '700',
                                            fontFamily: "'Uni Sans', sans-serif",
                                            fontStyle: 'italic',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.4em',
                                            transition: 'transform 0.1s'
                                        }}
                                        onMouseDown={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(0.95)')}
                                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <Check size={16} />
                                        ПРИНЯТЬ
                                    </button>
                                    <button
                                        onClick={() => onRejectRequest(request.id)}
                                        disabled={isProcessing}
                                        style={{
                                            flex: 1,
                                            padding: '0.6em',
                                            backgroundColor: colors.white,
                                            color: '#c0392b',
                                            border: `2px solid #c0392b`,
                                            borderRadius: '14px',
                                            fontSize: '0.9em',
                                            fontWeight: '700',
                                            fontFamily: "'Uni Sans', sans-serif",
                                            fontStyle: 'italic',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.4em',
                                            transition: 'transform 0.1s'
                                        }}
                                        onMouseDown={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(0.95)')}
                                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <XIcon size={16} />
                                        ОТКЛОНИТЬ
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div style={{
                    width: '100%',
                    backgroundColor: colors.white,
                    borderRadius: '20px 0 20px 0',
                    padding: '2em 1.5em',
                    boxSizing: 'border-box',
                    boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '1.1em',
                        fontWeight: '700',
                        fontFamily: "'Uni Sans', sans-serif",
                        fontStyle: 'italic',
                        color: colors.eventPrimary,
                        marginBottom: '0.5em'
                    }}>
                        Нет запросов
                    </div>
                    <div style={{
                        fontSize: '0.9em',
                        color: colors.textLight,
                        lineHeight: '1.5'
                    }}>
                        Пока нет запросов на участие в этом событии
                    </div>
                </div>
            )}
        </div>
    );
}



