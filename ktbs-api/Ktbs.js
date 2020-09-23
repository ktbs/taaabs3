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
	 * \param URL or string uri - the uri of the KtbsRoot : REQUIRED !
	 * \throws KtbsError throws a KtbsError when no uri is provided as an argument
	 * \public
	 */
	constructor(uri) {
		if(uri) {
			super(uri);
			this._JSONData["@type"] = "KtbsRoot";
		}
		else
			throw new KtbsError("Missing required parameter \"uri\", or empty value");
	}

	/**
	 * Gets the parent resource of this resource (always null for Ktbs Root instances)
	 * \return null for Ktbs Root instances
	 * \public
	 */
	get parent() {
		return null;
	}

	/**
	 * Gets the software version of the service hosting the Ktbs root
	 * \return string
	 * \public
	 */
	get version() {
		return this._JSONData.version;
	}

	/**
	 * Returns a user-friendly label
	 * \return string
	 * \public
	 */
	get label() {
		return this._label;
	}

	set label(new_label) {
		this._label = new_label;
	}

	/**
	 * 
	 * \return string
	 * \public
	 */
	get type() {
		return "Ktbs";
	}

	/**
	 * Gets the builtin methods supported by the kTBS service
	 * \return Array of Method
	 * \public
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
	 * Checks if the Ktbs service supports a builtin method whose ID is provided as an argument
	 * \param string builtin_method_id - the ID of the builtin method we want to check if it is supported
	 * \return boolean
	 * \public
	 */
	supports_builtin_method(builtin_method_id) {
		return (
				this._JSONData.hasBuiltinMethod
			&&	(this._JSONData.hasBuiltinMethod instanceof Array)
			&&	this._JSONData.hasBuiltinMethod.includes(builtin_method_id)
		);
	}

	/**
	 * Gets a builtin method from it's ID
	 * \param string builtin_method_id - the ID of the builtin method we want.
	 * \return Method
	 * \throws KtbsError throws a KtbsError if the requested method is not supported by the service
	 * \public
	 */
	get_builtin_method_by_id(builtin_method_id) {
		if(this.supports_builtin_method(builtin_method_id))
			return Method.getBuiltinMethod(builtin_method_id);
		else
			throw new KtbsError("This Ktbs service does not support builtin method \"" + builtin_method_id + "\"");
	}

	/**
	 * Gets the bases in the Ktbs root
	 * \return Array of Base
	 * \public
	 */
	get bases() {
		if(!this._bases) {
			this._bases = new Array();

			if(this._JSONData.hasBase) {
				for(let i = 0; i < this._JSONData.hasBase.length; i++) {
					const base_data = this._JSONData.hasBase[i];
					let base;

					if(base_data instanceof Object) {
						const base_uri = this.resolve_link_uri(base_data["@id"]);
						const base_label = base_data["label"];
						base = ResourceMultiton.get_resource(Base, base_uri);

						if(base_label && !base.label)
							base.label = base_label;
					}
					else {
						const base_uri = this.resolve_link_uri(base_data);
						base = ResourceMultiton.get_resource(Base, base_uri);
					}

					base.registerObserver(this._onChildResourceDeleted.bind(this), "lifecycle-status-change", "deleted");
					this._bases.push(base);
				}
			}
		}

		return this._bases;
	}

	/**
	 * Gets the data needed to post the new resource to it's parent
	 * \return Object
	 * \protected
	 */
	_getPostData() {
		return null;
	}

	/**
	 * Deletes the current resource
	 * \throws KtbsError always throws a KtbsError when invoked for a Ktbs as Ktbs roots can not be deleted
	 */
	delete(abortSignal = null, credentials = null) {
		throw new KtbsError("Ktbs roots can not be deleted");
	}

	/**
	 * Gets the uri to query in order to read resource's data (For some resource types, this might be different from the resource URI, for instance if we need to add some query parameters. In such case, descending resource types must override this method)
	 * \return URL
	 * \protected
	 */
	get _data_read_uri() {
		if(!this._dataReadUri) {
			this._dataReadUri = new URL(this.uri);
			this._dataReadUri.searchParams.append("prop", "label");
		}

		return this._dataReadUri;
	}

	/**
	 * 
	 * \param Base new_child 
	 */
	_registerNewChild(new_child) {
		let newChildrenJSONDataChunk = {"@id": new_child.id};

		if(new_child.label)
			newChildrenJSONDataChunk.label = new_child.label;
		
		if(this._JSONData.hasBase == undefined)
			this._JSONData.hasBase = new Array();

		this._JSONData.hasBase.push(newChildrenJSONDataChunk);

		if(this._bases)
			delete this._bases;
	}

	/**
	 * 
	 */
	_onChildResourceDeleted(deleted_child) {
		deleted_child.unregisterObserver(this._onChildResourceDeleted.bind(this), "lifecycle-status-change", "deleted");

		if(this._JSONData.hasBase instanceof Array) {
			for(let i = (this._JSONData.hasBase.length - 1); i >= 0; i--) {
				if(this._JSONData.hasBase[i]) {
					const aBaseDataChunk = this._JSONData.hasBase[i];
					let aBaseLink;

					if(aBaseDataChunk instanceof Object)
						aBaseLink = aBaseDataChunk["@id"];
					else
						aBaseLink = aBaseDataChunk;

					if(this.resolve_link_uri(aBaseLink).toString() == deleted_child.uri.toString())
						this._JSONData.hasBase.splice(i, 1);
				}
			}
		}

		if(this._bases)
			delete this._bases;
	}

	/**
	 * 
	 * \param Resource modified_child 
	 */
	_onChildResourceModified(modified_child) {
		if(this._JSONData.hasBase instanceof Array) {
			for(let i = (this._JSONData.hasBase.length - 1); i >= 0; i--) {
				if(this._JSONData.hasBase[i]) {
					const aBaseDataChunk = this._JSONData.hasBase[i];
					let aBaseLink;

					if(aBaseDataChunk instanceof Object)
						aBaseLink = aBaseDataChunk["@id"];
					else
						aBaseLink = aBaseDataChunk;

					if(this.resolve_link_uri(aBaseLink).toString() == modified_child.uri.toString()) {
						let newDataChunk;

						if(modified_child.label)
							newDataChunk = {"@id": modified_child.id, "label": modified_child.label}
						else
							newDataChunk = modified_child.id;

						this._JSONData.hasBase[i] = newDataChunk;
					}
				}
			}
		}

		if(this._bases)
			delete this._bases;
	}

	/**
	 * Get all the children of the current resource
	 * \return Array of Resource
	 * \public
	 */
	get children() {
		return this.bases;
	}

	/**
	 * Resets all the resource cached data
	 * \public
	 */
	_resetCachedData() {
		if(this._builtin_methods)
			delete this._builtin_methods;

		if(this._bases)
			delete this._bases;
	}
}
