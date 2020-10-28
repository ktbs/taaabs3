import {Resource} from "./Resource.js";
import {ResourceMultiton} from "./ResourceMultiton.js";
import {Obsel} from "./Obsel.js";
import {Model} from "./Model.js";
import {Method} from "./Method.js";
import {Base} from "./Base.js";
import {ObselList} from "./ObselList.js";
import {TraceStats} from "./TraceStats.js";
import {KtbsError} from "./Errors.js";

/**
 * Abstract class, meant to be be inherited by the trace resource types (StoredTrace and ComputedTrace)
 */
export class Trace extends Resource {

	/**
	 * Gets the parent Base of the trace, or undefined if the trace's parent Base is unknown (i.e. the resource hasn't been read or recorded yet).
	 * \return Base
	 * \public
	 */
	get parent() {
		if(!this._parent && this._JSONData.inBase)
			this._parent = ResourceMultiton.get_resource(Base, this.resolve_link_uri(this._JSONData.inBase));

		return this._parent;
	}

	/**
	 * Gets the model of the Trace
	 * \return Model
	 * \public
	 */
	get model() {
		if(!this._model && this._JSONData.hasModel)
			this._model = ResourceMultiton.get_resource(Model, this.resolve_link_uri(this._JSONData.hasModel));

		return this._model;
	}

	/**
	 * Gets the temporal origin of the Trace
	 * \return string
	 * \public
	 */
	get origin() {
		return this._JSONData.origin;
	}

	/**
	 * Gets the obsel list of the trace
	 * \return ObselList
	 * \public
	 */
	get obsel_list() {
		if(!this._obsel_list && this._JSONData.hasObselList)
			this._obsel_list = ResourceMultiton.get_resource(ObselList, this.resolve_link_uri(this._JSONData.hasObselList));

		return this._obsel_list;
	}

	/**
	 * Gets the TraceStats aspect resource for the current trace
	 * \return TraceStats
	 * \public
	 */
	get stats() {
		if(!this._stats && this._JSONData.hasTraceStatistics)
			this._stats = ResourceMultiton.get_resource(TraceStats, this.resolve_link_uri(this._JSONData.hasTraceStatistics));

		return this._stats;
	}

	/**
	 * Resets all the resource cached data
	 * \public
	 */
	_resetCachedData() {
		super._resetCachedData();

		if(this._parent)
			this._parent = undefined;

		if(this._model)
			this._model = undefined;

		if(this._obsel_list)
			delete this._obsel_list;

		if(this._stats)
			delete this._stats;
	}
}

/**
 * Class for the StoredTrace resource type
 */
export class StoredTrace extends Trace {

	/**
	 * Constructor
	 * \param URL or string uri - the resource's URI
	 * \public
	 */
	constructor(uri = null) {
		super(uri);
		this._JSONData["@type"] = "StoredTrace";
	}

	/**
	 * Gets the model of the Trace
	 * \return Model
	 * \public
	 */
	get model() {
		return super.model;
	}

	/**
	 * Sets the model of the StoredTrace
	 * \param Model newModel - the new Model for the StoredTrace
	 * \throws TypeError throws a TypeError when provided argument is not an instance of Model
	 * \public
	 */
	set model(newModel) {
		if(newModel instanceof Model) {
			this._JSONData.hasModel = newModel.uri.toString();
			this._model = null;
		}
		else
			throw new TypeError("New value for property \"model\" must be an instance of Model");
	}

	/**
	 * Gets the temporal origin of the Trace
	 * \return string
	 * \public
	 */
	get origin() {
		return super.origin;
	}

	/**
	 * Sets the temporal origin for the Trace
	 * \param String newOrigin - the new origin for the Trace
	 * \public
	 */
	set origin(newOrigin) {
		this._JSONData.origin = newOrigin;
	}

	/**
	 * Stores an Obsel or an Array of Obsel as child(s) of the current StoredTrace
	 * \param Obsel or Array of Obsel new_child_resource - the new child resource
	 * \param AbortSignal abortSignal an optional AbortSignal allowing to stop the HTTP request
	 * \param Object credentials an optional credentials object. If none is specified, the "credentials" property value of the resource will be used.
	 * \throws TypeError throws a TypeError if the provided new_child_resource argument is not an Obsel
	 * \return Promise
	 * \public
	 */
	post(new_child_resource, abortSignal = null, credentials = null) {
		if((new_child_resource instanceof Obsel) || (new_child_resource instanceof Array)) {
			if(new_child_resource instanceof Array) {
				if(new_child_resource.length == 0)
					throw new KtbsError("Empty obsel collection can not be posted to trace");
				else 
					for(let i = 0; i < new_child_resource.length; i++) {
						let aChildResource = new_child_resource[i];

						if(!(aChildResource instanceof Obsel))
							throw new KtbsError("Collection can contain only Obsel instances to be posted to trace");
						else
							aChildResource.parent = this;
					}
			}
			else
				new_child_resource.parent = this;

			return super.post(new_child_resource, abortSignal, credentials);
		}
		else
			throw new TypeError("Only Obsel instances can be posted as childrens of a Trace");
	}
}

