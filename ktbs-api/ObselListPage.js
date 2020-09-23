import {ResourceMultiton} from "./ResourceMultiton.js";
import {Resource} from "./Resource.js";
import {Obsel} from "./Obsel.js";
import {Trace} from "./Trace.js";

/**
 * Class to help reading obsels list from a Trace in a paginated fasion
 */
export class ObselListPage extends Resource {

    /**
	 * Constructor
	 * \param URL or string uri the resource's URI
     * \public
	 */
	constructor(uri = null) {
        super(uri);

        /**
		 * A Promise for the "GET" request allowing to read the resource's data
		 * \var Promise
         * \protected
		 */
		this._obselListPageGetPromise = null;
    }

    /**
     * Attemps to asynchronously read an ObselListPage's data from the REST service and returns a Promise.
	 * \param AbortSignal abortSignal - an optional AbortSignal allowing to stop the HTTP request
	 * \param Object credentials - an optional credentials object. If none is specified, the "credentials" property value of the resource will be used.
	 * \return Promise
     * \public
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
     * \return URL
     * \public
     */
    get next_page_uri() {
        return this._nextPageURI;
    }

    /**
     * Gets the obsel list page that comes next after the current one
     * \return ObselListPage
     * \public
     */
    get next_page() {
        if(!this._next_page && this.next_page_uri)
            this._next_page = ResourceMultiton.get_resource(ObselListPage, this.next_page_uri);
        
        return this._next_page;
    }

    /**
     * Gets the Trace the ObselListPage belongs to
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
     * Gets the obsels of the current page
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
	 * \throws KtbsError always throws a KtbsError when invoked for a ObselListPage as it is not a container resource
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

        if(this._next_page)
            this._next_page = undefined;

        if(this._parent)
            this._parent = undefined;

        if(this._obsels)
            delete this._obsels;
    }
}