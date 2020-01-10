import {Resource} from "./Resource.js";
import {Model} from "./Model.js";

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

	/**
	 * Gets the URI of the Method's parent Method
	 * @return string
	 */
	_get_parent_method_uri() {
		if(this._JSONData.hasParentMethod)
			return new URL(this._JSONData.hasParentMethod, this._uri).toString();
		else
			return null;
	}

	/**
	 * Gets the Method's parent Method
	 * @return Method
	 */
	get parent_method() {
		let parent_method_uri = this._get_parent_method_uri();

		if(parent_method_uri)
			return new Method(parent_method_uri);
		else
			return null;
	}

	/**
	 * Gets the URI of the Model, if any
	 * @return string
	 */
	_get_model_uri() {
		let model_uri = null;
		let parameters = this._JSONData.parameter;

		if(parameters) {
			for(let i = 0; (model_uri == null) && (i < parameters.length); i++) {
				let parameterString = parameters[i];
				let equalCharPos = parameterString.indexOf('=');

				if(equalCharPos != -1) {
					let parameterKey = parameterString.substring(0, equalCharPos);
					
					if(parameterKey == "model")
						model_uri = parameterString.substring(equalCharPos + 1);
				}
			}
		}

		if(model_uri)
			return new URL(model_uri, this._uri).toString();
		else
			return null;
	}

	/**
	 * Gets the Model, if any
	 * @return Model
	 */
	get model() {
		let model_uri = this._get_model_uri();

		if(model_uri != null)
			return new Model(this._get_model_uri());
		else
			return null;
	}
}
