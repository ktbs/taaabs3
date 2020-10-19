import {ResourceMultiton} from "./ResourceMultiton.js";
import {Resource} from "./Resource.js";
import {Base} from "./Base.js";

/**
 * Class for the "Method" resource type
 */
export class Method extends Resource {

	/**
	 * The prefix for builtin methods URIs
	 * \var string
	 * \static
	 * \protected
	 */
	static builtin_methods_prefix = "http://liris.cnrs.fr/silex/2009/ktbs#";

	/**
	 * Constructor
	 * \param URL or string uri - the resource's URI
	 * \public
	 */
	constructor(uri = null) {
		super(uri);
		this._JSONData["@type"] = "Method";

		if(this.is_builtin)
			this._syncStatus = "in_sync";
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
			this._is_builtin = (this.uri && this.uri.toString().startsWith(Method.builtin_methods_prefix));

		return this._is_builtin;
	}

	/**
	 * 
	 * 
	 * \return Promise
	 * \public
	 */
	get_methods_hierarchy(abortSignal = null, credentials = null) {
		let resolveHierarchyPromise, rejectHierarchyPromise;

		const hierarchyPromise = new Promise((resolve, reject) => {
			resolveHierarchyPromise = resolve;
			rejectHierarchyPromise = reject;
		});

		if(this.is_builtin)
			resolveHierarchyPromise(this);
		else {
			this.get(abortSignal, credentials)
				.then(() => {
					if(this.parent_method.is_builtin)
						resolveHierarchyPromise(this.parent_method);
					else {
						this.parent_method.get(abortSignal, credentials)
							.then(() => {
								this.parent_method.get_methods_hierarchy(abortSignal, credentials)
									.then((builtin_method) => {
										resolveHierarchyPromise(builtin_method);
									})
									.catch((error) => {
										rejectHierarchyPromise(error);
									});
							})
							.catch((error) => {
								rejectHierarchyPromise(error);
							});
					}
				})
				.catch((error) => {
					rejectHierarchyPromise(error);
				});
		}

		return hierarchyPromise;
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
	 * Gets raw parameters data
	 * \return String
	 * \public
	 */
	get raw_parameters_data() {
		return this._JSONData.parameter;
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
	 * 
	 */
	static _getBuiltinMethodData(builtin_method_id) {
		let builtin_method_data = undefined;

		for(let i = 0; (builtin_method_data == undefined) && (i < Method._builtin_methods_data.length); i++)
			if(Method._builtin_methods_data[i].id == builtin_method_id)
				builtin_method_data = Method._builtin_methods_data[i];

		return builtin_method_data;
	}

	/**
	 * 
	 */
	get available_parameters() {
		if(!this._available_parameters) {
			if(this.is_builtin) {
				const method_data = Method._getBuiltinMethodData(this.id);
				this._available_parameters = method_data.available_parameters;
			}
			else
				this._available_parameters = this.parent_method.available_parameters();
		}

		return this._available_parameters;
	}

	/**
	 * 
	 */
	get source_traces_cardinality() {
		if(!this._source_traces_cardinality) {
			if(this.is_builtin) {
				const method_data = Method._getBuiltinMethodData(this.id);
				this._source_traces_cardinality = method_data.source_traces_cardinality;
			}
			else
				return this.parent_method.source_traces_cardinality;
		}

		return this._source_traces_cardinality;
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

	/**
	 * Gets IDs of builtin methods supported by default
	 * \var Array
	 * \static
	 * \public
	 */
	static get builtin_methods_ids() {
		if(!Method._builtin_methods_ids) {
			Method._builtin_methods_ids = new Array();

			for(let i = 0; i < Method._builtin_methods_data.length; i++)
				Method._builtin_methods_ids.push(Method._builtin_methods_data[i].id);
		}

		return Method._builtin_methods_ids;
	}

	/**
	 * Data describing builtin methods supported by default and their respective parameters
	 * \var Array
	 * \static
	 * \protected
	 */
	static _builtin_methods_data = [
		{
			id: "filter",
			label: "Filter",
			description: "This method copies the obsels of the source trace if they pass the filter",
			source_traces_cardinality: 1,
			extensible: false,
			available_parameters: [
				{
					id: "model",
					type: "Model",
					label: "Model",
					description: "The model of the computed trace. If not provided, the model (resp. origin) of the source trace will be used instead"
				},
				{
					id: "origin",
					type: "String",
					label: "Origin",
					description: "The origin of the computed trace"
				},
				{
					id: "after",
					type: "Number",
					label: "After (timestamp)",
					description: "The integer timestamp below which obsels are filtered out"
				},
				{
					id: "before",
					type: "Number",
					label: "Before (timestamp)",
					description: "The integer timestamp above which obsels are filtered out"
				},
				{
					id: "afterDT",
					type: "Date",
					label: "After (date/time)",
					description: "The datetime timestamp below which obsels are filtered out"
				},
				{
					id: "beforeDT",
					type: "Date",
					label: "Before (date/time)",
					description: "The datetime timestamp above which obsels are filtered out"
				},
				{
					id: "otypes",
					type: "Array",
					label: "Obsel types",
					description: "Only obsels of these types (or their subtypes) will be kept"
				},
				{
					id: "bgp",
					type: "String",
					label: "Basic graph pattern",
					description: "A SPARQL Basic Graph Pattern used to express additional criteria"
				},
			]
		},
		{
			id: "fusion",
			label: "Fusion",
			description: "This method merges the content of all its sources",
			source_traces_cardinality: '*',
			extensible: false,
			available_parameters: [
				{
					id: "model",
					type: "Model",
					label: "Model",
					description: "The model of the computed trace"
				},
				{
					id: "origin",
					type: "String",
					label: "Origin",
					description: "The origin of the computed trace"
				}
			]
		},
		{
			id: "fsa",
			label: "Finite State Automaton (FSA)",
			description: "This method applies a Finite State Automaton to detect patterns of obsels in the source trace, and produce an obsel in the transformed trace for each pattern occurence",
			source_traces_cardinality: 1,
			extensible: false,
			available_parameters: [
				{
					id: "model",
					type: "Model",
					label: "Model",
					description: "The model of the computed trace"
				},
				{
					id: "origin",
					type: "String",
					label: "Origin",
					description: "The origin of the computed trace"
				},
				{
					id: "fsa",
					type: "String",
					label: "FSA",
					description: "The description of the FSA"
				}
			]
		},
		{
			id: "hrules",
			label: "Hubble Rules (HRules)",
			description: "This method is named after the Hubble project, in which they have been proposed. Those rules can be used both as a stylesheet in the Taaabs timeline component, and as a transformation, thanks to this method. A benefit is that such a transformation can be built interactively in the timeline, with a direct visual feedback of its effect, then “materialized” as a user-defined method and applied to other traces",
			source_traces_cardinality: 1,
			extensible: false,
			available_parameters: [
				{
					id: "model",
					type: "Model",
					label: "Model",
					description: "The model of the computed trace"
				},
				{
					id: "origin",
					type: "String",
					label: "Origin",
					description: "The origin of the computed trace"
				},
				{
					id: "rules",
					type: "String",
					label: "Rules",
					description: "The description of the rules"
				}
			]
		},
		{
			id: "pipe",
			label: "Pipe",
			description: "This method applies the component methods in sequence",
			source_traces_cardinality: '*',
			extensible: false,
			available_parameters: [
				{
					id: "methods",
					type: "Array",
					label: "Methods",
					description: "List of methods"
				}
			]
		},
		{
			id: "parallel",
			label: "Parallel",
			description: "This method applies the component methods in parallel, and merges all resulting traces",
			source_traces_cardinality: '*',
			extensible: false,
			available_parameters: [
				{
					id: "methods",
					type: "Array",
					label: "Methods",
					description: "List of methods"
				},
				{
					id: "model",
					type: "Model",
					label: "Model",
					description: "The model of the computed trace"
				},
				{
					id: "origin",
					type: "String",
					label: "Origin",
					description: "The origin of the computed trace"
				}
			]
		},
		{
			id: "sparql",
			label: "Sparql",
			description: "This method applies a SPARQL CONSTRUCT query to the source trace",
			source_traces_cardinality: 1,
			extensible: true,
			available_parameters: [
				{
					id: "model",
					type: "Model",
					label: "Model",
					description: "The model of the computed trace"
				},
				{
					id: "origin",
					type: "String",
					label: "Origin",
					description: "The origin of the computed trace"
				},
				{
					id: "sparql",
					type: "String",
					label: "Sparql query",
					description: "A SPARQL CONSTRUCT query",
					required: true
				},
				{
					id: "scope",
					type: "String",
					label: "Scope",
					description: "Graph against which the SPARQL query must be executed",
					allowed_values: [
						{
							value: "trace",
							label: "Trace",
							description: "The SPARQL query only has access to the obsels of the source trace"
						},
						{
							value: "base",
							label: "Base",
							description: "The default graph is the union of all the information contained in the base (including subbases). The GRAPH keyword can be used to filter information per graph. Note that this is concetually clean, but very inefficient with the current implementation"
						},
						{
							value: "store",
							label : "Store",
							description: "The default graph is the entire content of the underlying triple-sore. The GRAPH keyword can be used to filter information per graph. Note that this is only safe if all users are allowed to access any stored information. For this reason, this option is disable by default."
						}
					],
					default_value: "trace"
				},
				{
					id: "inherit",
					type: "Boolean",
					label: "Inherit properties",
					description: "Inherit properties from source obsel"
				}
			]
		},
		{
			id: "isparql",
			label: "Incremental Sparql (ISparql)",
			description: "This method applies a SPARQL SELECT query to the source trace, and builds new obsels with the result.",
			source_traces_cardinality: 1,
			extensible: true,
			available_parameters: [
				{
					id: "model",
					type: "Model",
					label: "Model",
					description: "The model of the computed trace"
				},
				{
					id: "origin",
					type: "String",
					label: "Origin",
					description: "The origin of the computed trace"
				},
				{
					id: "sparql",
					type: "String",
					label: "Sparql query",
					description: "A SPARQL SELECT query",
					required: true
				}
			]
		},
		{
			id: "external",
			label: "External",
			description: "This method invokes an external program to compute a computed trace. The external program is given as a command line, expected to produce the obsels graph of the computed trace",
			source_traces_cardinality: '*',
			extensible: true,
			available_parameters: [
				{
					id: "model",
					type: "Model",
					label: "Model",
					description: "The model of the computed trace"
				},
				{
					id: "origin",
					type: "String",
					label: "Origin",
					description: "The origin of the computed trace"
				},
				{
					id: "command-line",
					type: "String",
					label: "Command line",
					description: "The command line to execute",
					required: true
				},
				{
					id: "format",
					type: "String",
					label: "Format",
					description: "The format expected and produced by the command line",
					default_value: "turtle"
				},
				{
					id: "min-sources",
					type: "Number",
					label: "Minimum number of sources",
					description: "The minimum number of sources expected by the command-line"
				},
				{
					id: "max-sources",
					type: "Number",
					label: "Maximum number of sources",
					description: "The maximum number of sources expected by the command-line"
				},
				{
					id: "feed-to-stdin",
					type: "Boolean",
					label: "Feed to standard input",
					description: "Whether to use the external command standard input"
				}
			]
		}
	];	
}