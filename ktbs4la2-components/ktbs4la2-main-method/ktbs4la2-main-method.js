import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {Method} from "../../ktbs-api/Method.js";

/**
 * 
 */
class KTBS4LA2MainMethod extends KtbsResourceElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true);
		this._resourceStatusString = "Pending...";
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._containerDiv = this.shadowRoot.querySelector("#container");
		this.titleTag = this.shadowRoot.querySelector("#title");
		this.linkTag = this.shadowRoot.querySelector("#resource-link");
		this.resourceTypeLabel = this.shadowRoot.querySelector("#resource-type-label");
		this.resourceStatusTag = this.shadowRoot.querySelector("#resource-status");
		this.resourceStatusLabel = this.shadowRoot.querySelector("#resource-status-label");
		this.errorMessageDiv = this.shadowRoot.querySelector("#error-message");
		this.parentMethodSubsection = this.shadowRoot.querySelector("#parent-method");
		this.modelSubsection = this.shadowRoot.querySelector("#model");
	}

	/**
	 * 
	 */
	connectedCallback() {
		super.connectedCallback();

		this._componentReady.then(() => {
			if(this.getAttribute("label"))
				this.titleTag.innerText = this.getAttribute("label");
			else
				this.titleTag.innerText = this._ktbsResource.id;

			this.linkTag.href = this.getAttribute("uri");
			this.linkTag.innerHTML = this.getAttribute("uri");
		});
	}

	/**
	 * 
	 */
	onktbsResourceLoaded() {
		this._componentReady.then(() => {
			
			if(!this.getAttribute("label")) {
				let label = this._ktbsResource.label;

				if(label)
					this.titleTag.innerText = label;
			}

			this._resourceStatusString = "Online";
			this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
			this._containerDiv.className = "online";

			// create child elements
			/* ... */
		});
	}

	/**
	 * 
	 */
	onktbsResourceLoadFailed(error) {
		super.onktbsResourceLoadFailed(error);

		this._componentReady.then(() => {
			this._resourceStatusString = "Error";
			this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
			this.errorMessageDiv.innerText = " (" + error + ")";
			this._containerDiv.className = "error";
		});
	}

	/**
	 * 
	 */
	_getKtbsResourceClass() {
		return Method;
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		this.resourceTypeLabel.innerText = this._translateString("Method");
		this.linkTag.setAttribute("title", this._translateString("See the resource on the REST console (opens in a new tab)"));
		this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
		this.parentMethodSubsection.setAttribute("lang", this._lang);
		this.parentMethodSubsection.setAttribute("title", this._translateString("Parent method") + " : ");
		this.modelSubsection.setAttribute("lang", this._lang);
		this.modelSubsection.setAttribute("title", this._translateString("Model") + " : ");
	}
}

customElements.define('ktbs4la2-main-method', KTBS4LA2MainMethod);
