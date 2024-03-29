import {RestError} from "./Errors.js";
import {KtbsError} from "./Errors.js";
import {JSONLDError} from "./Errors.js";
import {ResourceMultiton} from "./ResourceMultiton.js";

/**
 * Abstract class intended to be inherited by KTBS resource types
 */
export class Resource {

	/**
	 * Constructor
	 * \param URL or string uri the resource's URI
	 * \public
	 */
	constructor(uri = null) {

		this._bindedOnClientAbortsGetRequestMethod = this._onClientAbortsGetRequest.bind(this);

		/**
		 * The etag provided by the server at the resource latest HTTP query
		 * \var string
		 * \protected
		 */
		this._etag = null;

		/**
		 * The resource data that can be read from/written to the remote kTBS service
		 * \var Object
		 * \protected
		 */
		this._JSONData = new Object();

		/**
		 * The resource synchronization status
		 * \var string
		 * \protected
		 */
		this._syncStatus = "needs_sync";

		/**
		 * The resource lifecycle status
		 * \var string
		 * \protected
		 */
		this._lifecycleStatus = "new";

		/**
		 * The error that occured during the latest REST operation attempt for this resource, if any (null if no REST operation was attempted since instanciation, or if the latest one was successfull)
		 * \var Error
		 * \protected
		 */
		this._error = null;

		/**
		 * A Promise for the "GET" request allowing to read the resource's data
		 * \var Promise
		 * \protected
		 */
		this._getPromise = null;

		/**
		 * An array registering all clients abort signals that accessed the current GET request
		 * \var Array
		 * \protected
		 */
		this._clientGetAbortSignals = new Array();

		/**
		 * Stores the registered observers
		 * \var Object
		 * \protected
		 */
		this._observers = {};

		/**
		 * Stores the notifications that are queued before being sent
		 * \var Object
		 * \protected
		 */
		this._queuedNotifications = {"sync-status-change" : "needs_sync", "lifecycle-status-change": "new"};

		/**
		 * Whether or not the resource was get using authentification credentials
		 * \var boolean
		 * \protected
		 */
		this._authentified = false;

		/**
		 * Whether or not we should try to use credentials previously stored in local/session storages for the resource's parent URIs 
		 * \var boolean
		 * \protected
		 */
		this._use_parent_credentials = true;

		// if an uri has been specified at instanciation, set it
		if(uri != null)
			this.uri = uri;
	}

	/**
	 * Gets the resource's URI
	 * \return URL
	 * \public
	 */
	get uri() {
		return this._uri;
	}

	/**
	 * Sets the resource's URI
	 * \param URL or String new_uri the new URI for the resource.
	 * \throws TypeError Throws a TypeError if the uri parameter is not an instance of URL or String
	 * \throws KtbsError Throws an KtbsError if we try to change the URI of a resource that already exists on a remote kTBS service
	 * \public
	 */
	set uri(new_uri) {
		if(this._lifecycleStatus == "new") {
			if(new_uri instanceof URL)
				this._uri = new_uri;
			else if(typeof new_uri == "string")
				this._uri = new URL(new_uri);
			else
				throw new TypeError("uri must be of either type \"URL\" or \"String\"");

			this._lifecycleStatus = "exists";
			this._queuedNotifications["lifecycle-status-change"] = "exists";
		}
		else
			throw new KtbsError("Resource's URI can not be changed anymore");
	}

	/**
	 * Gets the synchronization status of the resource
	 * \return string the synchronisation status of the resource
	 * \public
	 */
	get syncStatus() {
		return this._syncStatus;
	}

	/**
	 * 
	 */
	_removeFromSharedCache() {
		return new Promise((resolve, reject) => {
			Resource.sharedCacheOpened
				.then((sharedCache) => {
					if(this._cachedGetRequest) {
						sharedCache.delete(this._cachedGetRequest)
							.then((response) => {
								delete this._cachedGetRequest;
								resolve();
							})
							.catch(reject);
					}
					else
						resolve();
				})
				.catch(reject);
		});
	}

	/**
	 * Sets the synchronization status of the resource
	 * \param string new_syncStatus the new synchronisation status for the resource
	 * \throws TypeError if new_syncStatus is not a valid synchronization status
	 * \public
	 */
	set syncStatus(new_syncStatus) {
		if(
				(new_syncStatus == "needs_sync")
			||	(new_syncStatus == "pending")
			||	(new_syncStatus == "in_sync")
			||	(new_syncStatus == "error")
			||	(new_syncStatus == "needs_auth")
			||	(new_syncStatus == "access_denied")
		) {
			const old_syncStatus = this._syncStatus;

			if(new_syncStatus != old_syncStatus) {
				if(old_syncStatus == "in_sync")
					this._removeFromSharedCache();

				this._syncStatus = new_syncStatus;
				this._queueNotification("sync-status-change", old_syncStatus);
			}
		}
		else
			throw new TypeError(new_syncStatus + " is not a valid synchronization status");
	}

	/**
	 * Gets the lifecycle status of the resource
	 * \return string the lifecycle status of the resource
	 * \public
	 */
	get lifecycleStatus() {
		return this._lifecycleStatus;
	}