/**
 * Class for the "ComputedTrace" resource type
 */
export class ComputedTrace extends Trace {

	/**
	 * Constructor
	 * \param URL or string uri - the resource's URI
	 * \public
	 */
	constructor(uri = null) {
		super(uri);
		this._JSONData["@type"] = "ComputedTrace";
	}

	/**
	 * Gets the computed trace's Method
	 * \return Method
	 * \public
	 */
	get method() {
		if(!this._method) {
			const method_id = this._JSONData.hasMethod;
			let method_uri;

			if(Method.builtin_methods_ids.includes(method_id))
				method_uri = Method.getBuiltinMethodUri(method_id);
			else
				method_uri = this.resolve_link_uri(method_id);
			
			this._method = ResourceMultiton.get_resource(Method, method_uri);
		}

		return this._method;
	}

	/**
	 * Sets the trace's Method
	 * \param Method new_method - the new method for the computed trace
	 * \throws TypeError throws a TypeError if the provided argument is not a Method
	 * \public
	 */
	set method(new_method) {
		if(new_method instanceof Method) {
			this._JSONData.hasMethod = new_method.uri;
			this._method = new_method;
		}
		else
			throw new TypeError("New value for property \"method\" must be an instance of Method");
	}

	/**
	 * Gets the source traces of the computed trace
	 * \return Array of Trace
	 * \public
	 */
	get source_traces() {
		if(!this._source_traces) {
			this._source_traces = new Array();

			if(
					this._JSONData.hasSource
				&&	(this._JSONData.hasSource instanceof Array)
			) 
				for(let i = 0; i < this._JSONData.hasSource.length; i++) {
					const trace_link = this._JSONData.hasSource[i];
					const trace_uri = this.resolve_link_uri(trace_link);
					const trace = ResourceMultiton.get_resource(Trace, trace_uri);
					this._source_traces.push(trace);
				}
		}

		return this._source_traces;
	}

	/**
	 * Sets the source traces for the computed trace
	 * \param Array of Trace new_source_traces - the new source traces for the computed trace
	 * \throws TypeError throws a TypeError if the provided argument is not an Array of Trace
	 * \public
	 */
	set source_traces(new_source_traces) {
		if(new_source_traces instanceof Array) {
			for(let i = 0; i < new_source_traces.length; i++) {
				const an_array_item = new_source_traces[i];

				if(!(an_array_item instanceof Trace))
					throw new TypeError("New value for property \"source_traces\" must be an Array of Trace");
			}

			this._source_traces = new_source_traces;
		}
		else
			throw new TypeError("New value for property \"source_traces\" must be an Array of Trace");
	}

	/**
	 * Gets the ComputedTrace's parameters
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
	 * Sets the ComputedTrace's parameters
	 * \param Array new_parameters - the new parameters for the ComputedTrace
	 * \throws TypeError throws a TypeError if the provided argument is not an Array
	 * \public
	 */
	set parameters(new_parameters) {
		if(new_parameters instanceof Array) {
			this._JSONData.parameter = new_parameters;
			this._parameters = new_parameters;
		}
		else
			throw new TypeError("New value for property parameters must be of type Array.");
	}

	/**
     * Gets the data to be sent for this resource to be POSTed to a parent one
	 * \return Object
	 * \protected
     */
	_getPostData() {
		let postData = this._JSONData;

		if(this.source_traces.length > 0) {
			postData.hasSource = new Array();

			for(let i = 0; i < this.source_traces.length; i++)
				postData.hasSource.push(this.source_traces[i].uri);
		}
		else if(postData.hasSource)
			delete postData.hasSource;

		return postData;
	}

	/**
	 * Stores a new Obsel as a child of the current Trace
	 * \throws KtbsError always throws a KtbsError when invoked for ComputedTrace instances, as computed trace do not store any obsel
	 * \public
	 */
	post(new_child_resource, abortSignal = null, credentials = null) {
		throw new KtbsError("Computed traces cannot store children obsels");
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
		const putPromise = super.put(abortSignal, credentials);

		if(this._obsel_list)
			this._obsel_list.force_state_refresh();

		if(this._stats)
			this._stats.force_state_refresh();
		
		return putPromise;
	}

	/**
	 * Resets all the resource cached data
	 * \public
	 */
	_resetCachedData() {
		super._resetCachedData();

		if(this._method)
			this._method = undefined;

		if(this._source_traces)
			delete this._source_traces;
	}
}