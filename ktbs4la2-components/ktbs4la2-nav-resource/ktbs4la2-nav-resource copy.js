import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {Resource} from "../../ktbs-api/Resource.js";
//import * as KTBSErrors from "../../ktbs-api/Errors.js";

/**
 * 
 */
class KTBS4LA2NavResource extends KtbsResourceElement {
	
	/**
	 * 
	 */
	constructor() {
		super(import.meta.url);
		this._childrenInstanciated = false;

		this._childrenObserver = new MutationObserver(this._updateEmptyChildren.bind(this));
		this._childrenObserver.observe(this, {childList: true});
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push("preload-children");
		return observedAttributes;
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "label") {
			this._componentReady.then(() => {
				if(newValue)
					this._titleTag.innerText = newValue;
				else if(this.hasAttribute("uri"))
					this._titleTag.innerText = Resource.extract_relative_id(this.getAttribute("uri"));
			});
		}
		else if(attributeName == "uri") {
			this._componentReady.then(() => {
				this._titleTag.href = newValue;
				this._titleTag.title = this._getTitleHint();

				if(!this.hasAttribute("label"))
					this._titleTag.innerText = Resource.extract_relative_id(newValue);
			});
		}
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._containerDiv = this.shadowRoot.querySelector("#container");
		this._titleTag = this.shadowRoot.querySelector("#title");
		this._titleTag.addEventListener("click", this.onClickTitle.bind(this));
		this._unfoldButton = this.shadowRoot.querySelector("#unfold-button");
		this._unfoldButton.addEventListener("click", this._toggleFolded.bind(this));
		this._childList = this.shadowRoot.querySelector("#child-list");
		this._childListSpinner = this.shadowRoot.querySelector("#childlist-spinner");
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		if(this._containerDiv.classList.contains("folded"))
			this._unfoldButton.setAttribute("title", this._translateString("Unfold child list"));
		else
			this._unfoldButton.setAttribute("title", this._translateString("Fold child list"));

