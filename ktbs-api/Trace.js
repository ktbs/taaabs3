import {ResourceProxy} from "./ResourceProxy.js";
import {Resource} from "./Resource.js";
import {Model} from "./Model.js";

/**
 * Abstract class, meant to be be inherited by the trace resource types (StoredTrace and ComputedTrace)
 */
export class Trace extends Resource {

	/**
	 * Gets the URI of the model of the Trace
	 * @return URL
	 */
	_get_model_uri() {
		return new URL(this._JSONData.hasModel, this.uri);
	}

	/**
	 * Gets the model of the Trace
	 * @return Model
	 */
	get model() {
		return ResourceProxy.get_resource(Model, this._get_model_uri());
	}

	/**
	 * Gets the temporal origin of the trace
	 * @return string
	 */
	get origin() {
		return this._JSONData.origin;
	}
}
