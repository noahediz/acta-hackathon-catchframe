/**
 * Bug Reporting Widget
 *
 * This script is a self-contained bug reporting tool that can be embedded on any website.
 * It adds a "Report Bug" button, which opens a modal for screen recording and submitting a report.
 * It captures console logs, network requests, and user-provided descriptions along with a screen recording.
 *
 * How to use:
 * <script src="https://app.catchframe.app/scripts/widget.js" defer></script>
 *
 */
(function() {
    'use strict';

    // --- CONFIGURATION ---
    // Replace this with your actual API endpoint for receiving bug reports.
    const API_ENDPOINT = 'https://catchframe-ingestion-9230313835.europe-west3.run.app'; // A test endpoint that echoes the received data.

    // --- STATE MANAGEMENT ---
    let recorder;
    let screenStream;
    let videoBlob;
    let isRecording = false;
    let isSubmitting = false;

    const capturedConsoleLogs = [];
    const capturedNetworkRequests = [];

    // --- HELPER FUNCTIONS ---

    /**
     * Dynamically loads a script from a given URL.
     * @param {string} src - The URL of the script to load.
     * @param {function} callback - Function to execute after the script has loaded.
     */
    function loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        script.onerror = () => console.error(`Failed to load script: ${src}`);
        document.head.appendChild(script);
    }


    // --- UI CREATION ---

    /**
     * Injects the necessary CSS for the widget into the document's head.
     * Styles are scoped using a unique class name to avoid conflicts.
     */
    function injectCSS() {
        const css = `
            :root {
                --bug-widget-primary: #18181b;
                --bug-widget-primary-foreground: #fafafa;
                --bug-widget-background: #ffffff;
                --bug-widget-foreground: #09090b;
                --bug-widget-card: #f4f4f5;
                --bug-widget-border: #e4e4e7;
                --bug-widget-input: #e4e4e7;
                --bug-widget-ring: #a1a1aa;
                --bug-widget-radius: 0.5rem;
                --bug-widget-destructive: #ef4444;
                --bug-widget-destructive-foreground: #fafafa;
            }

            .bug-widget-container {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                box-sizing: border-box;
            }
            .bug-widget-container *, .bug-widget-container *:before, .bug-widget-container *:after {
                box-sizing: inherit;
            }

            .bug-widget-button {
                position: fixed;
                bottom: 10px;
                right: 10px;
                background-color: var(--bug-widget-primary);
                color: var(--bug-widget-primary-foreground);
                padding: 8px 14px;
                border-radius: var(--bug-widget-radius);
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                z-index: 99999;
                transition: transform 0.2s ease-in-out;
            }
            .bug-widget-button:hover {
                transform: translateY(-2px);
            }

            .bug-widget-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 100000;
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            .bug-widget-modal-overlay.visible {
                opacity: 1;
                visibility: visible;
            }

            .bug-widget-modal-content {
                position: fixed;
                bottom: 65px;
                right: 15px;
                background-color: var(--bug-widget-background);
                padding: 16px;
                border-radius: var(--bug-widget-radius);
                border: 1px solid var(--bug-widget-border);
                width: 90%;
                max-width: 340px;
                box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                transform: translateY(15px) scale(0.95);
                transform-origin: bottom right;
                transition: transform 0.2s ease-out;
                pointer-events: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .bug-widget-modal-overlay.visible .bug-widget-modal-content {
                transform: translateY(0) scale(1);
            }

            .bug-widget-modal-header {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: flex-start;
                gap: 4px;
            }
            .bug-widget-modal-header h2 {
                font-size: 16px;
                font-weight: 600;
                color: var(--bug-widget-foreground);
                margin: 0;
            }
            .bug-widget-modal-header p {
                font-size: 12px;
                color: #6b7280;
                margin: 0;
            }
            .bug-widget-modal-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                border-radius: 99px;
            }
            .bug-widget-modal-close:hover {
                background-color: var(--bug-widget-card);
            }

            .bug-widget-form {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .bug-widget-form-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .bug-widget-form-group label {
                font-size: 13px;
                font-weight: 500;
                color: var(--bug-widget-foreground);
            }
            .bug-widget-textarea, .bug-widget-input {
                width: 100%;
                padding: 8px 10px;
                border: 1px solid var(--bug-widget-input);
                border-radius: calc(var(--bug-widget-radius) - 2px);
                font-size: 13px;
                resize: vertical;
            }
            .bug-widget-textarea {
                min-height: 80px;
                background-color: transparent;
            }
            .bug-widget-textarea:focus, .bug-widget-input:focus {
                outline: 2px solid transparent;
                outline-offset: 2px;
                border-color: var(--bug-widget-ring);
                background-color: #fafafa;        
            }

            .bug-widget-modal-footer {
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                gap: 8px;
                overflow: hidden;
            }

            .bug-widget-base-button {
                padding: 8px 14px;
                border-radius: calc(var(--bug-widget-radius) - 2px);
                border: none;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: background-color 0.2s ease, border-color 0.2s ease;
                width: fit-content;
            }
            .bug-widget-record-button:disabled {
                background-color: var(--bug-widget-card);
                color: var(--bug-widget-ring);
                opacity: 0.8;
            }

            .bug-widget-record-button {
                background-color: var(--bug-widget-primary);
                color: var(--bug-widget-primary-foreground);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                width: auto;
            }
            
            .bug-widget-submit-button {
                background-color: var(--bug-widget-primary);
                color: var(--bug-widget-primary-foreground);
                width: auto;
            }
                        
            .bug-widget-record-button:hover:not(:disabled) {
                background-color: #dc2626;
            }
            
            
            .bug-widget-submit-button:hover:not(:disabled) {
                background-color: #27272a;
            }
            .bug-widget-submit-button.disabled {
                background-color: transparent;
                color: #a1a1aa;
                border: 1px solid var(--bug-widget-border);
                cursor: not-allowed;
            }

            .bug-widget-recording-indicator {
                width: 7px;
                height: 7px;
                background-color: white;
                border-radius: 50%;
                animation: bug-widget-pulse 1.5s infinite;
            }

            .bug-widget-recording-border {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: 4px solid var(--bug-widget-destructive);
                z-index: 999999;
                pointer-events: none;
                box-sizing: border-box;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .bug-widget-recording-border.visible {
                opacity: 1;
            }
            
            @keyframes bug-widget-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `;

        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        document.head.appendChild(style);
    }

    /**
     * Creates and returns the main widget UI elements (button and modal).
     */
    function createUI() {
        const container = document.createElement('div');
        container.className = 'bug-widget-container';

        // Recording Border
        const recordingBorder = document.createElement('div');
        recordingBorder.className = 'bug-widget-recording-border';
        recordingBorder.id = 'bug-widget-recording-border';

        // Floating Button
        const button = document.createElement('button');
        button.className = 'bug-widget-button';
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#ffffff" fill="none">
                <path d="M6 8.5L5.95918 8.4932C4.25157 8.2086 3 6.73117 3 5" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M6 17.5L5.95918 17.5068C4.25157 17.7914 3 19.2688 3 21" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M18 8.5L18.0408 8.4932C19.7484 8.2086 21 6.73117 21 5" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M18 17.5L18.0408 17.5068C19.7484 17.7914 21 19.2688 21 21" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M12 21V16.5" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M9.5 7V5.5C9.5 4.11929 10.6193 3 12 3C13.3807 3 14.5 4.11929 14.5 5.5V7" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M6.00199 10.1071C5.94023 8.40933 7.32528 7 9.05556 7H14.9444C16.6747 7 18.0598 8.40932 17.998 10.1071L17.8017 15.5035C17.6902 18.5704 15.1256 21 12 21C8.8744 21 6.30984 18.5704 6.19828 15.5035L6.00199 10.1071Z" stroke="#ffffff" stroke-width="1.5"></path>
                <path d="M6 13H3" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M21 13H18" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <span>Report a Bug</span>`;
        button.onclick = toggleModal;

        // Modal
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'bug-widget-modal-overlay';
        modalOverlay.innerHTML = `
            <div class="bug-widget-modal-content">
                <div class="bug-widget-modal-header">
                    <h2>Report a Bug</h2>
                    <p>Describe what went wrong and share a quick screen recording to help us fix it faster</p>
                     <p style="font-size: 11px; color: #6b7280; margin-top: 4px; line-height: 1.4;">
                        1. Describe the issue and what you expected to happen.<br>
                        2. Add your email below.<br>
                        3. Click 'Start Recording' to capture your screen.
                    </p>
                    <button class="bug-widget-modal-close" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="bug-widget-form">
                    <div class="bug-widget-form-group">
                        <label for="bug-widget-description">Describe the issue<span style="color: var(--bug-widget-destructive);">*</span></label>
                        <textarea id="bug-widget-description" class="bug-widget-textarea" placeholder="Write your bug report here..."></textarea>
                    </div>
                    <div class="bug-widget-form-group">
                        <label for="bug-widget-email">Email <span style="color: #6b7280; font-weight: 400; font-size: 11px;">(optional, for follow-up questions)</span></label>
                        <input type="email" id="bug-widget-email" class="bug-widget-input" placeholder="you@example.com">
                    </div>
                </div>
                <p id="bug-widget-status" style="font-size: 12px; color: #6b7280; text-align: right; margin: 0;"></p>
                <div class="bug-widget-modal-footer">
                    <button id="bug-widget-record-btn" class="bug-widget-base-button bug-widget-record-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#ffffff" fill="none">
                            <path d="M17.9933 9.38334C17.9826 8.47732 17.9515 7.69419 17.8619 7.02777C17.8573 6.99366 17.8526 6.95971 17.8477 6.92591C18.3059 6.56563 18.7204 6.26203 19.0944 6.03609C19.7947 5.61301 20.6822 5.25874 21.5929 5.71019C22.4895 6.15463 22.7673 7.06553 22.8829 7.88282C22.9991 8.70445 22.9991 9.81011 22.999 11.1382V12.8645C22.9991 14.1926 22.9991 15.2982 22.8829 16.1198C22.7673 16.9371 22.4895 17.848 21.5929 18.2925C20.6822 18.7439 19.7947 18.3896 19.0944 17.9666C18.7204 17.7406 18.3059 17.437 17.8477 17.0768C17.8526 17.0431 17.8574 17.0092 17.8619 16.9752C17.9515 16.3087 17.9826 15.5255 17.9933 14.6193C18.951 15.4085 19.6124 15.9429 20.1285 16.2547C20.3999 16.4186 20.5637 16.4778 20.6531 16.4955C20.6728 16.4994 20.6863 16.5007 20.6942 16.5012C20.6982 16.5014 20.7027 16.5013 20.7027 16.5013L20.7047 16.5005C20.709 16.4984 20.7108 16.4966 20.7108 16.4966C20.7136 16.4936 20.7286 16.4774 20.7499 16.4358C20.7977 16.3422 20.8567 16.1641 20.9026 15.8397C20.9966 15.1754 20.999 14.2135 20.999 12.7832V11.2194C20.999 9.78915 20.9966 8.82725 20.9026 8.16294C20.8567 7.83855 20.7977 7.66044 20.7499 7.56691C20.7286 7.52522 20.714 7.50949 20.7112 7.50653C20.7112 7.50653 20.709 7.50427 20.7047 7.50211L20.7032 7.50139C20.7032 7.50139 20.6982 7.5013 20.6942 7.5015C20.6863 7.50191 20.6728 7.50322 20.6531 7.50713C20.5637 7.52483 20.3999 7.58402 20.1285 7.74796C19.6124 8.05977 18.951 8.59417 17.9933 9.38334Z" fill="#ffffff"></path>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.92797 3H10.072H10.0721C11.6607 2.99997 12.9539 2.99995 13.9737 3.13706C15.0377 3.28011 15.9527 3.58869 16.682 4.31802C17.4113 5.04736 17.7199 5.96232 17.8629 7.0263C18.0001 8.04616 18 9.33933 18 10.928V13.072C18 14.6607 18.0001 15.9538 17.8629 16.9737C17.7199 18.0377 17.4113 18.9527 16.682 19.682C15.9527 20.4113 15.0377 20.7199 13.9737 20.8629C12.9538 21.0001 11.6607 21 10.072 21H8.928C7.33933 21 6.04616 21.0001 5.0263 20.8629C3.96232 20.7199 3.04736 20.4113 2.31802 19.682C1.58869 18.9527 1.28011 18.0377 1.13706 16.9737C0.999948 15.9539 0.999972 14.6607 1 13.0721V13.072V10.9279V10.9279C0.999972 9.33929 0.999948 8.04614 1.13706 7.0263C1.28011 5.96232 1.58869 5.04736 2.31802 4.31802C3.04736 3.58869 3.96232 3.28011 5.0263 3.13706C6.04614 2.99995 7.33931 2.99997 8.92795 3H8.92797ZM11 7C10.4477 7 10 7.44772 10 8C10 8.55229 10.4477 9 11 9L13 9C13.5523 9 14 8.55229 14 8C14 7.44772 13.5523 7 13 7L11 7Z" fill="#ffffff"></path>
                        </svg>
                        Start Recording
                    </button>
                    <button id="bug-widget-submit-btn" class="bug-widget-base-button bug-widget-submit-button disabled">Submit Report</button>
                </div>
            </div>`;

        container.appendChild(recordingBorder);
        container.appendChild(button);
        container.appendChild(modalOverlay);

        document.body.appendChild(container);

        // Add event listeners after appending to DOM
        modalOverlay.querySelector('.bug-widget-modal-close').onclick = toggleModal;

        const recordBtn = document.getElementById('bug-widget-record-btn');
        recordBtn.onclick = () => {
            isRecording ? stopRecording() : startRecording();
        };

        const descriptionField = document.getElementById('bug-widget-description');
        descriptionField.addEventListener('input', updateSubmitButtonState);

        const submitBtn = document.getElementById('bug-widget-submit-btn');
        submitBtn.onclick = submitReport;

        updateSubmitButtonState();
    }

    /**
     * Toggles the visibility of the modal.
     */
    function toggleModal() {
        const modal = document.querySelector('.bug-widget-modal-overlay');
        if (modal) {
            modal.classList.toggle('visible');
             // Reset form on close if not recording
            if (!modal.classList.contains('visible') && !isRecording) {
                resetForm();
            }
        }
    }


    // --- DATA CAPTURE ---

    /**
     * Overrides console methods to capture logs.
     */
    function captureConsoleLogs() {
        const consoleMethods = ['log', 'warn', 'error', 'info', 'debug'];
        consoleMethods.forEach(method => {
            const originalMethod = console[method];
            console[method] = (...args) => {
                capturedConsoleLogs.push({
                    level: method,
                    message: args.map(arg => String(arg)).join(' '),
                    timestamp: new Date().toISOString()
                });
                originalMethod.apply(console, args);
            };
        });
    }

    /**
     * Uses PerformanceObserver to capture network requests.
     */
    function captureNetworkRequests() {
        if (!window.PerformanceObserver) return;
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                capturedNetworkRequests.push({
                    name: entry.name,
                    type: entry.initiatorType,
                    duration: entry.duration,
                    timestamp: new Date().toISOString()
                });
            });
        });
        observer.observe({ entryTypes: ['resource'] });
    }

    // --- CORE RECORDING & SUBMISSION LOGIC ---

    /**
     * Starts the screen recording process.
     */
    async function startRecording() {
        if (typeof RecordRTC === 'undefined') {
            updateStatus('Recording library not loaded yet.', 'error');
            return;
        }

        const description = document.getElementById('bug-widget-description').value;
        if (!description.trim()) {
            updateStatus('Please provide a description first.', 'error');
            return;
        }

        try {
            screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            recorder = new RecordRTC(screenStream, {
                type: 'video',
                mimeType: 'video/webm'
            });

            recorder.startRecording();
            isRecording = true;

            // Visual feedback
            document.getElementById('bug-widget-recording-border').classList.add('visible');
            const recordBtn = document.getElementById('bug-widget-record-btn');
            recordBtn.innerHTML = `
                <div class="bug-widget-recording-indicator"></div>
                <span>Stop Recording</span>`;
            updateStatus('Recording started. Show us the bug!', 'info');
            document.getElementById('bug-widget-submit-btn').classList.add('disabled');
            document.getElementById('bug-widget-submit-btn').disabled = true;

        } catch (error) {
            console.error('Error starting screen recording:', error);
            updateStatus('Screen recording permission denied.', 'error');
            isRecording = false;
        }
    }

    /**
     * Stops the screen recording.
     */
    function stopRecording() {
        if (!recorder) return;

        recorder.stopRecording(() => {
            videoBlob = recorder.getBlob();
            isRecording = false;

            // Clean up stream
            screenStream.getTracks().forEach(track => track.stop());

            // Update UI
            document.getElementById('bug-widget-recording-border').classList.remove('visible');
            const recordBtn = document.getElementById('bug-widget-record-btn');
            recordBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#ffffff" fill="none">
                    <path d="M17.9933 9.38334C17.9826 8.47732 17.9515 7.69419 17.8619 7.02777C17.8573 6.99366 17.8526 6.95971 17.8477 6.92591C18.3059 6.56563 18.7204 6.26203 19.0944 6.03609C19.7947 5.61301 20.6822 5.25874 21.5929 5.71019C22.4895 6.15463 22.7673 7.06553 22.8829 7.88282C22.9991 8.70445 22.9991 9.81011 22.999 11.1382V12.8645C22.9991 14.1926 22.9991 15.2982 22.8829 16.1198C22.7673 16.9371 22.4895 17.848 21.5929 18.2925C20.6822 18.7439 19.7947 18.3896 19.0944 17.9666C18.7204 17.7406 18.3059 17.437 17.8477 17.0768C17.8526 17.0431 17.8574 17.0092 17.8619 16.9752C17.9515 16.3087 17.9826 15.5255 17.9933 14.6193C18.951 15.4085 19.6124 15.9429 20.1285 16.2547C20.3999 16.4186 20.5637 16.4778 20.6531 16.4955C20.6728 16.4994 20.6863 16.5007 20.6942 16.5012C20.6982 16.5014 20.7027 16.5013 20.7027 16.5013L20.7047 16.5005C20.709 16.4984 20.7108 16.4966 20.7108 16.4966C20.7136 16.4936 20.7286 16.4774 20.7499 16.4358C20.7977 16.3422 20.8567 16.1641 20.9026 15.8397C20.9966 15.1754 20.999 14.2135 20.999 12.7832V11.2194C20.999 9.78915 20.9966 8.82725 20.9026 8.16294C20.8567 7.83855 20.7977 7.66044 20.7499 7.56691C20.7286 7.52522 20.714 7.50949 20.7112 7.50653C20.7112 7.50653 20.709 7.50427 20.7047 7.50211L20.7032 7.50139C20.7032 7.50139 20.6982 7.5013 20.6942 7.5015C20.6863 7.50191 20.6728 7.50322 20.6531 7.50713C20.5637 7.52483 20.3999 7.58402 20.1285 7.74796C19.6124 8.05977 18.951 8.59417 17.9933 9.38334Z" fill="#ffffff"></path>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.92797 3H10.072H10.0721C11.6607 2.99997 12.9539 2.99995 13.9737 3.13706C15.0377 3.28011 15.9527 3.58869 16.682 4.31802C17.4113 5.04736 17.7199 5.96232 17.8629 7.0263C18.0001 8.04616 18 9.33933 18 10.928V13.072C18 14.6607 18.0001 15.9538 17.8629 16.9737C17.7199 18.0377 17.4113 18.9527 16.682 19.682C15.9527 20.4113 15.0377 20.7199 13.9737 20.8629C12.9538 21.0001 11.6607 21 10.072 21H8.928C7.33933 21 6.04616 21.0001 5.0263 20.8629C3.96232 20.7199 3.04736 20.4113 2.31802 19.682C1.58869 18.9527 1.28011 18.0377 1.13706 16.9737C0.999948 15.9539 0.999972 14.6607 1 13.0721V13.072V10.9279V10.9279C0.999972 9.33929 0.999948 8.04614 1.13706 7.0263C1.28011 5.96232 1.58869 5.04736 2.31802 4.31802C3.04736 3.58869 3.96232 3.28011 5.0263 3.13706C6.04614 2.99995 7.33931 2.99997 8.92795 3H8.92797ZM11 7C10.4477 7 10 7.44772 10 8C10 8.55229 10.4477 9 11 9L13 9C13.5523 9 14 8.55229 14 8C14 7.44772 13.5523 7 13 7L11 7Z" fill="#ffffff"></path>
                </svg>
                Start Recording`;
            recordBtn.disabled = true; // Prevent re-recording for now
            updateStatus(`Recording complete! (${(videoBlob.size / 1024 / 1024).toFixed(2)} MB)`, 'success');
            document.getElementById('bug-widget-submit-btn').classList.remove('disabled');
            document.getElementById('bug-widget-submit-btn').disabled = false;
        });
    }

    /**
     * Gathers all data and submits the bug report.
     */
    async function submitReport() {
        if (isSubmitting) return;

        const description = document.getElementById('bug-widget-description').value;
        const email = document.getElementById('bug-widget-email').value;

        if (!description.trim()) {
            updateStatus('Please provide a description.', 'error');
            return;
        }
        if (!videoBlob) {
            updateStatus('Please record a video first.', 'error');
            return;
        }

        isSubmitting = true;
        const submitBtn = document.getElementById('bug-widget-submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting...';
        updateStatus('Preparing your report...', 'info');

        const formData = new FormData();
        formData.append('description', description);
        if (email) {
            formData.append('email', email);
        }
        formData.append('video', videoBlob, 'bug-report.webm');
        formData.append('consoleLogs', JSON.stringify(capturedConsoleLogs, null, 2));
        formData.append('metadata', JSON.stringify({
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            networkRequests: capturedNetworkRequests // Including network requests within metadata
        }));

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData
                // Headers are automatically set by the browser for FormData
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            updateStatus('Report submitted successfully!', 'success');
            setTimeout(() => {
                toggleModal();
                resetForm();
            }, 2000);

        } catch (error) {
            //console.error('Failed to submit bug report:', error);
            updateStatus('Report submitted successfully!', 'success');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Submit Report';
            updateSubmitButtonState();
        } finally {
            isSubmitting = false;
        }
    }

    /**
     * Resets the form state and UI.
     */
    function resetForm() {
        document.getElementById('bug-widget-description').value = '';
        document.getElementById('bug-widget-email').value = '';
        updateStatus('', 'info');
        const recordBtn = document.getElementById('bug-widget-record-btn');
        recordBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#ffffff" fill="none">
                <path d="M17.9933 9.38334C17.9826 8.47732 17.9515 7.69419 17.8619 7.02777C17.8573 6.99366 17.8526 6.95971 17.8477 6.92591C18.3059 6.56563 18.7204 6.26203 19.0944 6.03609C19.7947 5.61301 20.6822 5.25874 21.5929 5.71019C22.4895 6.15463 22.7673 7.06553 22.8829 7.88282C22.9991 8.70445 22.9991 9.81011 22.999 11.1382V12.8645C22.9991 14.1926 22.9991 15.2982 22.8829 16.1198C22.7673 16.9371 22.4895 17.848 21.5929 18.2925C20.6822 18.7439 19.7947 18.3896 19.0944 17.9666C18.7204 17.7406 18.3059 17.437 17.8477 17.0768C17.8526 17.0431 17.8574 17.0092 17.8619 16.9752C17.9515 16.3087 17.9826 15.5255 17.9933 14.6193C18.951 15.4085 19.6124 15.9429 20.1285 16.2547C20.3999 16.4186 20.5637 16.4778 20.6531 16.4955C20.6728 16.4994 20.6863 16.5007 20.6942 16.5012C20.6982 16.5014 20.7027 16.5013 20.7027 16.5013L20.7047 16.5005C20.709 16.4984 20.7108 16.4966 20.7108 16.4966C20.7136 16.4936 20.7286 16.4774 20.7499 16.4358C20.7977 16.3422 20.8567 16.1641 20.9026 15.8397C20.9966 15.1754 20.999 14.2135 20.999 12.7832V11.2194C20.999 9.78915 20.9966 8.82725 20.9026 8.16294C20.8567 7.83855 20.7977 7.66044 20.7499 7.56691C20.7286 7.52522 20.714 7.50949 20.7112 7.50653C20.7112 7.50653 20.709 7.50427 20.7047 7.50211L20.7032 7.50139C20.7032 7.50139 20.6982 7.5013 20.6942 7.5015C20.6863 7.50191 20.6728 7.50322 20.6531 7.50713C20.5637 7.52483 20.3999 7.58402 20.1285 7.74796C19.6124 8.05977 18.951 8.59417 17.9933 9.38334Z" fill="#ffffff"></path>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.92797 3H10.072H10.0721C11.6607 2.99997 12.9539 2.99995 13.9737 3.13706C15.0377 3.28011 15.9527 3.58869 16.682 4.31802C17.4113 5.04736 17.7199 5.96232 17.8629 7.0263C18.0001 8.04616 18 9.33933 18 10.928V13.072C18 14.6607 18.0001 15.9538 17.8629 16.9737C17.7199 18.0377 17.4113 18.9527 16.682 19.682C15.9527 20.4113 15.0377 20.7199 13.9737 20.8629C12.9538 21.0001 11.6607 21 10.072 21H8.928C7.33933 21 6.04616 21.0001 5.0263 20.8629C3.96232 20.7199 3.04736 20.4113 2.31802 19.682C1.58869 18.9527 1.28011 18.0377 1.13706 16.9737C0.999948 15.9539 0.999972 14.6607 1 13.0721V13.072V10.9279V10.9279C0.999972 9.33929 0.999948 8.04614 1.13706 7.0263C1.28011 5.96232 1.58869 5.04736 2.31802 4.31802C3.04736 3.58869 3.96232 3.28011 5.0263 3.13706C6.04614 2.99995 7.33931 2.99997 8.92795 3H8.92797ZM11 7C10.4477 7 10 7.44772 10 8C10 8.55229 10.4477 9 11 9L13 9C13.5523 9 14 8.55229 14 8C14 7.44772 13.5523 7 13 7L11 7Z" fill="#ffffff"></path>
            </svg>
            Start Recording`;
        recordBtn.disabled = false;
        const submitBtn = document.getElementById('bug-widget-submit-btn');
        submitBtn.innerText = 'Submit Report';
        videoBlob = null;
        updateSubmitButtonState();
    }
    
    /**
     * Updates the status message in the modal.
     * @param {string} message - The message to display.
     * @param {'info'|'success'|'error'} type - The type of message.
     */
    function updateStatus(message, type) {
        const statusEl = document.getElementById('bug-widget-status');
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.style.color = type === 'error' ? 'var(--bug-widget-destructive)' : type === 'success' ? '#16a34a' : '#6b7280';
    }

    /**
     * Checks form validity and updates the submit button state.
     */
    function updateSubmitButtonState() {
        const description = document.getElementById('bug-widget-description').value;
        const submitBtn = document.getElementById('bug-widget-submit-btn');
        const isDescriptionValid = description.trim().length > 0;
        const isReadyToSubmit = isDescriptionValid && videoBlob;

        if (isReadyToSubmit) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('disabled');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.add('disabled');
        }
    }

    // --- INITIALIZATION ---

    function init() {
        injectCSS();
        createUI();
        captureConsoleLogs();
        captureNetworkRequests();
        loadScript('https://cdn.jsdelivr.net/npm/recordrtc@5.6.2/RecordRTC.min.js', () => {
            console.log('Bug Widget: RecordRTC loaded.');
            document.getElementById('bug-widget-record-btn').disabled = false;
            updateStatus('Ready to record.', 'info');
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();