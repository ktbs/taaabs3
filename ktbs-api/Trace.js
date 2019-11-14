import {Resource} from "./Resource.js";

/**
 * 
 */
export class Trace extends Resource {

	/**
	 * @return Base
	 */
	get_base() {

	}

	/**
	 * @return Model
	 */
	get_model_uri() {
		if((this._parsedJson.hasModel) && (this._parsedJson.hasModel.substr(0, 4) == "http"))
			return this._parsedJson.hasModel;
		else
			return this._uri + this._parsedJson.hasModel;
	}

	/**
	 * @return Model
	 */
	get_model() {

	}

	/**
	 * An opaque string representing the temporal origin of the trace: two traces with the same origin can be temporally compared.
	 * @return str
	 */
	get_origin() {

	}

	/**
	 * The timestamp from which this trace was being collected, relative to the origin. This may be omitted (and then return null).
	 * @return int
	 */
	get_trace_begin() {

	}

	/**
	 * The datetime from which this trace was being collected, relative to the origin. This may be omitted (and then return null).
	 * @return str
	 */
	get_trace_begin_dt() {

	}

	/**
	 * The timestamp until which this trace was being collected, relative to the origin. This may be omitted (and then return null).
	 * @return int
	 */
	get_trace_end() {

	}

	/**
	 * The datetime until which this trace was being collected, relative to the origin. This may be omitted (and then return null).
	 * @return string
	*/
	get_trace_end_dt() {

	}

	/**
	 * @return Trace[]
	 */
	list_source_traces() {

	}

	/**
	 * Return the list of the traces of which this trace is a source.
	 * @return Trace[]
	 */
	list_transformed_traces() {

	}

	/**
	 * Return the data graphs providing contextual information for this trace.
	 * @return DataGraph[]
	 */
	list_contexts() {

	}

	/**
	 * Return a list of the obsel of this trace matching the parameters.
	 * @param int begin
	 * @param int end
	 * @param bool reverse
	 * @return Obsel[]
	 */
	list_obsels(begin = null, end = null, reverse = false) {

	}

	/**
	 * Return the obsel of this trace identified by the URI, or null.
	 * @param string id
	 * @return Obsel
	 */
	get_obsel(id) {

	}
}
