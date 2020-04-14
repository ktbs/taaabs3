import {ResourceProxy} from "./ResourceProxy.js";
import {Resource} from "./Resource.js";
import {Model} from "./Model.js";
import {Base} from "./Base.js";

/**
 * Class for the "Method" resource type
 */
export class Method extends Resource {

	/**
	 * Gets the parent Base of this method
	 * @return Base the method's parent base if any, or undefined if the base's parent is unknown (i.e. the resource hasn't been read or recorded yet)
	 */
	get parent() {
		if(!this._parent) {
			if(this._JSONData.inBase)
				this._parent = ResourceProxy.get_resource(Base, this.resolve_link_uri(this._JSONData.inBase));
		}

		return this._parent;
	}

	/**
	 * Gets the URI of the Method's parent Method
	 * @return URL
	 */
	_get_parent_method_uri() {
		if(!this._parent_method_uri && this._JSONData.hasParentMethod)
			this._parent_method_uri = this.resolve_link_uri(this._JSONData.hasParentMethod);
		
		return this._parent_method_uri;
	}

	/**
	 * Gets the Method's parent Method
	 * @return Method
	 */
	get parent_method() {
		if(!this._parent_method) {
			let parent_method_uri = this._get_parent_method_uri();

			if(parent_method_uri)
				this._parent_method = ResourceProxy.get_resource(Method, parent_method_uri);
		}

		return this._parent_method;
	}

	/**
	 * Gets the URI of the Model, if any
	 * @return URL
	 */
	_get_model_uri() {
		if(!this._model_uri) {
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
				this._model_uri = this.resolve_link_uri(model_uri_string);
		}

		return this._model_uri;
	}

	/**
	 * Gets the Model, if any
	 * @return Model
	 */
	get model() {
		if(!this._model) {
			let model_uri = this._get_model_uri();

			if(model_uri != null)
				this._model = ResourceProxy.get_resource(Model, this._get_model_uri());
		}
		
		return this._model;
	}
}
