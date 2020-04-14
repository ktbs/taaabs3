import {ResourceProxy} from "./ResourceProxy.js";
import {Resource} from "./Resource.js";
import {Ktbs} from "./Ktbs.js";
import {StoredTrace, ComputedTrace} from "./Trace.js";
import {Model} from "./Model.js";
import {Method} from "./Method.js";

/**
 * Class for the "Base" resource-type
 */
export class Base extends Resource {

	/**
	 * Gets the parent resource of this resource.
	 * @return Resource the resource's parent resource if any, or undefined if the resource's parent is unknown (i.e. the resource hasn't been read or recorded yet), or null if the resource doesn't have any parent (i.e. Ktbs Root).
	 */
	get parent() {
		if(!this._parent) {
			if(this._JSONData["inBase"])
				this._parent = ResourceProxy.get_resource(Base, this.resolve_link_uri(this._JSONData["inBase"]));
			else if(this._JSONData["inRoot"])
				this._parent = ResourceProxy.get_resource(Ktbs, this.resolve_link_uri(this._JSONData["inRoot"]));
		}

		return this._parent;
	}

	/**
	 * Gets the stored traces in the Base
	 * @return StoredTrace[]
	 */
	get stored_traces() {
		if(!this._stored_traces) {
			this._stored_traces = new Array();

			if(this._JSONData.contains instanceof Array) {
				for(let i = 0; i < this._JSONData.contains.length; i++) {
					if(this._JSONData.contains[i]["@type"] == "StoredTrace") {
						let stored_trace_uri_string = this._JSONData.contains[i]["@id"];
						let stored_trace_uri = this.resolve_link_uri(stored_trace_uri_string);
						let stored_trace = ResourceProxy.get_resource(StoredTrace, stored_trace_uri);

						let stored_trace_label = this._JSONData.contains[i]["label"];

						if(stored_trace_label && !stored_trace.label)
							stored_trace.label = stored_trace_label;

						this._stored_traces.push(stored_trace);
					}
				}
			}
		}

		return this._stored_traces;
	}

	/**
	 * Gets the computed traces in the Base
	 * @return ComputedTrace[]
	 */
	get computed_traces() {
		if(!this._computed_traces) {
			this._computed_traces = new Array();

			if(this._JSONData.contains instanceof Array) {
				for(let i = 0; i < this._JSONData.contains.length; i++) {
					if(this._JSONData.contains[i]["@type"] == "ComputedTrace") {
						let computed_trace_uri_string = this._JSONData.contains[i]["@id"];
						let computed_trace_uri = this.resolve_link_uri(computed_trace_uri_string);
						let computed_trace = ResourceProxy.get_resource(ComputedTrace, computed_trace_uri);

						let computed_trace_label = this._JSONData.contains[i]["label"];

						if(computed_trace_label && !computed_trace.label)
							computed_trace.label = computed_trace_label;

						this._computed_traces.push(computed_trace);
					}
				}
			}
		}

		return this._computed_traces;
	}

	/**
	 * Gets the models in the Base
	 * @return Model[]
	 */
	get models() {
		if(!this._models) {
			this._models = new Array();

			if(this._JSONData.contains instanceof Array) {
				for(let i = 0; i < this._JSONData.contains.length; i++) {
					if(this._JSONData.contains[i]["@type"] == "TraceModel") {
						let model_uri_string = this._JSONData.contains[i]["@id"];
						let model_uri = this.resolve_link_uri(model_uri_string);
						let model = ResourceProxy.get_resource(Model, model_uri);

						let model_label = this._JSONData.contains[i]["label"];

						if(model_label && !model.label)
							model.label = model_label;

						this._models.push(model);
					}
				}
			}
		}

		return this._models;
	}

	/**
	 * Gets the methods in the Base
	 * @return Method[]
	 */
	get methods() {
		if(!this._methods) {
			this._methods = new Array();

			if(this._JSONData.contains instanceof Array) {
				for(let i = 0; i < this._JSONData.contains.length; i++) {
					if(this._JSONData.contains[i]["@type"] == "Method") {
						let method_uri_string = this._JSONData.contains[i]["@id"];
						let method_uri = this.resolve_link_uri(method_uri_string);
						let method = ResourceProxy.get_resource(Method, method_uri);

						let method_label = this._JSONData.contains[i]["label"];

						if(method_label && !method.label)
							method.label = method_label;

						this._methods.push(method);
					}
				}
			}
		}

		return this._methods;
	}

	/**
	 * Gets the sub-bases in the Base
	 * @return Base[]
	 */
	get bases() {
		if(!this._bases) {
			this._bases = new Array();

			if(this._JSONData.contains instanceof Array) {
				for(let i = 0; i < this._JSONData.contains.length; i++) {
					if(this._JSONData.contains[i]["@type"] == "Base") {
						let base_uri_string = this._JSONData.contains[i]["@id"];
						let base_uri = this.resolve_link_uri(base_uri_string);
						let base = ResourceProxy.get_resource(Base, base_uri);

						let base_label = this._JSONData.contains[i]["label"];

						if(base_label && !base.label)
							base.label = base_label;

						this._bases.push(base);
					}
				}
			}
		}

		return this._bases;
	}

	/**
	 * Gets the uri to query in order to read resource's data (For some resource types, this might be different from the resource URI, for instance if we need to add some query parameters. In such case, descending resource types must override this method)
	 * @return string
	 */
	get _data_read_uri() {
		if(!this._dataReadUri) {
			this._dataReadUri = new URL(this.uri);
			this._dataReadUri.searchParams.append("prop", "label");
		}

		return this._dataReadUri;
	}
}
