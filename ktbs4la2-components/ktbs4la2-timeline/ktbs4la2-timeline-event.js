import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

import "../ktbs4la2-document-header/ktbs4la2-document-header.js";
import {lightOrDark} from "../common/colors-utils.js";

export class KTBS4LA2TimelineEvent extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true, false);
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push("begin");
		observedAttributes.push("end");
		observedAttributes.push("visible");
		observedAttributes.push("href");
		observedAttributes.push("color");
		observedAttributes.push("symbol");
		observedAttributes.push("title");
		observedAttributes.push("hidden-siblinbgs-count");
		observedAttributes.push("id");
		return observedAttributes;
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "begin") {
			if(newValue != null) {
				this._beginTime = parseInt(newValue, 10);

				if(isNaN(this._beginTime))
					this.emitErrorEvent(new Error("Cannot parse integer from string : " + newValue));
			}
			else
				this._beginTime = undefined;
		}
		else if(attributeName == "end") {
			if(newValue != null) {
				this._endTime = parseInt(newValue, 10);

				if(isNaN(this._endTime))
					this.emitErrorEvent(new Error("Cannot parse integer from string : " + newValue));
			}
			else
				this._endTime = undefined;
		}
		else if(attributeName == "visible") {
			this._isVisible = !((newValue == "0") || (newValue == "false"));
		}
		else if(attributeName == "href")
			this._componentReady.then(() => {
				this._marker.setAttribute("href", newValue);
				this._popupHeaderLink.setAttribute("href", newValue);
				this._popupHeaderLink.style.visibility = "visible";
			});
		else if(attributeName == "color")
			this._componentReady.then(() => {
				if(this.hasAttribute("symbol")) {
					this._marker.style.color = newValue;
					this._marker.style.backgroundColor = "transparent";
				}
				else
					this._marker.style.backgroundColor = newValue;

				this._popup.style.backgroundColor = newValue;
				this._popup.style.borderColor = newValue;
				this._popup.className = lightOrDark(newValue);
			});
		else if(attributeName == "symbol")
			this._componentReady.then(() => {
				this._marker.innerHTML = newValue;

				if(newValue)
					this._marker.style.backgroundColor = "transparent";
			});
		else if(attributeName == "title")
			this._componentReady.then(() => {
				this._marker.setAttribute("title", newValue);
			});
		else if(attributeName == "hidden-siblinbgs-count")
			this._componentReady.then(() => {
				this._hiddenSiblingsMarker.innerText = "+" + newValue;
			});
		else if(attributeName == "id")
			this._componentReady.then(() => {
				this._popupHeaderLabel.innerText = newValue;
			});
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._hiddenSiblingsMarker = this.shadowRoot.querySelector("#hidden-siblings-marker");
		this._marker = this.shadowRoot.querySelector("#marker");
		this._marker.addEventListener("click", this._onClickMarker.bind(this));
		this._closeButton = this.shadowRoot.querySelector("#close-button");
		this._closeButton.addEventListener("click", this._onClickCloseButton.bind(this));
		this._popup = this.shadowRoot.querySelector("#popup");
		this._popupHeader = this.shadowRoot.querySelector("#popup-header");
		this._popupHeaderLabel = this.shadowRoot.querySelector("#popup-header-label");
		this._popupHeaderLink = this.shadowRoot.querySelector("#popup-header-link");
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		this._closeButton.setAttribute("title", this._translateString("Close"));
	}

	/**
	 * 
	 */
	get beginTime() {
		return this._beginTime;
	}
	
	/**
	 * 
	 */
	get endTime() {
		if(this._endTime != undefined)
			return this._endTime;
		else
			return this._beginTime;
	}

	/**
	 * 
	 */
	get isVisible() {
		return ((this._isVisible == undefined) || this._isVisible);
	}
	
	/**
	 * 
	 */
	_onClickCloseButton(event) {
		event.preventDefault();

		if(this.selected)
			this.classList.remove("selected");
	}

	/**
	 * 
	 */
	_onClickMarker(event) {
		event.preventDefault();
		this._toggleSelect();
	}

	/**
	 * 
	 */
	get selected() {
		return this.classList.contains("selected");
	}

	/**
	 * 
	 */
	_toggleSelect() {
		if(!this.selected) {
			let select_event = new CustomEvent("select-timeline-event", {bubbles: true});

			if(this.dispatchEvent(select_event)) {
				// @TODO positionnement automatique de la popup
				this.classList.add("selected");
			}
		}
		else
			this.classList.remove("selected");
	}

	/**
	 * 
	 */
	static compareEventsOrder(eventA, eventB) {
		if(eventA.beginTime < eventB.beginTime)
			return -1;
		else if(eventA.beginTime > eventB.beginTime)
			return 1;
		else {
			if(eventA.endTime > eventB.endTime)
				return -1;
			else if(eventA.endTime < eventB.endTime)
				return 1;
			else {
				if(eventA.id < eventB.id)
					return -1;
				else if(eventA.id > eventB.id)
					return 1;
				else 
					return 0;
			}
		}
	}
}

customElements.define('ktbs4la2-timeline-event', KTBS4LA2TimelineEvent);