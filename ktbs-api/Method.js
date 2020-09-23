import {ResourceMultiton} from "./ResourceMultiton.js";
import {Resource} from "./Resource.js";
import {Base} from "./Base.js";

/**
 * Class for the "Method" resource type
 */
export class Method extends Resource {

	/**
	 * Constructor
	 * \param URL or string uri - the resource's URI
	 * \public
	 */
	constructor(uri = null) {
		super(uri);
		this._JSONData["@type"] = "Method";
	}

	/**
	 * Gets the parent Base of this method
	 * \return Base
	 * \public
	 */
	get parent() {
		if(!this._parent) {
			if(this._JSONData.inBase)
				this._parent = ResourceMultiton.get_resource(Base, this.resolve_link_uri(this._JSONData.inBase));
		}

		return this._parent;
	}

	/**
	 * Checks if the method is a builtin method
	 * \return boolean
	 * \public
	 */
	get is_builtin() {
		if(this._is_builtin == undefined)
			this._is_builtin = this.uri.toString().startsWith(Method.builtin_methods_prefix);

		return this._is_builtin;
	}

	/**
	 * Sets if the method is as a builtin method or not
	 * \param boolean new_is_builtin the new
	 * \public
	 */
	set is_builtin(new_is_builtin) {
		this._is_builtin = new_is_builtin;
	}

	/**
	 * Gets the URI of the Method's parent Method
	 * \return URL
	 * \protected
	 */
	_get_parent_method_uri() {
		if(!this._parent_method_uri && this._JSONData.hasParentMethod)
			if(Method.builtin_methods_ids.includes(this._JSONData.hasParentMethod))
				this._parent_method_uri = Method.getBuiltinMethodUri(this._JSONData.hasParentMethod);
			else
				this._parent_method_uri = this.resolve_link_uri(this._JSONData.hasParentMethod);
		
		return this._parent_method_uri;
	}

	/**
	 * Gets the Method's parent Method
	 * \return Method
	 * \public
	 */
	get parent_method() {
		if(!this._parent_method) {
			let parent_method_uri = this._get_parent_method_uri();

			if(parent_method_uri)
				this._parent_method = ResourceMultiton.get_resource(Method, parent_method_uri);
		}

		return this._parent_method;
	}

	/**
	 * Sets the Method's parent Method
	 * \param Method new_parent_method - the new parent Method for the current Method
	 * \throws TypeError throws a TypeError if the provided argument is not a Method
	 * \public
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
	 * Gets the Method's parameters
	 * \return Array
	 * \public
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
	 * Sets the Method's parameters
	 * \param Array new_parameters - the new parameters for the Method
	 * \throws TypeError throws a TypeError if the provided argument is not an Array
	 * \public
	 */
	set parameters(new_parameters) {
		if(new_parameters instanceof Array)
			this._parameters = new_parameters;
		else
			throw new TypeError("New value for property parameters must be of type Array.");
	}

	/**
	 * Gets the data to be send in a POST query
	 * \return Object
	 * \protected
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
	 * \throws KtbsError always throws a KtbsError when invoked for a Method as it is not a container resource
	 * \public
	 */
	post(new_child_resource, abortSignal = null, credentials = null) {
		throw new KtbsError("Only Ktbs roots, Bases and Traces can contain child resources");
	}

	/**
	 * Gets a builtin method's uri from it's ID
	 * \param string builtin_method_id - the ID of the builtin method we want the uri of
	 * \return URL
	 * \static
	 * \public
	 */
	static getBuiltinMethodUri(builtin_method_id) {
		return new URL(Method.builtin_methods_prefix + builtin_method_id);
	}

	/**
	 * Gets a builtin method from it's ID
	 * \param string builtin_method_id - the ID of the builtin method we want
	 * \return Method
	 * \static
	 * \public
	 */
	static getBuiltinMethod(builtin_method_id) {
		const builtin_method_uri = Method.getBuiltinMethodUri(builtin_method_id);
		return ResourceMultiton.get_resource(Method, builtin_method_uri);
	}

	/**
	 * Resets all the resource cached data
	 * \public
	 */
	_resetCachedData() {
		super._resetCachedData();

		if(this._parent)
			this._parent = undefined;

		if(this._parent_method_uri)
			delete this._parent_method_uri;

		if(this._parent_method)
			this._parent_method = undefined;

		if(this._parameters)
			delete this._parameters;
	}
}

/**
 * The prefix for builtin methods URIs
 * \var string
 * \static
 * \protected
 */
Method.builtin_methods_prefix = "http://liris.cnrs.fr/silex/2009/ktbs#";

/**
 * Ids of builtin methods supported by default
 * \var Array
 * \static
 * \public
 */
Method.builtin_methods_ids = ["sparql", "fsa", "fusion", "filter", "hrules", "pipe", "parallel", "isparql"];