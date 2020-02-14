import {ResourceProxy} from "./ResourceProxy.js";
import {Resource} from "./Resource.js";
import {StoredTrace} from "./StoredTrace.js";
import {ComputedTrace} from "./ComputedTrace.js";
import {Model} from "./Model.js";
import {Method} from "./Method.js";

/**
 * Class for the "Base" resource-type
 */
export class Base extends Resource {

	/**
	 * Gets the stored traces in the Base
	 * @return StoredTrace[]
	 */
	get stored_traces() {
		let stored_traces = new Array();

		if(this._JSONData.contains instanceof Array) {
			for(let i = 0; i < this._JSONData.contains.length; i++) {
				if(this._JSONData.contains[i]["@type"] == "StoredTrace") {
					let stored_trace_uri_string = this._JSONData.contains[i]["@id"];
					let stored_trace_uri = new URL(stored_trace_uri_string, this.uri);
					let stored_trace = ResourceProxy.get_resource(StoredTrace, stored_trace_uri);

					let stored_trace_label = this._JSONData.contains[i]["label"];

					if(stored_trace_label && !stored_trace.label)
						stored_trace.label = stored_trace_label;

					stored_traces.push(stored_trace);
				}
			}
		}

		return stored_traces;
	}

	/**
	 * Gets the computed traces in the Base
	 * @return ComputedTrace[]
	 */
	get computed_traces() {
		let computed_traces = new Array();

		if(this._JSONData.contains instanceof Array) {
			for(let i = 0; i < this._JSONData.contains.length; i++) {
				if(this._JSONData.contains[i]["@type"] == "ComputedTrace") {
					let computed_trace_uri_string = this._JSONData.contains[i]["@id"];
					let computed_trace_uri = new URL(computed_trace_uri_string, this.uri);
					let computed_trace = ResourceProxy.get_resource(ComputedTrace, computed_trace_uri);

					let computed_trace_label = this._JSONData.contains[i]["label"];

					if(computed_trace_label && !computed_trace.label)
						computed_trace.label = computed_trace_label;

					computed_traces.push(computed_trace);
				}
			}
		}

		return computed_traces;
	}

	/**
	 * Gets the models in the Base
	 * @return Model[]
	 */
	get models() {
		let models = new Array();

		if(this._JSONData.contains instanceof Array) {
			for(let i = 0; i < this._JSONData.contains.length; i++) {
				if(this._JSONData.contains[i]["@type"] == "TraceModel") {
					let model_uri_string = this._JSONData.contains[i]["@id"];
					let model_uri = new URL(model_uri_string, this.uri);
					let model = ResourceProxy.get_resource(Model, model_uri);

					let model_label = this._JSONData.contains[i]["label"];

					if(model_label && !model.label)
						model.label = model_label;

					models.push(model);
				}
			}
		}

		return models;
	}

	/**
	 * Gets the methods in the Base
	 * @return Method[]
	 */
	get methods() {
		let methods = new Array();

		if(this._JSONData.contains instanceof Array) {
			for(let i = 0; i < this._JSONData.contains.length; i++) {
				if(this._JSONData.contains[i]["@type"] == "Method") {
					let method_uri_string = this._JSONData.contains[i]["@id"];
					let method_uri = new URL(method_uri_string, this.uri);
					let method = ResourceProxy.get_resource(Method, method_uri);

					let method_label = this._JSONData.contains[i]["label"];

					if(method_label && !method.label)
						method.label = method_label;

					methods.push(method);
				}
			}
		}

		return methods;
	}

	/**
	 * Gets the sub-bases in the Base
	 * @return Base[]
	 */
	get bases() {
		let bases = new Array();

		if(this._JSONData.contains instanceof Array) {
			for(let i = 0; i < this._JSONData.contains.length; i++) {
				if(this._JSONData.contains[i]["@type"] == "Base") {
					let base_uri_string = this._JSONData.contains[i]["@id"];
					let base_uri = new URL(base_uri_string, this.uri);
					let base = ResourceProxy.get_resource(Base, base_uri);

					let base_label = this._JSONData.contains[i]["label"];

					if(base_label && !base.label)
						base.label = base_label;

					bases.push(base);
				}
			}
		}

		return bases;
	}

	/**
	 * Gets the uri to query in order to read resource's data (For some resource types, this might be different from the resource URI, for instance if we need to add some query parameters. In such case, descending resource types must override this method)
	 * @return string
	 */
	get _data_read_uri() {
		let dataReadUri = new URL(this.uri);
		dataReadUri.searchParams.append("prop", "label");
		return dataReadUri;
	}
}