	/**
	 * Sets the lifecycle status for the resource
	 * \param string new_lifecycleStatus the new lifecycle status for the resource
	 * \throws TypeError if new_lifecycleStatus is not a valid lifecycle status
	 * \throws TypeError if the new lifecycle status can not be switched to from the current one (allowed transitions are : new > exists, exists > modified, exists > deleted, modified > exists, modified > deleted)
	 * \public
	 */
	set lifecycleStatus(new_lifecycleStatus) {
		if(
				(new_lifecycleStatus == "new")
			||	(new_lifecycleStatus == "exists")
			||	(new_lifecycleStatus == "modified")
			||	(new_lifecycleStatus == "deleted")
		) {
			if(
					((this._lifecycleStatus == "new") && (new_lifecycleStatus == "modified"))
				||	((this._lifecycleStatus == "new") && (new_lifecycleStatus == "deleted"))
				||	((this._lifecycleStatus == "exists") && (new_lifecycleStatus == "new"))
				||	((this._lifecycleStatus == "modified") && (new_lifecycleStatus == "new"))
				||	((this._lifecycleStatus == "deleted") && (new_lifecycleStatus != "deleted"))
			)
				throw new TypeError("Transition from lifecycle status \"" + this._lifecycleStatus + "\" to \"" + new_lifecycleStatus + "\" forbidden");
			else {
				if(new_lifecycleStatus == "deleted")
					this._removeFromSharedCache();

				const oldStatus = this._lifecycleStatus;
				
				if(new_lifecycleStatus != oldStatus) {
					this._lifecycleStatus = new_lifecycleStatus;
					this._queueNotification("lifecycle-status-change", oldStatus);
				}
			}
		}
		else
			throw new TypeError(new_lifecycleStatus + " is not a valid lifecycle status");
	}

	/**
	 * Registers a new observer to notify when the resource's state changes
	 * \param function callback the callback function to add to the observers collection
	 * \param notification_types
	 * \param values
	 * \throws TypeError if the provided "observer_callback" argument is not a function
	 * \public
	 */
	registerObserver(callback, notification_types = "*", values = "*") {
		if(typeof callback == 'function') {
			const notification_types_array = (notification_types instanceof Array)?notification_types:[notification_types];
			const values_array = (values instanceof Array)?values:[values];

			for(let i = 0; i < notification_types_array.length; i++) {
				const aNotificationType = notification_types_array[i];

				if(this._observers[aNotificationType] == undefined) {
					if(aNotificationType == "*")
						this._observers["*"] = new Array();
					else
						this._observers[aNotificationType] = {};
				}

				if(aNotificationType == "*") {
					if(!this._observers["*"].includes(callback))
						this._observers["*"].push(callback);
				}
				else {
					for(let j = 0; j < values_array.length; j++) {
						const aValue = values_array[j];

						if(this._observers[aNotificationType][aValue] == undefined)
							this._observers[aNotificationType][aValue] = new Array();

						if(!this._observers[aNotificationType][aValue].includes(callback))
							this._observers[aNotificationType][aValue].push(callback);
					}
				}
			}
		}
		else
			throw new TypeError("The provided argument is not a function");
	}

	/**
	 * Unregisters an observer so it won't be notified anymore when the resource's state changes
	 * \param function callback the callback function to remove from the observers collection
	 * \param notification_types
	 * \param values
	 * \public
	 */
	unregisterObserver(callback, notification_types = "*", values = "*") {
		const notification_types_array = (notification_types instanceof Array)?notification_types:[notification_types];
		const values_array = (values instanceof Array)?values:[values];

		for(let i = 0; i < notification_types_array.length; i++) {
			const aNotificationType = notification_types_array[i];

			if(aNotificationType == "*") {
				if(this._observers["*"] instanceof Array) {
					const callback_index = this._observers["*"].findIndex(callback);

					if(callback_index != -1)
						this._observers["*"].splice(callback_index, 1);
				}
			}
			else if(this._observers[aNotificationType] instanceof Array) {
				for(let j = 0; j < values_array.length; j++) {
					const aValue = values_array[j];

					if(this._observers[aNotificationType][aValue] instanceof Array) {
						const callback_index = this._observers[aNotificationType][aValue].findIndex(callback);

						if(callback_index != -1)
							this._observers[aNotificationType][aValue].splice(callback_index, 1);
					}
				}
			}
		}
	}

	/**
	 * 
	 * \param string type 
	 * \param string old_value 
	 * \protected
	 */
	_queueNotification(type, old_value) {
		if((type == "sync-status-change") || (type == "lifecycle-status-change") || (type == "children-add")) {
			if(this._queuedNotifications[type] == undefined)
				this._queuedNotifications[type] = old_value;
		}
		else
			throw new KtbsError("Cannot queue notification of unknown type \"" + type + "\"");
	}

	/**
	 * Notifies the registered observers of a state change of the current resource
	 * \param string notification_type
	 * \param string new_value
	 * \public
	 */
	_notifyObservers(notification_type, old_value, new_value) {
		// build the list of observers whose subscribing criteras match this notification
		let notified_observers = new Array();

		// get the observers who subscribe to ALL notifications
		if(this._observers["*"] instanceof Array)
			notified_observers = notified_observers.concat(this._observers["*"]);

		// get the observers who subscribe to notifications of the same type
		if(this._observers[notification_type]) {
			// get the observers who subscribe to notifications of the same type with ANY value
			if(this._observers[notification_type]["*"] instanceof Array)
				notified_observers = notified_observers.concat(this._observers[notification_type]["*"]);

			// get the observers who subscribe to notifications of the same type with the same value
			if(this._observers[notification_type][new_value] instanceof Array)
				notified_observers = notified_observers.concat(this._observers[notification_type][new_value]);
		}

		// filter duplicates to ensure we have only unique values
		notified_observers = notified_observers.filter((v, i, a) => a.indexOf(v) === i);

		// finally, send notifications (= call registered callbacks)
		for(let i = 0; i < notified_observers.length; i++) {
			const aCallback = notified_observers[i];

			if(aCallback && (typeof aCallback == 'function'))
				(aCallback)(this, notification_type, old_value);
		}
	}

