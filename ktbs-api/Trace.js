import {Resource} from "./Resource.js";
import {Model} from "./Model.js";

/**
 * Abstract class, base for the "Trace" resource types (StoredTrace and ComputedTrace)
 */
export class Trace extends Resource {

	/**
	 * Gets the URI of the model of the Trace
	 * @return string
	 */
	_get_model_uri() {
		return new URL(this._JSONData.hasModel, this._uri).toString();
	}

	/**
	 * Gets the model of the Trace
	 * @return Model
	 */
	get model() {
		return new Model(this._get_model_uri());
	}

	/**
	 * Gets the temporal origin of the trace
	 * @return string
	 */
	get origin() {
		return this._JSONData.origin;
	}
}
