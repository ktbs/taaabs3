import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

class KTBS4LA2IFrame extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, false);
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._iframeElement = this.shadowRoot.querySelector("#iframe");
		this._iframeElement.addEventListener("load", this.onDocumentLoad.bind(this));
		this._iframeWindow = this._iframeElement.contentWindow;
		this._previousBodyWidth = null;
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push("src");
		return observedAttributes;
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		if(attributeName == "src") {
			this._componentReady.then(() => {
				this._iframeElement.setAttribute("src", newValue);
			});
		}
	}

	/**
	 * 
	 */
	adjustHeight(event) {
		if(this._previousBodyWidth != this._iframeWindow.document.body.offsetWidth) {
			this._previousBodyWidth = this._iframeWindow.document.body.offsetWidth;
			let bodyHeight = this._iframeWindow.document.documentElement.offsetHeight + 15;
			this._iframeElement.height = bodyHeight + "px";
		}
	}

	/**
	 * 
	 */
	onDocumentLoad(event) {
		let newURL = this._iframeWindow.location;
		this.setAttribute("current-src", newURL);

		if(newURL != this.getAttribute("src")) {
			let newTitle = this._iframeWindow.document.title;

			this.dispatchEvent(
				new CustomEvent("internal-navigate", {
					bubbles: true,
					detail : {document_url: newURL, document_title: newTitle}
				})
			);
		}
		
		this.adjustHeight();
		this._iframeWindow.addEventListener("resize", this.adjustHeight.bind(this));
		this._iframeWindow.addEventListener("mousemove", this.onMouseMove.bind(this));
	}

	/**
	 * 
	 */
	onMouseMove(event) {
		event.preventDefault();
        let boundingClientRect = this._iframeElement.getBoundingClientRect();
		
		let mouseEvent = new MouseEvent("mousemove", {
			bubbles: true,
			cancelable: false,
			screenX: event.screenX,
            screenY: event.screenY,
            clientX: event.clientX + boundingClientRect.left,
            clientY: event.clientY + boundingClientRect.top,
			ctrlKey: event.ctrlKey,
			shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
			button: event.button
		});

		this.dispatchEvent(mouseEvent);
    }
}

customElements.define('ktbs4la2-iframe', KTBS4LA2IFrame);
