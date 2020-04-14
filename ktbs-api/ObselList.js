import {Resource} from "./Resource.js";
import {ObselListPage} from "./ObselListPage.js";
import {ResourceProxy} from "./ResourceProxy.js";
import {Trace} from "./Trace.js";
import {Obsel} from "./Obsel.js";

/**
 * Class to help reading obsels list from a Trace
 */
export class ObselList extends Resource {
	
	/**
	 * Constructor
	 */
	constructor(uri = null) {
		super(uri);

		/**
		 * Only obsels after this one will be returned
		 * @type uri
		 */
		this._after = null;

		/**
		 * Only obsels before this one will be returned
		 * @type uri
		 */
		this._before = null;

		/**
		 * Only that many obsels (at most) will be returned
		 * @type int
		 */
		this._limit = 5;

		/**
		 * The minimum begin value for returned obsels
		 * @type int
		 */
		this._minb = null;

		/**
		 * The minimum end value for returned obsels
		 * @type int
		 */
		this._mine = null;

		/**
		 * The maximum begin value for returned obsels
		 * @type int
		 */
		this._maxb = null;

		/**
		 * The maximum end value for returned obsels
		 * @type int
		 */
		this._maxe = null;

		/**
		 * Skip that many obsels
		 * @type int
		 */
		this._offset = null;

		/**
		 * Reverse the order (see below)
		 * @type boolean
		 */
		this._reverse = null;
	}

	/**
     * Gets the Trace the ObselList belongs to
	 * @return Trace
     */
    get parent() {
		if(!this._parent) {
			let parent_trace_uri = this.resolve_link_uri("./");
			this._parent = ResourceProxy.get_resource(Trace, parent_trace_uri);
		}

		return this._parent;
    }

	/**
	 * Always returns true for ObselList instances since they are never modifiable.
	 * @return bool
	 */
	get readonly() {
		return true;
	}

	/**
	 * Gets the uri to query in order to read resource's data (For some resource types, this might be different from the resource URI, for instance if we need to add some query parameters. In such case, descending resource types must override this method)
	 * @return URL
	 */
	get _data_read_uri() {
		let params = new Array();

		if(this._after && (this._after != ""))
			params.push("after=" + this._after);

		if(this._before && (this._before != ""))
			params.push("before=" + this._before);

		if(this._limit && (this._limit != ""))
			params.push("limit=" + this._limit);

		if(this._minb && (this._minb != ""))
			params.push("minb=" + this._minb);

		if(this._mine && (this._mine != ""))
			params.push("mine=" + this._mine);

		if(this._maxb && (this._maxb != ""))
			params.push("maxb=" + this._maxb);

		if(this._maxe && (this._maxe != ""))
			params.push("maxe=" + this._maxe);

		if(this._offset && (this._offset != ""))
			params.push("offset=" + this._offset);

		if(this._reverse && (this._reverse != ""))
			params.push("reverse=" + this._reverse);

		let dataReadUri = this.uri.toString();

		if(params.length > 0)
			dataReadUri += "?" + params.join("&");

		return new URL(dataReadUri);
	}

	/**
	 * Builds and returns an URI to fetch the first Obsel page from the Trace
	 * @param int limit The maximum number of obsels to fetch for this page (default: 500)
	 * @return URL
	 */
	_get_first_page_uri(limit = 500) {
		let params = new Array();

		if(this._after && (this._after != ""))
			params.push("after=" + this._after);

		if(this._before && (this._before != ""))
			params.push("before=" + this._before);

		params.push("limit=" + limit);

		if(this._minb && (this._minb != ""))
			params.push("minb=" + this._minb);

		if(this._mine && (this._mine != ""))
			params.push("mine=" + this._mine);

		if(this._maxb && (this._maxb != ""))
			params.push("maxb=" + this._maxb);

		if(this._maxe && (this._maxe != ""))
			params.push("maxe=" + this._maxe);

		if(this._offset && (this._offset != ""))
			params.push("offset=" + this._offset);

		if(this._reverse && (this._reverse != ""))
			params.push("reverse=" + this._reverse);

		let first_page_uri_string = this.uri.toString();

		if(params.length > 0)
			first_page_uri_string += "?" + params.join("&");

		return new URL(first_page_uri_string);
	}

	/**
	 * Gets the data for the first page of the Obsel list and returns a Promise attached to the HTTP request
	 * @param int limit The maximum number of obsels to fetch for this page (default: 500)
	 * @return ObselListPage
	 */
	get_first_page(limit = 500) {
		let firstPageURI = this._get_first_page_uri(limit);
		return ResourceProxy.get_resource(ObselListPage, firstPageURI);
	}

	/**
	 * Gets all the obsels of the obsel list
	 * @return Obsel[]
	 */
	get obsels() {
		let obsels = new Array();

		if(this._JSONData.obsels instanceof Array) {
			for(let i = 0; i < this._JSONData.obsels.length; i++) {
				let obsel_data = this._JSONData.obsels[i];
				let obsel_uri = this.resolve_link_uri(obsel_data["@id"]);
				let obsel_is_known = ResourceProxy.has_resource(Obsel, obsel_uri);
				let obsel = ResourceProxy.get_resource(Obsel, obsel_uri);

				if(!obsel_is_known) {
					obsel.JSONData = obsel_data;
					obsel.context = this.context;
					obsel.parent = this.parent;
					obsel.syncStatus = "in_sync";
				}

				obsels.push(obsel);
			}
		}

        return obsels;
	}
}
