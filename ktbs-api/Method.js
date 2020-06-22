import {ResourceProxy} from "./ResourceProxy.js";
import {Resource} from "./Resource.js";
import {Model} from "./Model.js";
import {Base} from "./Base.js";

/**
 * Class for the "Method" resource type
 */
export class Method extends Resource {

	/**
	 * Constructor
	 * @param URL or string uri the resource's URI
	 */
	constructor(uri = null) {
		super(uri);
		this._JSONData["@type"] = "Method";
	}

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
	 * 
	 */
	set parent_method(new_parent_method) {
		if(new_parent_method instanceof Method) {
			this._JSONData.hasParentMethod = new_parent_method.uri.toString();
			this._parent_method = new_parent_method;
		}
		else if((typeof new_parent_method == "string") || (new_parent_method instanceof String)) {
			this._JSONData.hasParentMethod = new_parent_method;
			this._parent_method = null;
		}
		else
			throw new TypeError("New value for property parent_method must be either of type Method or String");
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
	/*get model() {
		if(!this._model) {
			let model_uri = this._get_model_uri();

			if(model_uri != null)
				this._model = ResourceProxy.get_resource(Model, this._get_model_uri());
		}
		
		return this._model;
	}*/

	/**
	 * 
	 */
	/*set model(new_model) {
		if(new_model instanceof Model)
			this.parameters["model"] = new_model.uri.toString();
		else
			throw new TypeError("New value for property model must be of type Model.");
	}*/
	
	/**
	 * 
	 */
	get parameters() {
		if(!this._parameters) {
			this._parameters = new Array();

			if(this._JSONData.parameter && (this._JSONData.parameter instanceof array)) {
				for(let i = 0; i < this._JSONData.parameter.length; i++) {
					let parameterString = parameters[i];
					let equalCharPos = parameterString.indexOf('=');

					if(equalCharPos != -1) {
						let parameterKey = parameterString.substring(0, equalCharPos);
						let parameterValue = parameterString.substring(equalCharPos + 1);
						this._parameters[parameterKey] = parameterValue;
					}
				}
			}
		}

		return this._parameters;
	}

	/**
	 * 
	 */
	set parameters(new_parameters) {
		if(new_parameters instanceof Array)
			this._parameters = new_parameters;
		else
			throw new TypeError("New value for property parameters must be of type Array.");
	}

	/**
	 * Gets the data to be send in a POST query
	 * @returns Object
	 */
	_getPostData() {
		let postData = this._JSONData;
		let parametersData = new Array();

		for(const parameter_key in this.parameters) {
			const parameter_value = this.parameters[parameter_key];
			let parameterString;

			if(parameter_value instanceof URL)
				parameterString = parameter_key + "=" + parameter_value.toString();
			else if(parameter_value instanceof Object)
				parameterString = parameter_key + "=" + JSON.stringify(parameter_value);
			else
				parameterString = parameter_key + "=" + parameter_value;

			parametersData.push(parameterString);
		}

		postData["parameter"] = parametersData;
		return postData;
	}
	
	/**
	 * Stores a new resource as a child of the current resource
	 * @throws KtbsError always throws a KtbsError when invoked for a Method as it is not a container resource
	 */
	post(new_child_resource, abortSignal = null, credentials = null) {
		throw new KtbsError("Only Ktbs roots, Bases and Traces can contain child resources");
	}

	/**
	 * 
	 * @param string builtin_method_id 
	 * @static
	 */
	static getBuiltinMethod(builtin_method_id) {
		const builtin_method_uri = new URL(Method._builtin_methods_prefix + builtin_method_id);
		return ResourceProxy.get_resource(Method, builtin_method_uri);
	}
}

/**
 * 
 * @type string
 * @static
 */
Method._builtin_methods_prefix = "http://liris.cnrs.fr/silex/2009/ktbs#";