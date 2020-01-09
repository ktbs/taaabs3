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
	 * Gets the URIs of the stored traces in the Base
	 * @return string[]
	 */
	_get_stored_traces_uris() {
		let stored_traces_uris = new Array();

		if(this._JSONData.contains instanceof Array) {
			for(let i = 0; i < this._JSONData.contains.length; i++) {
				if(this._JSONData.contains[i]["@type"] == "StoredTrace") {
					let stored_trace_id = this._JSONData.contains[i]["@id"];
					let stored_trace_uri;

					if(stored_trace_id.substr(0, 4) == "http")
						stored_trace_uri = stored_trace_id;
					else
						stored_trace_uri = this._uri + stored_trace_id;

					stored_traces_uris.push(stored_trace_uri);
				}
			}
		}
		
		return stored_traces_uris;
	}

	/**
	 * Gets the stored traces in the Base
	 * @return StoredTrace[]
	 */
	get stored_traces() {
		let stored_traces = new Array();
		let stored_traces_uris = this._get_stored_traces_uris();

		for(let i = 0; i < stored_traces_uris.length; i++) {
			let stored_trace_uri = stored_traces_uris[i];
			let stored_trace = new StoredTrace(stored_trace_uri);
			stored_traces.push(stored_trace);
		}

		return stored_traces;
	}

	/**
	 * Gets the URIs of the computed traces in the Base
	 * @return string[]
	 */
	_get_computed_traces_uris() {
		let computed_traces_uris = new Array();

		if(this._JSONData.contains instanceof Array) {
			for(let i = 0; i < this._JSONData.contains.length; i++) {
				if(this._JSONData.contains[i]["@type"] == "ComputedTrace") {
					let computed_trace_id = this._JSONData.contains[i]["@id"];
					let computed_trace_uri;

					if(computed_trace_id.substr(0, 4) == "http")
						computed_trace_uri = computed_trace_id;
					else
						computed_trace_uri = this._uri + computed_trace_id;

					computed_traces_uris.push(computed_trace_uri);
				}
			}
		}
		
		return computed_traces_uris;
	}

	/**
	 * Gets the computed traces in the Base
	 * @return ComputedTrace[]
	 */
	get computed_traces() {
		let computed_traces = new Array();
		let computed_traces_uris = this._get_computed_traces_uris();

		for(let i = 0; i < computed_traces_uris.length; i++) {
			let computed_trace_uri = computed_traces_uris[i];
			let computed_trace = new ComputedTrace(computed_trace_uri);
			computed_traces.push(computed_trace);
		}

		return computed_traces;
	}

	/**
	 * Gets the URIs of the models in the Base
	 * @return string[]
	 */
	_get_models_uris() {
		let models_uris = new Array();

		if(this._JSONData.contains instanceof Array) {
			for(let i = 0; i < this._JSONData.contains.length; i++) {
				if(this._JSONData.contains[i]["@type"] == "TraceModel") {
					let model_id = this._JSONData.contains[i]["@id"];
					let model_uri;

					if(model_id.substr(0, 4) == "http")
						model_uri = model_id;
					else
						model_uri = this._uri + model_id;

					models_uris.push(model_uri);
				}
			}
		}
		
		return models_uris;
	}

	/**
	 * Gets the models in the Base
	 * @return Model[]
	 */
	get models() {
		let models = new Array();
		let models_uris = this._get_models_uris();

		for(let i = 0; i < models_uris.length; i++) {
			let model_uri = models_uris[i];
			let model = new Model(model_uri);
			models.push(model);
		}

		return models;
	}

	/**
	 * Gets the URIs of the methods in the base.
	 * @return string[]
	 */
	_get_methods_uris() {
		let methods_uris = new Array();

		if(this._JSONData.contains instanceof Array) {
			for(let i = 0; i < this._JSONData.contains.length; i++) {
				if(this._JSONData.contains[i]["@type"] == "Method") {
					let method_id = this._JSONData.contains[i]["@id"];
					let method_uri;

					if(method_id.substr(0, 4) == "http")
						method_uri = method_id;
					else
						method_uri = this._uri + method_id;

					methods_uris.push(method_uri);
				}
			}
		}
		
		return methods_uris;
	}

	/**
	 * Gets the methods in the Base
	 * @return Method[]
	 */
	get methods() {
		let methods = new Array();
		let methods_uris = this._get_methods_uris();

		for(let i = 0; i < methods_uris.length; i++) {
			let method_uri = methods_uris[i];
			let method = new Method(method_uri);
			methods.push(method);
		}

		return methods;
	}

	/**
	 * Gets the URIs of the sub-bases in the Base
	 * @return string[]
	 */
	_get_bases_uris() {
		let bases_uris = new Array();

		if(this._JSONData.contains instanceof Array) {
			for(let i = 0; i < this._JSONData.contains.length; i++) {
				if(this._JSONData.contains[i]["@type"] == "Base") {
					let base_id = this._JSONData.contains[i]["@id"];
					let base_uri;

					if(base_id.substr(0, 4) == "http")
						base_uri = base_id;
					else
						base_uri = this._uri + base_id;

					bases_uris.push(base_uri);
				}
			}
		}
		
		return bases_uris;
	}

	/**
	 * Gets the sub-bases in the Base
	 * @return Base[]
	 */
	get bases() {
		let bases = new Array();
		let bases_uris = this._get_bases_uris();

		for(let i = 0; i < bases_uris.length; i++) {
			let base_uri = bases_uris[i];
			let base = new Base(base_uri);
			bases.push(base);
		}

		return bases;
	}
}
