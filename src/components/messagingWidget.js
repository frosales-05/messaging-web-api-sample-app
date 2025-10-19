import { FiMessageCircle, FiX } from 'react-icons/fi';
import './messagingWidget.css';

export default function MessagingWidget({ 
    isOpen, 
    onToggle, 
    isLoading,
    isExistingConversation,
    onAppUiReady,
    onClickButton
}) {
    const handleToggleChat = () => {
        if (!isLoading) {
            onToggle(!isOpen);
        }
    };

    return (
        <div className="messaging-widget-container">
            <button
                className={`messaging-widget-button ${isOpen ? 'active' : ''} ${isLoading ? 'loading' : ''}`}
                onClick={handleToggleChat}
                title="Abrir chat"
                disabled={isLoading}
            >
                {isOpen ? (
                    <FiX size={24} />
                ) : (
                    <FiMessageCircle size={24} />
                )}
                {isLoading && <span className="spinner"></span>}
            </button>
        </div>
    );
}
