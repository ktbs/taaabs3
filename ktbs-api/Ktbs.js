import {ResourceProxy} from "./ResourceProxy.js";
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
	 * @param URL or string uri the uri of the KtbsRoot : REQUIRED !
	 */
	constructor(uri) {
		if(uri)
			super(uri);
		else
			throw new Error("Missing required parameter \"uri\", or empty value");
	}

	/**
	 * Always returns true for Ktbs instances since they are never modifiable.
	 * @return bool
	 */
	get readonly() {
		return true;
	}

	/**
	 * Gets the parent resource of this resource (always null for Ktbs Root instances)
	 * @return null for Ktbs Root instances
	 */
	get parent() {
		return null;
	}

	/**
	 * Sets the parent resource of this resource. Always throws an Error for Ktbs Root instances.
	 * @param Resource parent the new parent for the resource (must be an instance of either "Ktbs" or "Base").
	 * @throws Error Always throws an Error for Ktbs Root instances.
	 */
	set parent(parent) {
		throw new Error("Resource's parent can not be set for Ktbs Root instances");
	}

	/**
	 * Gets the software version of the service hosting the Ktbs root
	 * @return string
	 */
	get version() {
		return this._JSONData.version;
	}

	/**
	 * Returns a user-friendly label
	 * @return string
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
	 * @return URL[]
	 */
	_get_builtin_methods_uris() {
		let methods_uris = new Array();

		if(this._JSONData.hasBuiltinMethod instanceof Array) {
			for(let i = 0; i < this._JSONData.hasBuiltinMethod.length; i++) {
				let method_uri_string = this._JSONData.hasBuiltinMethod[i];
				let method_uri = new URL(method_uri_string, this.uri);
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
			let builtin_method_uri = builtin_methods_uris[i];
			let builtin_method = ResourceProxy.get_resource(Method, builtin_method_uri);
			builtin_methods.push(builtin_method);
		}

		return builtin_methods;
	}

	/**
	 * Gets the URIs of the bases in the Ktbs root
	 * @return URL[]
	 */
	_get_bases_uris() {
		let bases_uris = new Array();

		if(this._JSONData.hasBase instanceof Array) {
			for(let i = 0; i < this._JSONData.hasBase.length; i++) {
				let base_uri_string = this._JSONData.hasBase[i];
				let base_uri = new URL(base_uri_string, this.uri);
				bases_uris.push(base_uri);
			}
		}

		return bases_uris;
	}

	/**
	 * Gets the bases in the Ktbs root
	 * @return Base[]
	 */
	get bases() {
		let bases = new Array();
		let bases_uris = this._get_bases_uris();

		for(let i = 0; i < bases_uris.length; i++) {
			let base_uri = bases_uris[i];
			let base = ResourceProxy.get_resource(Base, base_uri);
			bases.push(base);
		}

		return bases;
	}
}
