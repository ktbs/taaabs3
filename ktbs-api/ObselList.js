import {Resource} from "./Resource.js";
import {ObselListPage} from "./ObselListPage.js";
import {ResourceMultiton} from "./ResourceMultiton.js";
import {Trace} from "./Trace.js";
import {Obsel} from "./Obsel.js";

/**
 * Class to help reading obsels list from a Trace
 */
export class ObselList extends Resource {
	
	/**
	 * Constructor
	 * \param URL or string uri - the resource's URI
	 * \public
	 */
	constructor(uri = null) {
		super(uri);

		/**
		 * Only obsels after this one will be returned
		 * \var URL
		 * \protected
		 */
		this._after = null;

		/**
		 * Only obsels before this one will be returned
		 * \var URL
		 * \protected
		 */
		this._before = null;

		/**
		 * Only that many obsels (at most) will be returned
		 * \var int
		 * \protected
		 */
		this._limit = 5;

		/**
		 * The minimum begin value for returned obsels
		 * \var int
		 * \protected
		 */
		this._minb = null;

		/**
		 * The minimum end value for returned obsels
		 * \var int
		 * \protected
		 */
		this._mine = null;

		/**
		 * The maximum begin value for returned obsels
		 * \var int
		 * \protected
		 */
		this._maxb = null;

		/**
		 * The maximum end value for returned obsels
		 * \var int
		 * \protected
		 */
		this._maxe = null;

		/**
		 * Skip that many obsels
		 * \var int
		 * \protected
		 */
		this._offset = null;

		/**
		 * Reverse the order (see below)
		 * \var boolean
		 * \protected
		 */
		this._reverse = null;
	}

	/**
     * Gets the Trace the ObselList belongs to
	 * \return Trace
	 * \public
     */
    get parent() {
		if(!this._parent) {
			let parent_trace_uri = this.resolve_link_uri("./");
			this._parent = ResourceMultiton.get_resource(Trace, parent_trace_uri);
		}

		return this._parent;
    }

	/**
	 * Gets the uri to query in order to read resource's data (For some resource types, this might be different from the resource URI, for instance if we need to add some query parameters. In such case, descending resource types must override this method)
	 * \return URL
	 * \protected
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
	 * \param int limit - the maximum number of obsels to fetch for this page (default: 500)
	 * \return URL
	 * \protected
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
	 * \param int limit - the maximum number of obsels to fetch for this page (default: 500)
	 * \return ObselListPage
	 * \protected
	 */
	get_first_page(limit = 500) {
		let firstPageURI = this._get_first_page_uri(limit);
		return ResourceMultiton.get_resource(ObselListPage, firstPageURI);
	}

	/**
	 * Gets all the obsels of the obsel list
	 * \return Array of Obsel
	 * \public
	 */
	get obsels() {
		if(!this._obsels) {
			this._obsels = new Array();

			if(this._JSONData.obsels instanceof Array) {
				for(let i = 0; i < this._JSONData.obsels.length; i++) {
					let obsel_data = this._JSONData.obsels[i];
					let obsel_uri = this.resolve_link_uri(obsel_data["@id"]);
					let obsel_is_known = ResourceMultiton.has_resource(Obsel, obsel_uri);
					let obsel = ResourceMultiton.get_resource(Obsel, obsel_uri);

					if(!obsel_is_known) {
						obsel.JSONData = obsel_data;
						obsel.context = this.context;
						obsel.parent = this.parent;
						obsel.syncStatus = "in_sync";
					}

					this._obsels.push(obsel);
				}
			}
		}
        return this._obsels;
	}

	/**
	 * Stores a new resource as a child of the current resource
	 * \throws KtbsError always throws a KtbsError when invoked for a ObselList as it is not a container resource
	 * \public
	 */
	post(new_child_resource, abortSignal = null, credentials = null) {
		throw new KtbsError("Only Ktbs roots, Bases and Traces can contain child resources");
	}

	/**
	 * Resets all the resource cached data
	 * \public
	 */
	_resetCachedData() {
		super._resetCachedData();

		if(this._parent)
			this._parent = undefined;

		if(this._obsels)
			delete this._obsels;
	}
}
