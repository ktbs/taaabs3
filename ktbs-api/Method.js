import {Resource} from "./Resource.js";

/**
 * Class for the "Method" resource type
 */
export class Method extends Resource {

	/**
	 * Attemps to asynchronously read an existing object's data to the REST service and returns a promise.
	 * @return Promise
	 */
	get() {
		if(this._uri) {
			return new Promise((resolve, reject) => {
				this._syncStatus = "pending";

				let fetchParameters = { 
					method: "GET",
					headers: new Headers({
						"Accept": "application/json"
					}),
					/*mode: "cors",
					credentials: "include",*/
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
									this._JSONData = parsedJson;
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
			});
		}
		else
			throw new Error("Cannot read data from a resource without an uri");
	}
}
