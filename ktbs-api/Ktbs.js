import {Resource} from "./Resource.js";
import {Base} from "./Base.js";

/**
 * 
 */
export class Ktbs extends Resource {

	/**
	 * Constructor.
	 * Since the Ktbs root is read-only through the REST service, it can not be created, updated or removed with the current API.
	 * @param uri the uri of the KtbsRoot : REQUIRED !
	 */
	constructor(uri) {
		if(uri)
			super(uri);
		else
			throw new Error("Missing required parameter \"uri\", or empty value");
	}

	/**
	 * 
	 */
	get_version() {
		return this._parsedJson.version;
	}

	/**
	 * 
	 */
	get_comment() {
		return this._parsedJson["http://www.w3.org/2000/01/rdf-schema#comment"];
	}

	/**
	 * Return true if this resource is not modifiable.
	 * @return bool
	 */
	get_readonly() {
		return true;
	}

	/**
	 * 
	 */
	get_relative_id() {
		return this.get_id();
	}

	/**
	 * Returns a user-friendly label
	 * @return str
	 */
	get_label() {
		return null;
	}

	/**
	 * Remove this resource from the KTBS. If the resource can not be removed, an exception must be raised.
	 */
	remove() {
		throw new Error("The Ktbs root can not be removed !");
	}

	/**
	 * List the uris of the builtin methods supported by the kTBS.
	 * @return string[]
	 */
	list_builtin_methods_uris() {
		let methods_uris = new Array();

		if(this._parsedJson.hasBuiltinMethod instanceof Array) {
			for(let i = 0; i < this._parsedJson.hasBuiltinMethod.length; i++) {
				let method_id = this._parsedJson.hasBuiltinMethod[i];
				let method_uri;

				if(method_id.substr(0, 4) == "http")
					method_uri = method_id;
				else
					method_uri = this._uri + method_id;

				methods_uris.push(method_uri);
			}
		}
		
		return methods_uris;
	}

	/**
	 * List the builtin methods supported by the kTBS.
	 * @return Method[]
	 */
	/*list_builtin_methods() {

	}*/

	/**
	 * Return the builtin method identified by the given URI if supported, or null.
	 * @param string methodUri
	 * @return Method
	 */
	/*get_builtin_method(methodUri) {

	}*/

	/**
	 * 
	 */
	list_bases_uris() {
		let bases_uris = new Array();

		if(this._parsedJson.hasBase instanceof Array) {
			for(let i = 0; i < this._parsedJson.hasBase.length; i++) {
				let base_id = this._parsedJson.hasBase[i];
				let base_uri;

				if(base_id.substr(0, 4) == "http")
					base_uri = base_id;
				else
					base_uri = this._uri + base_id;

				bases_uris.push(base_uri);
			}
		}

		return bases_uris;
	}

	/**
	 * Returns all the bases in the Ktbs root
	 * @return Base[]
	 */
	list_bases() {
		let bases = new Array();
		let bases_uris = this.list_bases_uris();

		for(let i = 0; i < bases_uris.length; i++) {
			let baseURI = bases_uris[i];
			let base = new Base(baseURI);
			bases.push(base);
		}

		return bases;
	}

	/**
	 * Return the base identified by the given URI, or null.
	 * @param string baseUri
	 * @return Base
	 */
	get_base(baseUri) {
		if(this._parsedJson.hasBase.includes(baseUri))
			return new Base(baseUri);
		else
			throw new Error("There is no base with uri " + baseUri + "in the Ktbs root " + this._uri);
	}


	/**
	 * Creates a base inside the current Ktbs and returns it
	 * @param baseID
	 * @param baseLabel
	 * @return Base
	 */
	/*create_base(baseID, baseLabel = null) {

	}*/
}
