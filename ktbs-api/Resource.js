import {ResourceProxy} from "./ResourceProxy.js";
import * as KTBSErrors from "./Errors.js";

/**
 * Abstract class intended to be inherited by KTBS resource types
 */
export class Resource {

	/**
	 * Constructor
	 * @param URL or string uri the resource's URI
	 */
	constructor(uri = null) {

		/**
		 * The resource's uri
		 * @type URL
		 */
		this._uri;

		/**
		 * The resource's ID relative to its “containing” resource
		 * @type string
		 */
		this._id;

		/**
		 * The etag provided by the server at the resource latest HTTP query
		 * @type string
		 */
		this._etag = null;

		/**
		 * The resource data that can be read from/written to the remote kTBS service
		 * @type Object
		 */
		this._JSONData = new Object();

		/**
		 * The resource synchronization status
		 * @type string
		 */
		this._syncStatus = "needs_sync";

		/**
		 * A Promise for the "GET" request allowing to read the resource's data
		 * @type Promise
		 */
		this._getPromise = null;

		/**
		 * A collection of observers callbacks to notify when the resource's state changes
		 * @type Array
		 */
		this._observers = new Array();

		/**
		 * Whether or not the resource was get using authentification credentials
		 * @type boolean
		 */
		this._authentified = false;

		/**
		 * Whether or not we should try to use credentials previously stored in local/session storages for the resource's parent URIs 
		 * @type boolean
		 */
		this._use_parent_credentials = true;

		// if an uri has been specified at instanciation, set it
		if(uri != null)
			this.uri = uri;
	}

	/**
	 * Gets the resource's URI
	 * @return URL
	 */
	get uri() {
		return this._uri;
	}

	/**
	 * Sets the resource's URI
	 * @param URL or String uri the new URI for the resource.
	 * @throws TypeError Throws a TypeError if the uri parameter is not an instance of URL or String
	 * @throws Error Throws an Error if we try to set the URI of a resource that already exists on a kTBS service.
	 */
	set uri(uri) {
		if(this.syncStatus == "needs_sync") {
			if(uri instanceof URL)
				this._uri = uri;
			else if(typeof uri == "string")
				this._uri = new URL(uri);
			else
				throw new TypeError("uri must be of either type \"URL\" or \"String\"");
		}
		else
			throw new Error("Resource's URI can not be changed anymore");
	}

	/**
	 * Gets the synchronization status of the resource
	 * @return string the synchronisation status of the resource
	 */
	get syncStatus() {
		return this._syncStatus;
	}

	/**
	 * Gets whether or not the resource was read using authentication credentials.
	 * @return boolean
	 */
	get authentified() {
		return this._authentified;
	}

	/**
	 * Gets the uri to query in order to read resource's data (For some resource types, this might be different from the resource URI, for instance if we need to add some query parameters. In such case, descending resource types must override this method)
	 * @return string
	 */
	get _data_read_uri() {
		return this._uri;
	}

	/**
	 * 
	 */
	get context() {
		return this._JSONData["@context"];
	}

	/**
	 * Returns a user-friendly label
	 * @return string
	 */
	get label() {
		if(this._JSONData["label"])
			return this._JSONData["label"];
		else
			return this._JSONData["http://www.w3.org/2000/01/rdf-schema#label"];
	}

	/**
	 * Gets the label for a given language
	 * @param string lang a short code for the language we want the label translated into
	 * @return string the translated label, or the default label if no translated label has been found, or undefined if no default label has been found
	 */
	get_translated_label(lang) {
		let label = this.label;

		if(label instanceof Array) {
			for(let i = 0; i < label.length; i++) {
				let aLabel = label[i];

				if((aLabel instanceof Object) && (aLabel["@language"] == lang))
					return aLabel["@value"];
			}
		}
		else
			return label;
	}

	/**
	 * Set a user-friendly label.
	 * @param string label The new label for the resource
	 */
	set label(label) {
		this._JSONData["label"] = label;
	}

	/**
	 * Sets a translation for the label in a given language
	 * @param string label the translated label
	 * @param string lang a short code for the language the label is translated in
	 */
	set_translated_label(label, lang) {
		let currentLabel = this.label;
		let newLabel;

		if(currentLabel instanceof string) {
			newLabel = new Array();
			newLabel.push({"@language": "en", "@value": currentLabel});
		}
		else if(currentLabel instanceof Array) {
			newLabel = currentLabel;
		}

		currentLabel.push({"@language": lang, "@value": label})
		this.label = currentLabel;
	}

	/**
	 * Gets the "comment" of the resource
	 * @return string
	 */
	get comment() {
		return this._JSONData["http://www.w3.org/2000/01/rdf-schema#comment"];
	}

	/**
	 * Sets the "comment" of the resource
	 * @param string comment the new comment for the resource
	 */
	set comment(comment) {
		this._JSONData["http://www.w3.org/2000/01/rdf-schema#comment"] = comment;
	}

	/**
	 * Gets the ID of this resource, relative to its parent resource URI.
	 * @return string
	 */
	get id() {
		if(this._id)
			return this._id;
		else if(this._uri)
			return Resource.extract_relative_id(this._uri.toString());
		else
			return undefined;
	}

