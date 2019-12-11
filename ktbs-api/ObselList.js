import {Resource} from "./Resource.js";

/**
 * 
 */
export class ObselList extends Resource {
	
	/**
	 * 
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
	 * 
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

		let dataReadUri = this._uri;

		if(params.length > 0)
			dataReadUri += "?" + params.join("&");

		return dataReadUri;
	}

	/**
	 * 
	 */
	_get_first_page_uri(temporary_limit = 500) {
		let params = new Array();

		if(this._after && (this._after != ""))
			params.push("after=" + this._after);

		if(this._before && (this._before != ""))
			params.push("before=" + this._before);

		params.push("limit=" + temporary_limit);

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

		let dataReadUri = this._uri;

		if(params.length > 0)
			dataReadUri += "?" + params.join("&");

		return dataReadUri;
	}

	/**
	 * 
	 */
	_read_obsel_page(pageURI, abortSignal = null) {
		let page_read = new Promise((resolve, reject) => {
				let fetchParameters = { 
					method: "GET",
					headers: new Headers({
						"Accept": "application/json"
					}),
					mode: "cors",
					credentials: "include",
					cache: "default"
				};

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

		return page_read;
	}

	/**
	 * 
	 */
	_read_first_obsel_page(limit = 500, abortSignal = null) {
		let firstPageURI = this._get_first_page_uri(limit);
		return this._read_obsel_page(firstPageURI, abortSignal);
	}

	/**
	 * 
	 */
	get obsels() {
		let obsels = new Array();

		if(this._parsedJson.obsels instanceof Array) {
			for(let i = 0; i < this._parsedJson.obsels.length; i++)
				obsels.push(this._parsedJson.obsels[i]);
		}
		
		return obsels;
	}
}
