import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

import "./ktbs4la2-timeline-histogram-bar-subdivision.js";
import "../ktbs4la2-document-header/ktbs4la2-document-header.js";

/**
 * Gets the number of days in a particular month
 * @param int month the number of the month 
 * @param int year the year
 */
function getNumberOfDaysInMonth(month, year) {
	return new Date(year, month, 0).getDate();
}

export class KTBS4LA2TimelineHistogramBar extends TemplatedHTMLElement {

    /**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true, false);
		this._subdivsObserver = new MutationObserver(this._onSubdivsNodesMutation.bind(this));
		this._subdivsObserver.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["amount"]});
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
	get totalAmount() {
		let totalAmount = 0;
		const childSubdivs = this.querySelectorAll("ktbs4la2-timeline-histogram-bar-subdivision");

		for(let i = 0; i < childSubdivs.length; i++) {
			const childAmount = parseInt(childSubdivs[i].getAttribute("amount"), 10);

			if(!isNaN(childAmount))
				totalAmount += childAmount;
		}

		return totalAmount;
	}

    /**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
        observedAttributes.push("begin");
		observedAttributes.push("end");
		observedAttributes.push("normalized");
		observedAttributes.push("show-duration");
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

			this._componentReady.then(() => {
				this._updatePopupTitle();
			})
			.catch(() => {});
		}
		else if(attributeName == "end") {
			if(newValue != null) {
				this._endTime = parseInt(newValue, 10);

				if(isNaN(this._endTime))
					this.emitErrorEvent(new Error("Cannot parse integer from string : " + newValue));
			}
			else
				this._endTime = undefined;

			this._componentReady.then(() => {
				this._updatePopupTitle();
			})
			.catch(() => {});
		}
		else if(attributeName == "normalized") {
			const childSubdivs = this.querySelectorAll("ktbs4la2-timeline-histogram-bar-subdivision");

			for(let i = 0; i < childSubdivs.length; i++) {
				const aChildSubdiv = childSubdivs[i];

				aChildSubdiv._componentReady.then(() => {
					aChildSubdiv._updateHeight();
				})
				.catch(() => {});
			}
		}
		else if(attributeName == "show-duration") {
			this._componentReady.then(() => {
				this._updatePopupList();
			})
			.catch(() => {});
		}
    }

    /**
	 * 
	 */
	onComponentReady() {
		this._container = this.shadowRoot.querySelector("#container");
		this._container.addEventListener("mousemove", this._onMouseMove.bind(this));
		this._popup = this.shadowRoot.querySelector("#popup");
		this._popupTitle = this.shadowRoot.querySelector("#popup-title");
		this._popupList = this.shadowRoot.querySelector("#popup-list");
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
	get normalized() {
		return (
				this.hasAttribute("normalized")
			&&	(
					(this.hasAttribute("normalized") == "1")
				||	(this.hasAttribute("normalized") == "true")
			)
		);
	}

	/**
	 * 
	 */
	set normalized(new_value) {
		if(typeof(new_value) === "boolean") {
			if(new_value)
				this.setAttribute("normalized", "true");
			else if(this.hasAttribute("normalized"))
				this.removeAttribute("normalized");
		}
		else
			throw new TypeError("The value for property \"normalized\" must be a boolean");
	}

	/**
	 * 
	 */
	 get showDuration() {
		return (
				this.hasAttribute("show-duration")
			&&	(
					(this.hasAttribute("show-duration") == "1")
				||	(this.hasAttribute("show-duration") == "true")
			)
		);
	}

	/**
	 * 
	 */
	set showDuration(new_value) {
		if(typeof(new_value) === "boolean") {
			if(new_value)
				this.setAttribute("show-duration", "true");
			else if(this.hasAttribute("show-duration"))
				this.removeAttribute("show-duration");
		}
		else
			throw new TypeError("The value for property \"showDuration\" must be a boolean");
	}

	/**
	 * 
	 */
	_updatePopupTitle() {
		let title = "";

		if(this.beginTime && this.endTime) {
			const beginDate = new Date(this.beginTime);
			const endDate = new Date(this.endTime);

			// test if the bar represents a whole year
			if(beginDate.getFullYear() == endDate.getFullYear()) {
				if(
					(
							(beginDate.getMonth() == 0) 
						&&	(beginDate.getDate() == 1)
						&&	(beginDate.getHours() == 0)
						&&	(beginDate.getMinutes() == 0)
						&&	(beginDate.getSeconds() == 0)
						&&	(beginDate.getMilliseconds() == 0)
					)
					&&	(
							(endDate.getMonth() == 11) 
						&&	(endDate.getDate() == 31)
						&&	(endDate.getHours() == 23)
						&&	(endDate.getMinutes() == 59)
						&&	(endDate.getSeconds() == 59)
						&&	(endDate.getMilliseconds() == 999)
					)
				)
					title = beginDate.getFullYear();
				else {
					// test if the bar represents a whole month
					if(beginDate.getMonth() == endDate.getMonth()) {
						if(
							(
									(beginDate.getDate() == 1)
								&&	(beginDate.getHours() == 0)
								&&	(beginDate.getMinutes() == 0)
								&&	(beginDate.getSeconds() == 0)
								&&	(beginDate.getMilliseconds() == 0)
							)
							&&	(
									(endDate.getDate() == getNumberOfDaysInMonth(beginDate.getMonth() + 1, beginDate.getYear()))
								&&	(endDate.getHours() == 23)
								&&	(endDate.getMinutes() == 59)
								&&	(endDate.getSeconds() == 59)
								&&	(endDate.getMilliseconds() == 999)
							)
						)
							title = this._translateString(KTBS4LA2TimelineHistogramBar.monthNames[beginDate.getMonth() + 1]) + " " + beginDate.getFullYear();
						else {
							// test if the bar represents a whole day
							if(beginDate.getDate() == endDate.getDate()) {
								if(
									(
											(beginDate.getHours() == 0)
										&&	(beginDate.getMinutes() == 0)
										&&	(beginDate.getSeconds() == 0)
										&&	(beginDate.getMilliseconds() == 0)
									)
									&&	(
											(endDate.getHours() == 23)
										&&	(endDate.getMinutes() == 59)
										&&	(endDate.getSeconds() == 59)
										&&	(endDate.getMilliseconds() == 999)
									)
								)
									title = beginDate.toLocaleString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});
								else if(this.beginTime == this.endTime) // test if the bar represents a single millisecond
									title = beginDate.toLocaleTimeString(undefined, {year: 'numeric', month: 'long', day: 'numeric'}) + "." + beginDate.getMilliseconds().toString().padStart(3, '0');
							}
						}
					}
				}
			}

			if(title == "")
				title = this._translateString("From ") +  beginDate.toLocaleTimeString(undefined, {year: 'numeric', month: 'long', day: 'numeric'}) + "." + beginDate.getMilliseconds().toString().padStart(3, '0') + this._translateString(" to ") + endDate.toLocaleTimeString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})+ "." + endDate.getMilliseconds().toString().padStart(3, '0');
		}
		
		this._popupTitle.innerText = title;
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		this._updatePopupTitle();
	}

	/**
	 * 
	 */
	_updatePopupList() {
		// purge list content
		for(let i = this._popupList.childNodes.length - 1; i >= 0; i--)
			this._popupList.childNodes[i].remove();
		// ---

		// rebuild list content
		const childSubdivs = this.querySelectorAll("ktbs4la2-timeline-histogram-bar-subdivision");

		for(let i = 0; i < childSubdivs.length; i++) {
			const aSubdiv = childSubdivs[i];
			const subdivAmount = parseInt(aSubdiv.getAttribute("amount"), 10);

			const listItem = document.createElement("li");
				const marker = document.createElement("a");
					marker.classList.add("marker");

					if(aSubdiv.hasAttribute("symbol")) {
						marker.classList.add("symbol");
						marker.innerText = aSubdiv.getAttribute("symbol");

						if(aSubdiv.hasAttribute("color"))
							marker.style.color = aSubdiv.getAttribute("color");
					}
					else {
						if(aSubdiv.hasAttribute("color"))
							marker.style.backgroundColor = aSubdiv.getAttribute("color");
						else
							marker.style.backgroundColor = "#888";

						if(aSubdiv.hasAttribute("shape"))
							marker.classList.add(aSubdiv.getAttribute("shape").toLowerCase());
						else
							marker.classList.add("duration-bar");
					}
				listItem.appendChild(marker);

				const label = document.createElement("span");
					label.classList.add("label");
					label.innerText = aSubdiv.getAttribute("label") + ": ";
				listItem.appendChild(label);

				const figure = document.createElement("span");
					figure.classList.add("figure");

					if(!this.showDuration)
						figure.innerText = subdivAmount;
					else {
						let rest = subdivAmount;
						const days = Math.floor(rest / (1000*60*60*24));
						rest = rest - days * (1000*60*60*24);
						const hours = Math.floor(rest / (1000*60*60));
						rest = rest - hours * (1000*60*60);
						const minutes = Math.floor(rest / (1000*60));
						rest = rest - minutes * (1000*60);
						const seconds = Math.floor(rest / 1000);
						rest = rest - seconds * (1000);
						const milliseconds = rest;

						const labelParts = [];

						if(days > 0)
							labelParts.push(days + " " + this._translateString("d"));

						if((days > 0) || (hours > 0))
							labelParts.push(hours + " " + this._translateString("h"));

						if((days > 0) || (hours > 0) || (minutes > 0))
							labelParts.push(minutes + " " + this._translateString("m"));

						if((days > 0) || (hours > 0) || (minutes > 0) || (seconds > 0))
							labelParts.push(seconds + " " + this._translateString("s"));

						if((days > 0) || (hours > 0) || (minutes > 0) || (seconds > 0) || (milliseconds > 0))
							labelParts.push(milliseconds + " " + this._translateString("ms"));

						figure.innerText = labelParts.join(", ");
					}

					if(this.normalized) {
						const subdivPercentage = Math.trunc(subdivAmount / this.totalAmount * 10000) / 100;
						figure.innerText += " (" + subdivPercentage + "%)";
					}
				listItem.appendChild(figure);

			this._popupList.appendChild(listItem);
		}
	}

	/**
	 * 
	 */
	_requestUpdatePopupList() {
		if(this._requestUpdatePopupListTaskID)
			clearTimeout(this._requestUpdatePopupListTaskID);

		this._requestUpdatePopupListTaskID = setTimeout(() => {
			this._componentReady.then(() => {
				this._updatePopupList();
			})
			.catch(() => {});

			delete this._requestUpdatePopupListTaskID;
		});
	}

	/**
	 * 
	 */
	_onSubdivsNodesMutation(mutationRecords, observer) {
		this._requestUpdatePopupList();
	}

	/**
	 * 
	 */
	_requestUpdatePopupPosition(event) {
		if(this._requestUpdatePopupPositionTaskID)
			clearTimeout(this._requestUpdatePopupPositionTaskID);

		this._requestUpdatePopupPositionTaskID = setTimeout(() => {
			this._componentReady.then(() => {
				const containerRect = this._container.getBoundingClientRect();
				const popupRect = this._popup.getBoundingClientRect();
				let newX = event.clientX - containerRect.left + 5;
				
				if((containerRect.left + newX + popupRect.width) > this.parentTimeline._displayWindow.clientWidth)
					newX = event.clientX - containerRect.left - (popupRect.width + 5);
				
				let newY = event.clientY - containerRect.top + 5;
				
				if((newY + popupRect.height) > containerRect.height)
					newY = containerRect.height - popupRect.height;

				this._popup.style.left = newX + "px";
				this._popup.style.top = newY + "px";
			})

			delete this._requestUpdatePopupPositionTaskID;
		})
	}

	/**
	 * 
	 */
	_onMouseMove(event) {
		event.preventDefault();
		event.stopPropagation();
		this._requestUpdatePopupPosition(event);
	}
}

KTBS4LA2TimelineHistogramBar.monthNames = {
	1: "Jan.",
	2: "Feb.",
	3: "Mar.",
	4: "Apr.",
	5: "May",
	6: "June",
	7: "July",
	8: "Aug.",
	9: "Sep.",
	10: "Oct.",
	11: "Nov.",
	12: "Dec."
};

customElements.define('ktbs4la2-timeline-histogram-bar', KTBS4LA2TimelineHistogramBar);