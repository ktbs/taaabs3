import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

import "../ktbs4la2-document-header/ktbs4la2-document-header.js";

class KTBS4LA2TimelineEvent extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url);

		this._rowIsOverflow = true;
		this._posXIsOverflow = true;
		this._beginTime = null;
		this._endTime = null;
		this._isVisible = null;

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
		observedAttributes.push("row");
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
			this._beginTime = null;
			this._updatePosX();
		}
		else if(attributeName == "end") {
			this._endTime = null;

			if(this.hasAttribute("begin")) {
				this._updatePosX();
			}
		}
		else if(attributeName == "row") {
			this._updateRow();
		}
		else if(attributeName == "visible") {
			this._isVisible = null;
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
	connectedCallback() {
		super.connectedCallback();
		this._parentTimeline = this.closest("ktbs4la2-timeline");
		
		if(this._parentTimeline) {
			this._resolveParentTimelineKnown();
			this._parentTimeline.addEventListener("update-represented-time", this._updatePosX.bind(this), false);
			this._parentTimeline.addEventListener("update-max-displayable-rows", this._updateRow.bind(this), false);
		}
		else {
			this._rejectParentTimelineKnown();
			this.emitErrorEvent(new Error("Element of type ktbs4la2-timeline-event must be nested in a parent element of type ktbs4la2-timeline"));
		}
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._container = this.shadowRoot.querySelector("#container");
		this._hiddenSiblingsMarker = this.shadowRoot.querySelector("#hidden-siblings-marker");
		this._marker = this.shadowRoot.querySelector("#marker");
		this._marker.addEventListener("click", this._onClickMarker.bind(this));
		this._popupDiv = this.shadowRoot.querySelector("#popup");
		this._closeButton = this.shadowRoot.querySelector("#close-button");
		this._closeButton.addEventListener("click", this._onClickCloseButton.bind(this));
		this.addEventListener("mousedown", this._onMouseDown.bind(this));
	}

	/**
	 * 
	 */
	get beginTime() {
		if(this._beginTime == null) {
			if(this.hasAttribute("begin")) {
				let beginTimeInt = parseInt(this.getAttribute("begin"));

				if(!isNaN(beginTimeInt))
					this._beginTime = beginTimeInt;
				else
					throw new Error("Cannot parse integer from string : " + this.getAttribute("begin"));
			}
			else
				this._beginTime = undefined;
		}

		return this._beginTime;
	}
	

	/**
	 * 
	 */
	get endTime() {
		if(this._endTime == null) {
			if(this.hasAttribute("end")) {
				let endTimeInt = parseInt(this.getAttribute("end"));

				if(!isNaN(endTimeInt))
					this._endTime = endTimeInt;
				else
					throw new Error("Cannot parse integer from string : " + this.getAttribute("end"));
			}
			else
				this._endTime = this.beginTime;
		}

		return this._endTime;
	}

	/**
	 * 
	 */
	get isVisible() {
		if(this._isVisible == null) {
			this._isVisible = (
					!this.hasAttribute("visible")
				|| 	(
						(this.getAttribute("visible") != "0")
					&&	(this.getAttribute("visible") != "false")
				)
			);
		}

		return this._isVisible;
	}

	/**
	 * 
	 */
	get posXIsOverflow() {
		return this._posXIsOverflow;
	}

	/**
	 * 
	 */
	set posXIsOverflow(newValue) {
		if(this._posXIsOverflow != newValue) {
			this._posXIsOverflow = newValue;

			if(newValue == true) {
				this._componentReady.then(() => {
					if(!this._container.classList.contains("posx-is-overflow"))
						this._container.classList.add("posx-is-overflow");
				});
			}
			else {
				this._componentReady.then(() => {
					if(this._container.classList.contains("posx-is-overflow"))
						this._container.classList.remove("posx-is-overflow");
				});
			}

			//this._updateSlot();
		}
	}

	/**
	 * 
	 */
	get rowIsOverflow() {
		return this._rowIsOverflow;
	}

	/**
	 * 
	 */
	set rowIsOverflow(newValue) {
		if(this._rowIsOverflow != newValue) {
			this._rowIsOverflow = newValue;

			if(newValue == true) {
				this._componentReady.then(() => {
					if(!this._container.classList.contains("row-is-overflow"))
						this._container.classList.add("row-is-overflow");
				});
			}
			else {
				this._componentReady.then(() => {
					if(this._container.classList.contains("row-is-overflow"))
						this._container.classList.remove("row-is-overflow");
				});

				this._updatePosX();
			}

			//this._updateSlot();
		}
	}

	/**
	 * 
	 */
	_updatePosX() {
		if(!this.rowIsOverflow && this.isVisible) {
			this._parentTimelineKnown.then(() => {
				this._parentTimeline._timeDivisionsInitialized.then(() => {
					this.posXIsOverflow = (this.beginTime < this._parentTimeline._firstRepresentedTime) || (this.endTime > this._parentTimeline._lastRepresentedTime);

					if(!this.posXIsOverflow) {
						let timelineBegin = this._parentTimeline._firstRepresentedTime;
						let timeOffset = this.beginTime - timelineBegin;
						let timelineEnd = this._parentTimeline._lastRepresentedTime;
						let timelineDuration = timelineEnd - timelineBegin;
						let posX = (timeOffset / timelineDuration) * 100;

						this._componentReady.then(() => {
							this._container.style.left = posX + "%";
						});

						if(this.hasAttribute("end") && (!this.hasAttribute("shape") || (this.getAttribute("shape") == "duration-bar"))) {
							let eventDuration = this.endTime - this.beginTime;
							let timelineDuration = this._parentTimeline._lastRepresentedTime - this._parentTimeline._firstRepresentedTime;
							let eventPercentageWidth = (eventDuration / timelineDuration) * 100;

							this._componentReady.then(() => {
								this._container.style.width = eventPercentageWidth + "%";
							});
						}
					}

					//this._updateSlot();
				});
			});
		}
	}

	/**
	 * 
	 */
	_updateRow() {
		if(this.hasAttribute("row")) {
			let newRowInt = parseInt(this.getAttribute("row"));

			if(!isNaN(newRowInt)) {
				this._parentTimelineKnown.then(() => {
					this.rowIsOverflow = (newRowInt > (this._parentTimeline._maxDisplayableRows - 1));
					
					this._componentReady.then(() => {
						this._container.style.bottom = (newRowInt * 15) + "px";
					});
				});
			}
			else
				throw new Error("Invalid value for row attribute : must be an integer");
		}
		else
			this.rowIsOverflow = true;
	}

	/**
	 * 
	 */
	/*_updateSlot() {
		if(!this.rowIsOverflow && !this._posXIsOverflow && this.isVisible) {
			if(this.getAttribute("slot") != "visible")
				this.setAttribute("slot", "visible");
		}
		else {
			if(this.hasAttribute("slot"))
				this.removeAttribute("slot");
		}
	}*/
	
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

	/**
	 * 
	 */
	_onMouseDown(event) {
		event.stopPropagation();
	}
}

customElements.define('ktbs4la2-timeline-event', KTBS4LA2TimelineEvent);