	/**
	 * 
	 * \public
	 */
	sendQueuedNotifications() {
		if(this._queuedNotifications["sync-status-change"] != undefined) {
			this._notifyObservers("sync-status-change", this._queuedNotifications["sync-status-change"], this.syncStatus);
			delete this._queuedNotifications["sync-status-change"];
		}

		if(this._queuedNotifications["lifecycle-status-change"] != undefined) {
			this._notifyObservers("lifecycle-status-change", this._queuedNotifications["lifecycle-status-change"], this.lifecycleStatus);
			delete this._queuedNotifications["lifecycle-status-change"];
		}

		if(this._queuedNotifications["children-add"] != undefined) {
			this._notifyObservers("children-add", this._queuedNotifications["children-add"]);
			delete this._queuedNotifications["children-add"];
		}
	}

	/**
	 * Gets the error that occured during the latest REST operation attempt for this resource, if any
	 * \return Error or null if no REST operation was attempted since instanciation, or if the latest one was successfull
	 * \public
	 */
	get error() {
		return this._error;
	}

	/**
	 * Gets the JSON Data of the resource
	 * \return Object
	 * \public
	 */
	get JSONData() {
		return this._JSONData;
	}

	/**
	 * Gets the eTag identifying the resource's version returned by the remote server at latest successfull query
	 * \return string
	 * \public
	 */
	get etag() {
		return this._etag;
	}

	/**
	 * 
	 * \return string
	 * \public
	 */
	get type() {
		return this._JSONData["@type"];
	}

	/**
	 * Sets the JSON Data for the resource
	 * \param Object newJSONData the new JSON Data for the resource
	 * \throws TypeError if newJSONData is not an Object
	 * \public
	 */
	set JSONData(new_JSONData) {
		if(new_JSONData instanceof Object) {
			this._JSONData = new_JSONData;
			this._resetCalculatedData();
		}
		else
			throw new TypeError("new JSONData must be an Object");
	}

	/**
	 * Gets whether or not the resource was read using authentication credentials.
	 * \return boolean
	 * \public
	 */
	get authentified() {
		return this._authentified;
	}

	/**
	 * Gets the uri to query in order to read resource's data (For some resource types, this might be different from the resource URI, for instance if we need to add some query parameters. In such case, descending resource types must override this method)
	 * \return URL
	 * \protected
	 */
	get _data_read_uri() {
		return this._uri;
	}

	/**
	 * Gets the JSON-LD context of the resource
	 * \return Object
	 * \public
	 */
	get context() {
		return this._JSONData["@context"];
	}

	/**
	 * Sets the JSON-LD context of the resource
	 * \param string new_context the JSON-LD context for the resource
	 * \public
	 */
	set context(new_context) {
		this._JSONData["@context"] = new_context;
	}

