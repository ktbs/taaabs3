import {Resource} from "./Resource.js";

/**
 * 
 */
export class Method extends Resource {

	/**
	 * Attemps to asynchronously read an existing object's data to the REST service and returns a promise.
	 * @return Promise
	 */
	_read_data() {
		if(this._uri) {
			if(this._data_read == null) {
				this._data_read = new Promise((resolve, reject) => {
					this._syncStatus = "pending";

					let fetchParameters = { 
						method: "GET",
						headers: new Headers({
							"Accept": "application/json"
						}),
						mode: "cors",
						credentials: "include",
						cache: "no-cache"
					};

					fetch(this._data_read_uri, fetchParameters)
						.then(function(response) {
							// if the HTTP request responded successfully
							if(response.ok) {
								if(response.headers.has("etag"))
									this._etag = response.headers.get("etag");

								// when the response content from the HTTP request has been successfully read
								response.json()
									.then(function(parsedJson) {
										this._parsedJson = parsedJson;
										this._syncStatus = "in_sync";
										resolve();
									}.bind(this))
									.catch(error => {
										this._syncStatus = "error";
										reject(error);
									});
							}
							else
								resolve();
							/*else if(response.status == 401) {
								reject();
							}
							else
								reject("Fetch request to uri \"" + this._data_read_uri + "\"has failed");
							*/
						}.bind(this))
						.catch(error => {
							this._syncStatus = "error";
							reject(error);
						});

					/*
					let httpRequest = new XMLHttpRequest();
					httpRequest.open('GET', this._uri, true);

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
								//this.resource._syncStatus = "error";
								//reject(new Error("Failed to perform GET request to URL \"" + this.resource._uri + "\". HTTP request status : " + this.status + ", " + this.statusText));
								// might be a builtin method
								// @todo : ktbs REST service should reply to GET requests even for builtin method
								resolve();
							}
						}
					};

					//httpRequest.timeout = 3000;
					httpRequest.resource = this;
					httpRequest.setRequestHeader("Accept", "application/json");
					httpRequest.send(null);*/
				});
			}

			return this._data_read;
		}
		else
			throw new Error("Cannot read data from a resource without an uri");
	}

	/**
	 * 
	 */
	get_id() {
		if(this._parsedJSON && this._parsedJSON["@id"])
			return this._parsedJSON["@id"];
		else
			return this._uri;
	}

	/**
	 * @return Base
	 */
	/*get_base() {

	}*/

	/**
	 * Return the parent method, or null. Note that returned method may not be stored on this KTBS, or can even be a built-in method.
	 * @return Method
	 */
	/*get_parent() {

	}*/

	/**
	 * @param Method method
	 */
	/*set_parent(method) {

	}*/

	/**
	 * List the names of all the parameters set by this method or its parent.
	 * @param bool include_inherited – defaults to true and means that parameters from the parent method should be included
	 * @return[str]
	 */
	/*list_parameters(include_inherited) {

	}*/

	/**
	 * Get the value of a parameter (own or inherited from the parent method).
	 * @return string key
	 */
	/*get_parameter(key) {

	}*/

	/**
	 * set the value of a parameter. An exception must be raised if the parameter is inherited.
	 * @param string key
	 * @param value
	 */
	/*set_parameter(key, value) {

	}*/

	/**
	 * Unset a parameter. An exception must be raised if the parameter is inherited.
	 * @param string key
	 */
	/*del_parameter(key) {

	}*/
}
