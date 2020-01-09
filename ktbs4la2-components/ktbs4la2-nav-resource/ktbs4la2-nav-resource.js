import {KtbsResourceElement} from "../common/KtbsResourceElement.js";

/**
 * 
 */
class KTBS4LA2NavResource extends KtbsResourceElement {
	
	/**
	 * 
	 */
	constructor() {
		super(import.meta.url);
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
			this._componentReady.then(function() {
				if(newValue)
					this._titleTag.innerText = newValue;
				else
					this._titleTag.innerText = this._ktbsResource.id;
			
			}.bind(this));
		}
		else if(attributeName == "uri") {
			this._componentReady.then(function() {
				this._titleTag.href = newValue;
			}.bind(this));
		}
		else if((attributeName == "preload-children") && (newValue == "true")) {
			this._ktbsResourceLoaded.then(function() {
				if(this._can_have_children())
					this._instanciateChildren();
			}.bind(this));
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
		this.addItemButton = this.shadowRoot.querySelector("#add-item-button");
	}

	/**
	 * 
	 */
	connectedCallback() {
		super.connectedCallback();

		Promise.all([this._resourceAttributesSet, this._componentReady]).then(() => {
			if(!this.getAttribute("label"))
				this._titleTag.innerText = this._ktbsResource.id;

			this._titleTag.title = this._getTitleHint();
		});
	}

	_updateStringsTranslation() {
		if(this._containerDiv.classList.contains("folded"))
			this._unfoldButton.setAttribute("title", this._translateString("Unfold child list"));
		else
			this._unfoldButton.setAttribute("title", this._translateString("Fold child list"));

		this._titleTag.setAttribute("title", this._getTitleHint());
		this.addItemButton.setAttribute("title", this._translateString("Add new child resource"));
	}

	/**	
	 * 
	 */
	onktbsResourceLoaded() {
		this._componentReady.then(() => {
			if(this._can_have_children() && this._containerDiv.classList.contains("unfolded"))
				this._instanciateChildren(true);

			let label = this._ktbsResource.label;
			
			if(label && !this.getAttribute("label"))
				this._titleTag.innerHTML = label;

			this._titleTag.title = this._getTitleHint();

			if(this._containerDiv.classList.contains("error"))
				this._containerDiv.classList.remove("error");
		});
	}

	/**
	 * 
	 */
	onktbsResourceLoadFailed(error) {
		super.onktbsResourceLoadFailed(error);

		this._componentReady.then(() => {
			if(this._can_have_children() && this._childrenInstanciated)
				this._instanciateChildren(true);

			if(!this._containerDiv.classList.contains("error"))
				this._containerDiv.classList.add("error");

			this._titleTag.title = this._getTitleHint();
		});
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
	_preLoadGrandChildren() {
		let children = this.querySelectorAll("ktbs4la2-nav-resource");

		for(let i = 0; i < children.length; i++) {
			let child = children[i];

			if(child._can_have_children() && (child.getAttribute("preload-children") != "true"))
				child.setAttribute("preload-children", "true");
		}
	}

	/**
	 * 
	 */
	_toggleFolded(event) {
		if(this._can_have_children()) {
			if(this._containerDiv.classList.contains("folded")) {
				if(!this._childrenInstanciated)
					this._instanciateChildren();

				this._containerDiv.classList.remove("folded");
				this._containerDiv.classList.add("unfolded");
				this._unfoldButton.title = this._translateString("Fold child list");

				if(this.getAttribute("preload-children") == "true")
					setTimeout(this._preLoadGrandChildren.bind(this), 100);
			}
			else {
				if(this._containerDiv.classList.contains("unfolded"))
					this._containerDiv.classList.remove("unfolded");

				this._containerDiv.classList.add("folded");
				this._unfoldButton.title = this._translateString("Unfold child list");
			}
		}
		else
			this.emitErrorEvent(Error("Nav element of resource type \"" + this.getAttribute("resource-type") + "\" cannot be unfolded as they cannot have children resources"));
	}

	/**	
	 * 
	 */
	_instanciateChildren(forceRefresh = false) {
		if(forceRefresh) {
			while(this.firstChild)
    			this.removeChild(this.firstChild);

			this._childrenInstanciated = false;
		}

		if(this._can_have_children()) {
			this._ktbsResourceLoaded.then(() => {
				if(!this._childrenInstanciated) {
					if(this.getAttribute("resource-type") == "Ktbs") {
						// create base child elements
						let bases = this._ktbsResource.bases;

						for(let i = 0; i < bases.length; i++) {
							let base = bases[i];
							let baseTag = document.createElement("ktbs4la2-nav-resource");
							baseTag.setAttribute("resource-type", "Base");
							baseTag.setAttribute("uri", base.uri);
							this.appendChild(baseTag);
						}

						// create method child elements
						let builtin_methods = this._ktbsResource.builtin_methods;
			
						for(let i = 0; i < builtin_methods.length; i++) {
							let builtin_method = builtin_methods[i];
							let methodTag = document.createElement("ktbs4la2-nav-resource");
							methodTag.setAttribute("resource-type", "Method");
							methodTag.setAttribute("uri", builtin_method.uri);
							this.appendChild(methodTag);
						}
					}
					else if(this.getAttribute("resource-type") == "Base") {

						// create base child elements
						let bases = this._ktbsResource.bases;
				
						for(let i = 0; i < bases.length; i++) {
							let base = bases[i];
							let baseTag = document.createElement("ktbs4la2-nav-resource");
							baseTag.setAttribute("resource-type", "Base");
							baseTag.setAttribute("uri", base.uri);
							this.appendChild(baseTag);
						}

						// create model child elements
						let models = this._ktbsResource.models;

						for(let i = 0; i < models.length; i++) {
							let model = models[i];
							let modelTag = document.createElement("ktbs4la2-nav-resource");
							modelTag.setAttribute("uri", model.uri);
							modelTag.setAttribute("resource-type", "Model");
							this.appendChild(modelTag);
						}

						// create stored trace child elements
						let stored_traces = this._ktbsResource.stored_traces;

						for(let i = 0; i < stored_traces.length; i++) {
							let storedTrace = stored_traces[i];
							let storedTraceTag = document.createElement("ktbs4la2-nav-resource");
							storedTraceTag.setAttribute("uri", storedTrace.uri);
							storedTraceTag.setAttribute("resource-type", "StoredTrace");
							this.appendChild(storedTraceTag);
						}

						// create method child elements
						let methods = this._ktbsResource.methods;
			
						for(let i = 0; i < methods.length; i++) {
							let method = methods[i];
							let methodTag = document.createElement("ktbs4la2-nav-resource");
							methodTag.setAttribute("resource-type", "Method");
							methodTag.setAttribute("uri", method.uri);
							this.appendChild(methodTag);
						}

						// create computed trace child elements
						let computed_traces = this._ktbsResource.computed_traces;

						for(let i = 0; i < computed_traces.length; i++) {
							let computedTrace = computed_traces[i];
							let computedTraceTag = document.createElement("ktbs4la2-nav-resource");
							computedTraceTag.setAttribute("uri", computedTrace.uri);
							computedTraceTag.setAttribute("resource-type", "ComputedTrace");
							this.appendChild(computedTraceTag);
						}
					}

					// done
					this._childrenInstanciated = true;
				}
			});		
		}
		else
			this.emitErrorEvent(new Error("Nav element of resource type \"" + this.getAttribute("resource-type") + "\" cannot have children resources"));
	}
}

customElements.define('ktbs4la2-nav-resource', KTBS4LA2NavResource);
