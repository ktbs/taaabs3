import {Resource} from "./Resource.js";
import {ResourceMultiton} from "./ResourceMultiton.js";
import {Obsel} from "./Obsel.js";
import {Model} from "./Model.js";
import {Method} from "./Method.js";
import {Base} from "./Base.js";
import {ObselList} from "./ObselList.js";
import {KtbsError} from "./Errors.js";

/**
 * Abstract class, meant to be be inherited by the trace resource types (StoredTrace and ComputedTrace)
 */
export class Trace extends Resource {

	/**
	 * Gets the parent Base of the trace
	 * @return Base the trace's parent base if any, or undefined if the trace's parent Base is unknown (i.e. the resource hasn't been read or recorded yet).
	 */
	get parent() {
		if(!this._parent && this._JSONData.inBase)
			this._parent = ResourceMultiton.get_resource(Base, this.resolve_link_uri(this._JSONData.inBase));

		return this._parent;
	}

	/**
	 * Gets the model of the Trace
	 * @return Model
	 */
	get model() {
		if(!this._model && this._JSONData.hasModel)
			this._model = ResourceMultiton.get_resource(Model, this.resolve_link_uri(this._JSONData.hasModel));
		
		return this._model;
	}

	/**
	 * Sets the model of the Trace
	 * @param Model newModel the new Model for the Trace
	 * @throws TypeError throws a TypeError when provided argument is not an instance of Model
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
	 * @return string
	 */
	get origin() {
		return this._JSONData.origin;
	}

	/**
	 * Sets the temporal origin for the Trace
	 * @param String newOrigin the new origin for the Trace
	 */
	set origin(newOrigin) {
		this._JSONData.origin = newOrigin;
	}

	/**
	 * Gets the obsel list of the trace
	 * @return ObselList
	 */
	get obsel_list() {
		if(!this._obsels && this._JSONData.hasObselList)
			this._obsels = ResourceMultiton.get_resource(ObselList, this.resolve_link_uri(this._JSONData.hasObselList));
		
		return this._obsels;
	}
}

/**
 * Class for the StoredTrace resource type
 */
export class StoredTrace extends Trace {

	/**
	 * Constructor
	 * @param URL or string uri the resource's URI
	 */
	constructor(uri = null) {
		super(uri);
		this._JSONData["@type"] = "StoredTrace";
	}

	/**
	 * Stores an Obsel or an Array of Obsel as child(s) of the current StoredTrace
	 * @param {Obsel, Array} new_child_resource the new child resource
	 * @param AbortSignal abortSignal an optional AbortSignal allowing to stop the HTTP request
	 * @param Object credentials an optional credentials object. If none is specified, the "credentials" property value of the resource will be used.
	 * @throws TypeError throws a TypeError if the provided new_child_resource argument is not an Obsel
	 * @returns Promise
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
	 * @param URL or string uri the resource's URI
	 */
	constructor(uri = null) {
		super(uri);
		this._JSONData["@type"] = "ComputedTrace";
	}

	/**
	 * Gets the trace's Method
	 * @return Method
	 */
	get method() {
		if(!this._method) {
			const method_id = this._JSONData.hasMethod;
			const method_uri = this.resolve_link_uri(method_id);
			this._method = ResourceMultiton.get_resource(Method, method_uri);
		}

		return this._method;
	}

	/**
	 * 
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
	 * 
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
	 * 
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
	 * 
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
	 * @throws KtbsError always throws a KtbsError when invoked for ComputedTrace instances, as computed trace do not store any obsel
	 */
	post(new_child_resource, abortSignal = null, credentials = null) {
		throw new KtbsError("Computed traces cannot store children obsels");
	}
}