	/**
	 * Sets the ID of this resource, relative to its parent resource URI.
	 * @param string id the new ID for the resource.
	 * @throws Error Throws an Error if we try to set the ID of a resource that already exists on a kTBS service.
	 */
	set id(id) {
		if(this.syncStatus == "needs_sync")
			this._id = id;
		else
			throw new Error("Resource's ID can not be changed anymore");
	}

	/**
	 * Gets the parent resource of this resource.
	 * @return Resource the resource's parent resource if any, or undefined if the resource's parent is unknown (i.e. the resource hasn't been read or recorded yet), or null if the resource doesn't have any parent (i.e. Ktbs Root).
	 */
	get parent() {
		if(this._JSONData["inBase"])
			return ResourceProxy.get_resource("Base", new URL(this._JSONData["inBase"], this.uri));
		else if(this._JSONData["inRoot"])
			return ResourceProxy.get_resource("Ktbs", new URL(this._JSONData["inRoot"], this.uri));
		else
			return undefined;
	}

	/**
	 * Sets the parent resource of this resource.
	 * @param Resource parent the new parent for the resource (must be an instance of either "Ktbs" or "Base").
	 * @throws TypeError if the parent parameter is not an instance of "Ktbs" nor "Base".
	 * @throws Error if the resource's parent can not be set anymore (i.e. the resource has already been recorded).
	 */
	set parent(parent) {
		if(this.syncStatus == "needs_sync") {
			if(parent instanceof Base) {
				this._JSONData["inBase"] = parent.uri;

				if(this._JSONData["inRoot"])
					delete this._JSONData["inRoot"];
			}
			else if(parent instanceof Ktbs) {
				this._JSONData["inRoot"] = parent.uri;

				if(this._JSONData["inBase"])
					delete this._JSONData["inBase"];
			}
			else
				throw new TypeError("Parent resource must be of either type \"Base\" or \"Ktbs\"");

			this._parent_uri = parent.uri;
		}
		else
			throw new Error("Resource's parent can not be changed anymore");
	}

	/**
	 * Return true if this resource is not modifiable (descending resource types should override this method if necessary).
	 * @return bool
	 */
	get readonly() {
		return false;
	}

	/**
	 * Remove the credentials stored in a given storage for the resource's URI
	 * @param Storage storage The storage to remove the credentials from
	 */
	_removeOwnCredentialsFromStorage(storage) {
		let storageCredentialsString = storage.getItem("credentials");

		if(storageCredentialsString) {
			let storageCredentials = JSON.parse(storageCredentialsString);

			if(storageCredentials instanceof Array) {
				for(let i = 0; i < storageCredentials.length; i++) {
					let aResourceCredential = storageCredentials[i];

					if(aResourceCredential.uri == this.uri.toString())
						storageCredentials.splice(i, 1);
				}

				storageCredentialsString = JSON.stringify(storageCredentials);
				storage.setItem("credentials", storageCredentialsString);
			}
		}
	}

	/**
	 * Remove the credentials stored in local/session storages for the resource's URI
	 */
	_removeOwnCredentials() {
		if(window.sessionStorage)
			this._removeOwnCredentialsFromStorage(sessionStorage);

		if(window.localStorage)
			this._removeOwnCredentialsFromStorage(localStorage);
	}

	/**
	 * Gets the credentials stored in a storage specifically for this resource.
	 * @param Storage the storage in where to look in the credentials.
	 * @return Object an object containing the credential informations, or null if no appropriate credentials have been found.
	 */
	_getOwnCredentialsFromStorage(storage) {
		let storageCredentialsString = storage.getItem("credentials");

		if(storageCredentialsString) {
			let storageCredentials = JSON.parse(storageCredentialsString);

			if(storageCredentials instanceof Array) {
				for(let i = 0; i < storageCredentials.length; i++) {
					let aResourceCredential = storageCredentials[i];

					if(aResourceCredential.uri == this.uri.toString())
						return aResourceCredential;
				}
			}
		}

		return null;
	}

	/**
	 * Gets the credentials stored in a storage for a resource having an uri who is the closest parent of this resource's uri.
	 * @param Storage the storage in where to look in the credentials.
	 * @return Object an object containing the credential informations, or null if no appropriate credentials have been found.
	 */
	_getParentsCredentialsFromStorage(storage) {
		let parentCredendials = new Array();
		let storageCredentialsString = storage.getItem("credentials");

		if(storageCredentialsString) {
			let storageCredentials = JSON.parse(storageCredentialsString);

			if(storageCredentials instanceof Array) {
				for(let i = 0; i < storageCredentials.length; i++) {
					let aResourceCredential = storageCredentials[i];

					if(this.uri.toString().startsWith(aResourceCredential.uri))
						parentCredendials.push(aResourceCredential);
				}
			}
		}
		
		if(parentCredendials.length > 0) {
			parentCredendials.sort((credentialA, credentialB) => {
				return (credentialB.length - credentialA.length);
			});

			return parentCredendials[0];
		}
		else
			return null;
	}

