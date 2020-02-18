import {ResourceProxy} from "./ResourceProxy.js";
import {Resource} from "./Resource.js";

/**
 * Class to help reading obsels list from a Trace in a paginated fasion
 */
export class ObselListPage extends Resource {

    /**
	 * Constructor
	 * @param URL or string uri the resource's URI
	 */
	constructor(uri = null) {
        super(uri);

        /**
		 * A Promise for the "GET" request allowing to read the resource's data
		 * @type Promise
		 */
		this._obselListPageGetPromise = null;
    }

    /**
     * Attemps to asynchronously read an ObselListPage's data from the REST service and returns a Promise.
	 * @param AbortSignal abortSignal an optional AbortSignal allowing to stop the HTTP request
	 * @param Object credentials an optional credentials object. If none is specified, the "credentials" property value of the resource will be used.
	 * @return Promise
     */
    get(abortSignal = null, credentials = null) {
        if(this._obselListPageGetPromise == null) {
            this._obselListPageGetPromise = new Promise((resolve, reject) => {
                super.get(abortSignal, credentials)
                    .then((response) => {
                        if(response.headers.has("link")) {
                            let linkResponseHeader = response.headers.get("link");
                            let links = linkResponseHeader.split(', ');

                            for(let i = 0; (!this._nextPageURI) && (i < links.length); i++) {
                                let aLinkData = links[i];
                                let aLinkParts = aLinkData.split(';');

                                if((aLinkParts.length == 2) && (aLinkParts[1] == "rel=\"next\""))
                                    this._nextPageURI = new URL(aLinkParts[0].substring(1, aLinkParts[0].length - 1));

                                resolve(response);
                            }
                        }
                    })
                    .catch((error) => {
                        this._obselListPageGetPromise = null;
                        reject(error);
                    });
            });
        }

        return this._obselListPageGetPromise;
    }

    /**
     * Gets the uri of the obsel list page that comes next after the current one
     * @return URL
     */
    get next_page_uri() {
        return this._nextPageURI;
    }

    /**
     * Gets the obsel list page that comes next after the current one
     * @return ObselListPage
     */
    get next_page() {
        if(this.next_page_uri)
            return ResourceProxy.get_resource(ObselListPage, this.next_page_uri);
        else
            return undefined;
    }

    /**
     * Gets the obsels of the current page
     * @return Array
     */
    get obsels() {
        return this._JSONData.obsels;
    }
}