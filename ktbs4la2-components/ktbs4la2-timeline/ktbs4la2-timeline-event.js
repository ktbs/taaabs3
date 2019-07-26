import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

class KTBS4LA2TimelineEvent extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url);

		this._resolveParentTimelineKnown;
		this._rejectParentTimelineKnown;

		this._parentTimelineKnown = new Promise((resolve, reject) => {
			this._resolveParentTimelineKnown = resolve;
			this._rejectParentTimelineKnown = reject;
		});
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push("begin");
		observedAttributes.push("end")
		observedAttributes.push("href");
		observedAttributes.push("color");
		observedAttributes.push("title");
		return observedAttributes;
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);
		
		if(attributeName == "begin")
			this._componentReady.then(() => {
				this._adjustPosX();
				this._adjustWidth();
			});
		else if(attributeName == "end")
			this._componentReady.then(() => {
				this._adjustWidth();
			});
		else if(attributeName == "href")
			this._componentReady.then(() => {
				this._marker.setAttribute("href", newValue);
			});
		else if(attributeName == "color")
			this._componentReady.then(() => {
				this._marker.style.backgroundColor = newValue;
			});
		else if(attributeName == "title")
			this._componentReady.then(() => {
				this._marker.setAttribute("title", newValue);
			});
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._container = this.shadowRoot.querySelector("#container");
		this._marker = this.shadowRoot.querySelector("#marker");
		this._marker.addEventListener("click", this._onClickMarker.bind(this));
		this._popupDiv = this.shadowRoot.querySelector("#popup");
		this._closeButton = this.shadowRoot.querySelector("#close-button");
		this._closeButton.addEventListener("click", this._onClickCloseButton.bind(this));
	}

	/**
	 * 
	 */
	connectedCallback() {
		super.connectedCallback();
		this._parentTimeline = this.closest("ktbs4la2-timeline");
		
		if(this._parentTimeline) {
			this._resolveParentTimelineKnown();
		}
		else {
			this._rejectParentTimelineKnown();
			this.emitErrorEvent(new Error("Element of type ktbs4la2-timeline-event must be nested in a parent element of type ktbs4la2-timeline"));
		}
	}

	/**
	 * 
	 */
	_adjustWidth() {
		if(this.getAttribute("begin") && this.getAttribute("end") && (this._parentTimeline)) {
			let eventDuration = parseInt(this.getAttribute("end")) - parseInt(this.getAttribute("begin"));
			let timelineDuration = this._parentTimeline._lastRepresentedTime - this._parentTimeline._firstRepresentedTime;
			let eventPercentageWidth = (eventDuration / timelineDuration) * 100;
			this._container.style.width = eventPercentageWidth + "%";
		}
	}

	/**
	 * 
	 */
	_adjustPosX() {
		this._parentTimelineKnown.then(() => {
			let timeOffset = this.getAttribute("begin") - this._parentTimeline._firstRepresentedTime;
			let timelineDuration = this._parentTimeline._lastRepresentedTime - this._parentTimeline._firstRepresentedTime;
			let posX = (timeOffset / timelineDuration) * 100;
			this._container.style.left = posX + "%";
		});
	}
	
	/**
	 * 
	 */
	_onClickCloseButton(event) {
		event.preventDefault();

		if(this.classList.contains("selected"))
			this.classList.remove("selected");
	}

	/**
	 * 
	 */
	_onClickMarker(event) {
		event.preventDefault();

		if(!this.classList.contains("selected"))
			this.classList.add("selected");
		else
			this.classList.remove("selected");
	}
}

customElements.define('ktbs4la2-timeline-event', KTBS4LA2TimelineEvent);