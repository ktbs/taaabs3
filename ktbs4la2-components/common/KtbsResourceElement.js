import {TemplatedHTMLElement} from "./TemplatedHTMLElement.js";

import {Ktbs} from "../../ktbs-api/Ktbs.js";
import {Base} from "../../ktbs-api/Base.js";
import {Method} from "../../ktbs-api/Method.js";
import {Model} from "../../ktbs-api/Model.js";
import {StoredTrace} from "../../ktbs-api/StoredTrace.js";
import {ComputedTrace} from "../../ktbs-api/ComputedTrace.js";

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

		// pre-create a promise that will be resolved when the ktbs resource has been succesfully loaded
		this._resolveKtbsResourceLoaded;
		this._rejectKtbsResourceLoaded;

		this._ktbsResourceLoaded = new Promise(function(resolve, reject) {
			this._resolveKtbsResourceLoaded = resolve;
			this._rejectKtbsResourceLoaded = reject;
		}.bind(this));

		this._ktbsResourceLoaded
			.then(() => {
				if(this.onktbsResourceLoaded)
					this.onktbsResourceLoaded();
			})
			.catch((error) => {
				if(this.onktbsResourceLoadFailed)
					this.onktbsResourceLoadFailed(error);
			});
		// --- done


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
				.then(this._onResourceAttributesSet.bind(this))
				.catch(this._onMissingResourceAttributes.bind(this));
		// ---
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
		let uri = this.getAttribute("uri");
		
		try {
			this._ktbsResource = new (this._getKtbsResourceClass())(uri);
		
			this._ktbsResource.get(this._abortController.signal)
				.then(function() {
					this._resolveKtbsResourceLoaded();
				}.bind(this))
				.catch(function(error) {
					this._rejectKtbsResourceLoaded(error);
				}.bind(this));
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
				let JSClass = eval(resourceType);

				if(JSClass && (typeof JSClass === 'function') && (/^\s*class\s+/.test(JSClass.toString())))
					return JSClass;
				else
					throw new Error("Unknown class \"" + resourceType + "\"");
			}
			else
				throw new Error("Invalid value for attribute \"resource-type\"");
		}
		else
			throw new Error("Missing required attribute \"resource-type\"");
	}

	/**
	 * 
	 */
	requestEditResource() {
		this.dispatchEvent(new CustomEvent("request-edit-ktbs-resource", {bubbles: true}));
	}

	/**
	 * 
	 */
	requestDeleteResource() {
		this.dispatchEvent(new CustomEvent("request-delete-ktbs-resource", {bubbles: true}));
	}
}

/**
 * 
 */
KtbsResourceElement.resourceInstances = new Array();

export {KtbsResourceElement};
