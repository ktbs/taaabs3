import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

class KTBS4LA2MainSubsection extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true);
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push("title");
		return observedAttributes;
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "title") {
			this._componentReady.then(function() {
				this._titleH2.innerText = newValue;
			}.bind(this));
		}
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._titleH2 = this.shadowRoot.querySelector("#title");
		this._chevronLink = this.shadowRoot.querySelector("#chevron");
		this._chevronLink.addEventListener("click", this.toggleExpanded.bind(this));
		this._contentDiv = this.shadowRoot.querySelector("#content");
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		if((this.getAttribute("foldable") == "true") && (this.getAttribute("expanded") != "false"))
			this._chevronLink.title = this._translateString("Fold");
		else
			this._chevronLink.title = this._translateString("Expand");
	}

	/**
	 * 
	 */
	connectedCallback() {
		super.connectedCallback();

		this._componentReady.then(() => {
			if(this.getAttribute("title"))
				this._titleH2.innerText = this.getAttribute("title");

			if(!this.getAttribute("foldable")) {
				this.setAttribute("foldable", "false");
				this._chevronLink.title = this._translateString("Expand");
			}

			if(this.getAttribute("foldable") == "false") {
				this.setAttribute("expanded", "true");
				this._chevronLink.title = this._translateString("Fold");
			}
			else if(!this.getAttribute("expanded")) {
				this.setAttribute("expanded", "true");
				this._chevronLink.title = this._translateString("Fold");
			}
		});
	}

	toggleExpanded(event) {
		event.preventDefault();
		
		if(this.getAttribute("foldable") == "true") {
			if(this.getAttribute("expanded") == "true") {
				this.setAttribute("expanded", false);
				this._chevronLink.title = this._translateString("Expand");
			}
			else {
				this.setAttribute("expanded", "true");
				this._chevronLink.title = this._translateString("Fold");
			}
		}
	}
}

customElements.define('ktbs4la2-main-subsection', KTBS4LA2MainSubsection);
