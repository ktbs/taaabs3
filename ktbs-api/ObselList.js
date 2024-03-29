import {Resource} from "./Resource.js";
import {ResourceMultiton} from "./ResourceMultiton.js";
import {Trace} from "./Trace.js";
import {Obsel} from "./Obsel.js";
import {RestError} from "./Errors.js";

/**
 * Class to help reading obsels list from a Trace
 */
export class ObselList {
	
	/**
	 * Constructor
	 * \param Trace parentTrace the parent Trace of the ObselList
	 * \throws throws a TypeError if provided argument is not an instance of Trace
	 * \public
	 */
	constructor(parentTrace) {
		if(parentTrace instanceof Trace) {

			/**
			 * A reference to the parent trace owning the current ObselList
			 * \var Trace
			 * \protected
			 */
			this._parentTrace = parentTrace;

			/**
			 * An object storing all previously resolved Query promises, indexed by their URL
			 * \var Object
			 * \protected
			 */
			this._queryPromises = {};
		}
		else
			throw new TypeError("Argument must be an instance of Trace");
	}

	/**
     * Gets the Trace the ObselList belongs to
	 * \return Trace
	 * \public
     */
    get parent() {
		return this._parentTrace;
    }

	/**
	 * Gets the URI of the obsel list
	 * \return URL
	 * \public
	 */
	get uri() {
		if(!this._uri)
			this._uri = new URL(this._parentTrace.uri + "@obsels");

		return this._uri;
	}

	/**
	 * Processes the HTTP response of a Query
	 * \param Object response a HTTP Response object returned from a fetch or read from a cache
	 * \return Promise
	 * \protected
	 */
	_processQueryResponse(response) {
		return new Promise((resolve, reject) => {
			// if the HTTP request responded successfully
			if(response.ok) {
				let nextPageLinkAfter = null;

				if(response.headers.has("link")) {
					let linkResponseHeader = response.headers.get("link");
					let links = linkResponseHeader.split(', ');

					for(let i = 0; (!this._nextPageURI) && (i < links.length); i++) {
						let aLinkData = links[i];
						let aLinkParts = aLinkData.split(';');

						if((aLinkParts.length == 2) && (aLinkParts[1] == "rel=\"next\"")) {
							const nextPageLink = new URL(aLinkParts[0].substring(1, aLinkParts[0].length - 1));
							
							if(nextPageLink.searchParams.has("after"))
								nextPageLinkAfter = nextPageLink.searchParams.get("after");
						}
					}
				}

				response.json()
					.then((parsedJson) => {
						// the JSON content from the HTTP response has been successfully read
						let obsels = new Array();

						if(parsedJson.obsels instanceof Array) {
							for(let i = 0; i < parsedJson.obsels.length; i++) {
								let obsel_data = parsedJson.obsels[i];
								let obsel_uri = this.parent.resolve_link_uri(obsel_data["@id"]);
								let obsel_is_known = ResourceMultiton.has_resource(Obsel, obsel_uri);
								let obsel = ResourceMultiton.get_resource(Obsel, obsel_uri);

								if(!obsel_is_known) {
									obsel.JSONData = obsel_data;
									obsel.context = parsedJson["@context"];
									obsel.parent = this.parent;
									obsel.syncStatus = "in_sync";
								}

								obsels.push(obsel);
							}
						}

                        resolve({obsels: obsels, nextPageLinkAfter: nextPageLinkAfter});
					})
					.catch(reject);
			}
			else {
				let responseBody = null;

				response.text()
					.then((responseText) => {
						responseBody = responseText;
					})
					.finally(() => {
						const error = new RestError(response.status, response.statusText, responseBody);
						reject(error);
					});
			}
		});
	}

