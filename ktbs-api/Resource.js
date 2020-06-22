import {RestError} from "./Errors.js";
import {KtbsError} from "./Errors.js";
import {JSONLDError} from "./Errors.js";

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
	 * @param URL or String new_uri the new URI for the resource.
	 * @throws TypeError Throws a TypeError if the uri parameter is not an instance of URL or String
	 * @throws Error Throws an Error if we try to set the URI of a resource that already exists on a kTBS service.
	 */
	set uri(new_uri) {
		if((this.syncStatus == "needs_sync") || (this.syncStatus == "pending")) {
			if(new_uri instanceof URL)
				this._uri = new_uri;
			else if(typeof new_uri == "string")
				this._uri = new URL(new_uri);
			else
				throw new TypeError("uri must be of either type \"URL\" or \"String\"");
		}
		else
			throw new KtbsError("Resource's URI can not be changed anymore");
	}

	/**
	 * Gets the synchronization status of the resource
	 * @return string the synchronisation status of the resource
	 */
	get syncStatus() {
		return this._syncStatus;
	}

	/**
	 * Sets the synchronization status of the resource
	 * @param string newStatus the new synchronisation status for the resource
	 * @throws TypeError if newValue is not a valid status
	 */
	set syncStatus(new_syncStatus) {
		if(
				(new_syncStatus == "needs_sync")
			||	(new_syncStatus == "pending")
			||	(new_syncStatus == "in_sync")
			||	(new_syncStatus == "error")
			||	(new_syncStatus == "needs_auth")
			||	(new_syncStatus == "access_denied")
			||	(new_syncStatus == "deleted")
		)
			this._syncStatus = new_syncStatus;
		else
			throw new TypeError(new_syncStatus + " is not a valid resource status");
	}

	/**
	 * Gets the JSON Data of the resource
	 * @returns Object
	 */
	get JSONData() {
		return this._JSONData;
	}

	/**
	 * Sets the JSON Data for the resource
	 * @param Object newJSONData the new JSON Data for the resource
	 * @throws TypeError if newJSONData is not an Object
	 */
	set JSONData(new_JSONData) {
		if(new_JSONData instanceof Object)
			this._JSONData = new_JSONData;
		else
			throw new TypeError("new JSONData must be an Object");
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
	 * 
	 */
	set context(new_context) {
		this._JSONData["@context"] = new_context;
	}

	/**
	 * Resolves a link from the current resource to another resource. Supports relative links and shortcut links referring to context.
	 * @return URL
	 */
	resolve_link_uri(link, force_use_context = false) {
		if(typeof link == "string") {
			if(link.startsWith("http://"))
				// link is absolute
				return new URL(link);
			else {
				let matches = link.match("^(.*):(.*)");

				if(matches != null) {
					// link seems to be relative to a named context prefix
					let link_prefix_name = matches[1];
					let link_suffix = matches[2];
					let prefix_name_substitution_string = null;

					if(this.context instanceof Array) {
						// resource context has multiple items
						for(let i = 0; i < this.context.length; i++) {
							let context_prefix = this.context[i];

							// in this case (argument link seems to be relative to a named context prefix), 
							// we are only intersted in context items who are Objects 
							// ( = associate a prefix name with a prefix substitution string)
							if(context_prefix instanceof Object) {
								for(let context_prefix_name in context_prefix) {
									if(context_prefix_name == link_prefix_name) {
										prefix_name_substitution_string = context_prefix[context_prefix_name];
										break;
									}
								}

								if(prefix_name_substitution_string != null)
									break;
							}
						}
					} 
					else if(this.context instanceof Object) {
						// resource context has only one items, who might not be an object, 
						// but in this case (argument link seems to be relative to a named context prefix), 
						// we are only intersted in context items who are Objects (associate a prefix name with a prefix substitution string)
						for(let context_prefix_name in this.context) {
							if(context_prefix_name == link_prefix_name) {
								prefix_name_substitution_string = this.context[context_prefix_name];
								break;
							}
						}
					}

					if(prefix_name_substitution_string != null) {
						if(prefix_name_substitution_string.charAt(prefix_name_substitution_string.length - 1) == "#") {
							let uri = new URL(prefix_name_substitution_string.substring(0, prefix_name_substitution_string.length - 1));
							uri.hash = decodeURIComponent(link_suffix);
							return uri;
						}
						else
							return new URL(link_suffix, prefix_name_substitution_string);
					}
					else
						throw new JSONLDError("Could not resolve prefix name \"" + link_prefix_name + "\" from resource's context data");
				}
				else {
					// link is not relative to a named context refix

					if(force_use_context) {
						// link is relative to a context prefix which is not named
						let prefix_string = null;

						if(this.context instanceof Array) {
							// resource context has multiple items
							for(let i = 0; i < this.context.length; i++) {
								let context_prefix = this.context[i];

								if(((typeof context_prefix) == "string") || (context_prefix instanceof String)) {
									prefix_string = context_prefix;
									break;
								}
							}
						}
						else {
							// resource context has only one item
							let context_prefix = this.context;

							if(((typeof context_prefix) == "string") || (context_prefix instanceof String))
								prefix_string = context_prefix;
						}

						if(prefix_string != null) {
							if(prefix_string.charAt(prefix_string.length - 1) == "#") {
								let uri = new URL(prefix_string.substring(0, prefix_string - 1));
								uri.hash = decodeURIComponent(link);
								return uri;
							}
							else
								return new URL(link, prefix_string);
						}
						else
							throw new JSONLDError("Could not resolve link \"" + link + "\" from resource's context data");
					}
					else {
						// default : link is relative to the current resource's uri
						return new URL(link, this.uri);
					}
				}
			}
		}
		else
			throw new TypeError("Parameter \"link\" must be a String");
	}

	/**
	 * Returns a user-friendly label
	 * @return string
	 */
	get label() {
		if(!this._label) {
			if(this._JSONData["label"])
				this._label = this._JSONData["label"];
			else
				this._label = this._JSONData["http://www.w3.org/2000/01/rdf-schema#label"];
		}

		return this._label;
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
	 * @param string new_label The new label for the resource
	 */
	set label(new_label) {
		this._JSONData["label"] = new_label;
		this._label = new_label;
	}

	/**
	 * Sets a translation for the label in a given language
	 * @param string label the translated label
	 * @param string lang a short code for the language the label is translated in
	 */
	set_translated_label(label, lang) {
		let newLabel;

		if(!(currentLabel instanceof Array)) {
			newLabel = new Array();
			newLabel.push({"@language": "en", "@value": this.label});
		}
		else
			newLabel = this.label;

		newLabel.push({"@language": lang, "@value": label})
		this.label = newLabel;
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
		if(this._JSONData["@id"])
			return Resource.extract_relative_id(this._JSONData["@id"]);
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
			this._JSONData["@id"] = id;
		else
			throw new KtbsError("Resource's ID can not be changed anymore");
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
								let error = new RestError(response.status, response.statusText);
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
			throw new KtbsError("Cannot get data from a resource without uri");
	}

    /**
	 * Resets all the resource's data.
	 */
	force_state_refresh() {
		this._etag = null;
		this._label = null;
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

			// @TODO check if "aCallback" is still a valid reference to a binded function before call, instead of try/catching it
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
				return last_id_part.substring(hash_char_position + 1);
			else
				return last_id_part;
		}
	}

	/**
	 * Gets the data to be send in a POST query
	 * @returns Object
	 */
	_getPostData() {
		return this._JSONData;
	}

	/**
	 * Stores a new resource as a child of the current resource
	 * @param {Resource, Array} new_child_resource the new child resource
	 * @param AbortSignal abortSignal an optional AbortSignal allowing to stop the HTTP request
	 * @param Object credentials an optional credentials object. If none is specified, the "credentials" property value of the resource will be used.
	 * @returns Promise
	 */
	post(new_child_resource, abortSignal = null, credentials = null) {
		if(this._uri) {
			if((new_child_resource instanceof Resource) || (new_child_resource instanceof Array)) {
				let postBody;

				if(new_child_resource instanceof Resource) {
					new_child_resource.syncStatus = "pending";
					postBody = JSON.stringify(new_child_resource._getPostData());
				}
				else if(new_child_resource instanceof Array) {
					let postBodyArray = new Array();

					for(let i = 0; i < new_child_resource.length; i++) {
						new_child_resource[i].syncStatus = "pending";
						postBodyArray.push(new_child_resource[i]._getPostData());
					}

					postBody = JSON.stringify(postBodyArray);
				}

				const postPromise = new Promise((resolve, reject) => {
					let fetchParameters = {
						method: "POST",
						headers: new Headers({
							"content-type": "application/json"
						}),
						body: postBody
					};

					if(credentials == null)
						credentials = this.credentials;

					if((credentials != null) && credentials.id && credentials.password)
						fetchParameters.headers.append("Authorization", "Basic " + btoa(credentials.id + ":" + credentials.password));

					if(abortSignal)
						fetchParameters.signal = abortSignal;
					
					fetch(this._uri, fetchParameters)
						.then((response) => {
							if(response.ok) {
								response.text()
								.then((responseText) => {
									// when the response content from the HTTP request has been successfully read
									this.syncStatus = "needs_sync";
									this._getPromise = null;

									if(new_child_resource instanceof Resource) {
										new_child_resource.uri = new URL(responseText);
										new_child_resource.syncStatus = "needs_sync";
										new_child_resource.notifyObservers();
									}
									else if(new_child_resource instanceof Array) {
										for(let i = 0; i < new_child_resource.length; i++) {
											new_child_resource[i].uri = new URL(responseText);
											new_child_resource[i].syncStatus = "needs_sync";
											new_child_resource[i].notifyObservers();
										}
									}
									
									resolve();
								})
								.catch((error) => {
									if(new_child_resource instanceof Resource)
										new_child_resource._syncStatus = "error";
									else if(new_child_resource instanceof Array) {
										for(let i = 0; i < new_child_resource.length; i++)
											new_child_resource[i]._syncStatus = "error";
									}

									reject(error);
								});
							}
							else {
								if(response.status == 401)
									this.syncStatus = "needs_auth";
								else if(response.status == 403)
									this.syncStatus = "access_denied";

								let error = new RestError(response.status, response.statusText);

								if(new_child_resource instanceof Resource) {
									new_child_resource.syncStatus = "needs_sync";
									new_child_resource.notifyObservers(error);
								}
								else if(new_child_resource instanceof Array) {
									for(let i = 0; i < new_child_resource.length; i++) {
										new_child_resource[i].syncStatus = "needs_sync";
										new_child_resource[i].notifyObservers(error);
									}
								}

								reject(error);
							}
						})
						.catch((error) => {
							this._syncStatus = "error";
							reject(error);
						});
				});

				return postPromise;
			}
			else
				throw new TypeError("Argument must be a Resource or an Array of Resource");
		}
		else
			throw new KtbsError("Cannot post data to a resource without uri");
	}

	/**
	 * Gets the data to be send in a PUT query
	 * @returns Object
	 */
	_getPutData() {
		let putData = this._JSONData;

		/*if(putData["@context"])
			delete putData["@context"];*/

		return putData;
	}

	/**
	 * Stores the current existing Resource modifications
	 * @param AbortSignal abortSignal an optional AbortSignal allowing to stop the HTTP request
	 * @param Object credentials an optional credentials object. If none is specified, the "credentials" property value of the resource will be used.
	 * @throws KtbsError throws a KtbsError when invoked for a Resource which sync status is not either "in_sync" or "needs_sync"
	 * @returns Promise
	 */
	put(abortSignal = null, credentials = null) {
		if((this.syncStatus == "needs_sync") || (this.syncStatus == "in_sync")) {
			if(this._etag) {
				const putPromise = new Promise((resolve, reject) => {
					let fetchParameters = {
						method: "PUT",
						headers: new Headers({
							"Accept": "application/json",
							"content-type": "application/json",
							"If-Match": this._etag
						}),
						body: JSON.stringify(this._getPutData())
					};

					if(credentials == null)
						credentials = this.credentials;

					if((credentials != null) && credentials.id && credentials.password)
						fetchParameters.headers.append("Authorization", "Basic " + btoa(credentials.id + ":" + credentials.password));

					if(abortSignal)
						fetchParameters.signal = abortSignal;
					
					fetch(this._uri, fetchParameters)
						.then((response) => {
							if(response.ok) {
								// when the response content from the HTTP request has been successfully read
								this._authentified = ((credentials != null) && credentials.id && credentials.password);
								this.syncStatus = "in_sync";
								resolve();
								this.notifyObservers();
							}
							else {
								if(response.status == 401)
									this.syncStatus = "needs_auth";
								else if(response.status == 403)
									this.syncStatus = "access_denied";

								let error = new RestError(response.status, response.statusText);
								reject(error);
								this.notifyObservers(error);
							}
						})
						.catch((error) => {
							this._syncStatus = "error";
							reject(error);
						});
				});

				return putPromise;
			}
			throw new KtbsError("Resource without an Etag cannot be put, you should probably invoke get() first");
		}
		else
			throw new KtbsError("Resource synchronization status \"" + this.syncStatus + "\" is not suitable for PUT operation")
	}

	/**
	 * Deletes the current resource
	 * @param AbortSignal abortSignal an optional AbortSignal allowing to stop the HTTP request
	 * @param Object credentials an optional credentials object. If none is specified, the "credentials" property value of the resource will be used.
	 * @returns Promise
	 */
	delete(abortSignal = null, credentials = null) {
		if(this._uri) {
			this.syncStatus = "pending";

			const deletePromise = new Promise((resolve, reject) => {
				let fetchParameters = {
					method: "DELETE",
					headers: new Headers({
						"Accept": "application/json"
					}),
				};

				if(this._etag)
					fetchParameters.headers.append("If-Match", this._etag);

				if(credentials == null)
					credentials = this.credentials;

				if((credentials != null) && credentials.id && credentials.password)
					fetchParameters.headers.append("Authorization", "Basic " + btoa(credentials.id + ":" + credentials.password));

				if(abortSignal)
					fetchParameters.signal = abortSignal;
				
				fetch(this._uri, fetchParameters)
					.then((response) => {
						if(response.ok) {
							this.syncStatus = "deleted";
							this._getPromise = null;
							resolve();
							this.notifyObservers();
						}
						else {
							if(response.status == 401)
								this.syncStatus = "needs_auth";
							else if(response.status == 403)
								this.syncStatus = "access_denied";

							let error = new RestError(response.status, response.statusText);
							reject(error);
							new_child_resource.notifyObservers(error);
						}
					})
					.catch((error) => {
						this.syncStatus = "error";
						reject(error);
					});
			});

			return deletePromise;
		}
		else
			throw new KtbsError("Cannot post data to a resource without uri");
	}
}
