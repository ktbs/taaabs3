import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import * as KTBSErrors from "../../ktbs-api/Errors.js";

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
	connectedCallback() {
		super.connectedCallback();

		this._componentReady.then(() => {
			this.linkTag.href = this.getAttribute("uri");
			this.linkTag.innerText = this._ktbsResource.id;
			this.linkTag.title = this._getTitleHint();
		});
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		this.linkTag.title = this._getTitleHint();
	}

	/**	
	 * 
	 */
	onktbsResourceLoaded() {
		this._componentReady.then(() => {
			let label = this._ktbsResource.label;

			if((this._ktbsResource.authentified) && (!this._containerDiv.classList.contains("access-granted")))
				this._containerDiv.classList.add("access-granted");

			if(label)
				this.linkTag.innerText = label;

			this.linkTag.title = this._getTitleHint();
		});
	}

	/**
	 * 
	 */
	onktbsResourceLoadFailed(error) {
		if((error instanceof KTBSErrors.HttpError) && ((error.statusCode == 401) || (error.statusCode == 403))) {
			this._componentReady.then(() => {
				if(error.statusCode == 401) {
					if(!this._containerDiv.classList.contains("authentication-required"))
						this._containerDiv.classList.add("authentication-required");
				}
				else if(error.statusCode == 403) {
					if(!this._containerDiv.classList.contains("access-denied"))
						this._containerDiv.classList.add("access-denied");
				}

				this.linkTag.title = this._getTitleHint();
			});
		}
		else {
			super.onktbsResourceLoadFailed(error);

			this._componentReady.then(() => {
				if(!this._containerDiv.classList.contains("error"))
					this._containerDiv.classList.add("error");

				this.linkTag.title = this._getTitleHint();
			});
		}
	}

	/**
	 * 
	 */
	onClickLink(event) {
		event.preventDefault();
		let select_event = new CustomEvent("selectelement", {bubbles: true});
		this.dispatchEvent(select_event);
	}

	/**
	 * 
	 */
	_getTitleHint() {
		let hint = this._translateString("Type") + ": " + this.getAttribute("resource-type") + "\n" + 
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

		return hint;
	}
}

customElements.define('ktbs4la2-main-related-resource', KTBS4LA2MainRelatedResource);
