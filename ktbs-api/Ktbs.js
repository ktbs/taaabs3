import {Resource} from "./Resource.js";
import {Base} from "./Base.js";
import {Method} from "./Method.js";

/**
 * Class for the Ktbs root resource type
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
	 * Gets the software version of the service hosting the Ktbs root
	 * @return string
	 */
	get version() {
		return this._JSONData.version;
	}

	/**
	 * Gets the "comment" of the Ktbs root
	 */
	get comment() {
		return this._JSONData["http://www.w3.org/2000/01/rdf-schema#comment"];
	}

	/**
	 * Return true if this resource is not modifiable.
	 * @return bool
	 */
	get readonly() {
		return true;
	}

	/**
	 * Returns a user-friendly label
	 * @return str
	 */
	get label() {
		return null;
	}

	/**
	 * Remove this resource from the KTBS. If the resource can not be removed, an exception must be raised.
	 */
	remove() {
		throw new Error("The Ktbs root can not be removed !");
	}

	/**
	 * Gets the URIs of the builtin methods supported by the kTBS service
	 * @return string[]
	 */
	_get_builtin_methods_uris() {
		let methods_uris = new Array();

		if(this._JSONData.hasBuiltinMethod instanceof Array) {
			for(let i = 0; i < this._JSONData.hasBuiltinMethod.length; i++) {
				let method_id = this._JSONData.hasBuiltinMethod[i];
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
	 * Gets the builtin methods supported by the kTBS service
	 * @return Method[]
	 */
	get builtin_methods() {
		let builtin_methods = new Array();
		let builtin_methods_uris = this._get_builtin_methods_uris();

		for(let i = 0; i < builtin_methods_uris.length; i++) {
			let builtin_method_URI = builtin_methods_uris[i];
			let builtin_method = new Method(builtin_method_URI);
			builtin_methods.push(builtin_method);
		}

		return builtin_methods;
	}

	/**
	 * Gets the URIs of the bases in the Ktbs root
	 * @return string[]
	 */
	_get_bases_uris() {
		let bases_uris = new Array();

		if(this._JSONData.hasBase instanceof Array) {
			for(let i = 0; i < this._JSONData.hasBase.length; i++) {
				let base_id = this._JSONData.hasBase[i];
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
	 * Gets the bases in the Ktbs root
	 */
	get bases() {
		let bases = new Array();
		let bases_uris = this._get_bases_uris();

		for(let i = 0; i < bases_uris.length; i++) {
			let baseURI = bases_uris[i];
			let base = new Base(baseURI);
			bases.push(base);
		}

		return bases;
	}
}
