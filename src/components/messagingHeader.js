import "./messagingHeader.css";
import { FaCircleXmark, FaMinus } from "react-icons/fa6";

import { CONVERSATION_CONSTANTS } from "../helpers/constants";

export default function MessagingHeader(props) {
    /**
     * Handle Minimize ('-') button click.
     * Calls the parent's minimize handler.
     * @param {object} evt - click event from the Minimize ('-') button
     */
    function handleMinimizeButtonClick(evt) {
        if (evt && props.onMinimize) {
            console.log("Minimize button clicked");
            props.onMinimize();
        }
    }

    /**
     * Handle Close ('X') button click based on the current conversation status.
     * If the conversation is open, end the conversation in Salesforce then minimize.
     * If the conversation is either closed or not yet started, minimize the window.
     * @param {object} evt - click event from the Close ('X') button
     */
    function handleCloseButtonClick(evt) {
        if (evt) {
            if (props.conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.OPENED_CONVERSATION) {
                // End the conversation if it is currently opened.
                console.log("Close button: ending conversation and minimizing");
                props.endConversation().finally(() => {
                    // After ending conversation, minimize the chat
                    props.onMinimize();
                });
            } else if (props.conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION || props.conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.NOT_STARTED_CONVERSATION) {
                // Minimize the messaging window if the conversation is already closed.
                console.log("Close button: minimizing window");
                props.onMinimize();
            }
        }
    }

    /**
     * Generates a title text for the header buttons based on the current conversation status.
     * @returns {object} with minimize and close titles
     */
    function generateButtonTitles() {
        return {
            minimize: "Minimize chat",
            close: `${props.conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.OPENED_CONVERSATION ? `End conversation` : `Close window`}`
        };
    }

    const titles = generateButtonTitles();

    return (
        <div className="messagingHeader">
            <button
                className="messagingHeaderMinimizeButton"
                title={titles.minimize}
                onClick={handleMinimizeButtonClick}>
                <FaMinus className="messagingHeaderMinimizeButtonIcon"/>
            </button>
            {/* Close button (X) hidden as per requirements */}
            {/* <button
                className="messagingHeaderCloseButton"
                title={titles.close}
                onClick={handleCloseButtonClick}>
                <FaCircleXmark className="messagingHeaderCloseButtonIcon"/>
            </button> */}
        </div>
    )
}