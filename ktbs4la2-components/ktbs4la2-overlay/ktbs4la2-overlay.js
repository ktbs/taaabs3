import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

/**
 * 
 */
class KTBS4LA2Overlay extends TemplatedHTMLElement {

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
		this._closeIcon = this.shadowRoot.querySelector("#close");
		this._closeIcon.addEventListener("click", this._requestClose.bind(this));
		document.addEventListener('keyup', this._onKeyUp.bind(this));
	}

	/**
	 * 
	 */
	_requestClose(event) {
		this.dispatchEvent(new CustomEvent('closerequest'));
	}

	/**
	 * 
	 */
	_onKeyUp(event) {
		let key = event.key || event.keyCode;

		if((key === 'Escape') || (key === 'Esc') || (key === 27))
			this._requestClose();
	}

	/**
     * 
     */
    _updateStringsTranslation() {
		this._closeIcon.setAttribute("title", this._translateString("Close"));
		this._closeIcon.setAttribute("alt", this._translateString("Close icon"));
	}
}

customElements.define('ktbs4la2-overlay', KTBS4LA2Overlay);
