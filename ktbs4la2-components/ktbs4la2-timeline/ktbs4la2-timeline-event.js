import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

class KTBS4LA2TimelineEvent extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url);

		this._rowIsOverflow = false;
		this._posXIsOverflow = false;

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
		observedAttributes.push("row");
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
		else if(attributeName == "row")
			this._onUpdateRow(newValue);
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
		this.addEventListener("mousedown", this._onMouseDown.bind(this));
	}

	_onMouseDown(event) {
		event.stopPropagation();
	}

	/**
	 * 
	 */
	connectedCallback() {
		super.connectedCallback();
		this._parentTimeline = this.closest("ktbs4la2-timeline");
		
		if(this._parentTimeline) {
			this._resolveParentTimelineKnown();
			this._parentTimeline.addEventListener("update-represented-time", this._onParentTimelineUpdateRepresentedTime.bind(this));
		}
		else {
			this._rejectParentTimelineKnown();
			this.emitErrorEvent(new Error("Element of type ktbs4la2-timeline-event must be nested in a parent element of type ktbs4la2-timeline"));
		}
	}

	/**
	 * 
	 */
	_onParentTimelineUpdateRepresentedTime(event) {
		this._adjustWidth();
		this._adjustPosX();
	}

	/**
	 * 
	 */
	_onUpdateRow(newRowString) {
		let newRowInt = parseInt(newRowString);

		if(isNaN(newRowInt)) {
			this._rowIsOverflow = true;
			this._updateSlot();
		}
		else {
			this._componentReady.then(() => {
				this._container.style.bottom = (newRowInt * 15) + "px";

				this._parentTimelineKnown.then(() => {
					this._rowIsOverflow = newRowInt > this._parentTimeline._maxDisplayableRows;
					this._updateSlot();
				});
			});
		}
	}

	/**
	 * 
	 */
	_updateSlot() {
		if(this.getAttribute("row") && !this._rowIsOverflow && !this._posXIsOverflow) {
			if(this.getAttribute("slot") != "visible")
				this.setAttribute("slot", "visible");
		}
		else {
			if(this.getAttribute("slot"))
				this.removeAttribute("slot");
		}
	}

	/**
	 * 
	 */
	_adjustWidth() {
		if(this.getAttribute("begin") && this.getAttribute("end")) {
			this._parentTimelineKnown.then(() => {
				this._parentTimeline._timeDivisionsInitialized.then(() => {
					let eventDuration = parseInt(this.getAttribute("end")) - parseInt(this.getAttribute("begin"));
					let timelineDuration = this._parentTimeline._lastRepresentedTime - this._parentTimeline._firstRepresentedTime;
					let eventPercentageWidth = (eventDuration / timelineDuration) * 100;

					this._componentReady.then(() => {
						this._container.style.width = eventPercentageWidth + "%";
					});
				});
			});
		}
	}

	/**
	 * 
	 */
	_adjustPosX() {
		this._parentTimelineKnown.then(() => {
			this._parentTimeline._timeDivisionsInitialized.then(() => {
				let timelineBegin = this._parentTimeline._firstRepresentedTime;
				let timeOffset = this.getAttribute("begin") - timelineBegin;

				if(timeOffset >= 0) {
					let timelineEnd = this._parentTimeline._lastRepresentedTime;
					let timelineDuration = timelineEnd - timelineBegin;
					let posX = (timeOffset / timelineDuration) * 100;

					if(posX <= 100) {
						this._posXIsOverflow = false;
						this._updateSlot();

						this._componentReady.then(() => {
							this._container.style.left = posX + "%";
						});
					}
					else {
						this._posXIsOverflow = true;
						this._updateSlot();
					}
				}
				else {
					this._posXIsOverflow = true;
					this._updateSlot();
				}
			});
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

		if(!this.classList.contains("selected")) {
			this.classList.add("selected");
			let select_event = new CustomEvent("select-timeline-event", {bubbles: true});
			this.dispatchEvent(select_event);
		}
		else
			this.classList.remove("selected");
	}
}

customElements.define('ktbs4la2-timeline-event', KTBS4LA2TimelineEvent);