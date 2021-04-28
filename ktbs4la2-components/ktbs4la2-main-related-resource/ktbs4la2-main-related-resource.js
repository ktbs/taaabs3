import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {Resource} from "../../ktbs-api/Resource.js";
import {Method} from "../../ktbs-api/Method.js";

/**
 * 
 */
class KTBS4LA2MainRelatedResource extends KtbsResourceElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true);
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._containerDiv = this.shadowRoot.querySelector("#container");
		this.linkTag = this.shadowRoot.querySelector("#link");
		this.linkTag.addEventListener("click", this.onClickLink.bind(this));
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		if(!this.hasAttribute("label"))
			this.linkTag.innerText = this._ktbsResource.get_preferred_label(this._lang);
		
		this.linkTag.title = this._getTitleHint();
	}

	/**
	 * 
	 */
	_onKtbsResourceSyncInSync() {
		this._componentReady.then(() => {
			if((this._ktbsResource instanceof Method) && (this._ktbsResource.is_builtin))
				this._containerDiv.classList.add("inactive");
			else {
				if((this._ktbsResource.authentified) && (this._ktbsResource.hasOwnCredendtials) && (!this._containerDiv.classList.contains("access-granted")))
					this._containerDiv.classList.add("access-granted");

				if(!this.hasAttribute("label"))
					this.linkTag.innerText = this._ktbsResource.get_preferred_label(this._lang);
			}

			this.linkTag.title = this._getTitleHint();
		});
	}

	/**
	 * 
	 */
	_onKtbsResourceSyncError(old_syncStatus, error) {
		super._onKtbsResourceSyncError(old_syncStatus, error);

		this._componentReady.then(() => {
			if(!this._containerDiv.classList.contains("error"))
				this._containerDiv.classList.add("error");

			this.linkTag.title = this._getTitleHint();
		});
	}

	/**
	 * 
	 */
	_onKtbsResourceSyncNeedsAuth() {
		this._componentReady.then(() => {
			if(!this._containerDiv.classList.contains("authentication-required"))
				this._containerDiv.classList.add("authentication-required");

			this.linkTag.title = this._getTitleHint();
		});
	}

	/**
	 * 
	 */
	_onKtbsResourceSyncAccessDenied() {
		this._componentReady.then(() => {
			if(!this._containerDiv.classList.contains("access-denied"))
				this._containerDiv.classList.add("access-denied");

			this.linkTag.title = this._getTitleHint();
		});
	}

	/**
	 * 
	 */
	onClickLink(event) {
		event.preventDefault();

		if(!this._containerDiv.classList.contains("inactive") && !((this.getAttribute("inactive") == "1") || (this.getAttribute("inactive") == "true"))) {
			let select_event = new CustomEvent("selectelement", {bubbles: true});
			this.dispatchEvent(select_event);
		}
	}

	/**
	 * 
	 */
	_getTitleHint() {
		let hint;

		if((this._ktbsResource instanceof Method) && (this._ktbsResource.is_builtin)) {
			hint = this._translateString("Type") + ": " + this._translateString("Builtin method");
		}
		else {
			hint = this._translateString("Type") + ": " + this.getAttribute("resource-type") + "\n" + 
					this._translateString("Status") + " : ";
		
			switch(this._ktbsResource.syncStatus) {
				case "in_sync" :
					if(this._ktbsResource.authentified)
						hint += this._translateString("Access granted");
					else
						hint += this._translateString("Online");

					break;
				case "needs_sync" :
					hint += this._translateString("Pending...");
					break;
				case "pending" :
					hint += this._translateString("Pending...");
					break;
				case "needs_auth" :
					hint += this._translateString("Authentication required");
					break;
				case "access_denied" :
					hint += this._translateString("Access denied");
					break;
				case "error" :
					hint += this._translateString("Error");
					break;
				default : 
					hint += this._translateString("Unknown") + " (" + this._ktbsResource.syncStatus + ")";
			}
		}

		return hint;
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let attr = super.observedAttributes;
		attr.push("scale");
		return attr;
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);
		
		if(attributeName == "uri") {
			this._componentReady.then(() => {
				this.linkTag.href = window.location.origin + window.location.pathname + "#type=" + encodeURIComponent(this.getAttribute("resource-type")) + "&uri=" + encodeURIComponent(newValue);

				if(!this.hasAttribute("label"))
					this.linkTag.innerText = Resource.extract_relative_id(newValue);
			});
		}
		else if(attributeName == "label") {
			if(newValue)
				this._componentReady.then(() => {
					this.linkTag.innerText = newValue;
				});
		}
		else if(attributeName == "scale") {
			let ratio = parseFloat(newValue, 10);

			if(isNaN(ratio))
				ratio = 1;

			this._componentReady.then(() => {
				this.linkTag.style.setProperty('--ratio', ratio);
			});
		}
	}
}

customElements.define('ktbs4la2-main-related-resource', KTBS4LA2MainRelatedResource);
