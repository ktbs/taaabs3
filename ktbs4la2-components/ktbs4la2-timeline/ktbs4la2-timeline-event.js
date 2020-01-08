import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

import "../ktbs4la2-document-header/ktbs4la2-document-header.js";

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
		//observedAttributes.push("row");
		observedAttributes.push("visible");
		observedAttributes.push("href");
		observedAttributes.push("color");
		observedAttributes.push("symbol");
		observedAttributes.push("title");
		observedAttributes.push("hidden-siblinbgs-count");
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
		/*else if(attributeName == "row") {
			if(newValue != null)
				this.style.bottom = (parseInt(newValue, 10) * 15) + "px";
		}*/
		else if(attributeName == "visible") {
			this._isVisible = !((newValue == "0") || (newValue == "false"));
		}
		else if(attributeName == "href")
			this._componentReady.then(() => {
				this._marker.setAttribute("href", newValue);
			});
		else if(attributeName == "color")
			this._componentReady.then(() => {
				if(this.hasAttribute("symbol")) {
					this._marker.style.color = newValue;
					this._marker.style.backgroundColor = "transparent";
				}
				else
					this._marker.style.backgroundColor = newValue;
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
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._hiddenSiblingsMarker = this.shadowRoot.querySelector("#hidden-siblings-marker");
		this._marker = this.shadowRoot.querySelector("#marker");
		this._closeButton = this.shadowRoot.querySelector("#close-button");
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
	get selected() {
		return this.classList.contains("selected");
	}

	/**
	 * 
	 */
	toggleSelect(event) {
		if(!this.selected) {
			this.classList.add("selected");
			let select_event = new CustomEvent("select-timeline-event", {bubbles: true});
			this.dispatchEvent(select_event);
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