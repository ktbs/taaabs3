import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

class KTBS4LA2Overlay extends TemplatedHTMLElement {
	constructor() {
		super(import.meta.url, true);
	}

	onComponentReady() {
		this.closeIcon = this.shadowRoot.querySelector("#close");
		this.closeIcon.addEventListener("click", this.requestClose.bind(this));
		document.addEventListener('keyup', this.onKeyUp.bind(this));
	}

	requestClose(event) {
		this.dispatchEvent(new CustomEvent('closerequest'));
	}

	onKeyUp(event) {
		let key = event.key || event.keyCode;

		if((key === 'Escape') || (key === 'Esc') || (key === 27))
			this.requestClose();
	}
}

customElements.define('ktbs4la2-overlay', KTBS4LA2Overlay);
