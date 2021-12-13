import {ResourceMultiton} from "./ResourceMultiton.js";
import {Resource} from "./Resource.js";
import {Ktbs} from "./Ktbs.js";
import {StoredTrace} from "./Trace.js";
import {ComputedTrace} from "./Trace.js";
import {Model} from "./Model.js";
import {Method} from "./Method.js";

/**
 * Class for the "Base" resource-type
 */
export class Base extends Resource {

	/**
	 * Constructor
	 * \param URL or string uri the resource's URI
	 * \public
	 */
	constructor(uri = null) {
		super(uri);
		this._JSONData["@type"] = "Base";
	}

	/**
	 * Gets the parent resource of this resource.
	 * \return Resource
	 * \public
	 */
	get parent() {
		if(!this._parent) {
			if(this._JSONData.inBase)
				this._parent = ResourceMultiton.get_resource(Base, this.resolve_link_uri(this._JSONData.inBase));
			else if(this._JSONData.inRoot)
				this._parent = ResourceMultiton.get_resource(Ktbs, this.resolve_link_uri(this._JSONData.inRoot));
		}

		return this._parent;
	}

	/**
	 * Gets the stored traces in the Base
	 * \return Array of StoredTrace
	 * \public
	 */
	get stored_traces() {
		if(!this._stored_traces) {
			this._stored_traces = new Array();

			if(this._JSONData.contains instanceof Array) {
				for(let i = 0; i < this._JSONData.contains.length; i++) {
					if(this._JSONData.contains[i]["@type"] == "StoredTrace") {
						let stored_trace_uri_string = this._JSONData.contains[i]["@id"];
						let stored_trace_uri = this.resolve_link_uri(stored_trace_uri_string);
						let stored_trace = ResourceMultiton.get_resource(StoredTrace, stored_trace_uri);
						stored_trace.registerObserver(this._onChildResourceDeleted.bind(this), "lifecycle-status-change", "deleted");
						this._stored_traces.push(stored_trace);
					}
				}
			}
		}

		return this._stored_traces;
	}

	/**
	 * Gets the computed traces in the Base
	 * \return Array of ComputedTrace
	 * \public
	 */
	get computed_traces() {
		if(!this._computed_traces) {
			this._computed_traces = new Array();

			if(this._JSONData.contains instanceof Array) {
				for(let i = 0; i < this._JSONData.contains.length; i++) {
					if(this._JSONData.contains[i]["@type"] == "ComputedTrace") {
						let computed_trace_uri_string = this._JSONData.contains[i]["@id"];
						let computed_trace_uri = this.resolve_link_uri(computed_trace_uri_string);
						let computed_trace = ResourceMultiton.get_resource(ComputedTrace, computed_trace_uri);
						computed_trace.registerObserver(this._onChildResourceDeleted.bind(this), "lifecycle-status-change", "deleted");
						this._computed_traces.push(computed_trace);
					}
				}
			}
		}

		return this._computed_traces;
	}

	/**
	 * Gets the models in the Base
	 * \return Array of Model
	 * \public
	 */
	get models() {
		if(!this._models) {
			this._models = new Array();

			if(this._JSONData.contains instanceof Array) {
				for(let i = 0; i < this._JSONData.contains.length; i++) {
					if(this._JSONData.contains[i]["@type"] == "TraceModel") {
						let model_uri_string = this._JSONData.contains[i]["@id"];
						let model_uri = this.resolve_link_uri(model_uri_string);
						let model = ResourceMultiton.get_resource(Model, model_uri);
						model.registerObserver(this._onChildResourceDeleted.bind(this), "lifecycle-status-change", "deleted");
						this._models.push(model);
					}
				}
			}
		}

		return this._models;
	}

	/**
	 * Gets the methods in the Base
	 * \return Array of Method
	 * \public
	 */
	get methods() {
		if(!this._methods) {
			this._methods = new Array();

			if(this._JSONData.contains instanceof Array) {
				for(let i = 0; i < this._JSONData.contains.length; i++) {
					if(this._JSONData.contains[i]["@type"] == "Method") {
						let method_uri_string = this._JSONData.contains[i]["@id"];
						let method_uri = this.resolve_link_uri(method_uri_string);
						let method = ResourceMultiton.get_resource(Method, method_uri);
						method.registerObserver(this._onChildResourceDeleted.bind(this), "lifecycle-status-change", "deleted");
						this._methods.push(method);
					}
				}
			}
		}

		return this._methods;
	}