	/**
	 * Gets 
	 * \param Object query_parameters
	 * \return Promise
	 * \public
	 */
	query(query_parameters = {}, abortSignal = null) {
		const queryURL = new URL(this.uri);
		const queryURLSearchParams = queryURL.searchParams;

		if(query_parameters.after)
			queryURLSearchParams.append("after", query_parameters.after);

		if(query_parameters.before)
			queryURLSearchParams.append("before", query_parameters.before);

		if(query_parameters.limit)
			queryURLSearchParams.append("limit", query_parameters.limit);

		if(query_parameters.minb)
			queryURLSearchParams.append("minb", query_parameters.minb);

		if(query_parameters.mine)
			queryURLSearchParams.append("mine", query_parameters.mine);

		if(query_parameters.maxb)
			queryURLSearchParams.append("maxb", query_parameters.maxb);

		if(query_parameters.maxe)
			queryURLSearchParams.append("maxe", query_parameters.maxe);

		if(query_parameters.offset)
			queryURLSearchParams.append("offset", query_parameters.offset);

		if(query_parameters.reverse)
			queryURLSearchParams.append("reverse", query_parameters.reverse);

		if(this._queryPromises[queryURL.toString()])
			return this._queryPromises[queryURL.toString()];
		else {
			const queryPromise = new Promise((resolve, reject) => {
				Resource.sharedCacheOpened
					.then((sharedCache) => {
						const getRequestHeaders = new Headers({
							"Accept": "application/json",
							"X-Requested-With": "XMLHttpRequest"
						});

						if(this._parentTrace.credentials && this._parentTrace.credentials.id && this._parentTrace.credentials.password)
							getRequestHeaders.append("Authorization", "Basic " + btoa(this._parentTrace.credentials.id + ":" + this._parentTrace.credentials.password));

						const queryRequestParameters = {
							method: "GET",
							headers: getRequestHeaders,
							cache: "no-store"
						};

						if(abortSignal)
							queryRequestParameters.signal = abortSignal;

						const queryRequest = new Request(queryURL, queryRequestParameters);
						
						sharedCache.match(queryRequest)
							.then((cacheMatchResponse) => {
								if(cacheMatchResponse != undefined) {
									this._processQueryResponse(cacheMatchResponse)
										.then(resolve)
										.catch(reject);
								}
								else {
									fetch(queryRequest)
										.then((fetchResponse) => {
											const responseClone = fetchResponse.clone();

											this._processQueryResponse(fetchResponse)
												.then((processResponse) => {
													sharedCache.put(queryRequest, responseClone)
														.then((cachePutResponse) => {
															resolve(processResponse);
														})
														.catch(reject);
												})
												.catch(reject);
										})
										.catch((error) => {
											if((error instanceof DOMException) && (error.name == "AbortError") && abortSignal && abortSignal.aborted)
												delete this._queryPromises[queryURL.toString()];
											
											reject(error);
										});
								}
							})
							.catch(reject);
					})
					.catch(reject);
			});

			this._queryPromises[queryURL.toString()] = queryPromise;
			return queryPromise;
		}
	}

	/**
	 * Resets the calculated data temporarily stored in memory as instance variables. Descendant classes that add such variables should override this method, reset their own-level variables and then call super._resetCalculatedData()
	 * \public
	 */
	_resetCalculatedData() {
		this._queryPromises = {};
	}

	/**
	 * 
	 */
	_removeFromSharedCache() {
		return new Promise((resolve, reject) => {
			Resource.sharedCacheOpened
				.then((sharedCache) => {
					const matchRequestHeaders = new Headers({
						"Accept": "application/json",
						"X-Requested-With": "XMLHttpRequest"
					});

					if(this._parentTrace.credentials && this._parentTrace.credentials.id && this._parentTrace.credentials.password)
						matchRequestHeaders.append("Authorization", "Basic " + btoa(this._parentTrace.credentials.id + ":" + this._parentTrace.credentials.password));

					const matchRequestParameters = {
						method: "GET",
						headers: matchRequestHeaders,
						cache: "no-store"
					};

					const matchRequest = new Request(this.uri, matchRequestParameters);

					sharedCache.match(matchRequest, {ignoreSearch: true})
						.then((match) => {
							if(match != undefined)
								sharedCache.delete(matchRequest, {ignoreSearch: true})
									.then(resolve)
									.catch(reject);
							else
								resolve();
						})
						.catch(reject);
				})
				.catch(reject);
		});
	}

