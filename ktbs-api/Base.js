import {Resource} from "./Resource.js";

/**
 * 
 */
export class Base extends Resource {

	/**
	 * Return the element of this base identified by the given URI, or null.
	 * @param string id the uri of the element to get
	 * @return Trace|Model|Method|Base|DataGraph
	 */
	/*get(id) {

	}*/

	/**
	 * List the uris of the traces stored in that base
	 * @return string[]
	 */
	list_stored_traces_uris() {
		let stored_traces_uris = new Array();

		if(this._parsedJson.contains instanceof Array) {
			for(let i = 0; i < this._parsedJson.contains.length; i++) {
				if(this._parsedJson.contains[i]["@type"] == "StoredTrace") {
					let stored_trace_id = this._parsedJson.contains[i]["@id"];
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
	 * 
	 */
	/*list_stored_traces() {

	}*/

	/**
	 * List the uris of the traces stored in that base
	 * @return string[]
	 */
	list_computed_traces_uris() {
		let computed_traces_uris = new Array();

		if(this._parsedJson.contains instanceof Array) {
			for(let i = 0; i < this._parsedJson.contains.length; i++) {
				if(this._parsedJson.contains[i]["@type"] == "ComputedTrace") {
					let computed_trace_id = this._parsedJson.contains[i]["@id"];
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
	 * 
	 */
	/*list_computed_traces() {

	}*/

	/**
	 * List the uris of the traces stored in that base
	 * @return string[]
	 */
	list_traces_uris() {
		let traces_uris = new Array();

		if(this._parsedJson.contains instanceof Array) {
			for(let i = 0; i < this._parsedJson.contains.length; i++) {
				if((this._parsedJson.contains[i]["@type"] == "StoredTrace") || (this._parsedJson.contains[i]["@type"] == "ComputedTrace")) {
					let trace_id = this._parsedJson.contains[i]["@id"];
					let trace_uri;

					if(trace_id.substr(0, 4) == "http")
						trace_uri = trace_id;
					else
						trace_uri = this._uri + trace_id;

					traces_uris.push(trace_uri);
				}
			}
		}
		
		return traces_uris;
	}

	/**
	 * List the traces stored in that base
	 * @return Trace[]
	 */
	/*list_traces() {

	}*/

	/**
	 * List the uris of the models stored in that base
	 * @return string[]
	 */
	list_models_uris() {
		let models_uris = new Array();

		if(this._parsedJson.contains instanceof Array) {
			for(let i = 0; i < this._parsedJson.contains.length; i++) {
				if(this._parsedJson.contains[i]["@type"] == "TraceModel") {
					let model_id = this._parsedJson.contains[i]["@id"];
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
	 * List the models stored in that base
	 * @return Model[]
	 */
	/*list_models() {

	}*/

	/**
	 * List the uris of the methods stored in that base.
	 * @return string[]
	 */
	list_methods_uris() {
		let methods_uris = new Array();

		if(this._parsedJson.contains instanceof Array) {
			for(let i = 0; i < this._parsedJson.contains.length; i++) {
				if(this._parsedJson.contains[i]["@type"] == "Method") {
					let method_id = this._parsedJson.contains[i]["@id"];
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
	 * List the methods stored in that base.
	 * @return Method[]
	 */
	/*list_methods() {

	}*/

	/**
	 * List the uris of the bases stored in that base.
	 * @return string[]
	 */
	list_bases_uris() {
		let bases_uris = new Array();

		if(this._parsedJson.contains instanceof Array) {
			for(let i = 0; i < this._parsedJson.contains.length; i++) {
				if(this._parsedJson.contains[i]["@type"] == "Base") {
					let base_id = this._parsedJson.contains[i]["@id"];
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
	 * List the bases stored in that base.
	 * @return Base[]
	 */
	/*list_bases() {

	}*/

	/**
	 * List the data graphs stored in that base.
	 * @return DataGraph[]
	 */
	/*list_data_graphs() {

	}*/

	/**
	 * Creates a stored trace in that base If origin is not specified, a fresh opaque string is generated
	 * @param string id the uri
	 * @param Model model
	 * @param string origin
	 * @param string default_subject
	 * @param string label
	 * @return StoredTrace
	 */
	/*create_stored_trace(id, model, origin, default_subject, label) {
		
	}*/

	/**
	 * Creates a computed trace in that base.
	 * @param string id the uri
	 * @param Method method
	 * @param string[] parameters
	 * @param Trace[] sources
	 * @param string label
	 * @return ComputedTrace
	 */
	/*create_computed_trace(id, method, parameters, sources, label) {

	}*/

	/**
	 * @param string id uri
	 * @param Model[] parents
	 * @param string label
	 * @return Model
	 */
	/*create_model(id, parents, label) {

	}*/

	/**
	 * @param string id uri
	 * @param Method parent
	 * @param string[] parameters
	 * @param string label
	 * @return Method
	 */
	/*create_method(id, parent, parameters, label) {

	}*/

	/**
	 * @param string id uri
	 * @param string label
	 * @return Base
	 */
	/*create_base(id, label) {

	}*/

	/**
	 * @param string uri
	 * @param string label
	 * @return DataGraph
	 */
	/*create_data_graph(id, label) {

	}*/
}
