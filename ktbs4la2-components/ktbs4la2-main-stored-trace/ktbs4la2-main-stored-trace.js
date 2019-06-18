import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {StoredTrace} from "../../ktbs-api/StoredTrace.js";

import "../ktbs4la2-main-related-resource/ktbs4la2-main-related-resource.js";
import "../ktbs4la2-trace-stats/ktbs4la2-trace-stats.js";
import "../ktbs4la2-trace-obsels/ktbs4la2-trace-obsels.js";

/**
 * 
 */
class KTBS4LA2MainStoredTrace extends KtbsResourceElement {

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
		this.modelSubsection = this.shadowRoot.querySelector("#model");
		this.obselsSubsection = this.shadowRoot.querySelector("#obsels");
		this.statsSubsection = this.shadowRoot.querySelector("#stats");
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
				this.titleTag.innerText = this._ktbsResource.get_relative_id();

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
				let label = this._ktbsResource.get_label();

				if(label)
					this.titleTag.innerText = label;
			}

			this._resourceStatusString = "Online";
			this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
			this._containerDiv.className = "online";

			// create child elements
			let modelElement = document.createElement("ktbs4la2-main-related-resource");
			modelElement.setAttribute("resource-type", "Model");
			modelElement.setAttribute("uri", this._ktbsResource.get_model_uri());
			modelElement.setAttribute("slot", "model");
			this.appendChild(modelElement);

			let statsElement = document.createElement("ktbs4la2-trace-stats");
			statsElement.setAttribute("uri", this.getAttribute("uri") + "@stats");
			statsElement.setAttribute("slot", "stats");
			this.appendChild(statsElement);

			let obselsElement = document.createElement("ktbs4la2-trace-obsels");
			obselsElement.setAttribute("uri", this.getAttribute("uri") + "@obsels");
			obselsElement.setAttribute("slot", "obsels");
			this.appendChild(obselsElement);
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
			this.errorMessageDiv.innerText = " (" + error.message + ")";
			this._containerDiv.className = "error";
		});
	}

	/**
	 * 
	 */
	_getKtbsResourceClass() {
		return StoredTrace;
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		this.resourceTypeLabel.innerText = this._translateString("Stored trace");
		this.linkTag.setAttribute("title", this._translateString("See the resource on the REST console (opens in a new tab)"));
		this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
		this.modelSubsection.setAttribute("lang", this._lang);
		this.modelSubsection.setAttribute("title", this._translateString("Model") + " : ");
		this.obselsSubsection.setAttribute("lang", this._lang);
		this.obselsSubsection.setAttribute("title", this._translateString("Obsels") + " : ");
		this.statsSubsection.setAttribute("lang", this._lang);
		this.statsSubsection.setAttribute("title", this._translateString("Statistics") + " : ");
	}
}

customElements.define('ktbs4la2-main-stored-trace', KTBS4LA2MainStoredTrace);