	/**
	 * Tries to retrieve the most appropriate credentials for the resource from localStorage or sessionStorage.
	 * @return Object an object containing the credential informations, or null if no appropriate credentials have been found.
	 */
	get credentials() {
		let credentials = null;

		if(window.sessionStorage)
			credentials = this._getOwnCredentialsFromStorage(window.sessionStorage);

		if((credentials == null) && (window.localStorage))
			credentials = this._getOwnCredentialsFromStorage(window.localStorage);
		
		if((credentials == null) && (this._use_parent_credentials) && (window.sessionStorage))
			credentials = this._getParentsCredentialsFromStorage(window.sessionStorage);

		if((credentials == null) && (this._use_parent_credentials) && (window.localStorage))
			credentials = this._getParentsCredentialsFromStorage(window.localStorage);

		return credentials;
	}

	/**
	 * Gets if the resource has credentials of its own (as opposed to "inherited from it's parents") in localStorage or sessionStorage
	 * @return boolean
	 */
	get hasOwnCredendtials() {
		let credentials = null;

		if(window.sessionStorage)
			credentials = this._getOwnCredentialsFromStorage(window.sessionStorage);

		if((credentials == null) && (window.localStorage))
			credentials = this._getOwnCredentialsFromStorage(window.localStorage);

		return (credentials != null);
	}

	/**
	 * Removes credentials information for the resource, stops using parent's credentials and resets the resource.
	 */
	disconnect() {
		this._removeOwnCredentials();
		this._use_parent_credentials = false;
		this.force_state_refresh();
	}

	/**
	 * Attemps to asynchronously read an existing object's data from the REST service and returns a Promise.
	 * @param AbortSignal abortSignal an optional AbortSignal allowing to stop the HTTP request
	 * @param Object credentials an optional credentials object. If none is specified, the "credentials" property value of the resource will be used.
	 * @return Promise
	 */
	get(abortSignal = null, credentials = null) {
		if(this._uri) {
			if(this._getPromise == null) {
				this._getPromise = new Promise((resolve, reject) => {
					this._syncStatus = "pending";

					let fetchParameters = {
						method: "GET",
						headers: new Headers({
							"Accept": "application/json"
						}),
						cache: "default"
					};

					if(credentials == null)
						credentials = this.credentials;

					if((credentials != null) && credentials.id && credentials.password)
						fetchParameters.headers.append("Authorization", "Basic " + btoa(credentials.id + ":" + credentials.password));

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
										this._authentified = ((credentials != null) && credentials.id && credentials.password);
										this._JSONData = parsedJson;
										this._syncStatus = "in_sync";
										resolve(response);
										this.notifyObservers();
									})
									.catch((error) => {
										this._authentified = false;
										this._syncStatus = "error";
										reject(error);
										this.notifyObservers(error);
									});
							}
							else {
								if(response.status == 401)
									this._syncStatus = "needs_auth";
								else if(response.status == 403)
									this._syncStatus = "access_denied";

								this._etag = null;
								this._authentified = false;
								this._getPromise = null;
								let error = new KTBSErrors.HttpError(response.status, response.statusText);
								reject(error);
								this.notifyObservers(error);
							}
						})
						.catch((error) => {
							this._syncStatus = "error";
							this._etag = null;
							this._authentified = false;
							this._getPromise = null;
							reject(error);
							this.notifyObservers(error);
						});
				});
			}

			return this._getPromise;
		}
		else
			throw new Error("Cannot read data from a resource without an uri");
	}

    /**
	 * Resets all the resource's data.
	 */
	force_state_refresh() {
		this._etag = null;
		this._JSONData = new Object();
		this._getPromise = null;
		this._syncStatus = "needs_sync";
	}

	/**
	 * Registers an new observer to notify when the resource's state changes
	 * @param function callback the function to add to the observers collection
	 * @throws TypeError if the provided "callback" argument is not a function
	 */
	addObserver(callback) {
		if(typeof callback == 'function')
			this._observers.push(callback);
		else
			throw new TypeError("The provided argument is not a function");
	}

	/**
	 * Unregisters an observer so it won't be notified anymore when the resource's state changes
	 * @param function callback the function to remove from the observers collection
	 */
	removeObserver(callback) {
		let callbackIndex = this._observers.findIndex(candidate => {
			return (candidate === callback);
		});
	  
		if(callbackIndex !== -1) {
			this._observers = this._observers.slice(callbackIndex, 1);
	  }
	}

	/**
	 * Notifies the registered observers of a state change of the current resource
	 * @param Object data the data to send along with the notifications
	 */
	notifyObservers(data) {
		for(let i = 0; i < this._observers.length; i++) {
			let aCallback = this._observers[i];

			try {
				(aCallback)(data);
			}
			catch(error) {
				console.log(error);
			}
		}
	}

	/**
	 * Extract a resource's relative ID from it's URI.
	 * @param string uri The URI to extract the ID from.
	 * @return string
	 * @static
	 */
	static extract_relative_id(uri_string) {
		let uri_parts = uri_string.split('/');

		// if the uri ends with a slash
		if(uri_string.charAt(uri_string.length - 1) == '/') {
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
}
