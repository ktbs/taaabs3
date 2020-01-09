/**
 * This error type is meant to be used whan an HTTP request gets a response from server, but this response includes an HTTP status code that doesn't allow to access data (401, 404, 403, 500 etc...)
 */
export class HttpError extends Error {

    /**
     * Constructor
     */
    constructor(statusCode, message) {
        // call parent constructor (Error())
        super(message);

        /**
         * HTTP status code
         */
        this.statusCode = statusCode;
    }
};
