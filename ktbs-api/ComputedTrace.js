import {Trace} from "./Trace.js";
import {ResourceMultiton} from "./ResourceMultiton.js";
import {Method} from "./Method.js";
import {KtbsError} from "./Errors.js";

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