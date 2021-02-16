/**
 * This error type is meant to be used when a REST/HTTP request gets a response from server, but this response has an HTTP status code that means a failure of the requested operation (401, 404, 403, 500 etc...)
 */
export class RestError extends Error {

    /**
     * Constructor
     */
    constructor(statusCode, statusText, message) {
        // call parent constructor (Error())
        super(message);

        /**
         * HTTP status code
         * \var integer
         * \public
         */
        this.statusCode = statusCode;

        /**
         * HTTP status text
         * \var string
         * \public
         */
        this.statusText = statusText;

        /**
         * Error name
         * \var string
         * \public
         */
        this.name = "RestError";
    }
};

/**
 * This error type is thrown when an attempted operation violates Ktbs rules
 */
export class KtbsError extends Error {}

/**
 * This error type is thrown when a resource's data violates JSON-LD constraints
 */
export class JSONLDError extends Error {}
