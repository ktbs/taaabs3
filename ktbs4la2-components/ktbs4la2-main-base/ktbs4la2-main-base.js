import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {Base} from "../../ktbs-api/Base.js";

import "../ktbs4la2-main-subsection/ktbs4la2-main-subsection.js";
import "../ktbs4la2-main-related-resource/ktbs4la2-main-related-resource.js";
import "../ktbs4la2-add-resource-button/ktbs4la2-add-resource-button.js";

/**
 * 
 */
class KTBS4LA2MainBase extends KtbsResourceElement {

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
		this.childBasesSubsection  = this.shadowRoot.querySelector("#child-bases");
		this.childModelsSubsection  = this.shadowRoot.querySelector("#child-models");
		this.childStoredTracesSubsection  = this.shadowRoot.querySelector("#child-stored-traces");
		this.childMethodsSubsection  = this.shadowRoot.querySelector("#child-methods");
		this.childComputedTracesSubsection  = this.shadowRoot.querySelector("#child-computed-traces");
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		this.resourceTypeLabel.innerText = this._translateString("Base");
		this.linkTag.setAttribute("title", this._translateString("See the resource on the REST console (opens in a new tab)"));
		this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
		this.childBasesSubsection.setAttribute("lang", this._lang);
		this.childBasesSubsection.setAttribute("title", this._translateString("Bases") + " : ");
		this.childModelsSubsection.setAttribute("lang", this._lang);
		this.childModelsSubsection.setAttribute("title", this._translateString("Models") + " : ");
		this.childStoredTracesSubsection.setAttribute("lang", this._lang);
		this.childStoredTracesSubsection.setAttribute("title", this._translateString("Stored traces") + " : ");
		this.childMethodsSubsection.setAttribute("lang", this._lang);
		this.childMethodsSubsection.setAttribute("title", this._translateString("Methods") + " : ");
		this.childComputedTracesSubsection.setAttribute("lang", this._lang);
		this.childComputedTracesSubsection.setAttribute("title", this._translateString("Computed traces") + " : ");
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

			// create base child elements
			let bases_uris = this._ktbsResource.list_bases_uris();

			for(let i = 0; i < bases_uris.length; i++) {
				let baseUri = bases_uris[i];
				let baseTag = document.createElement("ktbs4la2-main-related-resource");
				baseTag.setAttribute("resource-type", "Base");
				baseTag.setAttribute("uri", baseUri);
				baseTag.setAttribute("slot", "bases");
				this.appendChild(baseTag);
			}

			let addBaseButton = document.createElement("ktbs4la2-add-resource-button");
			addBaseButton.setAttribute("parent-type", "Base");
			addBaseButton.setAttribute("parent-uri", this.getAttribute("uri"));
			addBaseButton.setAttribute("create-type", "Base");
			addBaseButton.setAttribute("slot", "bases");
			this.appendChild(addBaseButton);

			// create model child elements
			let models_uris = this._ktbsResource.list_models_uris();

			for(let i = 0; i < models_uris.length; i++) {
				let modelUri = models_uris[i];
				let modelTag = document.createElement("ktbs4la2-main-related-resource");
				modelTag.setAttribute("resource-type", "Model");
				modelTag.setAttribute("uri", modelUri);
				modelTag.setAttribute("slot", "models");
				this.appendChild(modelTag);
			}

			let addModelButton = document.createElement("ktbs4la2-add-resource-button");
			addModelButton.setAttribute("parent-type", "Base");
			addModelButton.setAttribute("parent-uri", this.getAttribute("uri"));
			addModelButton.setAttribute("create-type", "Model");
			addModelButton.setAttribute("slot", "models");
			this.appendChild(addModelButton);

			// create stored trace child elements
			let storedtraces_uris = this._ktbsResource.list_stored_traces_uris();

			for(let i = 0; i < storedtraces_uris.length; i++) {
				let storedTraceUri = storedtraces_uris[i];
				let storedTraceTag = document.createElement("ktbs4la2-main-related-resource");
				storedTraceTag.setAttribute("resource-type", "StoredTrace");
				storedTraceTag.setAttribute("uri", storedTraceUri);
				storedTraceTag.setAttribute("slot", "stored-traces");
				this.appendChild(storedTraceTag);
			}

			let addStoredTraceButton = document.createElement("ktbs4la2-add-resource-button");
			addStoredTraceButton.setAttribute("parent-type", "Base");
			addStoredTraceButton.setAttribute("parent-uri", this.getAttribute("uri"));
			addStoredTraceButton.setAttribute("create-type", "StoredTrace");
			addStoredTraceButton.setAttribute("slot", "stored-traces");
			this.appendChild(addStoredTraceButton);

			// create method child elements
			let methods_uris = this._ktbsResource.list_methods_uris();

			for(let i = 0; i < methods_uris.length; i++) {
				let method_uri = methods_uris[i];
				let methodTag = document.createElement("ktbs4la2-main-related-resource");
				methodTag.setAttribute("resource-type", "Method");
				methodTag.setAttribute("uri", method_uri);
				methodTag.setAttribute("slot", "methods");
				this.appendChild(methodTag);
			}

			let addMethodButton = document.createElement("ktbs4la2-add-resource-button");
			addMethodButton.setAttribute("parent-type", "Base");
			addMethodButton.setAttribute("parent-uri", this.getAttribute("uri"));
			addMethodButton.setAttribute("create-type", "Method");
			addMethodButton.setAttribute("slot", "methods");
			this.appendChild(addMethodButton);

			// create stored trace child elements
			let computedtraces_uris = this._ktbsResource.list_computed_traces_uris();

			for(let i = 0; i < computedtraces_uris.length; i++) {
				let computedTraceUri = computedtraces_uris[i];
				let computedTraceTag = document.createElement("ktbs4la2-main-related-resource");
				computedTraceTag.setAttribute("resource-type", "ComputedTrace");
				computedTraceTag.setAttribute("uri", computedTraceUri);
				computedTraceTag.setAttribute("slot", "computed-traces");
				this.appendChild(computedTraceTag);
			}

			let addComputedTraceButton = document.createElement("ktbs4la2-add-resource-button");
			addComputedTraceButton.setAttribute("parent-type", "Base");
			addComputedTraceButton.setAttribute("parent-uri", this.getAttribute("uri"));
			addComputedTraceButton.setAttribute("create-type", "ComputedTrace");
			addComputedTraceButton.setAttribute("slot", "computed-traces");
			this.appendChild(addComputedTraceButton);
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
		return Base;
	}
}

customElements.define('ktbs4la2-main-base', KTBS4LA2MainBase);