	/**
	 * Gets the sub-bases in the Base
	 * \return Array of Base
	 * \public
	 */
	get bases() {
		if(!this._bases) {
			this._bases = new Array();

			if(this._JSONData.contains instanceof Array) {
				for(let i = 0; i < this._JSONData.contains.length; i++) {
					if(this._JSONData.contains[i]["@type"] == "Base") {
						let base_uri_string = this._JSONData.contains[i]["@id"];
						let base_uri = this.resolve_link_uri(base_uri_string);
						let base = ResourceMultiton.get_resource(Base, base_uri);
						base.registerObserver(this._onChildResourceDeleted.bind(this), "lifecycle-status-change", "deleted");
						this._bases.push(base);
					}
				}
			}
		}

		return this._bases;
	}

	/**
	 * Gets the uri to query in order to read resource's data (For some resource types, this might be different from the resource URI, for instance if we need to add some query parameters. In such case, descending resource types must override this method)
	 * \return URL
	 * \protected
	 */
	get _data_read_uri() {
		if(!this._dataReadUri) {
			this._dataReadUri = new URL(this.uri);
			this._dataReadUri.searchParams.append("prop", "label");
		}

		return this._dataReadUri;
	}

	/**
	 * 
	 * @param Resource new_children 
	 */
	_registerNewChild(new_children) {
		let newChildrenJSONDataChunk = {"@id": new_children.id, "@type": new_children.type};

		if(new_children.label)
			newChildrenJSONDataChunk["label"] = new_children.label;

		if(this._JSONData.contains == undefined)
			this._JSONData.contains = new Array();

		this._JSONData.contains.push(newChildrenJSONDataChunk);

		if((new_children instanceof Base) && (this._bases))
			this._bases.push(new_children);
		else if((new_children instanceof Model) && (this._models))
			this._models.push(new_children);
		else if((new_children instanceof StoredTrace) && (this._stored_traces))
			this._stored_traces.push(new_children);
		else if((new_children instanceof Method) && (this._methods))
			this._methods.push(new_children);
		else if((new_children instanceof ComputedTrace) && (this._computed_traces))
			this._computed_traces.push(new_children);
		
		if(this._children)
			this._children.push(new_children);

		new_children.registerObserver(this._onChildResourceDeleted.bind(this), "lifecycle-status-change", "deleted");
	}

	/**
	 * Get all the children of the current resource
	 * \return Array of Resource
	 * \public
	 */
	get children() {
		if(!this._children) {
			this._children = new Array()
								.concat(this.bases)
								.concat(this.computed_traces)
								.concat(this.methods)
								.concat(this.stored_traces)
								.concat(this.models);
		}

		return this._children;
	}

	/**
	 * Resets the calculated data temporarily stored in memory as instance variables. Descendant classes that add such variables should override this method, reset their own-level variables and then call super._resetCalculatedData()
	 * \public
	 */
	_resetCalculatedData() {
		if(this._parent)
			this._parent = undefined;

		if(this._stored_traces)
			delete this._stored_traces;

		if(this._computed_traces)
			delete this._computed_traces;

		if(this._models)
			delete this._models;

		if(this._methods)
			delete this._methods;

		if(this._bases)
			delete this._bases;

		if(this._children)
			delete this._children;

		super._resetCalculatedData();
	}

	/**
	 * 
	 */
	_onChildResourceDeleted(deleted_child) {
		deleted_child.unregisterObserver(this._onChildResourceDeleted.bind(this), "lifecycle-status-change", "deleted");

		if(this._JSONData.contains instanceof Array)
			for(let i = (this._JSONData.contains.length - 1); i >= 0; i--)
				if(this._JSONData.contains[i])
					if(this.resolve_link_uri(this._JSONData.contains[i]["@id"]).toString() == deleted_child.uri.toString())
						this._JSONData.contains.splice(i, 1);

		if((deleted_child instanceof Base) && (this._bases))
			delete this._bases;
		else if((deleted_child instanceof Model) && (this._models))
			delete this._models;
		else if((deleted_child instanceof StoredTrace) && (this._stored_traces))
			delete this._stored_traces;
		else if((deleted_child instanceof Method) && (this._methods))
			delete this._methods;
		else if((deleted_child instanceof ComputedTrace) && (this._computed_traces))
			delete this._computed_traces;
		
		if(this._children)
			delete this._children;

		this._removeFromSharedCache();
	}
}