		this._titleTag.setAttribute("title", this._getTitleHint());
		this._childListSpinner.innerText = this._translateString("Pending...");
	}

	/**
	 * 
	 */
	_onKtbsResourceSyncInSync() {
		this._componentReady.then(() => {
			const label = this._ktbsResource.label;
			
			if(label && !this.hasAttribute("label"))
				this._titleTag.innerText = label;

			this._titleTag.title = this._getTitleHint();

			if(this._containerDiv.classList.contains("error"))
			this._containerDiv.classList.remove("error");

			if(this._containerDiv.classList.contains("authentication-required"))
				this._containerDiv.classList.remove("authentication-required");

			if(this._containerDiv.classList.contains("access-denied"))
				this._containerDiv.classList.remove("access-denied");

			if((this._ktbsResource.authentified) && (this._ktbsResource.hasOwnCredendtials) && (!this._containerDiv.classList.contains("access-granted")))
				this._containerDiv.classList.add("access-granted");

			if(
					this._can_have_children() 
				&& 	(
							(!this._childrenInstanciated && this._containerDiv.classList.contains("unfolded")) 
						|| 	(this.getAttribute("preload-children") == "1") || (this.getAttribute("preload-children") == "true")
					)
				)
				this._instanciateChildren();
		});
	}

	/**
	 * 
	 * \param Error error 
	 */
	_onKtbsResourceSyncError(old_syncStatus, error) {
		super._onKtbsResourceSyncError(old_syncStatus, error);

		this._componentReady.then(() => {
			if(this._containerDiv.classList.contains("unfolded"))
				this._containerDiv.classList.remove("unfolded");

			if(!this._containerDiv.classList.contains("folded"))
				this._containerDiv.classList.add("folded");

			let children = this.querySelectorAll("ktbs4la2-nav-resource");

			for(let i = 0; i < children.length; i++) {
				let aChild = children[i];
				this.removeChild(aChild);
			}
			
			this._childrenInstanciated = false;
			
			if(this._containerDiv.classList.contains("authentication-required"))
				this._containerDiv.classList.remove("authentication-required");

			if(this._containerDiv.classList.contains("access-denied"))
				this._containerDiv.classList.remove("access-denied");

			if(this._containerDiv.classList.contains("access-granted"))
				this._containerDiv.classList.remove("access-granted");

			if(!this._containerDiv.classList.contains("error"))
				this._containerDiv.classList.add("error");

			this._titleTag.title = this._getTitleHint();
		});
	}

	 /**
     * 
     */
    _onKtbsResourceSyncNeedsAuth() {
        this._componentReady.then(() => {
            if(this._containerDiv.classList.contains("access-denied"))
				this._containerDiv.classList.remove("access-denied");

			if(this._containerDiv.classList.contains("access-granted"))
				this._containerDiv.classList.remove("access-granted");

			if(this._containerDiv.classList.contains("error"))
				this._containerDiv.classList.remove("error");

			if(!this._containerDiv.classList.contains("authentication-required"))
				this._containerDiv.classList.add("authentication-required");

			this._titleTag.title = this._getTitleHint();
        });
    }

    /**
     * 
     */
    _onKtbsResourceSyncAccessDenied() {
        this._componentReady.then(() => {
            if(this._containerDiv.classList.contains("authentication-required"))
				this._containerDiv.classList.remove("authentication-required");

			if(this._containerDiv.classList.contains("access-granted"))
				this._containerDiv.classList.remove("access-granted");

			if(this._containerDiv.classList.contains("error"))
				this._containerDiv.classList.remove("error");

			if(!this._containerDiv.classList.contains("access-denied"))
				this._containerDiv.classList.add("access-denied");
			
			this._titleTag.title = this._getTitleHint();
        });
	}
	
	/**
	 * 
	 */
	_onKtbsResourceLifecycleDeleted() {
		setTimeout(() => {
			this.remove();
		}, 1500);

		this.classList.add("deleted");
	}

	/**
	 * 
	 */
	_onKtbsResourceChildrenAdd() {
		if(this._childrenInstanciated) {
			for(let i = 0; i < this._ktbsResource.children.length; i++) {
				const aChild = this._ktbsResource.children[i];
				const queryString = "ktbs4la2-nav-resource[resource-type = " + CSS.escape(aChild.type) + "][uri = " + CSS.escape(aChild.uri) + "]";
				const childElement = this.querySelector(queryString);
				
				if(!childElement)
					this._instanciateChild(aChild, true);
			}
		}
	}

	/**	
	 * 
	 */
	onClickTitle(event) {
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
					
		if(this._ktbsResource) {
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
			}
		}
		else
			hint += this._translateString("Pending...");

		return hint;
	}

	/**	
	 * 
	 */
	_can_have_children() {
		let resourceType = this.getAttribute("resource-type");
		return ((resourceType == "Ktbs") || (resourceType == "Base"));
	}

	/**
	 * 
	 */
	_toggleFolded(event) {
		if(this._can_have_children()) {
			this._componentReady.then(() => {
				if(this._containerDiv.classList.contains("folded")) {
					this._containerDiv.classList.remove("folded");
					this._containerDiv.classList.add("unfolded");
					this._unfoldButton.title = this._translateString("Fold child list");

					if(!this._childrenInstanciated)
						this._ktbsResource.get(this._abortController.signal).then(() => {
							this._instanciateChildren();
						});
				}
				else {
					if(this._containerDiv.classList.contains("unfolded"))
						this._containerDiv.classList.remove("unfolded");

					this._containerDiv.classList.add("folded");
					this._unfoldButton.title = this._translateString("Unfold child list");
				}
			});
		}
		else
			this.emitErrorEvent(Error("Nav element of resource type \"" + this.getAttribute("resource-type") + "\" cannot be unfolded as they cannot have children resources"));
	}

	/**
	 * 
	 */
	_instanciateChild(child, mark_as_new = false) {
		if(this._can_have_children()) {
			const newChildElement = document.createElement("ktbs4la2-nav-resource");
			newChildElement.setAttribute("resource-type", child.type);
			newChildElement.setAttribute("uri", child.uri);

			if(child.label)
				newChildElement.setAttribute("label", child.label);

			if(mark_as_new == true)
				newChildElement.classList.add("new");

			this.appendChild(newChildElement);

			setTimeout(() => {
				if(newChildElement.classList.contains("new"))
					newChildElement.classList.remove("new");
			}, 4000);
		}
		else
			this.emitErrorEvent(new Error("Nav element of resource type \"" + this.getAttribute("resource-type") + "\" cannot have children resources"));
	}

	/**	
	 * 
	 */
	_instanciateChildren() {
		if(this._can_have_children()) {
			if(!this._childrenInstanciated) {
				if(this._ktbsResource.children.length > 0) {
					for(let i = 0; i < this._ktbsResource.children.length; i++)
						this._instanciateChild(this._ktbsResource.children[i]);
				}
				else
					this._childList.classList.add("empty");
				
				this._childrenInstanciated = true;
				this._childList.classList.add("children-instanciated");
			}
		}
		else
			this.emitErrorEvent(new Error("Nav element of resource type \"" + this.getAttribute("resource-type") + "\" cannot have children resources"));
	}

	/**
	 * 
	 */
	_updateEmptyChildren() {
		if(this.childNodes.length > 0) {
			if(this._childList.classList.contains("empty"))
				this._childList.classList.remove("empty");
		}
		else {
			if(!this._childList.classList.contains("empty"))
				this._childList.classList.add("empty");
		}
	}
}

customElements.define('ktbs4la2-nav-resource', KTBS4LA2NavResource);
