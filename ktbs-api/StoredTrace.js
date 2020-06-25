import {Trace} from "./Trace.js";
import {Obsel} from "./Obsel.js";
import {KtbsError} from "./Errors.js";

/**
 * Class for the StoredTrace resource type
 */
export class StoredTrace extends Trace {

	/**
	 * Constructor
	 * @param URL or string uri the resource's URI
	 */
	constructor(uri = null) {
		super(uri);
		this._JSONData["@type"] = "StoredTrace";
	}

	/**
	 * Stores an Obsel or an Array of Obsel as child(s) of the current StoredTrace
	 * @param {Obsel, Array} new_child_resource the new child resource
	 * @param AbortSignal abortSignal an optional AbortSignal allowing to stop the HTTP request
	 * @param Object credentials an optional credentials object. If none is specified, the "credentials" property value of the resource will be used.
	 * @throws TypeError throws a TypeError if the provided new_child_resource argument is not an Obsel
	 * @returns Promise
	 */
	post(new_child_resource, abortSignal = null, credentials = null) {
		if((new_child_resource instanceof Obsel) || (new_child_resource instanceof Array)) {
			if(new_child_resource instanceof Array) {
				if(new_child_resource.length == 0)
					throw new KtbsError("Empty obsel collection can not be posted to trace");
				else 
					for(let i = 0; i < new_child_resource.length; i++) {
						let aChildResource = new_child_resource[i];

						if(!(aChildResource instanceof Obsel))
							throw new KtbsError("Collection can contain only Obsel instances to be posted to trace");
						else
							aChildResource.parent = this;
					}
			}
			else
				new_child_resource.parent = this;

			return super.post(new_child_resource, abortSignal, credentials);
		}
		else
			throw new TypeError("Only Obsel instances can be posted as childrens of a Trace");
	}
}