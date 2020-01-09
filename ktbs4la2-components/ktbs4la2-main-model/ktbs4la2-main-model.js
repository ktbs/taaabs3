import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {Model} from "../../ktbs-api/Model.js";

import "../ktbs4la2-model-diagram/ktbs4la2-model-diagram.js";

/**
 * 
 */
class KTBS4LA2MainModel extends KtbsResourceElement {

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
		this.resourceContentsSubsection = this.shadowRoot.querySelector("#resource-contents");
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

			let diagram = document.createElement("ktbs4la2-model-diagram");
			diagram.setAttribute("slot", "diagram");
			diagram.setAttribute("uri", this.getAttribute("uri"));
			this.appendChild(diagram);
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
		return Model;
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		this.resourceTypeLabel.innerText = this._translateString("Model");
		this.linkTag.setAttribute("title", this._translateString("See the resource on the REST console (opens in a new tab)"));
		this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
		this.resourceContentsSubsection.setAttribute("lang", this._lang);
	}
}

customElements.define('ktbs4la2-main-model', KTBS4LA2MainModel);