	/**
	 * Resolves a link from the current resource to another resource. Supports relative links and shortcut links referring to context.
	 * \param string link 
	 * \param boolean force_use_context 
	 * \return URL
	 * \public
	 */
	resolve_link_uri(link, force_use_context = false) {
		if(typeof link == "string") {
			if(link.startsWith("http://") || link.startsWith("https://"))
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
					else // default : link is relative to the current resource's uri
						return new URL(link, this.uri);
				}
			}
		}
		else
			throw new TypeError("Parameter \"link\" must be a String");
	}

	/**
	 * Returns a user-friendly label
	 * \return string
	 * \public
	 */
	get label() {
		return this._JSONData["label"];
	}

	/**
	 * Set a user-friendly label.
	 * \param string new_label The new label for the resource
	 * \public
	 */
	set label(new_label) {
		this._JSONData["label"] = new_label;
		this._label = new_label;
	}

	/**
	 * Gets the labels translations array
	 * \return Array
	 * \public
	 */
	get label_translations() {
		const labelKeys = ["label", "http://www.w3.org/2000/01/rdf-schema#label", "rdfs:label"];

		for(let i = 0; i < labelKeys.length; i++)
			if(this._JSONData[labelKeys[i]] && (this._JSONData[labelKeys[i]] instanceof Object))
				return this._JSONData[labelKeys[i]];

		return undefined;
	}

	/**
	 * Sets the labels translations array
	 * \param Array newValue
	 * \public
	 */
	set label_translations(newValue) {
		this._JSONData["http://www.w3.org/2000/01/rdf-schema#label"] = newValue;
	}

	/**
	 * Gets the label for a given language
	 * \param string lang a short code for the language we want the label translated into
	 * \return string the translated label, or the default label if no translated label has been found (which can be "undefined" if it hasn't been set)
	 * \public
	 */
	get_translated_label(lang) {
		const labelKeys = ["label", "http://www.w3.org/2000/01/rdf-schema#label", "rdfs:label"];

		for(let i = 0; i < labelKeys.length; i++) {
			const labelTranslations = this._JSONData[labelKeys[i]];

			if(labelTranslations instanceof Array) {
				for(let i = 0; i < labelTranslations.length; i++) {
					let aLabelTranslation = labelTranslations[i];

					if((aLabelTranslation instanceof Object) && (aLabelTranslation["@language"] == lang))
						return aLabelTranslation["@value"];
				}
			}
			else if(
					(labelTranslations instanceof Object)
				&&	labelTranslations["@language"]
				&&	labelTranslations["@value"]
				&& 	(labelTranslations["@language"] == lang)
			)
				return labelTranslations["@value"];
		}

		return undefined;
	}

	/**
	 * Sets a translation for the label in a given language
	 * \param string label the translated label
	 * \param string lang a short code for the language the label is translated in
	 * \public
	 */
	set_translated_label(label, lang) {
		let label_translations, label_translations_key;

		if(this._JSONData["http://www.w3.org/2000/01/rdf-schema#label"]) {
			label_translations = this._JSONData["http://www.w3.org/2000/01/rdf-schema#label"];
			label_translations_key = "http://www.w3.org/2000/01/rdf-schema#label";
		}
		else if(this._JSONData["rdfs:label"]) {
			label_translations = this._JSONData["rdfs:label"];
			label_translations_key = "rdfs:label";
		}
		else {
			label_translations = new Array();
			label_translations_key = "http://www.w3.org/2000/01/rdf-schema#label";
		}

		let existing_translation_replaced = false;

		for(let i = 0; !existing_translation_replaced && (i < label_translations.length); i++)
			if(label_translations[i]["@language"] == lang) {
				label_translations[i]["@value"] = label;
				existing_translation_replaced = true;
			}
	
		if(!existing_translation_replaced)
			label_translations.push({"@value": label, "@language": lang})
		
		this._JSONData[label_translations_key] = label_translations;
	}

	/**
	 * 
	 */
	get_preferred_label(lang) {
		let preferred_label = this.get_translated_label(lang);

		if(!preferred_label)
			preferred_label = this.label;

		if(!preferred_label)
			preferred_label = this.id;

		return preferred_label;
	}

	/**
	 * Gets the "comment" of the resource
	 * \return string
	 * \public
	 */
	get comment() {
		return this._JSONData["http://www.w3.org/2000/01/rdf-schema#comment"];
	}

	/**
	 * Sets the "comment" of the resource
	 * \param string comment the new comment for the resource
	 * \public
	 */
	set comment(comment) {
		this._JSONData["http://www.w3.org/2000/01/rdf-schema#comment"] = comment;
	}

	/**
	 * Gets the ID of this resource, relative to its parent resource URI.
	 * \return string
	 * \public
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
	 * \param string id the new ID for the resource.
	 * \throws KtbsError Throws a KtbsError if we try to change the ID of a resource that already exists on a kTBS service
	 * \public
	 */
	set id(id) {
		if(this.syncStatus == "needs_sync")
			this._JSONData["@id"] = id;
		else
			throw new KtbsError("Resource's ID can not be changed anymore");
	}

	/**
	 * Remove the credentials stored in a given storage for the resource's URI
	 * \param Storage storage The storage to remove the credentials from
	 * \protected
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
	 * \protected
	 */
	_removeOwnCredentials() {
		if(window.sessionStorage)
			this._removeOwnCredentialsFromStorage(sessionStorage);

		if(window.localStorage)
			this._removeOwnCredentialsFromStorage(localStorage);

		this._credentials = null;
	}

	/**
	 * Gets the credentials stored in a storage specifically for this resource.
	 * \param Storage the storage in where to look in the credentials.
	 * \return Object an object containing the credential informations, or null if no appropriate credentials have been found.
	 * \protected
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
	 * \param Storage the storage in where to look in the credentials.
	 * \return Object an object containing the credential informations, or null if no appropriate credentials have been found.
	 * \protected
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
	 * \return Object an object containing the credential informations, or null if no appropriate credentials have been found.
	 * \public
	 */
	get credentials() {
		if(!this._credentials) {
			if(window.sessionStorage)
				this._credentials = this._getOwnCredentialsFromStorage(window.sessionStorage);

			if(!this._credentials && (window.localStorage))
				this._credentials = this._getOwnCredentialsFromStorage(window.localStorage);
			
			if(!this._credentials && (this._use_parent_credentials) && (window.sessionStorage))
				this._credentials = this._getParentsCredentialsFromStorage(window.sessionStorage);

			if(!this._credentials && (this._use_parent_credentials) && (window.localStorage))
				this._credentials = this._getParentsCredentialsFromStorage(window.localStorage);
		}

		return this._credentials;
	}

	/**
	 * Gets if the resource has credentials of its own (as opposed to "inherited from it's parents") in localStorage or sessionStorage
	 * \return boolean
	 * \public
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
	 * \public
	 */
	disconnect() {
		this._removeOwnCredentials();
		this._use_parent_credentials = false;
		this.force_state_refresh();
	}

	/**
	 * Finds the Ktbs root that hosts the current resource 
	 * \return Promise a Promise that resolves with the Ktbs root
	 * \public
	 */
	get_root(abortSignal = null, credentials = null) {
		let resolveRootPromise, rejectRootPromise;

		const rootPromise = new Promise((resolve, reject) => {
			resolveRootPromise = resolve;
			rejectRootPromise = reject;
		});

		this.get(abortSignal, credentials)
			.then(() => {
				if(this.type == "Ktbs")
					resolveRootPromise(this);
				else {
					this.parent.get(abortSignal, credentials)
						.then(() => {
							this.parent.get_root(abortSignal, credentials)
								.then((root) => {
									resolveRootPromise(root);
								})
								.catch((error) => {
									rejectRootPromise(error);
								});
						})
						.catch((error) => {
							rejectRootPromise(error);
						});
				}
			})
			.catch((error) => {
				rejectRootPromise(error);
			});

		return rootPromise;
	}

	/**
	 * 
	 */
	_processGetResponse(response, credential_used) {
		return new Promise((resolve, reject) => {
			// if the HTTP request responded successfully
			if(response.ok) {
				if(response.headers.has("etag"))
					this._etag = response.headers.get("etag");
				else
					this._etag = null;

				// when the response content from the HTTP request has been successfully read
				response.json()
					.then((parsedJson) => {
						this._authentified = credential_used;
						this.JSONData = parsedJson;
						this._error = null;
						this.lifecycleStatus = "exists";
						this.syncStatus = "in_sync";
						resolve(response);
					})
					.catch(reject);
			}
			else {
				let responseBody = null;

				response.text()
					.then((responseText) => {
						responseBody = responseText;
					})
					.finally(() => {
						const error = new RestError(response.status, response.statusText, responseBody);
						reject(error);
					});
			}
		});
	}

	/**
	 * Attemps to asynchronously read an existing object's data from the REST service and returns a Promise.
	 * \param AbortSignal abortSignal an optional AbortSignal allowing to stop the HTTP request
	 * \param Object credentials an optional credentials object. If none is specified, the "credentials" property value of the resource will be used.
	 * \throws KtbsError throws a KtbsError if the resource has lifecycle status "new" or "deleted"
	 * \return Promise
	 * \public
	 */
	get(abortSignal = null, credentials = null) {
		if((this.lifecycleStatus == "exists") || (this.lifecycleStatus == "modified")) {
			if((this.syncStatus != "in_sync") && (this.syncStatus != "pending")) {
				this.syncStatus = "pending";
				this.sendQueuedNotifications();

				this._getPromise = new Promise((resolve, reject) => {
					Resource.sharedCacheOpened
						.then((sharedCache) => {
							this._currentGetRequestAbortController = new AbortController();
							this._purgeClientGetAbortSignals();

							const getRequestHeaders = new Headers({
								"Accept": "application/json",
								"X-Requested-With": "XMLHttpRequest"
							});

							if(!credentials && this.credentials)
								credentials = this.credentials;

							let credential_used = false;

							if(credentials && credentials.id && credentials.password) {
								getRequestHeaders.append("Authorization", "Basic " + btoa(credentials.id + ":" + credentials.password));
								credential_used = true;
							}

							if(this._etag)
								getRequestHeaders.append("If-None-Match", this._etag);

							const getRequestParameters = {
								method: "GET",
								headers: getRequestHeaders,
								cache: "no-store",
								signal: this._currentGetRequestAbortController.signal
							};

							const getRequest = new Request(this._data_read_uri, getRequestParameters);
							
							sharedCache.match(getRequest)
								.then((cacheMatchResponse) => {
									if(cacheMatchResponse != undefined) {
										this._processGetResponse(cacheMatchResponse, credential_used)
											.then((processResponse) => {
												resolve(processResponse);
												this.sendQueuedNotifications();
											})
											.catch((processError) => {
												reject(processError);
											});
									}
									else {
										this._registerClientGetAbortSignal(abortSignal);

										fetch(getRequest)
											.then((fetchResponse) => {
												const responseClone = fetchResponse.clone();

												this._processGetResponse(fetchResponse, credential_used)
													.then((processResponse) => {
														sharedCache.put(getRequest, responseClone)
															.then((cachePutResponse) => {
																this._cachedGetRequest = getRequest;
																resolve(processResponse);
																this.sendQueuedNotifications();
															})
															.catch((cachePutError) => {
																this._etag = null;
																this._authentified = false;
																this._error = cachePutError;
																this.syncStatus = "error";
																reject(cachePutError);
																this.sendQueuedNotifications();
															});
													})
													.catch((processError) => {
														this._etag = null;
														this._authentified = false;
														this._error = processError;

														if(processError.name == "RestError") {
															if(processError.statusCode == 401)
																this.syncStatus = "needs_auth";
															else if(processError.statusCode == 403)
																this.syncStatus = "access_denied";
															else
																this.syncStatus = "error";
														}
														else
															this.syncStatus = "error";

														reject(processError);
														this.sendQueuedNotifications();
													});
											})
											.catch((fetchError) => {
												this._etag = null;
												this._authentified = false;

												if((fetchError.name == "AbortError") && (this._currentGetRequestAbortController.signal.aborted)) {
													this._error = null;
													this.syncStatus = "needs_sync";
												}
												else {
													this._error = fetchError;
													this.syncStatus = "error";
												}

												reject(fetchError);
												this.sendQueuedNotifications();
											});
									}
								})
								.catch((cacheMatchError) => {
									this._etag = null;
									this._authentified = false;
									this._error = cacheMatchError;
									this.syncStatus = "error";
									reject(cacheMatchError);
									this.sendQueuedNotifications();
								});
						})
						.catch((openSharedCacheError) => {
							this._etag = null;
							this._authentified = false;
							this._error = openSharedCacheError;
							this.syncStatus = "error";
							reject(openSharedCacheError);
							this.sendQueuedNotifications();
						});
				});
			}
			else {
				if(!this._getPromise) {
					let resolveDummyPromise;

					this._getPromise = new Promise((resolve, reject) => {
						resolveDummyPromise = resolve;
					});

					resolveDummyPromise();
				}

				this._registerClientGetAbortSignal(abortSignal);
			}

			return this._getPromise;
		}
		else
			throw new KtbsError("Cannot get data from a resource with lifecycle status \"" + this.lifecycleStatus + "\"");
	}

	/**
	 * Callback function triggered when a client aborts the GET he attempted
	 * \param Event event
	 * \public
	 */
	_onClientAbortsGetRequest(event) {
		if(this._currentGetRequestAbortController) {
			let atLeastOneClientDidntAbort = false;

			for(let i = 0; (i < this._clientGetAbortSignals.length) && !atLeastOneClientDidntAbort; i++)
				atLeastOneClientDidntAbort = ((this._clientGetAbortSignals[i] != null) && !this._clientGetAbortSignals[i].aborted);

			if(!atLeastOneClientDidntAbort)
				this._currentGetRequestAbortController.abort();
		}
	}

	/**
	 * Clears all the previous GET request's registered client abort signals
	 * \public
	 */
	_purgeClientGetAbortSignals() {
		while(this._clientGetAbortSignals.length > 0) {
			const aClientGetAbortSignal = this._clientGetAbortSignals.pop();

			if(aClientGetAbortSignal != null)
				aClientGetAbortSignal.removeEventListener("abort", this._bindedOnClientAbortsGetRequestMethod);
		}
	}

	/**
	 * Registers a client abort signal
	 * \param AbortSignal or null abort_signal. If null, then the resource's current GET request becomes non-abortable
	 * \public
	 */
	_registerClientGetAbortSignal(abort_signal) {
		if(abort_signal != null)
			abort_signal.addEventListener("abort", this._bindedOnClientAbortsGetRequestMethod);

		this._clientGetAbortSignals.push(abort_signal);
	}

    /**
	 * Resets all the resource's source data
	 * \public
	 */
	force_state_refresh() {
		this._etag = null;
		this.JSONData = new Object();
		
		if(this.uri)
			this._lifecycleStatus = "exists";
		else
			this._lifecycleStatus = "new";

		this.syncStatus = "needs_sync";
		this._resetCalculatedData();
		this._getPromise = null;
		
		this.sendQueuedNotifications();
	}

	/**
	 * Resets the calculated data temporarily stored in memory as instance variables. Descendant classes that add such variables should override this method, reset their own-level variables and then call super._resetCalculatedData()
	 * \public
	 */
	_resetCalculatedData() {
		if(this._label)
			delete this._label;
	}

	/**
	 * Extract a resource's relative ID from it's URI.
	 * \param string uri The URI to extract the ID from.
	 * \return string
	 * \public
	 * \static
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
	 * \return Object
	 * \protected
	 */
	_getPostData() {
		return this._JSONData;
	}

	/**
	 * Stores one or several new resource(s) as (a) child(ren) of the current resource
	 * \param Resource or Array of Resource new_child_resource - the new child resource(s)
	 * \param AbortSignal abortSignal an optional AbortSignal allowing to stop the HTTP request
	 * \param Object credentials an optional credentials object. If none is specified, the "credentials" property value of the resource will be used.
	 * \throws TypeError if parameter new_child_resource is neither an instance of Resource or an Array containing only instances of Resource
	 * \throws KtbsError throws a KtbsError if the current resource has lifecycle status "new" or "deleted"
	 * \throws KtbsError throws a KtbsError if (one of) the child resource(s) has a lifecycle status different from "new"
	 * \return Promise
	 * \public
	 */
	post(new_child_resource, abortSignal = null, credentials = null) {
		if((this.lifecycleStatus == "exists") || (this.lifecycleStatus == "modified")) {
			if((new_child_resource instanceof Resource) || (new_child_resource instanceof Array)) {
				let postBody;

				if(new_child_resource instanceof Resource) {
					if(new_child_resource.lifecycleStatus != "new")
						throw new KtbsError("Can not post a new child resource with a lifecycle status different from \"new\"");
					else {
						new_child_resource.syncStatus = "pending";
						new_child_resource.sendQueuedNotifications();
						postBody = JSON.stringify(new_child_resource._getPostData());
					}
				}
				else if(new_child_resource instanceof Array) {
					let postBodyArray = new Array();

					for(let i = 0; i < new_child_resource.length; i++) {
						if(!(new_child_resource[i] instanceof Resource))
							throw new TypeError("Argument new_child_resource must be a Resource or an Array of Resource");
						if(new_child_resource[i].lifecycleStatus != "new")
							throw new KtbsError("Can not post a new child resource with a lifecycle status different from \"new\"");
						else {
							new_child_resource[i].syncStatus = "pending";
							new_child_resource[i].sendQueuedNotifications();
							postBodyArray.push(new_child_resource[i]._getPostData());
						}
					}

					postBody = JSON.stringify(postBodyArray);
				}

				const postPromise = new Promise((resolve, reject) => {
					let fetchParameters = {
						method: "POST",
						headers: new Headers({
							"content-type": "application/json",
							"X-Requested-With": "XMLHttpRequest"
						}),
						body: postBody
					};

					if(!credentials && this.credentials)
						credentials = this.credentials;

					if(credentials && credentials.id && credentials.password)
						fetchParameters.headers.append("Authorization", "Basic " + btoa(credentials.id + ":" + credentials.password));

					if(abortSignal)
						fetchParameters.signal = abortSignal;
					
					fetch(this._uri, fetchParameters)
						.then((response) => {
							if(response.ok) {
								response.text()
									.then((responseText) => { // the response content from the HTTP request has been successfully read
										if(new_child_resource instanceof Resource) {
											new_child_resource.uri = new URL(responseText);
											new_child_resource.lifecycleStatus = "exists";
											new_child_resource.syncStatus = "needs_sync";
											ResourceMultiton.register_resource(new_child_resource);
											new_child_resource.sendQueuedNotifications();
										}
										else if(new_child_resource instanceof Array) {
											for(let i = 0; i < new_child_resource.length; i++) {
												new_child_resource[i].uri = new URL(responseText);
												new_child_resource[i].lifecycleStatus = "exists";
												new_child_resource[i].syncStatus = "needs_sync";
												ResourceMultiton.register_resource(new_child_resource[i]);
												new_child_resource[i].sendQueuedNotifications();
											}
										}

										this._error = null;
										this._registerNewChildren(new_child_resource);
										resolve();
										this.sendQueuedNotifications();
									})
									.catch((error) => {
										if(new_child_resource instanceof Resource) {
											new_child_resource.syncStatus = "error";
											new_child_resource.sendQueuedNotifications();
										}
										else if(new_child_resource instanceof Array) {
											for(let i = 0; i < new_child_resource.length; i++) {
												new_child_resource[i].syncStatus = "error";
												new_child_resource[i].sendQueuedNotifications();
											}
										}

										this._error = error;
										reject(error);
									});
							}
							else {
								let responseBody = null;

								response.text()
									.then((responseText) => {
										responseBody = responseText;
									})
									.finally(() => {
										let error = new RestError(response.status, response.statusText, responseBody);

										if(new_child_resource instanceof Resource) {
											new_child_resource.syncStatus = "needs_sync";
											new_child_resource.sendQueuedNotifications();
										}
										else if(new_child_resource instanceof Array) {
											for(let i = 0; i < new_child_resource.length; i++) {
												new_child_resource[i].syncStatus = "needs_sync";
												new_child_resource[i].sendQueuedNotifications();
											}
										}

										this._error = error;
										reject(error);
									});
							}
						})
						.catch((error) => {
							this._error = error;
							reject(error);
						});
				});

				return postPromise;
			}
			else
				throw new TypeError("Argument new_child_resource must be a Resource or an Array of Resource");
		}
		else
			throw new KtbsError("Cannot post data to a resource with lifecycle status \"" + this.lifecycleStatus + "\"");
	}

	/**
	 * Gets the data to be send in a PUT query
	 * \return Object
	 * \protected
	 */
	_getPutData() {
		return this._JSONData;
	}

	/**
	 * Stores the current existing Resource modifications
	 * \param AbortSignal abortSignal an optional AbortSignal allowing to stop the HTTP request
	 * \param Object credentials an optional credentials object. If none is specified, the "credentials" property value of the resource will be used.
	 * \throws KtbsError throws a KtbsError when invoked for a Resource whose lifecycle status is not "exists" or "modified", and/or sync status is not "in_sync"
	 * \return Promise
	 * \public
	 */
	put(abortSignal = null, credentials = null) {
		if(((this.lifecycleStatus == "exists") || (this.lifecycleStatus == "modified")) && (this.syncStatus == "in_sync")) {
			this.syncStatus = "pending";
			this.sendQueuedNotifications();

			const putPromise = new Promise((resolve, reject) => {
				let fetchParameters = {
					method: "PUT",
					headers: new Headers({
						"Accept": "application/json",
						"content-type": "application/json",
						"If-Match": this._etag,
						"X-Requested-With": "XMLHttpRequest"
					}),
					body: JSON.stringify(this._getPutData())
				};

				if(!credentials && this.credentials)
					credentials = this.credentials;

				if(credentials && credentials.id && credentials.password)
					fetchParameters.headers.append("Authorization", "Basic " + btoa(credentials.id + ":" + credentials.password));

				if(abortSignal)
					fetchParameters.signal = abortSignal;
				
				fetch(this._uri, fetchParameters)
					.then((response) => {
						if(response.ok) {
							// when the response content from the HTTP request has been successfully read
							if(response.headers.has("etag"))
								this._etag = response.headers.get("etag");
							
							this._authentified = ((credentials != null) && credentials.id && credentials.password);
							this._error = null;
							this._removeFromSharedCache();
							this.lifecycleStatus = "exists";
							this.syncStatus = "in_sync";
							resolve();
							this.sendQueuedNotifications();
						}
						else {
							let responseBody = null;

							response.text()
								.then((responseText) => {
									responseBody = responseText;
								})
								.finally(() => {
									let error = new RestError(response.status, response.statusText, responseBody);
									this._error = error;

									if(response.status == 401)
										this.syncStatus = "needs_auth";
									else if(response.status == 403)
										this.syncStatus = "access_denied";

									reject(error);
									this.sendQueuedNotifications();
								});
						}
					})
					.catch((error) => {
						this._error = error;
						this.syncStatus = "error";
						reject(error);
						this.sendQueuedNotifications();
					});
			});

			return putPromise;
		}
		else
			throw new KtbsError("Resource lifecycle status \"" + this.lifecycleStatus + "\" and/or sync status \"" + this.syncStatus + "\" not suitable for PUT operation")
	}

	/**
	 * Deletes the current resource
	 * \param AbortSignal abortSignal an optional AbortSignal allowing to stop the HTTP request
	 * \param Object credentials an optional credentials object. If none is specified, the "credentials" property value of the resource will be used.
	 * \return Promise
	 * \public
	 */
	delete(abortSignal = null, credentials = null) {
		if(((this.lifecycleStatus == "exists") || (this.lifecycleStatus == "modified")) && (this.syncStatus == "in_sync")) {
			this.syncStatus = "pending";
			this.sendQueuedNotifications();

			const deletePromise = new Promise((resolve, reject) => {
				let fetchParameters = {
					method: "DELETE",
					headers: new Headers({
						"Accept": "application/json",
						"X-Requested-With": "XMLHttpRequest"
					}),
				};

				if(this._etag)
					fetchParameters.headers.append("If-Match", this._etag);

				if(!credentials && this.credentials)
					credentials = this.credentials;

				if(credentials && credentials.id && credentials.password)
					fetchParameters.headers.append("Authorization", "Basic " + btoa(credentials.id + ":" + credentials.password));

				if(abortSignal)
					fetchParameters.signal = abortSignal;
				
				fetch(this._uri, fetchParameters)
					.then((response) => {
						if(response.ok) {
							this._error = null;
							this.lifecycleStatus = "deleted";
							this.syncStatus = "in_sync";
							resolve();
							this.sendQueuedNotifications();
						}
						else {
							let responseBody = null;

							response.text()
								.then((responseText) => {
									responseBody = responseText;
								})
								.finally(() => {
									let error = new RestError(response.status, response.statusText, responseBody);
									this._error = error;

									if(response.status == 401)
										this.syncStatus = "needs_auth";
									else if(response.status == 403)
										this.syncStatus = "access_denied";

									reject(error);
									this.sendQueuedNotifications();
								});
						}
					})
					.catch((error) => {
						this._error = error;
						this.syncStatus = "error";
						reject(error);
						this.sendQueuedNotifications();
					});
			});

			return deletePromise;
		}
		else
			throw new KtbsError("Resource lifecycle status \"" + this.lifecycleStatus + "\" and/or sync status \"" + this.syncStatus + "\" not suitable for DELETE operation");
	}

	/**
	 * POSTs a SPARQL query to the resource, and returns a Promise that resolves with a JSON object containing data returned by the query
	 * \param string sparqlQuery 
	 * \param AbortSignal abortSignal 
	 * \param Object credentials 
	 * \return Promise
	 * \Public
	 */
	 SPARQLQuery(sparqlQuery, abortSignal = null, credentials = null) {
		const sparqlQueryPromise = new Promise((resolve, reject) => {
			let fetchParameters = {
				method: "POST",
				headers: new Headers({
					"content-type": "application/sparql-query",
					"Accept": "application/sparql-results+json",
					"X-Requested-With": "XMLHttpRequest"
				}),
				body: sparqlQuery
			};

			if(this._etag)
				fetchParameters.headers.append("If-Match", this._etag);

			if(!credentials && this.credentials)
				credentials = this.credentials;

			if(credentials && credentials.id && credentials.password)
				fetchParameters.headers.append("Authorization", "Basic " + btoa(credentials.id + ":" + credentials.password));

			if(abortSignal)
				fetchParameters.signal = abortSignal;
			
			fetch(this.uri, fetchParameters)
				.then((response) => {
					if(response.ok) {
						response.json()
							.then(resolve)
							.catch(reject);
					}
					else {
						let responseBody = null;

						response.text()
							.then((responseText) => {
								responseBody = responseText;
							})
							.finally(() => {
								const error = new RestError(response.status, response.statusText, responseBody);
								reject(error);
							});
					}
				})
				.catch(reject);
		});

		return sparqlQueryPromise;
	}

	/**
	 * 
	 * \param Resource or Array of Resource new_children
	 */
	_registerNewChildren(new_children) {
		if(this._registerNewChild) {
			if(new_children instanceof Array) {
				for(let i = 0; i < new_children.length; i++)
					this._registerNewChild(new_children[i]);
			}
			else
				this._registerNewChild(new_children);
		}
		
		this._queueNotification("children-add", this.children);
	}

	/**
	 * Get all the children of the current resource
	 * \return Array of Resource, or undefined if a resource of this type can't have children
	 * \public
	 */
	get children() {
		return undefined;
	}

	/**
	 * Creates and returns a deep copy of the current resource
	 * \return Resource
	 * \public
	 */
	clone() {
		const copy = new this.constructor(this.uri);
		copy._etag = this._etag;
		copy._JSONData = JSON.parse(JSON.stringify(this._JSONData));
		copy._syncStatus = this._syncStatus;
		copy._lifecycleStatus = this._lifecycleStatus;
		copy._error = this._error;
		copy._authentified = this._authentified;
		copy._use_parent_credentials = this._use_parent_credentials;
		return copy;
	}

	/**
     * A Promise that resolves when the shared cache has been successfully open
	 * \return Promise
	 * \public
	 * \static
     */
    static get sharedCacheOpened() {
        if(Resource._sharedCacheOpenedPromise == null) {
            Resource._sharedCacheOpenedPromise = new Promise((resolve, reject) => {
                caches.open('ktbs-api')
                    .then((sharedCache) => {
						const perfEntries = performance.getEntriesByType("navigation");

						// test if the user is reloading the page
						if(perfEntries[0] && perfEntries[0].type == "reload") {
							sharedCache.keys()
								.then((keys) => {
									keys.forEach((request, index, array) => {
										sharedCache.delete(request);
									});

									resolve(sharedCache);
								});
						}
						else
							resolve(sharedCache);
					})
                    .catch(reject);
            });

            return Resource._sharedCacheOpenedPromise;
        }

        return Resource._sharedCacheOpenedPromise;
    }
}

/**
 * A Promise that resolves when the shared cache has been successfully open
 * \var Promise
 * \protected
 * \static
 */
Resource._sharedCacheOpenedPromise = null;
