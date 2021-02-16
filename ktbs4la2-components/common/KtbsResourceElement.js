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
		this._ktbsResource = ResourceMultiton.get_resource(type, uri);
		this._bindedOnKtbsResourceNotificationMethod = this._onKtbsResourceNotification.bind(this);
		this._ktbsResource.registerObserver(this._bindedOnKtbsResourceNotificationMethod);
		this._onKtbsResourceNotification(this._ktbsResource, "sync-status-change");
	}

	/**
	 * 
	 * @param {*} notification_data 
	 */
	_onKtbsResourceNotification(sender, type, old_value) {
		if(sender == this._ktbsResource) {
			if((this._ktbsResource instanceof Method) && (this._ktbsResource.is_builtin))
				this._onKtbsResourceSyncInSync();
			else if(type == "sync-status-change") {
				switch(sender.syncStatus) {
					case "needs_sync":
						setTimeout(() => {
							if(this._onKtbsResourceSyncPending)
								this._onKtbsResourceSyncPending(old_value);
						});

						if(!(this._ktbsResource instanceof Method) || !(this._ktbsResource.is_builtin))
							this._ktbsResource.get(this._abortController.signal).catch(() => {});
						break;
					case "pending":
						setTimeout(() => {
							if(this._onKtbsResourceSyncPending)
								this._onKtbsResourceSyncPending(old_value);
						});

						break;
					case "needs_auth":
						setTimeout(() => {
							if(this._onKtbsResourceSyncNeedsAuth)
								this._onKtbsResourceSyncNeedsAuth(old_value);
						});

						break;
					case "access_denied":
						setTimeout(() => {
							if(this._onKtbsResourceSyncAccessDenied)
								this._onKtbsResourceSyncAccessDenied(old_value);
						});

						break;
					case "in_sync" :
						setTimeout(() => {
							if((this._ktbsResource.lifecycleStatus != "deleted") && (this._onKtbsResourceSyncInSync))
								this._onKtbsResourceSyncInSync(old_value);
						});

						break;
					case "error":
						setTimeout(() => {
							this._onKtbsResourceSyncError(old_value, sender.error);
						});

						break;
				}
			}
			else if(type == "lifecycle-status-change") {
				switch(sender.lifecycleStatus) {
					case "new":
						setTimeout(() => {
							if(this._onKtbsResourceLifecycleNew)
								this._onKtbsResourceLifecycleNew(old_value);
						});

						break;
					case "exists":
						setTimeout(() => {
							if(this._onKtbsResourceLifecycleExists)
								this._onKtbsResourceLifecycleExists(old_value);
						});

						break;
					case "modified":
						setTimeout(() => {
							if(this._onKtbsResourceLifecycleModified)
								this._onKtbsResourceLifecycleModified(old_value);
						});

						break;
					case "deleted":
						setTimeout(() => {
							if(this._onKtbsResourceLifecycleDeleted)
								this._onKtbsResourceLifecycleDeleted(old_value);
						});

						break;
				}
			}
			else if(type == "children-add") {
				setTimeout(() => {
					if(this._onKtbsResourceChildrenAdd)
						this._onKtbsResourceChildrenAdd(old_value);
				});
			}
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

		if(this._ktbsResource && this._bindedOnKtbsResourceNotificationMethod)
			this._ktbsResource.unregisterObserver(this._bindedOnKtbsResourceNotificationMethod);
	}

	/**
	 * 
	 */
	_onKtbsResourceSyncError(old_syncStatus, error) {
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
}

export {KtbsResourceElement};
