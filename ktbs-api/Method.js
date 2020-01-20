import {ResourceProxy} from "./ResourceProxy.js";
import {Resource} from "./Resource.js";
import {Model} from "./Model.js";

/**
 * Class for the "Method" resource type
 */
export class Method extends Resource {

	/**
	 * Gets the URI of the Method's parent Method
	 * @return URL
	 */
	_get_parent_method_uri() {
		if(this._JSONData.hasParentMethod)
			return new URL(this._JSONData.hasParentMethod, this.uri);
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
			return ResourceProxy.get_resource(Method, parent_method_uri);
		else
			return null;
	}

	/**
	 * Gets the URI of the Model, if any
	 * @return URL
	 */
	_get_model_uri() {
		let model_uri_string = null;
		let parameters = this._JSONData.parameter;

		if(parameters) {
			for(let i = 0; (model_uri_string == null) && (i < parameters.length); i++) {
				let parameterString = parameters[i];
				let equalCharPos = parameterString.indexOf('=');

				if(equalCharPos != -1) {
					let parameterKey = parameterString.substring(0, equalCharPos);
					
					if(parameterKey == "model")
						model_uri_string = parameterString.substring(equalCharPos + 1);
				}
			}
		}

		if(model_uri_string)
			return new URL(model_uri_string, this._uri);
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
			return ResourceProxy.get_resource(Model, this._get_model_uri());
		else
			return null;
	}
}
