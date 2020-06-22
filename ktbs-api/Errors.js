/**
 * This error type is meant to be used when a REST/HTTP request gets a response from server, but this response has an HTTP status code that means a failure of the requested operation (401, 404, 403, 500 etc...)
 */
export class RestError extends Error {

    /**
     * Constructor
     */
    constructor(statusCode, message) {
        // call parent constructor (Error())
        super(statusCode + " (" + message + ")");

        /**
         * HTTP status code
         */
        this.statusCode = statusCode;

        this.name = "REST error";
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
