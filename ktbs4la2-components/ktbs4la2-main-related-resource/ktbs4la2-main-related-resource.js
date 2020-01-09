import {KtbsResourceElement} from "../common/KtbsResourceElement.js";

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

			if(label)
				this.linkTag.innerText = label;

			this.linkTag.title = this._getTitleHint();
		});
	}

	/**
	 * 
	 */
	onktbsResourceLoadFailed(error) {
		super.onktbsResourceLoadFailed(error);

		this._componentReady.then(() => {
			if(!this.linkTag.classList.contains("error"))
				this.linkTag.classList.add("error");

			this.linkTag.title = this._getTitleHint();
		});
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

		switch(this._ktbsResource._syncStatus) {
			case "in_sync" :
				hint += this._translateString("Online");
				break;
			case "needs_sync" :
				hint += this._translateString("Pending...");
				break;
			case "error" :
				hint += this._translateString("Error");
				break;
			default : 
				hint += this._translateString("Unknown") + " (" + this._ktbsResource._syncStatus + ")";
		}

		return hint;
	}
}

customElements.define('ktbs4la2-main-related-resource', KTBS4LA2MainRelatedResource);
