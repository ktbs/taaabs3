import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

class KTBS4LA2AddResourceButton extends TemplatedHTMLElement {

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
		this._link = this.shadowRoot.querySelector("#link");
		this._link.addEventListener("click", this.onClick.bind(this));
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		let title = this._translateString("Create a new ") + this._translateString(this.getTypeLabel(this._createType)) + this._translateString(" into this ") + this._translateString(this.getTypeLabel(this._parentType));
		this._link.setAttribute("title", title);
	}

	/**
	 * 
	 */
	getTypeLabel(type) {
		switch(type) {
			case "Ktbs":
				return "kTBS root";
				break;
			case "Base":
				return "base";
				break;
			case "Model":
				return "model";
				break;
			case "StoredTrace":
				return "stored trace";
				break;
			case "Method":
				return "method";
				break;
			case "ComputedTrace":
				return "computed trace";
				break;
			default:
				return "resource";
				break;
		}
	}

	/**
	 * 
	 */
	connectedCallback() {
		super.connectedCallback();
		this._parentType = this.getAttribute("parent-type");
		this._parentUri = this.getAttribute("parent-uri");
		this._createType = this.getAttribute("create-type");

		this._componentReady.then(() => {
			let title = this._translateString("Create a new ") + this._translateString(this.getTypeLabel(this._createType)) + this._translateString(" into this ") + this._translateString(this.getTypeLabel(this._parentType));
			this._link.setAttribute("title", title);
		});
	}

	/**
	 * 
	 */
	onClick(event) {
		
	}
}

customElements.define('ktbs4la2-add-resource-button', KTBS4LA2AddResourceButton);
