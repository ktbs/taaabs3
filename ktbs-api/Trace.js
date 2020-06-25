import {ResourceMultiton} from "./ResourceMultiton.js";
import {Resource} from "./Resource.js";
import {Model} from "./Model.js";
import {Base} from "./Base.js";
import {ObselList} from "./ObselList.js";


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