import {Trace} from "./Trace.js";
import {Method} from "./Method.js";

/**
 * Class for the "ComputedTrace" resource type
 */
export class ComputedTrace extends Trace {

	/**
	 * Gets the URI of the trace's Method
	 * @return string
	 */
	_get_method_uri() {
		return new URL(this._JSONData.hasMethod, this._uri).toString();
	}

	/**
	 * Gets the trace's Method
	 * @return Method
	 */
	get method() {
		return new Method(this._get_method_uri());
	}
}
