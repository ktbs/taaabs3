import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

import "../ktbs4la2-document-header/ktbs4la2-document-header.js";
import {lightOrDark} from "../common/colors-utils.js";

export class KTBS4LA2TimelineEvent extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true, false);
		this._requestUpdatePopupPositionBindedFunction = this._requestUpdatePopupPosition.bind(this);
	}

	/**
	 * 
	 */
	get parentTimeline() {
		if(!this._parentTimeline)
			this._parentTimeline = this.closest("ktbs4la2-timeline"); 
		
		return this._parentTimeline;
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

				this._popupHeader.style.backgroundColor = newValue;
				this._popupBody.style.borderColor = newValue;
				this._popupArrow.style.borderColor = newValue;
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
		this._popupArrow = this.shadowRoot.querySelector("#popup-arrow");
		this._popupHeader = this.shadowRoot.querySelector("#popup-header");
		this._popupBody = this.shadowRoot.querySelector("#popup-body");
		this._popupContent = this.shadowRoot.querySelector("#popup-content");
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
	_requestUpdatePopupPosition() {
		if(this._requestUpdatePopupPositionID)
			clearTimeout(this._requestUpdatePopupPositionID);

		this._requestUpdatePopupPositionID = setTimeout(() => {
			this._positionPopup();
			this._requestUpdatePopupPositionID = null;
		});
	} 

	/**
	 * 
	 */
	_positionPopup() {
		if(this.selected) {
			if(this.parentTimeline) {
				let parentTimeDiv = this.parentTimeline._timeDiv;
				let parentWindow = this.parentTimeline._displayWindow;

				if(parentTimeDiv && parentWindow) {
					let eventLeftStyle = this.style.left;
					
					if(eventLeftStyle.charAt(eventLeftStyle.length - 1) == '%') {
						let eventLeft = parseFloat(eventLeftStyle.substring(0, eventLeftStyle.length - 1));
						
						if(!isNaN(eventLeft)) {
							let eventBottomStyle = this.style.bottom;

							if(eventBottomStyle.substring(eventBottomStyle.length - 2) == "px") {
								let eventBottom = parseFloat(eventBottomStyle.substring(0, eventBottomStyle.length - 2));
								
								if(!isNaN(eventBottom)) {
									this._popupContent.style.removeProperty("max-height");
									this._popupContent.style.removeProperty("max-width");
									this._popup.style.removeProperty("right");
									this._popup.style.removeProperty("left");
									this._popup.style.removeProperty("bottom");
									this._popupArrow.style.removeProperty("right");
									this._popupArrow.style.removeProperty("left");
									this._popupArrow.style.removeProperty("bottom");
									let parentTimeDivWidth = parentTimeDiv.clientWidth;
									let parentWindowWidth = parentWindow.clientWidth;
									let parentWindowHeight = parentWindow.clientHeight;
									let parentWindowScroll = parentWindow.scrollLeft;
									let availableSpaceAtLeft = ((eventLeft / 100) * parentTimeDivWidth) - parentWindowScroll;
									let availableSpaceAtRight = parentWindowWidth - (availableSpaceAtLeft + this._marker.clientWidth);
									let popupWidth = this._popup.clientWidth;
									let popupHeight = this._popup.clientHeight;

									if((availableSpaceAtRight >= (popupWidth + 1)) || (availableSpaceAtLeft >= (popupWidth + 1))) {
										if(availableSpaceAtRight >= (popupWidth + 1)) {
											// display popup at right
											this._popup.style.left = (this._marker.clientWidth + 5) + "px";
											this._popupArrow.className = "right";
											this._popupArrow.style.left = (this._marker.clientWidth) + "px";
										}
										else {
											// display popup at left
											this._popup.style.right = (this.clientWidth + 5) + "px";
											this._popupArrow.className = "left";
											this._popupArrow.style.right = (this.clientWidth) + "px";
										}

										let popupBottom = 2;

										if((popupHeight + 2) > parentWindowHeight) {
											// popup is too tall to fit in the timeline's display window
											popupBottom = (-eventBottom) + 2;
											let maxPopupContentHeight = (parentWindowHeight - 45)
											this._popupContent.style.maxHeight = maxPopupContentHeight + "px";
										}
										else if((eventBottom + popupBottom + popupHeight) > (parentWindowHeight - 1)) {
											// popup can fit in the timeline's display window, but we have to lower it down
											popupBottom = (parentWindowHeight - 1) - (eventBottom + popupHeight);
										}

										this._popup.style.bottom = popupBottom + "px";
									}
									else {
										let availableSpaceAtTop = parentWindowHeight - (eventBottom + this._marker.clientHeight);

										if((availableSpaceAtTop >= (popupHeight + 2)) || (eventBottom <= availableSpaceAtTop)) {
											// display popup above the marker
											this._popup.style.bottom = (this._marker.clientHeight + 9) + "px";

											if(availableSpaceAtTop < (popupHeight + 2))
												this._popupContent.style.maxHeight = (availableSpaceAtTop - 51) + "px";

											this._popupArrow.style.bottom = (this._marker.clientHeight + 3) + "px";
											this._popupArrow.className = "above";
										}
										else {
											// display popup below the marker
											if(popupHeight > (eventBottom - 2)) {
												this._popup.style.bottom = (-eventBottom) + 2 + "px";
												this._popupContent.style.maxHeight = (eventBottom - 45) + "px";
											}

											this._popupArrow.style.bottom = "-2px";
											this._popupArrow.className = "below";
										}

										if(popupWidth > (parentWindowWidth - 2)) {
											// popup is too wide to fit in the timeline's display window
											this._popupContent.style.maxWidth = (parentWindowWidth - 15) + "px";
											this._popup.style.left = (-availableSpaceAtLeft) + "px";
										}
										else if(popupWidth > (availableSpaceAtRight - 1)) {
											// popup can fit in the timeline's display window, but we have to shift it left
											this._popup.style.left = (availableSpaceAtRight - (popupWidth + 3)) + "px";
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	/**
	 * 
	 */
	_toggleSelect() {
		if(!this.selected) {
			let select_event = new CustomEvent("select-timeline-event", {bubbles: true});

			if(this.dispatchEvent(select_event)) {
				this.classList.add("selected");
				this._positionPopup();

				if(this.parentTimeline) {
					this.parentTimeline._displayWindow.addEventListener("scroll", this._requestUpdatePopupPositionBindedFunction);
					this._timelineResizeObserver = new ResizeObserver(this._requestUpdatePopupPositionBindedFunction);
					this._timelineResizeObserver.observe(this.parentTimeline._widgetContainer);
				}
			}
		}
		else {
			this.parentTimeline._displayWindow.removeEventListener("scroll", this._requestUpdatePopupPositionBindedFunction);
			this._timelineResizeObserver.disconnect();
			this.classList.remove("selected");
		}
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