	/**
	 * POSTs a SPARQL query to the obsel list, and returns a Promise that resolves with a JSON object containing data returned by the query
	 * \param string sparqlQuery 
	 * \param AbortSignal abortSignal 
	 * \param Object credentials 
	 * \return Promise
	 * \Public
	 */
	SPARQLQuery(sparqlQuery, abortSignal = null, credentials = null) {
		const sparqlQueryPromise = new Promise((resolve, reject) => {
			let fetchParameters = {
				method: "POST",
				headers: new Headers({
					"content-type": "application/sparql-query",
					"Accept": "application/sparql-results+json",
					"X-Requested-With": "XMLHttpRequest"
				}),
				body: sparqlQuery
			};

			if(this._etag)
				fetchParameters.headers.append("If-Match", this._etag);

			if(!credentials && this.credentials)
				credentials = this.credentials;

			if(credentials && credentials.id && credentials.password)
				fetchParameters.headers.append("Authorization", "Basic " + btoa(credentials.id + ":" + credentials.password));

			if(abortSignal)
				fetchParameters.signal = abortSignal;
			
			fetch(this.uri, fetchParameters)
				.then((response) => {
					if(response.ok) {
						response.json()
							.then(resolve)
							.catch(reject);
					}
					else {
						let responseBody = null;

						response.text()
							.then((responseText) => {
								responseBody = responseText;
							})
							.finally(() => {
								const error = new RestError(response.status, response.statusText, responseBody);
								reject(error);
							});
					}
				})
				.catch(reject);
		});

		return sparqlQueryPromise;
	}

	/**
	 * Performs a SPARQL Query in order to list all distinct values in the obsels for a given attribute type, and returns a Promise that resolves with an Array containing the distinct values
	 * \param AttributeType attributeType the attribute type we want to list distinct values
	 * \return Promise
	 * \Public
	 */
	list_attribute_type_distinct_values(attributeType, abortSignal = null, credentials = null) {
		return 	this.list_attribute_type_distinct_values_by_attribute_id(attributeType.id, abortSignal, credentials);
	}

	/**
	 * Performs a SPARQL Query in order to list all distinct values in the obsels for a given attribute id, and returns a Promise that resolves with an Array containing the distinct values
	 * \param string attribute_id the attribute id we want to list distinct values
	 * \return Promise
	 * \Public
	 */
	list_attribute_type_distinct_values_by_attribute_id(attribute_id, abortSignal = null, credentials = null) {
		const sparqlQuery = "PREFIX m: <" + this.parent.model.uri + "#>\n\nSELECT DISTINCT ?val {?obs m:" + attribute_id + " ?val}";
		
		const listPromise = new Promise((resolve, reject) => {
			this.SPARQLQuery(sparqlQuery, abortSignal, credentials)
				.then((JSONData) => {
					const distinctValuesArray = new Array();

					if(JSONData.results.bindings && (JSONData.results.bindings instanceof Array)) {
						for(let i = 0; i < JSONData.results.bindings.length; i++)
							if(JSONData.results.bindings[i].val && JSONData.results.bindings[i].val.value)
								distinctValuesArray.push(JSONData.results.bindings[i].val.value);
					}

					resolve(distinctValuesArray);
				})
				.catch(reject);
		});

		return listPromise;
	}

	/**
	 * 
	 */
	force_state_refresh() {
		return new Promise((resolve, reject) => {
			this._removeFromSharedCache()
				.then((response) => {
					this._resetCalculatedData();
					resolve(response);
				})
				.catch(reject);
		});
	}
}
