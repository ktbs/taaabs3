import {ResourceProxy} from "./ResourceProxy.js";
import {Resource} from "./Resource.js";
import {Model} from "./Model.js";
import {Method} from "./Method.js";
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
			this._parent = ResourceProxy.get_resource(Base, this.resolve_link_uri(this._JSONData.inBase));

		return this._parent;
	}

	/**
	 * Gets the model of the Trace
	 * @return Model
	 */
	get model() {
		if(!this._model && this._JSONData.hasModel)
			this._model = ResourceProxy.get_resource(Model, this.resolve_link_uri(this._JSONData.hasModel));
		
		return this._model;
	}

	/**
	 * Gets the temporal origin of the trace
	 * @return string
	 */
	get origin() {
		return this._JSONData.origin;
	}

	/**
	 * Gets the obsel list of the trace
	 * @return ObselList
	 */
	get obsel_list() {
		if(!this._obsels && this._JSONData.hasObselList)
			this._obsels = ResourceProxy.get_resource(ObselList, this.resolve_link_uri(this._JSONData.hasObselList));
		
			return this._obsels;
	}
}

/**
 * Class for the StoredTrace resource type
 */
export class StoredTrace extends Trace {}

/**
 * Class for the "ComputedTrace" resource type
 */
export class ComputedTrace extends Trace {

	/**
	 * Gets the URI of the trace's Method
	 * @return URL[]
	 */
	_get_method_uri() {
		if(!this._method_uri)
			this._method_uri = this.resolve_link_uri(this._JSONData.hasMethod);

		return this._method_uri;
	}

	/**
	 * Gets the trace's Method
	 * @return Method
	 */
	get method() {
		if(!this._method)
			this._method = ResourceProxy.get_resource(Method, this._get_method_uri());

		return this._method;
	}
}