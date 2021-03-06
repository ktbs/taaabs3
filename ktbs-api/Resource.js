/**
 * 
 */
export class Resource {

	/**
	 * Constructor
	 */
	constructor(uri = null) {
		/**
		 * The object's uri
		 */
		this._uri = uri;

		/**
		 * 
		 */
		this._parsedJson = new Object();

		/**
		 * 
		 */
		this._syncStatus = "needs_sync";

		/**
		 * 
		 */
		this._data_read = null;

		/**
		 * 
		 */
		if(this._uri)
			this._CRUDState = "read";
		else
			this._CRUDState = "create";

		/**
		 * 
		 */
		//this.eventListeners = new Array(); // "update, delete, children"
	}

	/**
	 * 
	 */
	get _data_read_uri() {
		return this._uri;
	}

	/**
	 * Attemps to asynchronously read an existing object's data to the REST service and returns a promise.
	 * @return Promise
	 */
	_read_data() {
		if(this._uri) {
			if(this._data_read == null) {
				this._data_read = new Promise((resolve, reject) => {
					let httpRequest = new XMLHttpRequest();
					httpRequest.open('GET', this._data_read_uri, true);

					httpRequest.onreadystatechange = function(event) {
						if (this.readyState == XMLHttpRequest.DONE) {
							if (this.status == 200) {
								this.resource._etag = this.getResponseHeader("etag");

								try {
									this.resource._parsedJson = JSON.parse(this.responseText);
									this.resource._syncStatus = "in_sync";
									resolve();
								}
								catch(error) {
									this.resource._syncStatus = "error";
									reject(error);
								}
							}
							else {
								this.resource._syncStatus = "error";
								reject(new Error("Failed to perform GET request to URL \"" + this.resource._data_read_uri + "\". HTTP request status : " + this.status + ", " + this.statusText));
							}
						}
					};

					//httpRequest.timeout = 5000;
					httpRequest.resource = this;
					httpRequest.setRequestHeader("Accept", "application/json");
					this._syncStatus = "pending";
					httpRequest.send(null);
				});
			}

			return this._data_read;
		}
		else
			throw new Error("Cannot read data from a resource without an uri");
	}

	/**
	 * Return the URI of this resource relative to its “containing” resource; basically, this is short ‘id’ that could have been used to create this resource in the corresponding ‘create_X’ method
	 * @return	str
	 */
	get_id() {
		return this._parsedJson["@id"];
	}

	/**
	 * 
	 */
	get_relative_id() {
		let id_parts = this._uri.split('/');

		if(this._uri.charAt(this._uri.length - 1) == '/') {
			let last_id_part = id_parts[id_parts.length - 2];
			return last_id_part + '/';
		}
		else {
			let last_id_part = id_parts[id_parts.length - 1];
			let hash_char_position = last_id_part.indexOf('#');

			if(hash_char_position != -1)
				return last_id_part.substring(hash_char_position);
			else
				return last_id_part;
		}
	}

	/**
	 * 
	 */
	set_id(newId) {
		this._parsedJson["@id"] = newId;
	}

	/**
	 * Return the absolute URI of this resource.
	 * @return uri
	 */
	get_uri() {
		return this._uri;
	}

    /**
	 * Ensure this resource is up-to-date. While remote resources are expected to perform best-effort to keep in sync with the server, it may sometimes be required to strongly ensure they are up-to-date. For local resources, this is has obviously no effect.
	 * @return Promise	
	 */
	force_state_refresh() {
		this._data_read = null;
		this._syncStatus = "needs_sync";
		return this._read_data();
	}

	/**
	 * Return true if this resource is not modifiable.
	 * @return bool
	 */
	get_readonly() {
		return false;
	}

	/**
	 * Remove this resource from the KTBS. If the resource can not be removed, an exception must be raised.
	 */
	/*remove() {
		
	}*/

	/**
	 * Returns a user-friendly label
	 * @return str
	 */
	get_label() {
		return this._parsedJson["label"];
	}

	/**
	 * Set a user-friendly label.
	 * @param label str
	 */
	set_label(newLabel) {
		this._parsedJson["label"] = newLabel;
		//this.notifyListeners("update");
	}

	/**
	 * Reset the user-friendly label to its default value.
	 */
	reset_label() {
		this._parsedJson.splice("label", 1);
	}

	/**
	 * 
	 */
	/*addEventListener(eventType, callback) {
		if(!this.eventListeners[eventType])
			this.eventListeners[eventType] = new Array();

		if(!this.eventListeners[eventType].includes(callback))
			*this.eventListeners[eventType].push(callback)
	}*/

	/**
	 * 
	 */
	/*removeEventListener(eventType, callback) {
		if((this.eventListeners[eventType] instanceof Array) && (this.eventListeners[eventType].includes(callback))) {
			this.eventListeners[eventType].splice(this.eventListeners[eventType].indexOf(callback));
		}
	}*/

	/**
	 * 
	 */
	/*notifyListeners(eventType) {
		if(this.eventListeners[eventType] instanceof Array) {
			for(let i = 0; i < this.eventListeners[eventType].length; i++) {
				let callback = this.eventListeners[eventType][i];

				if(callback !== undefined)
					callback();
			}
		}
	}*/
}
