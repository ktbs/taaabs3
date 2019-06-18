import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";
import "../ktbs4la2-iframe/ktbs4la2-iframe.js";

class KTBS4LA2MainDocumentation extends TemplatedHTMLElement {
	
	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, false);
		this._page = "";
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push("page");
		return observedAttributes;
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "page") {
			this._page = this.getAttribute("page");

			this._componentReady.then(function() {
				let iFrameSrc = this.getAttribute("doc-path") + this._lang + "/" + this._page;
				this._iframe.setAttribute("src", iFrameSrc);
			}.bind(this));
		}
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._iframe = this.shadowRoot.querySelector("#ktbs-iframe");
		this._iframe.addEventListener("internal-navigate", this._onIFrameNavigate.bind(this));
	}

	/**
	 * 
	 */
	connectedCallback() {
		super.connectedCallback();

		if(this.getAttribute("doc-path")) {
			let iFrameSrc = this.getAttribute("doc-path") + this._lang + "/";

			if(this.getAttribute("page")) {
				this._page = this.getAttribute("page");
				iFrameSrc += this._page;
			}

			this._componentReady.then(function() {
				this._iframe.setAttribute("src", iFrameSrc);
			}.bind(this));
		}
		else
			this.emitErrorEvent(new Error("Missing required attribute \"doc-path\""));
	}

	/**
	 * 
	 */
	_onIFrameNavigate(event) {
		let newSrc = String(event.detail.document_url);
		let newTitle = event.detail.document_title;
		
		if(newSrc.substr(0, this.getAttribute("doc-path").length + 3) == (this.getAttribute("doc-path") + this._lang + "/")) {
			let newPage = newSrc.substr(this.getAttribute("doc-path").length + 3);

			if(newPage != this._page) {
				this._page = newPage;

				this.dispatchEvent(
					new CustomEvent("page-change", {
						bubbles: true,
						detail : {new_page: newPage, new_title: newTitle}
					})
				);
			}
		}
		else
			this.emitErrorEvent(new Error("Calling an URL outside of the documentation path"));
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		let iFrameSrc = this.getAttribute("doc-path") + this._lang + "/" + this._page;
		this._iframe.setAttribute("src", iFrameSrc);
	}
}

customElements.define('ktbs4la2-main-documentation', KTBS4LA2MainDocumentation);
