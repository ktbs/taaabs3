import * as KTBSErrors from "./Errors.js";

/**
 * Base class for KTBS resources
 */
export class Resource {

	/**
	 * Constructor
	 */
	constructor(uri = null) {

		/**
		 * The resource's uri
		 */
		this._uri;

		/**
		 * The resource's ID relative to its “containing” resource
		 */
		this._id;

		/**
		 * The resource's parent URI
		 */
		this._parent_uri;

		/**
		 * The resource data that can be read from/written to the remote kTBS service 
		 */
		this._JSONData = new Object();

		/**
		 * The resource synchronization status
		 */
		this._syncStatus = "needs_sync";

		// if an uri has been specified at instanciation, set it
		if(uri != null)
			this.uri = uri;
	}

	/**
	 * Gets the resource's URI
	 */
	get uri() {
		return this._uri;
	}

	/**
	 * Sets the resource's URI
	 * @param string uri the new URI for the resource.
	 * @throws Error Throws an Error if we try to set the URI of a resource that already exists on a kTBS service.
	 */
	set uri(uri) {
		if(this._syncStatus == "needs_sync") {
			this._uri = uri;
			this._id = Resource.get_relative_id(uri);
			this._parent_uri = Resource.get_parent_uri(uri);
		}
		else
			throw new Error("Resource's URI can not be changed anymore");
	}

	/**
	 * Gets the uri to query in order to read resource's data (For some resource types, this might be different from the resource URI, for instance if we need to add some query parameters. In such case, descending resource types must override this method)
	 * @return string
	 */
	get _data_read_uri() {
		return this._uri;
	}

	/**
	 * Returns a user-friendly label
	 * @return string
	 */
	get label() {
		return this._JSONData["label"];
	}

	/**
	 * Set a user-friendly label.
	 * @param string label The new label for the resource
	 */
	set label(label) {
		this._JSONData["label"] = label;
	}

	/**
	 * Gets the ID of this resource, relative to its parent resource URI.
	 * @return string
	 */
	get id() {
		return this._id;
	}

	/**
	 * Sets the ID of this resource, relative to its parent resource URI.
	 * @param string id the new ID for the resource.
	 * @throws Error Throws an Error if we try to set the ID of a resource that already exists on a kTBS service.
	 */
	set id(id) {
		if(this._syncStatus == "needs_sync")
			this._id = id;
		else
			throw new Error("Resource's ID can not be changed anymore");
	}

	/**
	 * Gets the URI of the parent resource, if it exists (= if the resource exists on a kTBS service and is not a KTBS Root)
	 * @return string
	 */
	get parent_uri() {
		return this._parent_uri;
	}

	/**
	 * Sets the resource's parent URI
	 * @param string parent_uri the new parent URI
	 * @throws Error Throws an Error if we try to set the parent URI of a resource that already exists on a kTBS service.
	 */
	set parent_uri(parent_uri) {
		if(this._syncStatus == "needs_sync")
			this._parent_uri = parent_uri;
		else
			throw new Error("Resource's parent URI can not be changed anymore");
	}

	/**
	 * Return true if this resource is not modifiable (descending resource types should override this method if necessary).
	 * @return bool
	 */
	get readonly() {
		return false;
	}

	/**
	 * Attemps to asynchronously read an existing object's data to the REST service and returns a promise.
	 * @param AbortSignal abortSignal an optional AbortSignal allowing to stop the HTTP request
	 * @return Promise
	 */
	get(abortSignal = null) {
		if(this._uri) {
			return new Promise((resolve, reject) => {
				this._syncStatus = "pending";

				let fetchParameters = {
					method: "GET",
					headers: new Headers({
						"Accept": "application/json"
						//"Authorization": "Basic " + btoa("test:test")
					}),
					/*mode: "cors",
					credentials: "include",*/
					cache: "default"
				};

				if(this._etag)
					fetchParameters.headers.append("If-None-Match", this._etag);

				if(abortSignal)
					fetchParameters.signal = abortSignal;
				
				fetch(this._data_read_uri, fetchParameters)
					.then((response) => {
						// if the HTTP request responded successfully
						if(response.ok) {
							if(response.headers.has("etag"))
								this._etag = response.headers.get("etag");

							// when the response content from the HTTP request has been successfully read
							response.json()
								.then((parsedJson) => {
									this._JSONData = parsedJson;
									this._syncStatus = "in_sync";
									resolve();
								})
								.catch((error) => {
									this._syncStatus = "error";
									reject(error);
								});
						}
						else {
							reject(new KTBSErrors.HttpError(response.status, response.statusText));
						}
					})
					.catch((error) => {
						this._syncStatus = "error";
						reject(error);
					});
			});
		}
		else
			throw new Error("Cannot read data from a resource without an uri");
	}

    /**
	 * Ensure this resource is up-to-date. While remote resources are expected to perform best-effort to keep in sync with the server, it may sometimes be required to strongly ensure they are up-to-date. For local resources, this is has obviously no effect.
	 */
	force_state_refresh() {
		this._syncStatus = "needs_sync";
		this._JSONData = new Object();
	}

	/**
	 * Extract a resource's ID from it's URI
	 * @param string uri The URI to extract the ID from
	 * @returns string
	 */
	static get_relative_id(uri) {
		let uri_parts = uri.split('/');

		// if the uri ends with a slash
		if(uri.charAt(uri.length - 1) == '/') {
			let last_id_part = uri_parts[uri_parts.length - 2];
			return last_id_part + '/';
		}
		else {
			let last_id_part = uri_parts[uri_parts.length - 1];
			let hash_char_position = last_id_part.indexOf('#');

			if(hash_char_position != -1)
				return last_id_part.substring(hash_char_position);
			else
				return last_id_part;
		}
	}

	/**
	 * Extract a resource's parent URI from it's URI
	 * @param string uri The URI to extract the parent URI from
	 * @return string
	 */
	static get_parent_uri(uri) {
		let uri_parts = uri.split('/');

		// if the uri ends with a slash
		if(uri.charAt(uri.length - 1) == '/')
			return  uri_parts.slice(0, -2).join('/') + '/';
		else {
			let hash_char_position = uri.indexOf('#');

			if(hash_char_position != -1) {
				return uri.substring(0, hash_char_position);
			}
			else
				return uri_parts.slice(0, -1).join('/') + '/';
		}
	}
}
