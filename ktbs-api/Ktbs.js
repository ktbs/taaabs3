import {ResourceMultiton} from "./ResourceMultiton.js";
import {Resource} from "./Resource.js";
import {Base} from "./Base.js";
import {Method} from "./Method.js";
import {KtbsError} from "./Errors.js";

/**
 * Class for the Ktbs root resource type
 */
export class Ktbs extends Resource {

	/**
	 * Constructor.
	 * Since the Ktbs root is read-only through the REST service, it can not be created, updated or removed with the current API.
	 * @param URL or string uri the uri of the KtbsRoot : REQUIRED !
	 * @throws KtbsError throws a KtbsError when no uri is provided as an argument
	 */
	constructor(uri) {
		if(uri) {
			super(uri);
			this._JSONData["@type"] = "Ktbs";
		}
		else
			throw new KtbsError("Missing required parameter \"uri\", or empty value");
	}

	/**
	 * Gets the parent resource of this resource (always null for Ktbs Root instances)
	 * @return null for Ktbs Root instances
	 */
	get parent() {
		return null;
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
	 * Gets the builtin methods supported by the kTBS service
	 * @return Method[]
	 */
	get builtin_methods() {
		if(!this._builtin_methods) {
			this._builtin_methods = new Array();

			if(this._JSONData.hasBuiltinMethod instanceof Array) {
				for(let i = 0; i < this._JSONData.hasBuiltinMethod.length; i++) {
					const builtin_method_id = this._JSONData.hasBuiltinMethod[i];
					const aBuiltinMethod = this.get_builtin_method_by_id(builtin_method_id);
					this._builtin_methods.push(aBuiltinMethod);
				}
			}
		}

		return this._builtin_methods;
	}

	/**
	 * 
	 */
	supports_builtin_method(builtin_method_id) {
		return (
				this._JSONData.hasBuiltinMethod
			&&	(this._JSONData.hasBuiltinMethod instanceof Array)
			&&	this._JSONData.hasBuiltinMethod.includes(builtin_method_id)
		);
	}

	/**
	 * 
	 */
	get_builtin_method_by_id(builtin_method_id) {
		if(this.supports_builtin_method(builtin_method_id))
			return Method.getBuiltinMethod(builtin_method_id);
		else
			throw new KtbsError("This Ktbs service does not support builtin method \"" + builtin_method_id + "\"");
	}

	/**
	 * Gets the URIs of the bases in the Ktbs root
	 * @return URL[]
	 */
	_get_bases_uris() {
		if(!this._bases_uris) {
			this._bases_uris = new Array();

			if(this._JSONData.hasBase instanceof Array) {
				for(let i = 0; i < this._JSONData.hasBase.length; i++) {
					let base_uri_string = this._JSONData.hasBase[i];
					let base_uri = this.resolve_link_uri(base_uri_string);
					this._bases_uris.push(base_uri);
				}
			}
		}

		return this._bases_uris;
	}

	/**
	 * Gets the bases in the Ktbs root
	 * @return Base[]
	 */
	get bases() {
		if(!this._bases) {
			this._bases = new Array();
			let bases_uris = this._get_bases_uris();

			for(let i = 0; i < bases_uris.length; i++) {
				let base_uri = bases_uris[i];
				let base = ResourceMultiton.get_resource(Base, base_uri);
				this._bases.push(base);
			}
		}

		return this._bases;
	}

	/**
	 * Gets the data needed to post the new resource to it's parent
	 * @returns Object
	 */
	_getPostData() {
		return null;
	}

	/**
	 * Deletes the current resource
	 * @throws KtbsError always throws a KtbsError when invoked for a Ktbs as Ktbs roots can not be deleted
	 */
	delete(abortSignal = null, credentials = null) {
		throw new KtbsError("Ktbs roots can not be deleted");
	}
}
