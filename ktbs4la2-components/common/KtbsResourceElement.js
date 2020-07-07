import {TemplatedHTMLElement} from "./TemplatedHTMLElement.js";
import {ResourceMultiton} from "../../ktbs-api/ResourceMultiton.js";

// @TODO : check if the following imports are really necessary
import {Ktbs} from "../../ktbs-api/Ktbs.js";
import {Base} from "../../ktbs-api/Base.js";
import {Model} from "../../ktbs-api/Model.js";
import {Method} from "../../ktbs-api/Method.js";
import {StoredTrace} from "../../ktbs-api/Trace.js";
import {ComputedTrace} from "../../ktbs-api/Trace.js";

/**
 * 
 */
class KtbsResourceElement extends TemplatedHTMLElement {
	
	/**
	 * 
	 */
	constructor(componentJSPath, fetchStylesheet = true, fetchTranslation = true) {
		super(componentJSPath, fetchStylesheet, fetchTranslation);
		this._ktbsResource = null;
		this._initktbsResourceLoadedPromise();

		// 
			this._resolveUriSet;
			this._rejectUriSet;

			this._uriSet = new Promise((resolve, reject) => {
				this._resolveUriSet = resolve;
				this._rejectUriSet = reject;
			});


			this._resolveTypeSet;
			this._rejectTypeSet;

			this._typeSet = new Promise((resolve, reject) => {
				this._resolveTypeSet = resolve;
				this._rejectTypeSet = reject;
			});
		// ---

		//
			this._resourceAttributesSet = Promise.all([this._uriSet, this._typeSet]);

			this._resourceAttributesSet
				.then(() => {
					this._onResourceAttributesSet();
				})
				.catch((error) => {
					this._onMissingResourceAttributes(error);
				});
		// ---

		if(this.onKtbsResourceChange)
			this._bindedOnKtbsResourceChangeMethod = this.onKtbsResourceChange.bind(this);
	}

	/**
	 * Creates a promise that will be resolved when the ktbs resource has been succesfully loaded
	 */
	_initktbsResourceLoadedPromise() {
		this._ktbsResourceLoaded = new Promise((resolve, reject) => {
			this._resolveKtbsResourceLoaded = resolve;
			this._rejectKtbsResourceLoaded = reject;
		});

		this._ktbsResourceLoaded
			.then(() => {
				if(this.onktbsResourceLoaded)
					this.onktbsResourceLoaded();
			})
			.catch((error) => {
				if(this.onktbsResourceLoadFailed)
					this.onktbsResourceLoadFailed(error);
			});
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push('uri');
		observedAttributes.push('resource-type');
		observedAttributes.push('label');
		return observedAttributes;
	}

	/**
	 * 
	 */
	_onResourceAttributesSet() {
		let uri = new URL(this.getAttribute("uri"));
		let type = this._getKtbsResourceClass();
		
		try {
			this._ktbsResource = ResourceMultiton.get_resource(type, uri);

			if(this._bindedOnKtbsResourceChangeMethod)
				this._ktbsResource.addObserver(this._bindedOnKtbsResourceChangeMethod);
		
			if((this._ktbsResource.syncStatus == "in_sync") || !this._auto_get_resource)
				this._resolveKtbsResourceLoaded();
			else {
				this._ktbsResource.get(this._abortController.signal)
					.then(() => {
						this._resolveKtbsResourceLoaded();
					})
					.catch((error) => {
						this._rejectKtbsResourceLoaded(error);
					});
			}
		}
		catch(error) {
			this.emitErrorEvent(error);
		}
	}

	/**
	 * 
	 */
	_onMissingResourceAttributes(error) {
		this.emitErrorEvent(error);
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "uri")
			this._resolveUriSet();
		else if(attributeName == "resource-type")
			this._resolveTypeSet();
	}

	/**
	 * 
	 */
	connectedCallback() {
		super.connectedCallback();

		if(!this.getAttribute("uri"))
			this._rejectUriSet(new Error("Missing required attribute \"uri\"."));
	}

	/**
	 * 
	 */
	disconnectedCallback() {
		super.disconnectedCallback();

		if(this._bindedOnKtbsResourceChangeMethod)
			this._ktbsResource.removeObserver(this._bindedOnKtbsResourceChangeMethod);
	}

	/**
	 * 
	 */
	onktbsResourceLoadFailed(error) {
		if((error.name != "AbortError") || !this._abortController.signal.aborted)
			this.emitErrorEvent(error);
	}

	/**
	 * 
	 */
	_getKtbsResourceClass() {
		let resourceType = this.getAttribute("resource-type");

		if(resourceType) {
			if(resourceType.match(/^[a-zA-Z0-9_]+$/)) {
				try {
					let JSClass = eval(resourceType);

					if(JSClass && (typeof JSClass === 'function') && (/^\s*class\s+/.test(JSClass.toString())))
						return JSClass;
					else
						throw new Error("\"" + resourceType + "\" is not a class name.");
				}
				catch(error) {
					throw new Error("Unknown class \"" + resourceType + "\"");
				}
			}
			else
				throw new Error("Invalid class name \"" + resourceType + "\"");
		}
		else
			throw new Error("Missing required attribute \"resource-type\"");
	}

	/**
	 * 
	 */
	/*requestEditResource() {
		this.dispatchEvent(new CustomEvent("request-edit-ktbs-resource", {bubbles: true}));
	}*/

	/**
	 * 
	 */
	requestDeleteResource() {
		this.dispatchEvent(new CustomEvent("request-delete-ktbs-resource", {bubbles: true}));
	}

	/**
	 * 
	 */
	get _auto_get_resource() {
		return true;
	}
}

/**
 * 
 */
KtbsResourceElement.resourceInstances = new Array();

export {KtbsResourceElement};
