
/**
 * BykuganRecorder - A lightweight screen recording utility.
 */
export class BykuganRecorder {
    /**
     * @param {Object} options
     * @param {Object} options.constraints - MediaStreamConstraints for getDisplayMedia
     * @param {string} options.mimeType - Preferred mimeType
     * @param {number} options.timeSlice - ms to slice data (default 1000)
     */
    constructor(options = {}) {
        this.options = {
            timeSlice: 1000,
            constraints: {
                video: true,
                audio: false
            },
            ...options
        };
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.stream = null;
        this.onStopCallback = null;
    }

    static isSupported() {
        return !!(
            typeof navigator !== 'undefined' &&
            navigator.mediaDevices &&
            navigator.mediaDevices.getDisplayMedia &&
            typeof MediaRecorder !== 'undefined'
        );
    }

    _getBestMimeType() {
        if (this.options.mimeType && MediaRecorder.isTypeSupported(this.options.mimeType)) {
            return this.options.mimeType;
        }
        const types = [
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm',
            'video/mp4'
        ];
        return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
    }

    /**
     * Starts recording the screen.
     * @returns {Promise<MediaStream>} The screen media stream.
     */
    async start() {
        if (!BykuganRecorder.isSupported()) {
            throw new Error('Screen recording is not supported in this browser.');
        }

        try {
            this.recordedChunks = [];
            this.stream = await navigator.mediaDevices.getDisplayMedia(this.options.constraints);

            const mimeType = this._getBestMimeType();
            const options = mimeType ? { mimeType } : {};

            this.mediaRecorder = new MediaRecorder(this.stream, options);

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this._handleStop();
            };

            // Stop recording if the user stops sharing via the browser UI
            this.stream.getVideoTracks()[0].onended = () => {
                this.stop();
            };

            this.mediaRecorder.start(this.options.timeSlice);
            return this.stream;
        } catch (err) {
            console.error('Error starting screen recording:', err);
            throw err;
        }
    }

    /**
     * Stops the recording.
     * @returns {Promise<Blob>} The recorded video blob.
     */
    async stop() {
        return new Promise((resolve) => {
            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.onStopCallback = resolve;
                this.mediaRecorder.stop();
                // Also stop the stream tracks
                if (this.stream) {
                    this.stream.getTracks().forEach(track => track.stop());
                }
            } else {
                resolve(this.getBlob());
            }
        });
    }

    _handleStop() {
        const blob = this.getBlob();
        if (this.onStopCallback) {
            this.onStopCallback(blob);
            this.onStopCallback = null;
        }
    }

    /**
     * Returns the recorded blob.
     * @returns {Blob}
     */
    getBlob() {
        if (this.recordedChunks.length === 0) return null;
        const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
        return new Blob(this.recordedChunks, { type: mimeType });
    }

    /**
     * Downloads the recording.
     * @param {string} filename
     */
    save(filename = 'recording.webm') {
        const blob = this.getBlob();
        if (!blob) {
            console.warn('No recording available to save.');
            return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}
