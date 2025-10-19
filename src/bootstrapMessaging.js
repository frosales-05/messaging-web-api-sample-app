"use client";

import { useState, useEffect } from "react";

// Import children components to render.
import MessagingWindow from "./components/messagingWindow";
import MessagingButton from "./components/messagingButton";
import MessagingWidget from "./components/messagingWidget";

import './bootstrapMessaging.css';

import { storeOrganizationId, storeDeploymentDeveloperName, storeSalesforceMessagingUrl } from './services/dataProvider';
import { determineStorageType, initializeWebStorage, getItemInWebStorageByKey, getItemInPayloadByKey } from './helpers/webstorageUtils';
import { APP_CONSTANTS, STORAGE_KEYS } from './helpers/constants';

import Draggable from "./ui-effects/draggable";

export default function BootstrapMessaging() {
    let [shouldShowMessagingButton, setShowMessagingButton] = useState(false);
    let [orgId, setOrgId] = useState('');
    let [deploymentDevName, setDeploymentDevName] = useState('');
    let [messagingURL, setMessagingURL] = useState('');
    let [shouldDisableMessagingButton, setShouldDisableMessagingButton] = useState(false);
    let [shouldShowMessagingWindow, setShouldShowMessagingWindow] = useState(false);
    let [isMinimized, setIsMinimized] = useState(false);
    let [conversationClosed, setConversationClosed] = useState(false);
    let [showMessagingButtonSpinner, setShowMessagingButtonSpinner] = useState(false);
    let [isExistingConversation, setIsExistingConversation] = useState(false);
    let [shouldShowForm, setShouldShowForm] = useState(true);
    let [autoConnectAttempted, setAutoConnectAttempted] = useState(false);
    let [useWidgetUI, setUseWidgetUI] = useState(false);
    // Unique ID for each conversation to force component remount
    let [conversationKey, setConversationKey] = useState(0);

    useEffect(() => {
        const storage = determineStorageType();
        if (!storage) {
            console.error(`Cannot initialize the app. Web storage is required for the app to function.`);
            return;
        }

        // Load environment variables for auto-connect
        const envOrgId = process.env.REACT_APP_SALESFORCE_ORG_ID;
        const envDeploymentName = process.env.REACT_APP_SALESFORCE_DEPLOYMENT_NAME;
        const envMessagingUrl = process.env.REACT_APP_SALESFORCE_MESSAGING_URL;
        const autoConnect = process.env.REACT_APP_AUTO_CONNECT === 'true';

        console.log('=== AUTO-CONNECT DEBUG ===');
        console.log('REACT_APP_SALESFORCE_ORG_ID:', envOrgId);
        console.log('REACT_APP_SALESFORCE_DEPLOYMENT_NAME:', envDeploymentName);
        console.log('REACT_APP_SALESFORCE_MESSAGING_URL:', envMessagingUrl);
        console.log('REACT_APP_AUTO_CONNECT:', process.env.REACT_APP_AUTO_CONNECT, '(boolean:', autoConnect, ')');
        console.log('autoConnectAttempted:', autoConnectAttempted);

        // Check if environment variables are set for auto-connect
        if (autoConnect && envOrgId && envDeploymentName && envMessagingUrl && !autoConnectAttempted) {
            console.log('Auto-connect conditions met, validating credentials...');
            const isValidOrgId = isValidOrganizationId(envOrgId);
            const isValidDeployName = isValidDeploymentDeveloperName(envDeploymentName);
            const isValidUrlValue = isValidUrl(envMessagingUrl);
            console.log('isValidOrganizationId:', isValidOrgId);
            console.log('isValidDeploymentDeveloperName:', isValidDeployName);
            console.log('isValidUrl:', isValidUrlValue);
            console.log('Full URL for validation:', envMessagingUrl);
            
            if (isValidOrgId && isValidDeployName && isValidUrlValue) {
                console.log('✅ All validations passed! Auto-connecting with environment variables...');
                setAutoConnectAttempted(true);
                setOrgId(envOrgId);
                setDeploymentDevName(envDeploymentName);
                setMessagingURL(envMessagingUrl);
                setShouldShowForm(false);
                setUseWidgetUI(true);
                
                // Initialize messaging client with env values
                initializeMessagingClient(envOrgId, envDeploymentName, envMessagingUrl);
                
                // Check for existing conversation
                const messagingJwt = getItemInWebStorageByKey(STORAGE_KEYS.JWT);
                if (messagingJwt) {
                    console.log('Existing conversation found');
                    setIsExistingConversation(true);
                    setShowMessagingButton(true);
                    setShouldDisableMessagingButton(true);
                    setShouldShowMessagingWindow(true);
                } else {
                    console.log('No existing conversation - showing button to start new one');
                    setIsExistingConversation(false);
                    setShowMessagingButton(true);
                }
                return;
            } else {
                console.warn('❌ Validation failed! One or more credentials are invalid.');
                console.warn('Details:', {isValidOrgId, isValidDeployName, isValidUrlValue});
                setAutoConnectAttempted(true);
            }
        }

        const messaging_webstorage_key = Object.keys(storage).filter(item => item.startsWith(APP_CONSTANTS.WEB_STORAGE_KEY))[0];

        if (messaging_webstorage_key) {
            const webStoragePayload = storage.getItem(messaging_webstorage_key);
            const orgId = getItemInPayloadByKey(webStoragePayload, STORAGE_KEYS.ORGANIZATION_ID);
            const deploymentDevName = getItemInPayloadByKey(webStoragePayload, STORAGE_KEYS.DEPLOYMENT_DEVELOPER_NAME);
            const messagingUrl = getItemInPayloadByKey(webStoragePayload, STORAGE_KEYS.MESSAGING_URL);

            if (!isValidOrganizationId(orgId)) {
                console.warn(`Invalid organization id exists in the web storage: ${orgId}. Cleaning up the invalid object from the web storage.`);
                storage.removeItem(messaging_webstorage_key);
                // New conversation.
                setIsExistingConversation(false);
                setShouldShowForm(true);
                return;
            }
            
            // Re-Initialize state variables from the values in the web storage. This also re-populates app's deployment parameters input form fields with the previously entered data, in case of a messaging session continuation (e.g. page reload).
            setOrgId(orgId);
            setDeploymentDevName(deploymentDevName);
            setMessagingURL(messagingUrl);
            setShouldShowForm(false);

            // Initialize messaging client.
            initializeMessagingClient(orgId, deploymentDevName, messagingUrl);

            const messagingJwt = getItemInWebStorageByKey(STORAGE_KEYS.JWT);
            if (messagingJwt) {
                // Existing conversation.
                setIsExistingConversation(true);
                setShowMessagingButton(true);
                setShouldDisableMessagingButton(true);
                setShouldShowMessagingWindow(true);
            } else {
                // New conversation.
                setIsExistingConversation(false);
            }
        } else {
            // New conversation.
            setIsExistingConversation(false);
            setShouldShowForm(true);
        }

        return () => {
            showMessagingWindow(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-open messaging window when button is ready and auto-connect is enabled
    useEffect(() => {
        if (shouldShowMessagingButton && !shouldShowMessagingWindow && autoConnectAttempted && process.env.REACT_APP_AUTO_CONNECT === 'true' && !shouldShowForm) {
            console.log('Auto-opening messaging window...');
            // Simulate button click to properly initialize the messaging window
            setTimeout(() => {
                handleMessagingButtonClick();
            }, 300);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldShowMessagingButton]);

    /**
     * Initialize the messaging client by
     * 1. internally initializing the Embedded Service deployment paramaters in-memory.
     * 2. initializing Salesforce Organization Id in the browser web storage.
     */
    function initializeMessagingClient(ord_id, deployment_dev_name, messaging_url) {
        // Initialize helpers.
        initializeWebStorage(ord_id || orgId);
        storeOrganizationId(ord_id || orgId);
        storeDeploymentDeveloperName(deployment_dev_name || deploymentDevName);
        storeSalesforceMessagingUrl(messaging_url || messagingURL);
    }

    /**
     * Validates whether the supplied string is a valid Salesforce Organization Id.
     * @returns {boolean}
     */
    function isValidOrganizationId(id) {
        return typeof id === "string" && (id.length === 18 || id.length === 15) && id.substring(0, 3) === APP_CONSTANTS.ORGANIZATION_ID_PREFIX;
    }

    /**
     * Validates whether the supplied string is a valid Salesforce Embedded Service Deployment Developer Name.
     * @returns {boolean}
     */
    function isValidDeploymentDeveloperName(name) {
        return typeof name === "string" && name.length > 0;
    }

    /**
     * Determines whether the supplied url is a Salesforce Url.
     * @returns {boolean}
     */
    function isSalesforceUrl(url) {
        try {
            // Accept URLs both with and without trailing slash
            const normalizedUrl = url.endsWith('/') ? url : url + '/';
            return typeof url === "string" && url.length > 0 && normalizedUrl.slice(-20) === APP_CONSTANTS.SALESFORCE_MESSAGING_SCRT_URL + '/';
        } catch (err) {
            console.error(`Something went wrong in validating whether the url is a Salesforce url: ${err}`);
            return false;
        }
    }

    /**
     * Validates whether the supplied string has a valid protocol and is a Salesforce Url.
     * @returns {boolean}
     */
    function isValidUrl(url) {
        try {
            const urlToValidate = new URL(url);
            return isSalesforceUrl(url) && urlToValidate.protocol === APP_CONSTANTS.HTTPS_PROTOCOL;
        } catch (err) {
            console.error(`Something went wrong in validating the url provided: ${err}`);
            return false;
        }
    }

    /**
     * Handle a click action from the Deployment-Details-Form Submit Button. If the inputted parameters are valid, initialize the Messaging Client and render the Messaging Button.
     * @param {object} evt - button click event
     */
    function handleDeploymentDetailsFormSubmit(evt) {
        if (evt) {
            if(!isValidOrganizationId(orgId)) {
                alert(`Invalid OrganizationId Input Value: ${orgId}`);
                setShowMessagingButton(false);
                return;
            }
		    if(!isValidDeploymentDeveloperName(deploymentDevName)) {
                alert(`Expected a valid Embedded Service Deployment Developer Name value to be a string but received: ${deploymentDevName}.`);
                setShowMessagingButton(false);
                return;
            }
		    if(!isValidUrl(messagingURL)) {
                alert(`Expected a valid Salesforce Messaging URL value to be a string but received: ${messagingURL}.`);
                setShowMessagingButton(false);
                return;
            }

            // Initialize the Messaging Client.
            initializeMessagingClient();
            // New conversation.
            setIsExistingConversation(false);
            // Render the Messaging Button.
            setShowMessagingButton(true);
        }
    }

    /**
     * Reset isExistingConversation when conversation is cleaned up.
     * Called from conversation.js after cleanupMessagingData()
     */
    function onConversationCleanup() {
        console.log("Conversation cleaned up - resetting isExistingConversation to false");
        setIsExistingConversation(false);
    }

    /**
     * Determines whether the Deployment-Details-Form Submit Button should be enabled/disabled.
     * @returns {boolean} TRUE - disabled the button and FALSE - otherwise
     */
    function shouldDisableFormSubmitButton() {
        return (orgId && orgId.length === 0) || (deploymentDevName && deploymentDevName.length === 0) || (messagingURL && messagingURL.length === 0);
    }

    /**
     * Handle a click action from the Messaging Button.
     * If minimized with active conversation, restore window.
     * If minimized without active conversation (closed), open new conversation.
     * If window is open, minimize.
     * If window is closed, open new conversation.
     * @param {object} evt - button click event
     */
    function handleMessagingButtonClick(evt) {
        if (evt) {
            console.log("Messaging Button clicked.", {isMinimized, shouldShowMessagingWindow, isExistingConversation, conversationKey});
            
            if (isMinimized && isExistingConversation) {
                // If minimized WITH active conversation, restore the window
                console.log("Restoring chat from minimized state (active conversation)");
                setIsMinimized(false);
                setShouldShowMessagingWindow(true);
            } else if (isMinimized && !isExistingConversation) {
                // If minimized BUT conversation is closed, open new conversation
                console.log("Opening new conversation (previous was closed)");
                setShowMessagingButtonSpinner(true);
                setShouldShowMessagingWindow(true);
                setIsMinimized(false);
                // INCREMENT KEY to force component remount with new ID
                setConversationKey(prev => {
                    const newKey = prev + 1;
                    console.log("🔄 Incrementing conversationKey:", prev, "→", newKey);
                    return newKey;
                });
            } else if (shouldShowMessagingWindow) {
                // If window is open, minimize it ONLY (don't close conversation)
                console.log("Minimizing chat - only hiding window");
                setIsMinimized(true);
                setShouldShowMessagingWindow(false);
                // DO NOT trigger endConversation or any Salesforce logic
            } else {
                // Otherwise open a new conversation
                console.log("Opening new conversation");
                setShowMessagingButtonSpinner(true);
                setShouldShowMessagingWindow(true);
                setIsMinimized(false);
                setConversationClosed(false);
                // INCREMENT KEY to force component remount with new ID
                setConversationKey(prev => {
                    const newKey = prev + 1;
                    console.log("🔄 Incrementing conversationKey:", prev, "→", newKey);
                    return newKey;
                });
            }
        }
    }

    /**
     * Determines whether to render the Messaging Window based on the supplied parameter.
     * When closing completely (not just minimizing), cleanup and reset state.
     * @param {boolean} shouldShow - TRUE - render the Messaging WINDOW, FALSE - minimize or close
     * @param {boolean} closeCompletely - TRUE - close conversation in Salesforce, FALSE - just minimize
     */
    function showMessagingWindow(shouldShow, closeCompletely = false) {
        setShouldShowMessagingWindow(Boolean(shouldShow));
        
        if (!shouldShow) {
            if (closeCompletely) {
                // Complete close: cleanup conversation in Salesforce
                console.log("Closing conversation completely");
                setConversationClosed(true);
                setIsMinimized(false);
                setShowMessagingButtonSpinner(false);
            } else {
                // Just minimize: keep conversation active
                console.log("Minimizing conversation");
                setIsMinimized(true);
                setShowMessagingButtonSpinner(false);
            }
        } else {
            // Opening
            setIsMinimized(false);
            setShowMessagingButtonSpinner(false);
        }
    }

    /**
     * Handles the app UI readiness i.e. Messaging Button updates based on whether the Messaging Window UI is rendered.
     * @param {boolean} isReady - TRUE - disable the Messaging Button & remove the spinner and FALSE - otherwise.
     */
    function appUiReady(isReady) {
        // Disable Messaging Button if the app is UI ready.
        setShouldDisableMessagingButton(isReady);
        // Remove the spinner on the Messaging Button if the app is UI ready.
        setShowMessagingButtonSpinner(!isReady);
    }

    return (
        <>
            {!useWidgetUI && (
                <>
                    <h1>Messaging for Web - Sample App</h1>
                    {shouldShowForm && (
                        <div className="deploymentDetailsForm">
                            <h4>Input your Embedded Service (Custom Client) deployment details below</h4>
                            <label>Organization ID</label>
                            <input
                                type="text"
                                value={orgId || ""}
                                onChange={e => setOrgId(e.target.value.trim())}
                                disabled={shouldShowMessagingButton}>
                            </input>
                            <label>Developer Name</label>
                            <input
                                type="text"
                                value={deploymentDevName || ""}
                                onChange={e => setDeploymentDevName(e.target.value.trim())}
                                disabled={shouldShowMessagingButton}>
                            </input>
                            <label>URL</label>
                            <input
                                type="text"
                                value={messagingURL || ""}
                                onChange={e => setMessagingURL(e.target.value.trim())}
                                disabled={shouldShowMessagingButton}>
                            </input>
                            <button
                                className="deploymentDetailsFormSubmitButton"
                                onClick={handleDeploymentDetailsFormSubmit}
                                disabled={shouldDisableFormSubmitButton()}
                            >
                                Submit
                            </button>
                        </div>
                    )}
                    {shouldShowMessagingButton &&
                        <MessagingButton
                            clickHandler={handleMessagingButtonClick}
                            disableButton={shouldDisableMessagingButton}
                            showSpinner={showMessagingButtonSpinner} />}
                </>
            )}
            {useWidgetUI && shouldShowMessagingButton && (
                <MessagingWidget
                    isOpen={shouldShowMessagingWindow}
                    isMinimized={isMinimized}
                    onToggle={showMessagingWindow}
                    isLoading={showMessagingButtonSpinner}
                    isExistingConversation={isExistingConversation}
                    onAppUiReady={appUiReady}
                    onClickButton={handleMessagingButtonClick}
                />
            )}
            {(shouldShowMessagingWindow || isMinimized) && !useWidgetUI &&
                <Draggable intitialPosition={{ x: 1000, y: 500 }}>
                    <MessagingWindow
                        shouldShowMessagingWindow={shouldShowMessagingWindow}
                        isExistingConversation={isExistingConversation}
                        showMessagingWindow={showMessagingWindow}
                        deactivateMessagingButton={appUiReady}
                        isMinimized={isMinimized}
                        onConversationCleanup={onConversationCleanup} />
                </Draggable>
            }
            {(shouldShowMessagingWindow || isMinimized) && useWidgetUI &&
                <MessagingWindow
                    shouldShowMessagingWindow={shouldShowMessagingWindow}
                    isExistingConversation={isExistingConversation}
                    showMessagingWindow={showMessagingWindow}
                    deactivateMessagingButton={appUiReady}
                    isMinimized={isMinimized}
                    onConversationCleanup={onConversationCleanup} />
            }
        </>
    );
}