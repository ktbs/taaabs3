import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {Ktbs} from "../../ktbs-api/Ktbs.js";

import "../ktbs4la2-main-subsection/ktbs4la2-main-subsection.js";
import "../ktbs4la2-main-related-resource/ktbs4la2-main-related-resource.js";
import "../ktbs4la2-add-resource-button/ktbs4la2-add-resource-button.js";

/**
 * 
 */
class KTBS4LA2MainRoot extends KtbsResourceElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true);
		this._resourceStatusString = "Pending...";
	}

	onComponentReady() {
		this._containerDiv = this.shadowRoot.querySelector("#container");
		this.resourceTypeLabel = this.shadowRoot.querySelector("#resource-type-label");
		this.titleTag = this.shadowRoot.querySelector("#title");
		this.linkTag = this.shadowRoot.querySelector("#resource-link");
		this.resourceStatusTag = this.shadowRoot.querySelector("#resource-status");
		this.resourceStatusLabel = this.shadowRoot.querySelector("#resource-status-label");
		this.errorMessageDiv = this.shadowRoot.querySelector("#error-message");
		this.versionTag = this.shadowRoot.querySelector("#root-version");
		this.commentTag = this.shadowRoot.querySelector("#root-comment");
		this.editButton = this.shadowRoot.querySelector("#tool-edit");
		this.editButton.addEventListener("click", this.onClickEditButton.bind(this));
		this.removeButton = this.shadowRoot.querySelector("#tool-remove");
		this.removeButton.addEventListener("click", this.onClickRemoveButton.bind(this));
		this.versionLabel = this.shadowRoot.querySelector("#version-label");
		this.childBasesSubsection = this.shadowRoot.querySelector("#child-bases");
		this.childMethodsSubsection = this.shadowRoot.querySelector("#child-methods");
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		this.resourceTypeLabel.innerText = this._translateString("kTBS Root");
		this.linkTag.setAttribute("title", this._translateString("See the resource on the REST console (opens in a new tab)"));
		this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
		this.editButton.setAttribute("title", this._translateString("Edit this kTBS root uri and/or label"));
		this.removeButton.setAttribute("title", this._translateString("Remove from my kTBS roots"));
		this.versionLabel.innerText = this._translateString("Version");
		this.childBasesSubsection.setAttribute("title", this._translateString("Bases") + " : ");
		this.childBasesSubsection.setAttribute("lang", this._lang);
		this.childMethodsSubsection.setAttribute("title", this._translateString("Builtin methods") + " : ");
		this.childMethodsSubsection.setAttribute("lang", this._lang);
	}

	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		this._componentReady.then(() => {
			if(attributeName == "label")
				this.titleTag.innerText = newValue;
			else if(attributeName == "uri") {
				this.linkTag.href = newValue;
				this.linkTag.innerHTML = newValue;
			}
		});
	}

	/**
	 * 
	 */
	onktbsResourceLoaded() {
		this._componentReady.then(() => {
			this._resourceStatusString = "Online";
			this.resourceStatusLabel.innerText = this._translateString(this._resourceStatusString);
			this.errorMessageDiv.innerText = "";
			this._containerDiv.className = "online";

			let version = this._ktbsResource.get_version();

			if(version)
				this.versionTag.innerHTML = version;
		
			let comment = this._ktbsResource.get_comment();

			if(comment)
				this.commentTag.innerHTML = comment;

			while(this.firstChild)
    			this.removeChild(this.firstChild);

			let bases_uris = this._ktbsResource.list_bases_uris();

			for(let i = 0; i < bases_uris.length; i++) {
				let baseUri = bases_uris[i];
				let baseTag = document.createElement("ktbs4la2-main-related-resource");
				baseTag.setAttribute("resource-type", "Base");
				baseTag.setAttribute("uri", baseUri);
				baseTag.setAttribute("slot", "bases");
				this.appendChild(baseTag);
			}

			// create method child elements
			let methods_uris = this._ktbsResource.list_builtin_methods_uris();

			for(let i = 0; i < methods_uris.length; i++) {
				let method_uri = methods_uris[i];
				let methodTag = document.createElement("ktbs4la2-main-related-resource");
				methodTag.setAttribute("resource-type", "Method");
				methodTag.setAttribute("uri", method_uri);
				methodTag.setAttribute("slot", "methods");
				this.appendChild(methodTag);
			}

			let addBaseButton = document.createElement("ktbs4la2-add-resource-button");
			addBaseButton.setAttribute("parent-type", "Ktbs");
			addBaseButton.setAttribute("parent-uri", this.getAttribute("uri"));
			addBaseButton.setAttribute("create-type", "Base");
			addBaseButton.setAttribute("slot", "bases");
			this.appendChild(addBaseButton);
		});
	}

	/**
	 * 
	 */
	onktbsResourceLoadFailed(error) {
		super.onktbsResourceLoadFailed(error);

		this._componentReady.then(() => {
			while(this.firstChild)
    			this.removeChild(this.firstChild);

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
		return Ktbs;
	}

	/**
	 * 
	 */
	onClickEditButton(event) {
		this.requestEditResource();
	}

	/**
	 * 
	 */
	onClickRemoveButton(event) {
		this.requestDeleteResource();
	}
}

customElements.define('ktbs4la2-main-root', KTBS4LA2MainRoot);
