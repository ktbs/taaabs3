import {Resource} from "./Resource.js";

/**
 * Class to help reading obsels list from a Trace, optionally in a paginated fashion
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

		let dataReadUri = this.uri.toString();

		if(params.length > 0)
			dataReadUri += "?" + params.join("&");

		return new URL(dataReadUri);
	}

	/**
	 * Query the data for one page of the obsel list and returns a Promise attached to the HTTP request
	 * @param string pageURI the URI of the obsel page
	 * @param AbortSignal abortSignal an optional AbortSignal allowing to stop the HTTP request
	 * @return Promise
	 */
	get_obsel_page(pageURI, abortSignal = null) {
		return new Promise((resolve, reject) => {
				let fetchParameters = { 
					method: "GET",
					headers: new Headers({
						"Accept": "application/json"
					}),
					cache: "default"
				};

				let credentials = this.credentials;

				if((credentials != null) && credentials.id && credentials.password)
					fetchParameters.headers.append("Authorization", "Basic " + btoa(credentials.id + ":" + credentials.password));

				if(abortSignal)
					fetchParameters.signal = abortSignal;

				fetch(pageURI, fetchParameters)
					.then(function(response) {
						// if the HTTP request responded successfully
						if(response.ok) {
							let nextPageURI = null;
							
							if(response.headers.has("link")) {
								let linkResponseHeader = response.headers.get("link");
								let links = linkResponseHeader.split(', ');

								for(let i = 0; (nextPageURI == null) && (i < links.length); i++) {
									let aLinkData = links[i];
									let aLinkParts = aLinkData.split(';');

									if((aLinkParts.length == 2) && (aLinkParts[1] == "rel=\"next\""))
										nextPageURI = aLinkParts[0].substring(1, aLinkParts[0].length - 1);
								}
							}

							// when the response content from the HTTP request has been successfully read
							response.json()
								.then(function(parsedJson) {
									resolve({context: parsedJson["@context"], obsels: parsedJson.obsels, nextPageURI: nextPageURI});
								}.bind(this))
								.catch(error => {
									reject(error);
								});
						}
						else
							reject("Fetch request to uri \"" + pageURI + "\"has failed");
					}.bind(this))
					.catch(error => {
						reject(error);
					});
		});
	}

	/**
	 * Gets the data for the first page of the Obsel list and returns a Promise attached to the HTTP request
	 * @param int limit The maximum number of obsels to fetch for this page (default: 500)
	 * @param AbortSignal abortSignal an optional AbortSignal allowing to stop the HTTP request
	 * @return Promise
	 */
	get_first_obsel_page(limit = 500, abortSignal = null) {
		let firstPageURI = this._get_first_page_uri(limit);
		return this.get_obsel_page(firstPageURI, abortSignal);
	}

	/**
	 * Gets all the obsels of the obsel list
	 * @return Object[]
	 */
	get obsels() {
		let obsels = new Array();

		if(this._JSONData.obsels instanceof Array) {
			for(let i = 0; i < this._JSONData.obsels.length; i++)
				obsels.push(this._JSONData.obsels[i]);
		}
		
		return obsels;
	}
}
