import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";
import "./ktbs4la2-timeline-event.js";

/**
 * 
 */
function isLeapYear(year) {
	return (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0));
}

/**
 * Gets the number of days in a particular year
 * @param int year
 * @return int
 */
function getNumberOfDaysInYear(year) {
	return isLeapYear(year) ? 366 : 365;
}

/**
 * 
 */
function isEvenStartingYear(year) {
	if(isLeapYear(year)) {
		return ((year % 8) == 0);
	}
	else {
		let nextLeapYear = year + 1;

		while(!isLeapYear(nextLeapYear))
			nextLeapYear++;

		let leapYearDelta = nextLeapYear - year;
		
		if(isEvenStartingYear(nextLeapYear))
			return (leapYearDelta % 2 == 0);
		else
			return (leapYearDelta % 2 != 0);
	}
}

/**
 * 
 */
function getDayRankInYear(year, month, day) {
	let rank = 0;

	for(let i = 1; i < month; i++)
		rank += getNumberOfDaysInMonth(i, year);

	rank += day;

	return rank;
}

/**
 * Gets the number of days in a particular month
 * @param int month the number of the month 
 * @param int year the year
 */
function getNumberOfDaysInMonth(month, year) {
	return new Date(year, month, 0).getDate();
}

/**
 * 
 */
class KTBS4LA2TimelineSubdivision extends HTMLElement {

	/**
	 * 
	 */
	constructor() {
		super();
		this._unit = null;
		this._beginTime = null;
		this._endTime = null;
	}

	/**
	 * Gets the time unit of a time division node
	 * @return string the time unit (can be one of "year", "month", "day", "hour", "tenminutes", "minute", "tenseconds", "second", "ahundredmilliseconds", "tenmilliseconds",  or "millisecond"
	 */
	_getUnit() {
		if(this._unit == null) {
			for(let i = 0; i < this.classList.length; i++) {
				let className = this.classList[i];

				if(className.substring(0,14) == "time-division-") {
					this._unit = className.substring(14);
					break;
				}
			}
		}

		return this._unit;
	}

	/**
	 * 
	 */
	_getBeginTime() {
		if(this._beginTime == null) {
			if(this.classList.contains("subdivided")) {
				let firstSubDiv = this.querySelector(":scope > .time-division");

				if(firstSubDiv)
					this._beginTime = firstSubDiv._getBeginTime();
				else
					throw new Error("The time div is marked as subdivided and yet does not have children subdivisions");
			}
			else {
				let divisionType = this._getUnit();
				let dateString;
				
				switch(divisionType) {
					case "year":
						dateString = this.getAttribute("id") + "-01-01T00:00:00.000";
						break;
					case "month":
						dateString = this.getAttribute("id") + "-01T00:00:00.000";
						break;
					case "day":
						dateString = this.getAttribute("id") + "T00:00:00.000";
						break;
					case "hour":
						dateString = this.getAttribute("id").substring(0,10) + "T" + this.getAttribute("id").substring(11,13) +":00:00.000";
						break;
					case "tenminutes":
						dateString = this.getAttribute("id").substring(0,10) + "T" + this.getAttribute("id").substring(11,13) +":" + this.getAttribute("id").substring(14,15) + "0:00.000";
						break;
					case "minute":
						dateString = this.getAttribute("id").substring(0,10) + "T" + this.getAttribute("id").substring(11,13) +":" + this.getAttribute("id").substring(14,15) + this.getAttribute("id").substring(16,17) + ":00.000";
						break;
					case "tenseconds":
						dateString = this.getAttribute("id").substring(0,10) + "T" + this.getAttribute("id").substring(11,13) +":" + this.getAttribute("id").substring(14,15) + this.getAttribute("id").substring(16,17) + ":" + this.getAttribute("id").substring(18,19) + "0" + ".000";
						break;
					case "second":
						dateString = this.getAttribute("id").substring(0,10) + "T" + this.getAttribute("id").substring(11,13) +":" + this.getAttribute("id").substring(14,15) + this.getAttribute("id").substring(16,17) + ":" + this.getAttribute("id").substring(18,19) + this.getAttribute("id").substring(20,21) + ".000";
						break;
					case "ahundredmilliseconds":
						dateString = this.getAttribute("id").substring(0,10) + "T" + this.getAttribute("id").substring(11,13) +":" + this.getAttribute("id").substring(14,15) + this.getAttribute("id").substring(16,17) + ":" + this.getAttribute("id").substring(18,19) + this.getAttribute("id").substring(20,21) + "." + this.getAttribute("id").substring(22,23) + "00";
						break;
					case "tenmilliseconds":
						dateString = this.getAttribute("id").substring(0,10) + "T" + this.getAttribute("id").substring(11,13) +":" + this.getAttribute("id").substring(14,15) + this.getAttribute("id").substring(16,17) + ":" + this.getAttribute("id").substring(18,19) + this.getAttribute("id").substring(20,21) + "." + this.getAttribute("id").substring(22,23) + this.getAttribute("id").substring(24,25) + "0";
						break;
					case "millisecond":
						dateString = this.getAttribute("id").substring(0,10) + "T" + this.getAttribute("id").substring(11,13) +":" + this.getAttribute("id").substring(14,15) + this.getAttribute("id").substring(16,17) + ":" + this.getAttribute("id").substring(18,19) + this.getAttribute("id").substring(20,21) + "." + this.getAttribute("id").substring(22,23) + this.getAttribute("id").substring(24,25) + this.getAttribute("id").substring(26,27);
						break;
				}

				let dateObject = new Date(dateString);
				this._beginTime = dateObject.getTime();
			}
		}

		return this._beginTime;
	}

	/**
	 * 
	 */
	_getEndTime() {
		if(this._endTime == null) {
			if(this.classList.contains("subdivided")) {
				let allSubDivs = this.querySelectorAll(":scope > .time-division");

				if(allSubDivs.length > 0) {
					let lastSubDiv = allSubDivs[allSubDivs.length - 1];
					this._endTime = lastSubDiv._getEndTime();
				}
				else
					throw new Error("The time div is marked as subdivided and yet does not have children subdivisions");
			}
			else {
				let divisionType = this._getUnit();
				let dateString;
				
				switch(divisionType) {
					case "year":
						dateString = this.getAttribute("id") + "-12-31T23:59:59.999";
						break;
					case "month":
						let year = parseInt(this.getAttribute("id").substring(0, 4));
						let month = parseInt(this.getAttribute("id").substring(5, 7));
						dateString = this.getAttribute("id") + "-" + getNumberOfDaysInMonth(month, year) + "T23:59:59.999";
						break;
					case "day":
						dateString = this.getAttribute("id") + "T23:59:59.999";
						break;
					case "hour":
						dateString = this.getAttribute("id").substring(0,10) + "T" + this.getAttribute("id").substring(11,13) +":59:59.999";
						break;
					case "tenminutes":
						dateString = this.getAttribute("id").substring(0,10) + "T" + this.getAttribute("id").substring(11,13) +":" + this.getAttribute("id").substring(14,15) + "9:59.999";
						break;
					case "minute":
						dateString = this.getAttribute("id").substring(0,10) + "T" + this.getAttribute("id").substring(11,13) +":" + this.getAttribute("id").substring(14,15) + this.getAttribute("id").substring(16,17) + ":59.999";
						break;
					case "tenseconds":
						dateString = this.getAttribute("id").substring(0,10) + "T" + this.getAttribute("id").substring(11,13) +":" + this.getAttribute("id").substring(14,15) + this.getAttribute("id").substring(16,17) + ":" + this.getAttribute("id").substring(18,19) + "9" + ".999";
						break;
					case "second":
						dateString = this.getAttribute("id").substring(0,10) + "T" + this.getAttribute("id").substring(11,13) +":" + this.getAttribute("id").substring(14,15) + this.getAttribute("id").substring(16,17) + ":" + this.getAttribute("id").substring(18,19) + this.getAttribute("id").substring(20,21) + ".999";
						break;
					case "ahundredmilliseconds":
						dateString = this.getAttribute("id").substring(0,10) + "T" + this.getAttribute("id").substring(11,13) +":" + this.getAttribute("id").substring(14,15) + this.getAttribute("id").substring(16,17) + ":" + this.getAttribute("id").substring(18,19) + this.getAttribute("id").substring(20,21) + "." + this.getAttribute("id").substring(22,23) + "99";
						break;
					case "tenmilliseconds":
						dateString = this.getAttribute("id").substring(0,10) + "T" + this.getAttribute("id").substring(11,13) +":" + this.getAttribute("id").substring(14,15) + this.getAttribute("id").substring(16,17) + ":" + this.getAttribute("id").substring(18,19) + this.getAttribute("id").substring(20,21) + "." + this.getAttribute("id").substring(22,23) + this.getAttribute("id").substring(24,25) + "9";
						break;
					case "millisecond":
						dateString = this.getAttribute("id").substring(0,10) + "T" + this.getAttribute("id").substring(11,13) +":" + this.getAttribute("id").substring(14,15) + this.getAttribute("id").substring(16,17) + ":" + this.getAttribute("id").substring(18,19) + this.getAttribute("id").substring(20,21) + "." + this.getAttribute("id").substring(22,23) + this.getAttribute("id").substring(24,25) + this.getAttribute("id").substring(26,27);
						break;
				}

				let dateObject = new Date(dateString);
				this._endTime = (dateObject.getTime() + 1);
			}
		}

		return this._endTime;
	}
}

customElements.define('ktbs4la2-timeline-subdivision', KTBS4LA2TimelineSubdivision);

/**
 * 
 */
class KTBS4LA2Timeline extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url);

		this._beginTime = null;
		this._endTime = null;
		this._eventCountsPerTime = new Array();

		this._firstRepresentedTime;
		this._lastRepresentedTime;
		this._currentLevelDivWidth;

		this._bindedDragDisplayWindowFunction = this._onDragDisplayWindow.bind(this);
		this._bindedStopDraggingDisplayWindowFunction = this._onStopDraggingDisplayWindow.bind(this);
		this._displayWindowIsBeingDragged = false;
		this._displayWindowDragMouseTime;

		this._watchScroll = true;
		this._requestedScrollAmount = 0;
		this._scrollRequestID = null;
		this._bindedDragScrollBarCursorFunction = this._onDragScrollBarCursor.bind(this);
		this._bindedStopDraggingScrollBarCursorFunction = this._onStopDraggingScrollBarCursor.bind(this);
		this._scrollBarDragOrigin;
		this._dragScrollBarCursorUpdateViewID = null;
		this._scrollLeftButtonPressedIntervalID = null;
		this._scrollRightButtonPressedIntervalID = null;

		this._updateEventsRowsDelay = 250;
		this._requestUpdateEventsRowsID = null;
		this._requestZoomIncrementID = null;
		this._requestedZoomIncrementAmount = 0;
		this._requestedZoomMouseRelativeX = null;
		this._requestedZoomMouseTime = null;
		this._requestUpdateTimeDivisionsID = null;
		this._updateTimeDivisionsDelay = 250;
		this._maxDisplayableRows = null;
		this._requestUnsetZoomCursorID = null;
		this._requestUnsetZoomCursorDelay = 300;

		this._onDisplayWindowChangeHeightID = null;
		this._onDisplayWindowChangeWidthID = null;
		this._isZoomedOut = null;

		this._lastKnownDisplayWindowWidth = null;
		this._lastKnownDisplayWindowHeight = null;

		this._resolveBeginSet;
		this._rejectBeginSet;

		this._beginSet = new Promise(function(resolve, reject) {
			this._resolveBeginSet = resolve;
			this._rejectBeginSet = reject;
		}.bind(this));

		this._resolveEndSet;
		this._rejectEndSet;

		this._endSet = new Promise(function(resolve, reject) {
			this._resolveEndSet = resolve;
			this._rejectEndSet = reject;
		}.bind(this));

		this._resolveTimeDivisionsInitialized;
		this._rejectTimeDivisionsInitialized;

		this._timeDivisionsInitialized = new Promise(function(resolve, reject) {
			this._resolveTimeDivisionsInitialized = resolve;
			this._rejectTimeDivisionsInitialized = reject;
		}.bind(this));

		Promise.all([this._beginSet, this._endSet])
			.then(function() {
				this._componentReady.then(() => {
					this._initTimeDivisions();
					this._initZoom();
				});
			}.bind(this))
			.catch(function() {
				this.emitErrorEvent(new Error("Missing required attribute \"begin\" and/or \"end\""));
			}.bind(this));

		this._eventsSortedUntilRank = 0;
		this._eventsNodesObserver = new MutationObserver(this._onEventsNodesMutation.bind(this));
		this._eventsNodesObserver.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["visible"]});
		
		this.addEventListener("select-timeline-event", this._onSelectTimelineEvent.bind(this));
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push("begin");
		observedAttributes.push("end");
		observedAttributes.push("auto-sort-events");
		return observedAttributes;
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);
		
		if(attributeName == "begin")
			this._resolveBeginSet();
		else if(attributeName == "end")
			this._resolveEndSet();
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._widgetContainer = this.shadowRoot.querySelector("#widget-container");

		this._timeDiv = this.shadowRoot.querySelector("#time");
		this._eventsDiv = this.shadowRoot.querySelector("#events");
		this._displayWindow = this.shadowRoot.querySelector("#display-window");
		this._displayWindow.addEventListener("wheel", this._onMouseWheel.bind(this), { passive: false });
		this._displayWindow.addEventListener("mousedown", this._onDisplayWindowMouseDown.bind(this));
		this._displayWindow.addEventListener("scroll", this._onScroll.bind(this));
		this._scrollBar = this.shadowRoot.querySelector("#scrollbar");
		this._scrollBarBackground = this.shadowRoot.querySelector("#scrollbar-background");
		this._scrollBarBackground.addEventListener("click", this._onClickScrollBarBackGround.bind(this));
		this._scrollBarCursor = this.shadowRoot.querySelector("#scrollbar-cursor");
		this._scrollBarCursor.addEventListener("mousedown", this._onScrollBarCursorMouseDown.bind(this));
		
		this._dezoomButton = this.shadowRoot.querySelector("#dezoom-button");
		this._dezoomButton.addEventListener("click", this._onClickDezoomButton.bind(this));

		this._scrollLeftButton = this.shadowRoot.querySelector("#scroll-left-button");
		this._scrollLeftButton.addEventListener("mousedown", this._onScrollLeftButtonMouseDown.bind(this));
		this._scrollLeftButton.addEventListener("mouseup", this._onScrollLeftButtonMouseUp.bind(this));
		this._scrollLeftButton.addEventListener("mouseout", this._onScrollLeftButtonMouseUp.bind(this));
		
		this._scrollRightButton = this.shadowRoot.querySelector("#scroll-right-button");
		this._scrollRightButton.addEventListener("mousedown", this._onScrollRightButtonMouseDown.bind(this));
		this._scrollRightButton.addEventListener("mouseup", this._onScrollRightButtonMouseUp.bind(this));
		this._scrollRightButton.addEventListener("mouseout", this._onScrollRightButtonMouseUp.bind(this));

		try {
			let displayWindowResizeObserver = new ResizeObserver(this._onResizeWidgetContainer.bind(this));
			displayWindowResizeObserver.observe(this._widgetContainer);
		}
		catch(error) {
			this.emitErrorEvent(error);
		}

		this._updateIsEmpty();
	}

	/**
	 * 
	 */
	_onResizeWidgetContainer(entries, observer) {
		if(this._lastKnownDisplayWindowHeight != this._displayWindow.clientHeight) {		
			this._lastKnownDisplayWindowHeight = this._displayWindow.clientHeight;

			if(this._onDisplayWindowChangeHeightID != null)
				clearTimeout(this._onDisplayWindowChangeHeightID);

			this._onDisplayWindowChangeHeightID = setTimeout(() => {
				this._updateMaxDisplayableRows();
				this._onDisplayWindowChangeHeightID = null;
			});
		}

		if(this._lastKnownDisplayWindowWidth != this._displayWindow.clientWidth) {
			this._lastKnownDisplayWindowWidth = this._displayWindow.clientWidth;

			if(this._onDisplayWindowChangeWidthID != null)
				clearTimeout(this._onDisplayWindowChangeWidthID);

			this._onDisplayWindowChangeWidthID = setTimeout(() => {
				this._timeDivisionsInitialized.then(() => {
					this._initZoomParams();

					if(this._isZoomedOut == true) {
						this._setWidthRules(this._initialLevel, this._initialDivWidth);
						this._requestUpdateEventsRows();
					}
					
					this._updateScrollBarCursor();
					this._updateScrollBarContent();
				});

				this._onDisplayWindowChangeWidthID = null;
			});
		}
	}

	/**
	 * 
	 */
	_updateMaxDisplayableRows() {
		this._componentReady.then(() => {
			let widgetHeight = this._displayWindow.getBoundingClientRect().height;

			this._timeDivisionsInitialized.then(() => {
				let currentLevel = this._widgetContainer.className;
				let availableHeightForEvents;
				
				switch(currentLevel) {
					case "year" :
						availableHeightForEvents = widgetHeight - 25;
						break;
					case "month" :
						availableHeightForEvents = widgetHeight - 45;
						break;
					case "day" :
						availableHeightForEvents = widgetHeight - 65;
						break;
					case "hour" :
						availableHeightForEvents = widgetHeight - 85;
						break;
					case "tenminutes" :
						availableHeightForEvents = widgetHeight - 105;
						break;
					case "minute" :
						availableHeightForEvents = widgetHeight - 105;
						break;
					case "tenseconds" :
						availableHeightForEvents = widgetHeight - 125;
						break;
					case "second" :
						availableHeightForEvents = widgetHeight - 125;
						break;
					case "ahundredmilliseconds" :
						availableHeightForEvents = widgetHeight - 145;
						break;
					case "tenmilliseconds" :
						availableHeightForEvents = widgetHeight - 145;
						break;
					case "millisecond" :
						availableHeightForEvents = widgetHeight - 145;
						break;
				}
				
				let newMaxDisplayableRows = Math.floor(availableHeightForEvents / 15);
				
				if(newMaxDisplayableRows != this._maxDisplayableRows) {
					this._maxDisplayableRows = newMaxDisplayableRows;
					this.dispatchEvent(new CustomEvent("update-max-displayable-rows"));
					this._requestUpdateEventsRows();
				}
			});
		});
	}

	/**
	 * 
	 */
	_onSelectTimelineEvent(event) {
		let timelineEventID = event.target.getAttribute("id");
		let previouslySelectedEvents = this.querySelectorAll("ktbs4la2-timeline-event.selected:not([id = \"" + timelineEventID + "\"])");

		for(let i = 0; i < previouslySelectedEvents.length; i++)
			previouslySelectedEvents[i].classList.remove("selected");
	}

	/**
	 * 
	 */
	_getAllEventNodes() {
		return this.querySelectorAll("ktbs4la2-timeline-event");
	}

	/**
	 *
	 */
	_getViewBeginTime() {
		let totalTime = this._lastRepresentedTime - this._firstRepresentedTime;
		let timeOverWidthRatio = totalTime / this._timeDiv.clientWidth;
		let leftBorderTimeOffsetTime = this._displayWindow.scrollLeft * timeOverWidthRatio;
		return (this._firstRepresentedTime + leftBorderTimeOffsetTime);
	}

	/**
	 * 
	 */
	_getViewEndTime() {
		let totalTime = this._lastRepresentedTime - this._firstRepresentedTime;
		let timeOverWidthRatio = totalTime / this._timeDiv.clientWidth;
		let rightBorderTimeOffsetTime = (this._displayWindow.scrollLeft + this._displayWindow.clientWidth) * timeOverWidthRatio;
		return (this._firstRepresentedTime + rightBorderTimeOffsetTime);
	}

	/**
	 * 
	 */
	get beginTime() {
		if(!this._beginTime) {
			let firstInitialTimeDiv = this._timeDiv.querySelector(".time-division-" + this._initialLevel);
			this._beginTime = firstInitialTimeDiv._getBeginTime();
		}

		return this._beginTime;
	}

	/**
	 * 
	 */
	get endTime() {
		if(!this._endTime) {
			let allInitialTimeDivs = this._timeDiv.querySelectorAll(".time-division-" + this._initialLevel);

			if(allInitialTimeDivs.length > 0) {
				let lastInitialTimeDiv = allInitialTimeDivs[allInitialTimeDivs.length - 1];
				this._endTime = lastInitialTimeDiv._getEndTime();
			}
		}

		return this._endTime;
	}

	/**
	 * 
	 */
	_sortEventNodes() {
		let eventNodes = this._getAllEventNodes();
		let sortedUntil = this._eventsSortedUntilRank;
		let inversionProcessed;

		do {
			inversionProcessed = false;
			let firstInversion = null;

			for(let i = sortedUntil; i < (eventNodes.length - 2); i++)
				if(parseInt(eventNodes[i].getAttribute("begin")) > parseInt(eventNodes[i+1].getAttribute("begin"))) {
					eventNodes[i].before(eventNodes[i+1]);
					let temp = eventNodes[i];
					eventNodes[i] = eventNodes[i+1];
					eventNodes[i+1] = temp;
					inversionProcessed = true;

					if(firstInversion == null)
						firstInversion = i;
				}

			sortedUntil = firstInversion;
		} while(inversionProcessed);

		this._eventsSortedUntilRank = eventNodes.length;
	}

	/**
	 * 
	 */
	_updateIsEmpty() {
		let eventCount = this._getAllEventNodes().length;

		if(eventCount > 0) {
			if(this._displayWindow.classList.contains("empty"))
				this._displayWindow.classList.remove("empty");
		}
		else {
			if(!this._displayWindow.classList.contains("empty"))
				this._displayWindow.classList.add("empty");
		}
	}

	/**
	 * 
	 */
	_onEventsNodesMutation(mutationRecords, observer) {
		let addedOrRemovedEvent = false;
		let changedEventVisibility = false;

		for(let i = 0; (i < mutationRecords.length) && (!addedOrRemovedEvent || !changedEventVisibility); i++) {
			let currentMutationRecord = mutationRecords[i];

			if(currentMutationRecord.type == "childList") {
				let addedNodes = currentMutationRecord.addedNodes;
		
				for(let i = 0; (i < addedNodes.length) && !(addedOrRemovedEvent); i++) {
					let addedNode = addedNodes[i];

					if(addedNode.localName == "ktbs4la2-timeline-event")
						addedOrRemovedEvent = true;
				}

				let removedNodes = currentMutationRecord.removedNodes;
		
				for(let i = 0; (i < removedNodes.length) && !(addedOrRemovedEvent); i++) {
					let removedNode = removedNodes[i];

					if(removedNode.localName == "ktbs4la2-timeline-event")
						addedOrRemovedEvent = true;
				}
			}
			else if(	(currentMutationRecord.type == "attributes")
					&&	(currentMutationRecord.target.localName == "ktbs4la2-timeline-event")
					&&	(currentMutationRecord.attributeName == "visible"))
						changedEventVisibility = true;
				
		}

		if(addedOrRemovedEvent) {
			this._componentReady.then(() => {
				setTimeout(() => {
					this._updateIsEmpty();
					this._sortEventNodes();
					this._updateScrollBarContent();
					this._requestUpdateEventsRows();
				});
			});
		}
		else if(changedEventVisibility)
			this._componentReady.then(() => {
				this._requestUpdateEventsRows();
			});
	}

	/**
	 * 
	 */
	_updateEventsRows() {
		this._timeDivisionsInitialized.then(() => {
			let timeLineDuration = this._lastRepresentedTime - this._firstRepresentedTime;
			let availableWidth = this._timeDiv.clientWidth;
			let timeOverWidthRatio = timeLineDuration / availableWidth;
			
			if(!isNaN(timeOverWidthRatio)) {
				let pixelsBeginThreshold = 15;
				let timeBeginThreshold = timeOverWidthRatio * pixelsBeginThreshold;
				let pixelsEndThreshold = 1;
				let timeEndThreshold = timeOverWidthRatio * pixelsEndThreshold;
				let previousEventsPerRow = new Array();
				let previousEventsTimePerRow = new Array();
				let minDisplayableTime = this._firstRepresentedTime;
				let events = this.querySelectorAll("ktbs4la2-timeline-event:not([visible = \"false\"]):not([visible = \"0\"])");

				// we browse all visible events
				for(let i = 0; i < events.length; i++) {
					let currentEvent = events[i];
					let currentEventTime = currentEvent.beginTime;
					let availableRow = null;

					if(currentEventTime >= minDisplayableTime) {
						// we browse the "previousEventsPerRow" Array
						for(let j = 0; (availableRow == null) && (j <= (this._maxDisplayableRows - 1)) && (j < previousEventsPerRow.length); j++) {
							let previousEvent = previousEventsPerRow[j];

							if(previousEvent.hasAttribute("shape") && (previousEvent.getAttribute("shape") != "duration-bar")) {
								let previousEventTime = previousEvent.beginTime;
								let timeDelta = currentEventTime - previousEventTime;

								if(timeDelta >= timeBeginThreshold)
									availableRow = j;
							}
							else {
								let previousEventBeginTime = previousEvent.beginTime;
								let previousEventEndTime = previousEvent.endTime;

								let timeBeginDelta = currentEventTime - previousEventBeginTime;
								let timeEndDelta = currentEventTime - previousEventEndTime;

								if((timeBeginDelta >= timeBeginThreshold) && (timeEndDelta > timeEndThreshold))
									availableRow = j;
							}
						}
					}

					if(availableRow == null)
						availableRow = previousEventsPerRow.length;

					if(!currentEvent.hasAttribute("row") || (parseInt(currentEvent.getAttribute("row")) != availableRow))
						currentEvent.setAttribute("row", availableRow);

					if(availableRow <= (this._maxDisplayableRows - 1)) {
						if(currentEvent.hasAttribute("hidden-siblinbgs-count"))
							currentEvent.removeAttribute("hidden-siblinbgs-count");

						previousEventsPerRow[availableRow] = currentEvent;
						previousEventsTimePerRow[availableRow] = currentEventTime;

						if(previousEventsPerRow.length >= this._maxDisplayableRows)
							minDisplayableTime = Math.min(...previousEventsTimePerRow) + timeBeginThreshold;
					}
					else if(previousEventsPerRow.length > 0) {
						let lastVisibleEvent = previousEventsPerRow[previousEventsPerRow.length - 1];

						if(lastVisibleEvent.hasAttribute("hidden-siblinbgs-count")) {
							let hiddenSiblingsCount = parseInt(lastVisibleEvent.getAttribute("hidden-siblinbgs-count"));
							hiddenSiblingsCount++;
							lastVisibleEvent.setAttribute("hidden-siblinbgs-count", hiddenSiblingsCount);
						}
						else
							lastVisibleEvent.setAttribute("hidden-siblinbgs-count", "1");
					}
				}
			}
			else
				throw new Error("Could not determine time/width ratio");
		});
	}

	/**
	 * 
	 */
	_updateScrollBarCursor() {
		let timeDivOffsetTime = this._firstRepresentedTime - this.beginTime;
		let timeDivTimeOverWidthRatio = (this._lastRepresentedTime - this._firstRepresentedTime) / this._timeDiv.clientWidth;
		
		let viewBeginOffsetTime = timeDivOffsetTime + (this._displayWindow.scrollLeft * timeDivTimeOverWidthRatio);
		let viewEndOffsetTime = timeDivOffsetTime + ((this._displayWindow.scrollLeft + this._displayWindow.clientWidth) * timeDivTimeOverWidthRatio);

		let totalTimeDuration = this.endTime - this.beginTime;
		let scrollBarWidth = this._scrollBar.clientWidth;
		let scrollBarTimeOverWidthRatio = totalTimeDuration / scrollBarWidth;
		let cursorLeft = viewBeginOffsetTime / scrollBarTimeOverWidthRatio;

		let viewDuration = viewEndOffsetTime - viewBeginOffsetTime;
		let cursorWidth = viewDuration / scrollBarTimeOverWidthRatio;

		if(cursorWidth > (scrollBarWidth - cursorLeft))
			cursorWidth = (scrollBarWidth - cursorLeft);

		if(cursorWidth < 1) {
			cursorWidth = 1;

			if(!this._scrollBarCursor.classList.contains("view-too-small"))
				this._scrollBarCursor.classList.add("view-too-small");
		}
		else {
			if(this._scrollBarCursor.classList.contains("view-too-small"))
				this._scrollBarCursor.classList.remove("view-too-small");
		}

		this._scrollBarCursor.style.width = Math.round(cursorWidth) + "px";
		this._scrollBarCursor.style.left = (cursorLeft - 2) + "px";
	}

	/**
	 * 
	 */
	_onScroll(event) {
		event.preventDefault();

		if(this._watchScroll != false) {
			this._requestUpdateTimeDivisions();
			this._updateScrollBarCursor();
		}
		else
			this._watchScroll = true;

		this._updateScrollButtons();
	}

	/**
	 * 
	 */
	_updateScrollButtons() {
		if(this._beginIsInView()) {
			if(!this._scrollLeftButton.hasAttribute("disabled"))
				this._scrollLeftButton.setAttribute("disabled", "");
		}
		else {
			if(this._scrollLeftButton.hasAttribute("disabled"))
				this._scrollLeftButton.removeAttribute("disabled");
		}

		if(this._endIsInView()) {
			if(!this._scrollRightButton.hasAttribute("disabled"))
				this._scrollRightButton.setAttribute("disabled", "");
		}
		else {
			if(this._scrollRightButton.hasAttribute("disabled"))
				this._scrollRightButton.removeAttribute("disabled");
		}

		if(this._beginIsInView() && this._endIsInView()) {
			this._isZoomedOut = true;

			if(!this._dezoomButton.hasAttribute("disabled"))
				this._dezoomButton.setAttribute("disabled", "");

			if(this._scrollBar.classList.contains("scrollable"))
				this._scrollBar.classList.remove("scrollable");
		}
		else {
			if(this._dezoomButton.hasAttribute("disabled"))
				this._dezoomButton.removeAttribute("disabled");
		}
	}

	/**
	 * 
	 */
	_setSilentScroll(newValue) {
		this._watchScroll = false;
		this._displayWindow.scrollLeft = newValue;
	}

	/**
	 * 
	 */
	_requestUpdateTimeDivisions() {
		if(this._requestUpdateTimeDivisionsID != null)
			clearTimeout(this._requestUpdateTimeDivisionsID);

		this._requestUpdateTimeDivisionsID = setTimeout(() => {
			let viewBeginTime = this._getViewBeginTime();
			let viewEndTime = this._getViewEndTime();
			this._updateTimeDivisions(viewBeginTime, viewEndTime);
			let widthOverTimeRatio = this._timeDiv.clientWidth / (this._lastRepresentedTime - this._firstRepresentedTime);
			let newTimeOffset = viewBeginTime - this._firstRepresentedTime;
			let newScrollLeft = newTimeOffset * widthOverTimeRatio;
			this._setSilentScroll(newScrollLeft);
			this._requestUpdateTimeDivisionsID = null;
		}, this._updateTimeDivisionsDelay);
	}

	_updateViewSubdivisions(fromTime, toTime) {
		let units = Object.keys(KTBS4LA2Timeline.minDivisionWidthPerUnit);
		let currentUnitRank = units.indexOf(this._widgetContainer.className);

		for(let i = 0; i < currentUnitRank; i++) {
			let selector = "";
			
			for(let j = 0; j <= i; j++) {
				let unit = units[j];
				selector += ".time-division-" + unit + ":not(.overflow)";

				if(j < i)
					selector += " > ";
				else
					selector += ":not(.subdivided)";
			}
			
			let dividableTimeDivs = this._timeDiv.querySelectorAll(selector);
			
			for(let j = 0; j < dividableTimeDivs.length; j++) {
				let aSubDiv = dividableTimeDivs[j];
				
				if((aSubDiv._getEndTime() > fromTime) && (aSubDiv._getBeginTime() < toTime)) {
					let subDivUnit = units[i];
					let childrenUnit = units[i+1];
					let begin, end;

					switch(subDivUnit) {
						case "year":
							begin = 1;
							end = 12;
							break;
						case "month":
							begin = 1;
							let month = parseInt(aSubDiv.getAttribute("id").substring(5,7));
							let year = parseInt(aSubDiv.getAttribute("id").substring(0,4));
							end = getNumberOfDaysInMonth(month, year);
							break;
						case "day":
							begin = 0;
							end = 23;
							break;
						case "hour":
							begin = 0;
							end = 5;
							break;
						case "tenminutes":
							begin = 0;
							end = 9;
							break;
						case "minute":
							begin = 0;
							end = 5;
							break;
						case "tenseconds":
							begin = 0;
							end = 9;
							break;
						case "second":
							begin = 0;
							end = 9;
							break;
						case "ahundredmilliseconds":
							begin = 0;
							end = 9;
							break;
						case "tenmilliseconds":
							begin = 0;
							end = 9;
							break;
					}

					this._instanciateSubdivisions(begin, end, childrenUnit, aSubDiv);
				}
			}
		}
	}

	/**
	 * 
	 */
	_setViewBegin(newViewBegin) {
		if(newViewBegin < this.beginTime)
			newViewBegin = this.beginTime;

		let newViewEnd = newViewBegin + (this._displayWindow.clientWidth * ((this._lastRepresentedTime - this._firstRepresentedTime) / this._timeDiv.clientWidth));

		if(newViewEnd > this.endTime)
			newViewEnd = this.endTime;

		this._updateTimeDivisions(newViewBegin, newViewEnd);
		let viewWidthOverTimeRatio = this._timeDiv.clientWidth / (this._lastRepresentedTime - this._firstRepresentedTime);
		let timeOffset = newViewBegin - this._firstRepresentedTime;
		let newTimeDivScroll = timeOffset * viewWidthOverTimeRatio;
		this._setSilentScroll(newTimeDivScroll);
		this._updateScrollBarCursor();
	}

	/**
	 * 
	 */
	_onDisplayWindowMouseDown(event) {
		event.preventDefault();

		if(this._displayWindow.classList.contains("scrollable")) {
			this._displayWindowIsBeingDragged = true;
			let relativeMousePosX = event.offsetX - this._displayWindow.scrollLeft;
			this._displayWindowDragMouseTime = this._getMouseTime(relativeMousePosX);
			
			if(!this._displayWindow.classList.contains("scrolled"))
				this._displayWindow.classList.add("scrolled");

			this._displayWindow.addEventListener("mousemove", this._bindedDragDisplayWindowFunction, true);
			window.document.addEventListener("mouseup", this._bindedStopDraggingDisplayWindowFunction, true);
		}
	}

	/**
	 * 
	 */
	_onDragDisplayWindow(event) {
		event.preventDefault();
		let relativeMousePosX = event.offsetX - this._displayWindow.scrollLeft;
		let widthOverTimeRatio = this._timeDiv.clientWidth / (this._lastRepresentedTime - this._firstRepresentedTime);
		let mouseTimeOffset = this._displayWindowDragMouseTime - this._firstRepresentedTime;
		let newMouseAbsoluteX = mouseTimeOffset * widthOverTimeRatio;
		let newScrollLeft = newMouseAbsoluteX - relativeMousePosX;
		this._displayWindow.scrollLeft = newScrollLeft;
	}

	/**
	 * 
	 */
	_onStopDraggingDisplayWindow(event) {
		event.preventDefault();
		this._displayWindow.removeEventListener("mousemove", this._bindedDragDisplayWindowFunction, true);
		window.document.removeEventListener("mouseup", this._bindedStopDraggingDisplayWindowFunction, true);

		if(this._displayWindow.classList.contains("scrolled"))
			this._displayWindow.classList.remove("scrolled");

		this._displayWindowIsBeingDragged = false;
		this._displayWindowDragMouseTime = null;
	}

	/**
	 * 
	 */
	_onScrollBarCursorMouseDown(event) {
		event.preventDefault();

		if(this._scrollBar.classList.contains("scrollable")) {
			if(!this._scrollBarCursor.classList.contains("scrolled"))
				this._scrollBarCursor.classList.add("scrolled");

			this._scrollBarDragOrigin = event.clientX;
			let scrollBarCursorLeftValue = this._scrollBarCursor.style.left;
			this._scrollBarCursorOrigin = parseFloat(scrollBarCursorLeftValue.substring(0, scrollBarCursorLeftValue.length - 2));
			this._scrollBarDragViewBeginOrigin = this._getViewBeginTime();
			window.document.addEventListener("mousemove", this._bindedDragScrollBarCursorFunction, true);
			window.document.addEventListener("mouseup", this._bindedStopDraggingScrollBarCursorFunction, true);
		}
	}

	/**
	 * 
	 */
	_onDragScrollBarCursor(event) {
		event.preventDefault();
		let mouseXDelta = event.clientX - this._scrollBarDragOrigin;
		let totalDuration = this.endTime - this.beginTime;
		let scrollBarTimeOverWidthRatio = totalDuration / this._scrollBar.clientWidth;
		let newScrollBarCursorLeft = this._scrollBarCursorOrigin + mouseXDelta;

		if(this._dragScrollBarCursorUpdateViewID != null)
			clearTimeout(this._dragScrollBarCursorUpdateViewID);

		this._dragScrollBarCursorUpdateViewID = setTimeout(() => {
			let newViewBegin = this._scrollBarDragViewBeginOrigin + (mouseXDelta * scrollBarTimeOverWidthRatio);
			this._setViewBegin(newViewBegin);
			this._dragScrollBarCursorUpdateViewID = null;
		});
	}

	/**
	 * 
	 */
	_onStopDraggingScrollBarCursor(event) {
		event.preventDefault();
		window.document.removeEventListener("mousemove", this._bindedDragScrollBarCursorFunction, true);
		window.document.removeEventListener("mouseup", this._bindedStopDraggingScrollBarCursorFunction, true);

		if(this._scrollBarCursor.classList.contains("scrolled"))
			this._scrollBarCursor.classList.remove("scrolled");
	}

	/**
	 * 
	 */
	_onClickScrollBarBackGround(event) {
		event.preventDefault();
		let mouseX = event.offsetX;
		let totalDuration = this.endTime - this.beginTime;
		let scrollBarTimeOverWidthRatio = totalDuration / this._scrollBar.clientWidth;
		let mouseTime = this.beginTime + (mouseX * scrollBarTimeOverWidthRatio);
		let viewDuration = this._getViewEndTime() - this._getViewBeginTime();
		let newViewBeginTime = mouseTime - (viewDuration / 2);
		this._setViewBegin(newViewBeginTime);
	}

	/**
	 * 
	 */
	_incrementScroll(scrollIncrement) {
		let widthIncrementUnit = 40;
		this._requestedScrollAmount += scrollIncrement;
		let representedDuration = this._lastRepresentedTime - this._firstRepresentedTime;
		let timeOverWidthRatio = representedDuration / this._timeDiv.clientWidth;
		let viewDuration = this._displayWindow.clientWidth * timeOverWidthRatio;

		if(this._scrollRequestID != null)
			clearTimeout(this._scrollRequestID);

		this._scrollRequestID = setTimeout(() => {
			let viewWidthIncrement = widthIncrementUnit * this._requestedScrollAmount;
			let viewTimeIncrement = timeOverWidthRatio * viewWidthIncrement;
			let newViewBeginTime = this._getViewBeginTime() + viewTimeIncrement;
			this._setViewBegin(newViewBeginTime);
			this._scrollRequestID = null;
			this._requestedScrollAmount = 0;
		});
	}

	_beginIsInView() {
		return ((this._firstRepresentedTime <= this.beginTime) && (this._displayWindow.scrollLeft <= 0));
	}

	_endIsInView() {
		return ((this._lastRepresentedTime >= this.endTime) && (Math.ceil(this._displayWindow.scrollLeft) >= Math.floor(this._timeDiv.clientWidth - this._displayWindow.clientWidth)));
	}

	_onClickDezoomButton() {
		this._setWidthRules(this._initialLevel, this._initialDivWidth);
		this._unHideOverflowTimeDivs(this.beginTime, this.endTime);
		this._setSilentScroll(0);
		this._updateRepresentedTime();
		this._updateScrollBarCursor();
		this._updateScrollButtons();
	}

	/**
	 * 
	 */
	_onScrollLeftButtonMouseDown(event) {
		event.preventDefault();
		this._incrementScroll(-1);

		if(this._scrollLeftButtonPressedIntervalID != null)
			clearInterval(this._scrollLeftButtonPressedIntervalID);
		
		this._scrollLeftButtonPressedIntervalID = setInterval(() => {
			if(!this._beginIsInView())
				this._incrementScroll(-1);
			else {
				clearInterval(this._scrollLeftButtonPressedIntervalID);
				this._scrollLeftButtonPressedIntervalID = null;
			}
		}, 50);
	}

	/**
	 * 
	 */
	_onScrollLeftButtonMouseUp(event) {
		event.preventDefault();
		
		if(this._scrollLeftButtonPressedIntervalID != null) {
			clearInterval(this._scrollLeftButtonPressedIntervalID);
			this._scrollLeftButtonPressedIntervalID = null;
		}
	}

	/**
	 * 
	 */
	_onScrollRightButtonMouseDown(event) {
		event.preventDefault();
		this._incrementScroll(1);

		if(this._scrollRightButtonPressedIntervalID != null)
			clearInterval(this._scrollRightButtonPressedIntervalID);

		this._scrollRightButtonPressedIntervalID = setInterval(() => {
			if(!this._endIsInView())
				this._incrementScroll(1);
			else {
				clearInterval(this._scrollRightButtonPressedIntervalID);
				this._scrollRightButtonPressedIntervalID = null;
			}
		}, 50);
	}

	/**
	 * 
	 */
	_onScrollRightButtonMouseUp(event) {
		event.preventDefault();
		
		if(this._scrollRightButtonPressedIntervalID != null) {
			clearInterval(this._scrollRightButtonPressedIntervalID);
			this._scrollRightButtonPressedIntervalID = null;
		}
	}

	/**
	 * 
	 */
	_requestUpdateEventsRows() {
		if(this._requestUpdateEventsRowsID != null)
			clearTimeout(this._requestUpdateEventsRowsID);

		this._requestUpdateEventsRowsID = setTimeout(function() {
			this._updateEventsRows();
			this._requestUpdateEventsID = null;
		}.bind(this), this._updateEventsRowsDelay);
	}

	/**
	 * 
	 */
	_setWidthRules(newLevel, newDivWidth) {
		let css;

		switch(newLevel) {
			case "year":
				css = ".time-division-year.year-366 { width: " + newDivWidth + "px; }\n" +
						".time-division-year.year-365 { width: " + (newDivWidth * 365 / 366) + "px; }";

				break;
			case "month":
				css = ".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 12) + "px; }\n" +
						".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 12 * 365 / 365) + "px; }\n" +
						".time-division-month.month-31 { width: " + newDivWidth + "px; }\n" +
						".time-division-month.month-30 { width: " + (newDivWidth * 30 / 31) + "px; }\n" +
						".time-division-month.month-29 { width: " + (newDivWidth * 29 / 31) + "px; }\n" +
						".time-division-month.month-28 { width: " + (newDivWidth * 28 / 31) + "px; }";

				break;
			case "day":
				css = ".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366) + "px; }\n" +
						".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365) + "px; }\n" +
						".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31) + "px; }\n" +
						".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30) + "px; }\n" +
						".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29) + "px; }\n" +
						".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28) + "px; }\n" +
						".time-division-day { width: " + newDivWidth + "px; }";

				break;
			case "hour":
				css = ".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366 * 24) + "px; }\n" +
						".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365 * 24) + "px; }\n" +
						".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31 * 24) + "px; }\n" +
						".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30 * 24) + "px; }\n" +
						".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29 * 24) + "px; }\n" +
						".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28 * 24) + "px; }\n" +
						".time-division-day:not(.subdivided) { width: " + (newDivWidth * 24) + "px; }\n" +
						".time-division-hour { width: " + newDivWidth + "px; }";

				break;
			case "tenminutes":
				css = ".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366 * 24 * 6) + "px; }\n" +
						".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365 * 24 * 6) + "px; }\n" +
						".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31 * 24 * 6) + "px }\n" +
						".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30 * 24 * 6) + "px; }\n" +
						".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29 * 24 * 6) + "px; }\n" +
						".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28 * 24 * 6) + "px; }\n" +
						".time-division-day:not(.subdivided) { width: " + (newDivWidth * 24 * 6) + "px; }\n" +
						".time-division-hour:not(.subdivided) { width: " + (newDivWidth * 6) + "px; }\n" +
						".time-division-tenminutes { width: " + newDivWidth + "px; }";

				break;
			case "minute":
				css = ".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366 * 24 * 60) + "px; }\n" +
						".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365 * 24 * 60) + "px; }\n" +
						".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31 * 24 * 60) + "px }\n" +
						".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30 * 24 * 60) + "px; }\n" +
						".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29 * 24 * 60) + "px; }\n" +
						".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28 * 24 * 60) + "px; }\n" +
						".time-division-day:not(.subdivided) { width: " + (newDivWidth * 24 * 60) + "px; }\n" +
						".time-division-hour:not(.subdivided) { width: " + (newDivWidth * 60) + "px; }\n" +
						".time-division-tenminutes:not(.subdivided) { width: " + (newDivWidth * 10) + "px; }\n" +
						".time-division-minute { width: " + newDivWidth + "px; }";

				break;
			case "tenseconds":
				css = ".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366 * 24 * 6 * 60) + "px; }\n" +
						".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365 * 24 * 6 * 60) + "px; }\n" +
						".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31 * 24 * 6 * 60) + "px; }\n" +
						".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30 * 24 * 6 * 60) + "px; }\n" +
						".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29 * 24 * 6 * 60) + "px; }\n" +
						".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28 * 24 * 6 * 60) + "px; }\n" +
						".time-division-day:not(.subdivided) { width: " + (newDivWidth * 24 * 6 * 60) + "px; }\n" +
						".time-division-hour:not(.subdivided) { width: " + (newDivWidth * 6 * 60) + "px; }\n" +
						".time-division-tenminutes:not(.subdivided) { width: " + (newDivWidth * 6 * 10) + "px; }\n" +
						".time-division-minute:not(.subdivided) { width: " + (newDivWidth * 6) + "px; }\n" +
						".time-division-tenseconds { width: " + newDivWidth + "px; }";

				break;
			case "second":
				css = ".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366 * 24 * 3600) + "px; }\n" +
						".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365 * 24 * 3600) + "px; }\n" +
						".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31 * 24 * 3600) + "px; }\n" +
						".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30 * 24 * 3600) + "px; }\n" +
						".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29 * 24 * 3600) + "px; }\n" +
						".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28 * 24 * 3600) + "px; }\n" +
						".time-division-day:not(.subdivided) { width: " + (newDivWidth * 24 * 3600) + "px; }\n" +
						".time-division-hour:not(.subdivided) { width: " + (newDivWidth * 3600) + "px; }\n" +
						".time-division-tenminutes:not(.subdivided) { width: " + (newDivWidth * 10 * 60) + "px; }\n" +
						".time-division-minute:not(.subdivided) { width: " + (newDivWidth * 60) + "px; }\n" +
						".time-division-tenseconds:not(.subdivided) { width: " + (newDivWidth * 10) + "px; }\n" +
						".time-division-second { width: " + newDivWidth + "px; }";

				break;
			case "ahundredmilliseconds":
				css = ".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366 * 24 * 3600 * 10) + "px; }\n" +
						".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365 * 24 * 3600 * 10) + "px; }\n" +
						".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31 * 24 * 3600 * 10) + "px; }\n" +
						".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30 * 24 * 3600 * 10) + "px; }\n" +
						".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29 * 24 * 3600 * 10) + "px; }\n" +
						".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28 * 24 * 3600 * 10) + "px; }\n" +
						".time-division-day:not(.subdivided) { width: " + (newDivWidth * 24 * 3600 * 10) + "px; }\n" +
						".time-division-hour:not(.subdivided) { width: " + (newDivWidth * 3600 * 10) + "px; }\n" +
						".time-division-tenminutes:not(.subdivided) { width: " + (newDivWidth * 10 * 60 * 10) + "px; }\n" +
						".time-division-minute:not(.subdivided) { width: " + (newDivWidth * 60 * 10) + "px; }\n" +
						".time-division-tenseconds:not(.subdivided) { width: " + (newDivWidth * 10 * 10) + "px; }\n" +
						".time-division-second:not(.subdivided) { width: " + (newDivWidth * 10) + "px; }\n" +
						".time-division-ahundredmilliseconds { width: " + newDivWidth + "px; }";

				break;
			case "tenmilliseconds":
				css = ".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366 * 24 * 3600 * 100) + "px; }\n" +
						".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365 * 24 * 3600 * 100) + "px; }\n" +
						".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31 * 24 * 3600 * 100) + "px; }\n" +
						".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30 * 24 * 3600 * 100) + "px; }\n" +
						".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29 * 24 * 3600 * 100) + "px; }\n" +
						".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28 * 24 * 3600 * 100) + "px; }\n" +
						".time-division-day:not(.subdivided) { width: " + (newDivWidth * 24 * 3600 * 100) + "px; }\n" +
						".time-division-hour:not(.subdivided) { width: " + (newDivWidth * 3600 * 100) + "px; }\n" +
						".time-division-tenminutes:not(.subdivided) { width: " + (newDivWidth * 10 * 60 * 100) + "px; }\n" +
						".time-division-minute:not(.subdivided) { width: " + (newDivWidth * 60 * 100) + "px; }\n" +
						".time-division-tenseconds:not(.subdivided) { width: " + (newDivWidth * 10 * 100) + "px; }\n" +
						".time-division-second:not(.subdivided) { width: " + (newDivWidth * 100) + "px; }\n" +
						".time-division-ahundredmilliseconds:not(.subdivided) { width: " + (newDivWidth * 10) + "px; }\n" +
						".time-division-tenmilliseconds { width: " + newDivWidth + "px; }";

				break;
			case "millisecond":
				css = ".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366 * 24 * 3600 * 1000) + "px; }\n" +
						".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365 * 24 * 3600 * 1000) + "px; }\n" +
						".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31 * 24 * 3600 * 1000) + "px; }\n" +
						".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30 * 24 * 3600 * 1000) + "px; }\n" +
						".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29 * 24 * 3600 * 1000) + "px; }\n" +
						".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28 * 24 * 3600 * 1000) + "px; }\n" +
						".time-division-day:not(.subdivided) { width: " + (newDivWidth * 24 * 3600 * 1000) + "px; }\n" +
						".time-division-hour:not(.subdivided) { width: " + (newDivWidth * 3600 * 1000) + "px; }\n" +
						".time-division-tenminutes:not(.subdivided) { width: " + (newDivWidth * 10 * 60 * 1000) + "px; }\n" +
						".time-division-minute:not(.subdivided) { width: " + (newDivWidth * 60 * 1000) + "px; }\n" +
						".time-division-tenseconds:not(.subdivided) { width: " + (newDivWidth * 10 * 1000) + "px; }\n" +
						".time-division-second:not(.subdivided) { width: " + (newDivWidth * 1000) + "px; }\n" +
						".time-division-ahundredmilliseconds:not(.subdivided) { width: " + (newDivWidth * 100) + "px; }\n" +
						".time-division-tenmilliseconds:not(.subdivided) { width: " + (newDivWidth * 10) + "px; }\n" +
						".time-division-millisecond { width: " + newDivWidth + "px; }";

				break;
		}

		this.shadowRoot.getElementById("div-width-rules").innerText = css;
		this._widgetContainer.className = newLevel;
		this._currentLevelDivWidth = newDivWidth;
		this._updateMaxDisplayableRows();
	}

	/**
	 * 
	 */
	_instanciateSubdivisions(begin, end, unit, parent) {
		let intanciatedDivisionsCount = 0;

		if(!parent.classList.contains("subdivided")) {
			for(let current = begin; current <= end; current++) {
				let division = document.createElement("ktbs4la2-timeline-subdivision");
				let division_id;
				let even;

				if(unit == "year")
					division_id = current;
				else if((unit == "month") || (unit == "day") || (unit == "hour"))
					division_id = parent.getAttribute("id") + "-" + current.toString().padStart(2, '0');
				else
					division_id = parent.getAttribute("id") + "-" + current.toString();
				
				if(unit == "day") {
					let evenStartingYear;
					let month = parent.getAttribute("id").substring(5, 7);
					let year = parent.parentNode.getAttribute("id");
					let dayRankInYear = getDayRankInYear(year, month, current);

					if(isEvenStartingYear(year))
						even = ((dayRankInYear % 2) == 0);
					else
						even = ((dayRankInYear % 2) != 0);
				}
				else 
					even = ((current % 2) == 0);

				division.setAttribute("id", division_id);
				division.classList.add("time-division");
				division.classList.add("time-division-" + unit);

				if(even)
					division.classList.add("even");
				else
					division.classList.add("odd");

				if(unit == "year") {
					let nbOfDays = getNumberOfDaysInYear(current);
					division.classList.add("year-" + nbOfDays);
				}
				else if(unit == "month") {
					let year = parent.getAttribute("id");
					let month = current;
					let nbOfDays = getNumberOfDaysInMonth(month, year);
					division.classList.add("month-" + nbOfDays);
				}

				let label = document.createElement("span");
				label.classList.add("label");

				let hundreds, tens;

				switch(unit) {
					case "year" :
						label.innerText = current;
						break;
					case "month" :
						label.innerText = this._translateString(KTBS4LA2Timeline.monthNames[current]);
						break;
					case "tenminutes" :
						label.innerText = current.toString() + "0";
						break;
					case "minute" :
						tens = parseInt(parent.getAttribute("id").substring(14,15));
						label.innerText = tens.toString() + current.toString();
						break;
					case "tenseconds" :
						label.innerText = current.toString() + "0";
						break;
					case "second" :
						tens = parseInt(parent.getAttribute("id").substring(18,19));
						label.innerText = tens.toString() + current.toString();
						break;
					case "ahundredmilliseconds" :
						label.innerText = current.toString() + "00";
						break;
					case "tenmilliseconds" :
						hundreds = parseInt(parent.getAttribute("id").substring(22,23));
						label.innerText = hundreds.toString() + current.toString() + "0";
						break;
					case "millisecond" :
						hundreds = parseInt(parent.getAttribute("id").substring(22,23));
						tens = parseInt(parent.getAttribute("id").substring(24,25));
						label.innerText = hundreds.toString() + tens.toString() + current.toString();
						break;
					default :
						label.innerText = current.toString().padStart(2, '0');
						break;
				}

				division.appendChild(label);
				parent.appendChild(division);
				intanciatedDivisionsCount++;
			}

			parent.classList.add("subdivided");
		}

		return intanciatedDivisionsCount;
	}

	/**
	 * Creates the time divisions for the initial view of the timeline, so it fits to the space available for display, with a relevant time granularity
	 */
	_initTimeDivisions() {
		if(this.getAttribute("begin") && this.getAttribute("end")) {
			let beginTime = parseInt(this.getAttribute("begin"));
			let endTime = parseInt(this.getAttribute("end"));

			if((beginTime != NaN) && (endTime != NaN) && (beginTime <= endTime)) {
				let displayableDivCount;
				let lowestFullyInstanciatedLevel = "year";
				let beginDate = new Date(beginTime);
				let endDate = new Date(endTime);
				let availableWidth = this._displayWindow.clientWidth;
				// create the "years" subdivisions
				let lowestLevelntanciatedDivisionsCount = this._instanciateSubdivisions(beginDate.getFullYear(), endDate.getFullYear(), "year", this._timeDiv);

				// calculate how many new subdivisions would be created if we go to "month" level
				let yearDivisions = this._timeDiv.querySelectorAll(".time-division-year");
				let requiredSubDivisionsCount = 0;
				displayableDivCount = Math.floor(availableWidth / KTBS4LA2Timeline.minDivisionWidthPerUnit["month"]);

				for(let i = 0; i < yearDivisions.length; i++) {
					let yearDivision = yearDivisions[i];
					let currentYear = parseInt(yearDivision.getAttribute("id").substring(0,4));
					let beginMonth = (currentYear == beginDate.getFullYear())?(beginDate.getMonth() + 1):1;
					let endMonth = (currentYear == endDate.getFullYear())?(endDate.getMonth() + 1):12;
					let monthDifference = (endMonth - beginMonth) + 1;
					requiredSubDivisionsCount += monthDifference;
				}
				// done

				// if month subdivisions would fit in the display area, create them
				if(requiredSubDivisionsCount <= displayableDivCount) {
					lowestFullyInstanciatedLevel = "month";
					lowestLevelntanciatedDivisionsCount = 0;

					// browse each existing year subdivision ...
					for(let i = 0; i < yearDivisions.length; i++) {
						let yearDivision = yearDivisions[i];
						let currentYear = parseInt(yearDivision.getAttribute("id").substring(0,4));
						let beginMonth = (currentYear == beginDate.getFullYear())?(beginDate.getMonth() + 1):1;
						let endMonth = (currentYear == endDate.getFullYear())?(endDate.getMonth() + 1):12;

						// ... add new month subdivision in the current year subdivision 
						lowestLevelntanciatedDivisionsCount += this._instanciateSubdivisions(beginMonth, endMonth, "month", yearDivision);
					}

					// calculate how many new subdivisions would be created if we go to "day" level
					let monthDivisions = this._timeDiv.querySelectorAll(".time-division-month");
					let requiredSubDivisionsCount = 0;
					displayableDivCount = Math.floor(availableWidth / KTBS4LA2Timeline.minDivisionWidthPerUnit["day"]);
					
					for(let i = 0; i < monthDivisions.length; i++) {
						let monthDivision = monthDivisions[i];
						let currentMonth = parseInt(monthDivision.getAttribute("id").substring(5,7));
						let currentYear = parseInt(monthDivision.getAttribute("id").substring(0,4));
						let daysCountInCurrentMonth = getNumberOfDaysInMonth(currentMonth, currentYear);
						let beginDay = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)))?(beginDate.getDate()):1;
						let endDay = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)))?(endDate.getDate()):daysCountInCurrentMonth;
						let dayDifference = (endDay - beginDay) + 1;
						requiredSubDivisionsCount += dayDifference;
					}
	
					// if days subdivisions would fit in the display area, create them
					if(requiredSubDivisionsCount <= displayableDivCount) {
						lowestFullyInstanciatedLevel = "day";
						lowestLevelntanciatedDivisionsCount = 0;

						// browse each existing month subdivision ...
						for(let i = 0; i < monthDivisions.length; i++) {
							let monthDivision = monthDivisions[i];
							let currentMonth = parseInt(monthDivision.getAttribute("id").substring(5,7));
							let currentYear = parseInt(monthDivision.getAttribute("id").substring(0,4));
							let daysCountInCurrentMonth = getNumberOfDaysInMonth(currentMonth, currentYear);
							let beginDay = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)))?(beginDate.getDate()):1;
							let endDay = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)))?(endDate.getDate()):daysCountInCurrentMonth;

							// ... add new day subdivision in the current month subdivision 
							lowestLevelntanciatedDivisionsCount += this._instanciateSubdivisions(beginDay, endDay, "day", monthDivision);
						}

						// calculate how many new subdivisions would be created if we go to "hour" level
						let dayDivisions = this._timeDiv.querySelectorAll(".time-division-day");
						let requiredSubDivisionsCount = 0;
						displayableDivCount = Math.floor(availableWidth / KTBS4LA2Timeline.minDivisionWidthPerUnit["hour"]);

						for(let i = 0; i < dayDivisions.length; i++) {
							let dayDivision = dayDivisions[i];
							let currentDay = parseInt(dayDivision.getAttribute("id").substring(8,10));
							let currentMonth = parseInt(dayDivision.getAttribute("id").substring(5,7));
							let currentYear = parseInt(dayDivision.getAttribute("id").substring(0,4));
							let beginHour = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == (beginDate.getDate())))?(beginDate.getHours()):0;
							let endHour = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == (endDate.getDate())))?(endDate.getHours()):23;
							let hourDifference = (endHour - beginHour) + 1;
							requiredSubDivisionsCount += hourDifference;
						}

						// if hours subdivisions would fit in the display area, create them
						if(requiredSubDivisionsCount <= displayableDivCount) {
							lowestFullyInstanciatedLevel = "hour";
							lowestLevelntanciatedDivisionsCount = 0;

							// browse each existing month subdivision ...
							for(let i = 0; i < dayDivisions.length; i++) {
								let dayDivision = dayDivisions[i];
								let currentDay = parseInt(dayDivision.getAttribute("id").substring(8,10));
								let currentMonth = parseInt(dayDivision.getAttribute("id").substring(5,7));
								let currentYear = parseInt(dayDivision.getAttribute("id").substring(0,4));
								let beginHour = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == (beginDate.getDate())))?(beginDate.getHours()):0;
								let endHour = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == (endDate.getDate())))?(endDate.getHours()):23;
								
								// ... add new hour subdivision in the current day subdivision
								lowestLevelntanciatedDivisionsCount += this._instanciateSubdivisions(beginHour, endHour, "hour", dayDivision);
							}

							// calculate how many new subdivisions would be created if we go to "tenminutes" level
							let hourDivisions = this._timeDiv.querySelectorAll(".time-division-hour");
							let requiredSubDivisionsCount = 0;
							displayableDivCount = Math.floor(availableWidth / KTBS4LA2Timeline.minDivisionWidthPerUnit["tenminutes"]);

							for(let i = 0; i < hourDivisions.length; i++) {
								let hourDivision = hourDivisions[i];
								let currentHour = parseInt(hourDivision.getAttribute("id").substring(11,13));
								let currentDay = parseInt(hourDivision.getAttribute("id").substring(8,10));
								let currentMonth = parseInt(hourDivision.getAttribute("id").substring(5,7));
								let currentYear = parseInt(hourDivision.getAttribute("id").substring(0,4));
								let beginTenMinute = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()))?Math.floor(beginDate.getMinutes() / 10):0;
								let endTenMinute = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()))?Math.floor(endDate.getMinutes() / 10):5;
								let tenMinutesDifference = (endTenMinute - beginTenMinute) + 1;
								requiredSubDivisionsCount += tenMinutesDifference;
							}

							// if tenminutes subdivisions would fit in the display area, create them
							if(requiredSubDivisionsCount <= displayableDivCount) {
								lowestFullyInstanciatedLevel = "tenminutes";
								lowestLevelntanciatedDivisionsCount = 0;

								for(let i = 0; i < hourDivisions.length; i++) {
									let hourDivision = hourDivisions[i];
									let currentHour = parseInt(hourDivision.getAttribute("id").substring(11,13));
									let currentDay = parseInt(hourDivision.getAttribute("id").substring(8,10));
									let currentMonth = parseInt(hourDivision.getAttribute("id").substring(5,7));
									let currentYear = parseInt(hourDivision.getAttribute("id").substring(0,4));
									let beginTenMinute = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()))?Math.floor(beginDate.getMinutes() / 10):0;
									let endTenMinute = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()))?Math.floor(endDate.getMinutes() / 10):5;
								
									// ... add new minute subdivisions in the current hour subdivision
									lowestLevelntanciatedDivisionsCount += this._instanciateSubdivisions(beginTenMinute, endTenMinute, "tenminutes", hourDivision);
								}

								// calculate how many new subdivisions would be created if we go to "minute" level
								let tenMinutesDivisions = this._timeDiv.querySelectorAll(".time-division-tenminutes");
								let requiredSubDivisionsCount = 0;
								displayableDivCount = Math.floor(availableWidth / KTBS4LA2Timeline.minDivisionWidthPerUnit["minute"]);

								for(let i = 0; i < tenMinutesDivisions.length; i++) {
									let hourDivision = tenMinutesDivisions[i];
									let currentTenMinutes = parseInt(hourDivision.getAttribute("id").substring(14,15));
									let currentHour = parseInt(hourDivision.getAttribute("id").substring(11,13));
									let currentDay = parseInt(hourDivision.getAttribute("id").substring(8,10));
									let currentMonth = parseInt(hourDivision.getAttribute("id").substring(5,7));
									let currentYear = parseInt(hourDivision.getAttribute("id").substring(0,4));
									let beginMinute = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()) && (currentTenMinutes == Math.floor(beginDate.getMinutes() / 10)))?(beginDate.getMinutes() % 10):0;
									let endMinute = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()) && (currentTenMinutes == Math.floor(endDate.getMinutes() / 10)))?(endDate.getMinutes() % 10):9;
									let minuteDifference = (endMinute - beginMinute) + 1;
									requiredSubDivisionsCount += minuteDifference;
								}

								// if minutes subdivisions would fit in the display area, create them
								if(requiredSubDivisionsCount <= displayableDivCount) {
									lowestFullyInstanciatedLevel = "minute";
									lowestLevelntanciatedDivisionsCount = 0;

									for(let i = 0; i < tenMinutesDivisions.length; i++) {
										let tenMinutesDivision = tenMinutesDivisions[i];
										let currentTenMinutes = parseInt(tenMinutesDivision.getAttribute("id").substring(14,15));
										let currentHour = parseInt(tenMinutesDivision.getAttribute("id").substring(11,13));
										let currentDay = parseInt(tenMinutesDivision.getAttribute("id").substring(8,10));
										let currentMonth = parseInt(tenMinutesDivision.getAttribute("id").substring(5,7));
										let currentYear = parseInt(tenMinutesDivision.getAttribute("id").substring(0,4));
										let beginMinute = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()) && (currentTenMinutes == Math.floor(beginDate.getMinutes() / 10)))?(beginDate.getMinutes() % 10):0;
										let endMinute = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()) && (currentTenMinutes == Math.floor(endDate.getMinutes() / 10)))?(endDate.getMinutes() % 10):9;
									
										// ... add new minute subdivisions in the current hour subdivision
										lowestLevelntanciatedDivisionsCount += this._instanciateSubdivisions(beginMinute, endMinute, "minute", tenMinutesDivision);
									}

									// calculate how many new subdivisions would be created if we go to "tenseconds" level
									let minutesDivisions = this._timeDiv.querySelectorAll(".time-division-minute");
									let requiredSubDivisionsCount = 0;
									displayableDivCount = Math.floor(availableWidth / KTBS4LA2Timeline.minDivisionWidthPerUnit["tenseconds"]);

									for(let i = 0; i < minutesDivisions.length; i++) {
										let minuteDivision = minutesDivisions[i];
										let currentMinute = parseInt(minuteDivision.getAttribute("id").substring(16,17));
										let currentTenMinutes = parseInt(minuteDivision.getAttribute("id").substring(14,15));
										let currentHour = parseInt(minuteDivision.getAttribute("id").substring(11,13));
										let currentDay = parseInt(minuteDivision.getAttribute("id").substring(8,10));
										let currentMonth = parseInt(minuteDivision.getAttribute("id").substring(5,7));
										let currentYear = parseInt(minuteDivision.getAttribute("id").substring(0,4));
										let beginTenSecond = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()) && (currentTenMinutes == Math.floor(beginDate.getMinutes() / 10)) && (currentMinute == (beginDate.getMinutes() % 10)))?Math.floor(beginDate.getSeconds() / 10):0;
										let endTenSecond = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()) && (currentTenMinutes == Math.floor(endDate.getMinutes() / 10)) && (currentMinute == (endDate.getMinutes() % 10)))?Math.floor(endDate.getSeconds() / 10):5;
										let tenSecondDifference = (endTenSecond - beginTenSecond) + 1;
										requiredSubDivisionsCount += tenSecondDifference;
									}

									// if tenseconds subdivisions would fit in the display area, create them
									if(requiredSubDivisionsCount <= displayableDivCount) {
										lowestFullyInstanciatedLevel = "tenseconds";
										lowestLevelntanciatedDivisionsCount = 0;

										for(let i = 0; i < minutesDivisions.length; i++) {
											let minuteDivision = minutesDivisions[i];
											let currentMinute = parseInt(minuteDivision.getAttribute("id").substring(16,17));
											let currentTenMinutes = parseInt(minuteDivision.getAttribute("id").substring(14,15));
											let currentHour = parseInt(minuteDivision.getAttribute("id").substring(11,13));
											let currentDay = parseInt(minuteDivision.getAttribute("id").substring(8,10));
											let currentMonth = parseInt(minuteDivision.getAttribute("id").substring(5,7));
											let currentYear = parseInt(minuteDivision.getAttribute("id").substring(0,4));
											let beginTenSecond = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()) && (currentTenMinutes == Math.floor(beginDate.getMinutes() / 10)) && (currentMinute == (beginDate.getMinutes() % 10)))?Math.floor(beginDate.getSeconds() / 10):0;
											let endTenSecond = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()) && (currentTenMinutes == Math.floor(endDate.getMinutes() / 10)) && (currentMinute == (endDate.getMinutes() % 10)))?Math.floor(endDate.getSeconds() / 10):5;
										
											// ... add new tenseconds subdivisions in the current minute subdivision
											lowestLevelntanciatedDivisionsCount += this._instanciateSubdivisions(beginTenSecond, endTenSecond, "tenseconds", minuteDivision);
										}

										// calculate how many new subdivisions would be created if we go to "second" level
										let tenSecondsDivisions = this._timeDiv.querySelectorAll(".time-division-tenseconds");
										let requiredSubDivisionsCount = 0;
										displayableDivCount = Math.floor(availableWidth / KTBS4LA2Timeline.minDivisionWidthPerUnit["second"]);

										for(let i = 0; i < tenSecondsDivisions.length; i++) {
											let tenSecondDivision = tenSecondsDivisions[i];
											let currentTenSeconds = parseInt(tenSecondDivision.getAttribute("id").substring(18,19));
											let currentMinute = parseInt(tenSecondDivision.getAttribute("id").substring(16,17));
											let currentTenMinutes = parseInt(tenSecondDivision.getAttribute("id").substring(14,15));
											let currentHour = parseInt(tenSecondDivision.getAttribute("id").substring(11,13));
											let currentDay = parseInt(tenSecondDivision.getAttribute("id").substring(8,10));
											let currentMonth = parseInt(tenSecondDivision.getAttribute("id").substring(5,7));
											let currentYear = parseInt(tenSecondDivision.getAttribute("id").substring(0,4));
											let beginSecond = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()) && (currentTenMinutes == Math.floor(beginDate.getMinutes() / 10)) && (currentMinute == (beginDate.getMinutes() % 10)) && (currentTenSeconds == Math.floor(beginDate.getSeconds() / 10)))?(beginDate.getSeconds() % 10):0;
											let endSecond = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()) && (currentTenMinutes == Math.floor(endDate.getMinutes() / 10)) && (currentMinute == (endDate.getMinutes() % 10)) && (currentTenSeconds == Math.floor(endDate.getSeconds() / 10)))?(endDate.getSeconds() % 10):9;
											let secondDifference = (endSecond - beginSecond) + 1;
											requiredSubDivisionsCount += secondDifference;
										}

										// if second subdivisions would fit in the display area, create them
										if(requiredSubDivisionsCount <= displayableDivCount) {
											lowestFullyInstanciatedLevel = "second";
											lowestLevelntanciatedDivisionsCount = 0;

											for(let i = 0; i < tenSecondsDivisions.length; i++) {
												let tenSecondDivision = tenSecondsDivisions[i];
												let currentTenSeconds = parseInt(tenSecondDivision.getAttribute("id").substring(18,19));
												let currentMinute = parseInt(tenSecondDivision.getAttribute("id").substring(16,17));
												let currentTenMinutes = parseInt(tenSecondDivision.getAttribute("id").substring(14,15));
												let currentHour = parseInt(tenSecondDivision.getAttribute("id").substring(11,13));
												let currentDay = parseInt(tenSecondDivision.getAttribute("id").substring(8,10));
												let currentMonth = parseInt(tenSecondDivision.getAttribute("id").substring(5,7));
												let currentYear = parseInt(tenSecondDivision.getAttribute("id").substring(0,4));
												let beginSecond = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()) && (currentTenMinutes == Math.floor(beginDate.getMinutes() / 10)) && (currentMinute == (beginDate.getMinutes() % 10)) && (currentTenSeconds == Math.floor(beginDate.getSeconds() / 10)))?(beginDate.getSeconds() % 10):0;
												let endSecond = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()) && (currentTenMinutes == Math.floor(endDate.getMinutes() / 10)) && (currentMinute == (endDate.getMinutes() % 10)) && (currentTenSeconds == Math.floor(endDate.getSeconds() / 10)))?(endDate.getSeconds() % 10):9;
											
												// ... add new second subdivisions in the current tenseconds subdivision
												lowestLevelntanciatedDivisionsCount += this._instanciateSubdivisions(beginSecond, endSecond, "second", tenSecondDivision);
											}

											// calculate how many new subdivisions would be created if we go to "ahundredmilliseconds" level
											let secondsDivisions = this._timeDiv.querySelectorAll(".time-division-second");
											let requiredSubDivisionsCount = 0;
											displayableDivCount = Math.floor(availableWidth / KTBS4LA2Timeline.minDivisionWidthPerUnit["ahundredmilliseconds"]);

											for(let i = 0; i < secondsDivisions.length; i++) {
												let secondDivision = secondsDivisions[i];
												let currentSecond = parseInt(secondDivision.getAttribute("id").substring(20,21));
												let currentTenSeconds = parseInt(secondDivision.getAttribute("id").substring(18,19));
												let currentMinute = parseInt(secondDivision.getAttribute("id").substring(16,17));
												let currentTenMinutes = parseInt(secondDivision.getAttribute("id").substring(14,15));
												let currentHour = parseInt(secondDivision.getAttribute("id").substring(11,13));
												let currentDay = parseInt(secondDivision.getAttribute("id").substring(8,10));
												let currentMonth = parseInt(secondDivision.getAttribute("id").substring(5,7));
												let currentYear = parseInt(secondDivision.getAttribute("id").substring(0,4));
												let beginHundredMillisecond = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()) && (currentTenMinutes == Math.floor(beginDate.getMinutes() / 10)) && (currentMinute == (beginDate.getMinutes() % 10)) && (currentTenSeconds == Math.floor(beginDate.getSeconds() / 10)) && (currentSecond == (beginDate.getSeconds() % 10)))?Math.floor(beginDate.getMilliseconds() / 100):0;
												let endHundredMillisecond = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()) && (currentTenMinutes == Math.floor(endDate.getMinutes() / 10)) && (currentMinute == (endDate.getMinutes() % 10)) && (currentTenSeconds == Math.floor(endDate.getSeconds() / 10)) && (currentSecond == (endDate.getSeconds() % 10)))?Math.floor(endDate.getMilliseconds() / 100):9;
												let hundredMillisecondDifference = (endHundredMillisecond - beginHundredMillisecond) + 1;
												requiredSubDivisionsCount += hundredMillisecondDifference;
											}

											// if ahundredmilliseconds subdivisions would fit in the display area, create them
											if(requiredSubDivisionsCount <= displayableDivCount) {
												lowestFullyInstanciatedLevel = "ahundredmilliseconds";
												lowestLevelntanciatedDivisionsCount = 0;

												for(let i = 0; i < secondsDivisions.length; i++) {
													let secondDivision = secondsDivisions[i];
													let currentSecond = parseInt(secondDivision.getAttribute("id").substring(20,21));
													let currentTenSeconds = parseInt(secondDivision.getAttribute("id").substring(18,19));
													let currentMinute = parseInt(secondDivision.getAttribute("id").substring(16,17));
													let currentTenMinutes = parseInt(secondDivision.getAttribute("id").substring(14,15));
													let currentHour = parseInt(secondDivision.getAttribute("id").substring(11,13));
													let currentDay = parseInt(secondDivision.getAttribute("id").substring(8,10));
													let currentMonth = parseInt(secondDivision.getAttribute("id").substring(5,7));
													let currentYear = parseInt(secondDivision.getAttribute("id").substring(0,4));
													let beginHundredMillisecond = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()) && (currentTenMinutes == Math.floor(beginDate.getMinutes() / 10)) && (currentMinute == (beginDate.getMinutes() % 10)) && (currentTenSeconds == Math.floor(beginDate.getSeconds() / 10)) && (currentSecond == (beginDate.getSeconds() % 10)))?Math.floor(beginDate.getMilliseconds() / 100):0;
													let endHundredMillisecond = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()) && (currentTenMinutes == Math.floor(endDate.getMinutes() / 10)) && (currentMinute == (endDate.getMinutes() % 10)) && (currentTenSeconds == Math.floor(endDate.getSeconds() / 10)) && (currentSecond == (endDate.getSeconds() % 10)))?Math.floor(endDate.getMilliseconds() / 100):9;
												
													// ... add new ahundredmilliseconds subdivisions in the current second subdivision
													lowestLevelntanciatedDivisionsCount += this._instanciateSubdivisions(beginHundredMillisecond, endHundredMillisecond, "ahundredmilliseconds", secondDivision);
												}

												// calculate how many new subdivisions would be created if we go to "tenmilliseconds" level
												let hundredMillisecondsDivisions = this._timeDiv.querySelectorAll(".time-division-ahundredmilliseconds");
												let requiredSubDivisionsCount = 0;
												displayableDivCount = Math.floor(availableWidth / KTBS4LA2Timeline.minDivisionWidthPerUnit["tenmilliseconds"]);

												for(let i = 0; i < hundredMillisecondsDivisions.length; i++) {
													let hundredMillisecondsDivision = hundredMillisecondsDivisions[i];
													let currentHundredMillisecond = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(22,23));
													let currentSecond = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(20,21));
													let currentTenSeconds = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(18,19));
													let currentMinute = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(16,17));
													let currentTenMinutes = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(14,15));
													let currentHour = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(11,13));
													let currentDay = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(8,10));
													let currentMonth = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(5,7));
													let currentYear = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(0,4));
													let beginTenMillisecond = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()) && (currentTenMinutes == Math.floor(beginDate.getMinutes() / 10)) && (currentMinute == (beginDate.getMinutes() % 10)) && (currentTenSeconds == Math.floor(beginDate.getSeconds() / 10)) && (currentSecond == (beginDate.getSeconds() % 10)) && (currentHundredMillisecond == Math.floor(beginDate.getMilliseconds() / 100)))?(Math.floor(beginDate.getMilliseconds() / 10) % 10):0;
													let endTenMillisecond = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()) && (currentTenMinutes == Math.floor(endDate.getMinutes() / 10)) && (currentMinute == (endDate.getMinutes() % 10)) && (currentTenSeconds == Math.floor(endDate.getSeconds() / 10)) && (currentSecond == (endDate.getSeconds() % 10)) && (currentHundredMillisecond == Math.floor(endDate.getMilliseconds() / 100)))?(Math.floor(endDate.getMilliseconds() / 10) % 10):9;
													let tenMillisecondDifference = (endTenMillisecond - beginTenMillisecond) + 1;
													requiredSubDivisionsCount += tenMillisecondDifference;
												}

												// if tenmilliseconds subdivisions would fit in the display area, create them
												if(requiredSubDivisionsCount <= displayableDivCount) {
													lowestFullyInstanciatedLevel = "tenmilliseconds";
													lowestLevelntanciatedDivisionsCount = 0;

													for(let i = 0; i < hundredMillisecondsDivisions.length; i++) {
														let hundredMillisecondsDivision = hundredMillisecondsDivisions[i];
														let currentHundredMillisecond = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(22,23));
														let currentSecond = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(20,21));
														let currentTenSeconds = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(18,19));
														let currentMinute = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(16,17));
														let currentTenMinutes = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(14,15));
														let currentHour = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(11,13));
														let currentDay = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(8,10));
														let currentMonth = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(5,7));
														let currentYear = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(0,4));
														let beginTenMillisecond = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()) && (currentTenMinutes == Math.floor(beginDate.getMinutes() / 10)) && (currentMinute == (beginDate.getMinutes() % 10)) && (currentTenSeconds == Math.floor(beginDate.getSeconds() / 10)) && (currentSecond == (beginDate.getSeconds() % 10)) && (currentHundredMillisecond == Math.floor(beginDate.getMilliseconds() / 100)))?(Math.floor(beginDate.getMilliseconds() / 10) % 10):0;
														let endTenMillisecond = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()) && (currentTenMinutes == Math.floor(endDate.getMinutes() / 10)) && (currentMinute == (endDate.getMinutes() % 10)) && (currentTenSeconds == Math.floor(endDate.getSeconds() / 10)) && (currentSecond == (endDate.getSeconds() % 10)) && (currentHundredMillisecond == Math.floor(endDate.getMilliseconds() / 100)))?(Math.floor(endDate.getMilliseconds() / 10) % 10):9;
														
														// ... add new tenmilliseconds subdivisions in the current ahundredmilliseconds subdivision
														lowestLevelntanciatedDivisionsCount += this._instanciateSubdivisions(beginTenMillisecond, endTenMillisecond, "tenmilliseconds", hundredMillisecondsDivision);
													}

													// calculate how many new subdivisions would be created if we go to "millisecond" level
													let tenMillisecondsDivisions = this._timeDiv.querySelectorAll(".time-division-tenmilliseconds");
													let requiredSubDivisionsCount = 0;
													displayableDivCount = Math.floor(availableWidth / KTBS4LA2Timeline.minDivisionWidthPerUnit["millisecond"]);

													for(let i = 0; i < tenMillisecondsDivisions.length; i++) {
														let tenMillisecondsDivision = tenMillisecondsDivisions[i];
														let currentTenMillisecond = parseInt(tenMillisecondsDivision.getAttribute("id").substring(24,25));
														let currentHundredMillisecond = parseInt(tenMillisecondsDivision.getAttribute("id").substring(22,23));
														let currentSecond = parseInt(tenMillisecondsDivision.getAttribute("id").substring(20,21));
														let currentTenSeconds = parseInt(tenMillisecondsDivision.getAttribute("id").substring(18,19));
														let currentMinute = parseInt(tenMillisecondsDivision.getAttribute("id").substring(16,17));
														let currentTenMinutes = parseInt(tenMillisecondsDivision.getAttribute("id").substring(14,15));
														let currentHour = parseInt(tenMillisecondsDivision.getAttribute("id").substring(11,13));
														let currentDay = parseInt(tenMillisecondsDivision.getAttribute("id").substring(8,10));
														let currentMonth = parseInt(tenMillisecondsDivision.getAttribute("id").substring(5,7));
														let currentYear = parseInt(tenMillisecondsDivision.getAttribute("id").substring(0,4));
														let beginMillisecond = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()) && (currentTenMinutes == Math.floor(beginDate.getMinutes() / 10)) && (currentMinute == (beginDate.getMinutes() % 10)) && (currentTenSeconds == Math.floor(beginDate.getSeconds() / 10)) && (currentSecond == (beginDate.getSeconds() % 10)) && (currentHundredMillisecond == Math.floor(beginDate.getMilliseconds() / 100)) && (currentTenMillisecond == (Math.floor(beginDate.getMilliseconds() / 10) % 10)))?(beginDate.getMilliseconds() % 10):0;
														let endMillisecond = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()) && (currentTenMinutes == Math.floor(endDate.getMinutes() / 10)) && (currentMinute == (endDate.getMinutes() % 10)) && (currentTenSeconds == Math.floor(endDate.getSeconds() / 10)) && (currentSecond == (endDate.getSeconds() % 10)) && (currentHundredMillisecond == Math.floor(endDate.getMilliseconds() / 100)) && (currentTenMillisecond == (Math.floor(endDate.getMilliseconds() / 10) % 10)))?(endDate.getMilliseconds() % 10):9;
														let millisecondDifference = (endMillisecond - beginMillisecond) + 1;
														requiredSubDivisionsCount += millisecondDifference;
													}

													// if millisecond subdivisions would fit in the display area, create them
													if(requiredSubDivisionsCount <= displayableDivCount) {
														lowestFullyInstanciatedLevel = "millisecond";
														lowestLevelntanciatedDivisionsCount = 0;
														let addedLeft = 0;
														let addedRight = 0;

														for(let i = 0; i < tenMillisecondsDivisions.length; i++) {
															let tenMillisecondsDivision = tenMillisecondsDivisions[i];
															let currentTenMillisecond = parseInt(tenMillisecondsDivision.getAttribute("id").substring(24,25));
															let currentHundredMillisecond = parseInt(tenMillisecondsDivision.getAttribute("id").substring(22,23));
															let currentSecond = parseInt(tenMillisecondsDivision.getAttribute("id").substring(20,21));
															let currentTenSeconds = parseInt(tenMillisecondsDivision.getAttribute("id").substring(18,19));
															let currentMinute = parseInt(tenMillisecondsDivision.getAttribute("id").substring(16,17));
															let currentTenMinutes = parseInt(tenMillisecondsDivision.getAttribute("id").substring(14,15));
															let currentHour = parseInt(tenMillisecondsDivision.getAttribute("id").substring(11,13));
															let currentDay = parseInt(tenMillisecondsDivision.getAttribute("id").substring(8,10));
															let currentMonth = parseInt(tenMillisecondsDivision.getAttribute("id").substring(5,7));
															let currentYear = parseInt(tenMillisecondsDivision.getAttribute("id").substring(0,4));
															let beginMillisecond = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()) && (currentTenMinutes == Math.floor(beginDate.getMinutes() / 10)) && (currentMinute == (beginDate.getMinutes() % 10)) && (currentTenSeconds == Math.floor(beginDate.getSeconds() / 10)) && (currentSecond == (beginDate.getSeconds() % 10)) && (currentHundredMillisecond == Math.floor(beginDate.getMilliseconds() / 100)) && (currentTenMillisecond == (Math.floor(beginDate.getMilliseconds() / 10) % 10)))?(beginDate.getMilliseconds() % 10):0;
															let endMillisecond = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()) && (currentTenMinutes == Math.floor(endDate.getMinutes() / 10)) && (currentMinute == (endDate.getMinutes() % 10)) && (currentTenSeconds == Math.floor(endDate.getSeconds() / 10)) && (currentSecond == (endDate.getSeconds() % 10)) && (currentHundredMillisecond == Math.floor(endDate.getMilliseconds() / 100)) && (currentTenMillisecond == (Math.floor(endDate.getMilliseconds() / 10) % 10)))?(endDate.getMilliseconds() % 10):9;

															// at "millisecond" level (and only this level), if the required millisecond subdivisions don't fill the screen, we'll add some more left and right

															if((i == 0) && (requiredSubDivisionsCount < displayableDivCount) && (beginMillisecond > 0)) {
																let numberOfDivsToAddLeft = Math.floor((displayableDivCount - requiredSubDivisionsCount) / 2);
																let newBeginMillisecond = beginMillisecond - numberOfDivsToAddLeft;

																if(newBeginMillisecond < 0)
																	newBeginMillisecond = 0;

																addedLeft += (beginMillisecond - newBeginMillisecond);

																beginMillisecond = newBeginMillisecond;
															}

															if((i == (tenMillisecondsDivisions.length - 1)) && ((lowestLevelntanciatedDivisionsCount + (endMillisecond - beginMillisecond)) < displayableDivCount) && (endMillisecond < 9)) {
																let numberOfDivsToAddRight = displayableDivCount - (lowestLevelntanciatedDivisionsCount + (endMillisecond - beginMillisecond));
																let newEndMillisecond = endMillisecond + numberOfDivsToAddRight;

																if(newEndMillisecond > 9)
																	newEndMillisecond = 9;

																addedRight += (newEndMillisecond - endMillisecond);
																endMillisecond = newEndMillisecond;
															}

															// ... add new millisecond subdivisions in the current tenmilliseconds subdivision
															lowestLevelntanciatedDivisionsCount += this._instanciateSubdivisions(beginMillisecond, endMillisecond, "millisecond", tenMillisecondsDivision);
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
				}

				this._widgetContainer.className = lowestFullyInstanciatedLevel;
				this._initialLevel = this._widgetContainer.className;
				this._updateRepresentedTime();
				this._resolveTimeDivisionsInitialized();
			}
			else
				this.emitErrorEvent(new Error("Invalid attribute value"));
		}
		else
			this.emitErrorEvent(new Error("Missing required attribute"));
	}

	/**
	 * 
	 */
	_initZoomParams() {
		let newLevel = this._initialLevel;
		let timeDivs = this._timeDiv.querySelectorAll(".time-division-" + newLevel);
		let newDivWidth = this._displayWindow.clientWidth / timeDivs.length;

		while(newDivWidth < KTBS4LA2Timeline.minDivisionWidthPerUnit[newLevel]) {
			switch(newLevel) {
				case "millisecond":
					newLevel = "tenmilliseconds";
					newDivWidth = newDivWidth * 10;
					break;
				case "tenmilliseconds":
					newLevel = "ahundredmilliseconds";
					newDivWidth = newDivWidth * 10;
					break;
				case "ahundredmilliseconds":
					newLevel = "second";
					newDivWidth = newDivWidth * 10;
					break;
				case "second":
					newLevel = "tenseconds";
					newDivWidth = newDivWidth * 10;
					break;
				case "tenseconds":
					newLevel = "minute";
					newDivWidth = newDivWidth * 6;
					break;
				case "minute":
					newLevel = "tenminutes";
					newDivWidth = newDivWidth * 10;
					break;
				case "tenminutes":
					newLevel = "hour";
					newDivWidth = newDivWidth * 6;
					break;
				case "hour":
					newLevel = "day";
					newDivWidth = newDivWidth * 24;
					break;
				case "day":
					newLevel = "month";
					newDivWidth = newDivWidth * 31;
					break;
				case "month":
					newLevel = "year";
					newDivWidth = newDivWidth * 12;
					break;
			}
		}
		
		if((newLevel == "year") && (newDivWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["month"] * 12))) {
			newLevel = "month";
			newDivWidth = newDivWidth / 12;
		}

		if((newLevel == "month") && (newDivWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["day"] * 31))) {
			newLevel = "day";
			newDivWidth = newDivWidth / 31;
		}

		if((newLevel == "day") && (newDivWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["hour"] * 24))) {
			newLevel = "hour";
			newDivWidth = newDivWidth / 24;
		}

		if((newLevel == "hour") && (newDivWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["tenminutes"] * 6))) {
			newLevel = "tenminutes";
			newDivWidth = newDivWidth / 6;
		}

		if((newLevel == "tenminutes") && (newDivWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["minute"] * 10))) {
			newLevel = "minute";
			newDivWidth = newDivWidth / 10;
		}

		if((newLevel == "minute") && (newDivWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["tenseconds"] * 6))) {
			newLevel = "tenseconds";
			newDivWidth = newDivWidth / 6;
		}

		if((newLevel == "tenseconds") && (newDivWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["second"] * 10))) {
			newLevel = "second";
			newDivWidth = newDivWidth / 10;
		}

		if((newLevel == "second") && (newDivWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["ahundredmilliseconds"] * 10))) {
			newLevel = "ahundredmilliseconds";
			newDivWidth = newDivWidth / 10;
		}

		if((newLevel == "ahundredmilliseconds") && (newDivWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["tenmilliseconds"] * 10))) {
			newLevel = "tenmilliseconds";
			newDivWidth = newDivWidth / 10;
		}

		if((newLevel == "tenmilliseconds") && (newDivWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["millisecond"] * 10))) {
			newLevel = "millisecond";
			newDivWidth = newDivWidth / 10;
		}

		this._initialDivWidth = newDivWidth;
		this._initialLevel= newLevel;
	}


	/**
	 * 
	 */
	_initZoom() {
		this._initZoomParams();
		this._setWidthRules(this._initialLevel, this._initialDivWidth);
		this._isZoomedOut = true;
	}

	/**
	 * 
	 */
	_onMouseWheel(event) {
		if (event.ctrlKey) {
			let verticalMovement = event.deltaY;
			
			if(verticalMovement && (verticalMovement != 0)) {
				event.preventDefault();
				let movementUnit = event.deltaMode;

				if(movementUnit == 0)
					verticalMovement = verticalMovement / 28;

				let mouseRelativeX = event.offsetX - this._displayWindow.scrollLeft;
				this._requestZoomIncrement(verticalMovement, mouseRelativeX);
			}
		}
		/*
		// @TODO: détecter shift+roulette => scroll horizontal
		else if() { 

		}*/
	}

	/**
	 * 
	 */
	_setZoomCursor(zoomClass) {
		let supportedClass = true;

		switch(zoomClass) {
			case "zooming-in":
				if(this._displayWindow.classList.contains("zoom-denied"))
					this._displayWindow.classList.remove("zoom-denied");
	
				if(this._displayWindow.classList.contains("zooming-out"))
					this._displayWindow.classList.remove("zooming-out");

				break;
			case "zooming-out":
				if(this._displayWindow.classList.contains("zoom-denied"))
					this._displayWindow.classList.remove("zoom-denied");
	
				if(this._displayWindow.classList.contains("zooming-in"))
					this._displayWindow.classList.remove("zooming-in");

				break;
			case "zoom-denied":
				if(this._displayWindow.classList.contains("zooming-in"))
					this._displayWindow.classList.remove("zooming-in");
	
				if(this._displayWindow.classList.contains("zooming-out"))
					this._displayWindow.classList.remove("zooming-out");

				break;
			default:
				supportedClass = false;
		}

		if(supportedClass) {
			this._displayWindow.classList.add(zoomClass);

			if(this._requestUnsetZoomCursorID != null)
				clearTimeout(this._requestUnsetZoomCursorID);

			this._requestUnsetZoomCursorID = setTimeout(() => {
				this._displayWindow.classList.remove(zoomClass);
				this._requestUnsetZoomCursorID = null;
			}, this._requestUnsetZoomCursorDelay);
		}
	}

	/**
	 * 
	 */
	_getMouseTime(mouseRelativeX) {
		let timeOverWidthRatio = (this._lastRepresentedTime - this._firstRepresentedTime) / this._timeDiv.clientWidth;
		let mouseAbsoluteX = mouseRelativeX + this._displayWindow.scrollLeft;
		return (this._firstRepresentedTime + (mouseAbsoluteX * timeOverWidthRatio));
	}

	/**
	 * 
	 */
	_resetScrollForLastMousePositionAndTime() {
		let widthOverTimeRatio = this._timeDiv.clientWidth / (this._lastRepresentedTime - this._firstRepresentedTime);
		let mouseTimeOffset = this._requestedZoomMouseTime - this._firstRepresentedTime;
		let newMouseAbsoluteX = mouseTimeOffset * widthOverTimeRatio;
		let newScrollLeft = newMouseAbsoluteX - this._requestedZoomMouseRelativeX;
		this._setSilentScroll(newScrollLeft);
	}

	/**
	 * 
	 */
	_requestZoomIncrement(incrementAmount, mouseRelativeX) {
		let zoomDenied = false;

		if(incrementAmount > 0)
			zoomDenied = ((this._initialLevel == this._widgetContainer.className) && (this._currentLevelDivWidth <= this._initialDivWidth));
		else if(incrementAmount < 0)
			zoomDenied = (this._widgetContainer.className == "millisecond");

		if(zoomDenied) {
			this._requestedZoomIncrementAmount = 0;
			this._setZoomCursor("zoom-denied");
		}
		else {
			this._requestedZoomIncrementAmount += incrementAmount;
			this._requestedZoomMouseRelativeX = mouseRelativeX;
			this._requestedZoomMouseTime = this._getMouseTime(mouseRelativeX);

			if(this._requestedZoomIncrementAmount != 0) {
				if(this._requestedZoomIncrementAmount > 0)
					this._setZoomCursor("zooming-out");
				else if(this._requestedZoomIncrementAmount < 0)
					this._setZoomCursor("zooming-in");

				if(this._requestZoomIncrementID != null)
					clearTimeout(this._requestZoomIncrementID);

				this._requestZoomIncrementID = setTimeout(() => {
					let zoomAmount = this._requestedZoomIncrementAmount;
					this._requestedZoomIncrementAmount = 0;
					this._incrementZoom(zoomAmount);

					let timeOverWidthRatio = (this._lastRepresentedTime - this._firstRepresentedTime) / this._timeDiv.clientWidth;
					let newViewBeginTime = this._requestedZoomMouseTime - (mouseRelativeX * timeOverWidthRatio);
					let newViewEndTime = this._requestedZoomMouseTime + ((this._displayWindow.clientWidth - mouseRelativeX) * timeOverWidthRatio);
					this._updateTimeDivisions(newViewBeginTime, newViewEndTime);

					this._resetScrollForLastMousePositionAndTime();
					this._updateScrollBarCursor();
					this._requestUpdateEventsRows();

					this._requestZoomIncrementID = null;
				});
			}
		}
	}

	/**
	 * 
	 */
	_getFirstVisibleSubdivision(parent = null) {
		let callFromTop = (parent == null);
		let lowestVisibleLevelReached;

		if(callFromTop) {
			parent = this._timeDiv;
			lowestVisibleLevelReached = false;
		}
		else
			lowestVisibleLevelReached = (parent._getUnit() == this._widgetContainer.className);

		if(lowestVisibleLevelReached)
			return parent;
		else {
			let firstVisibleChild = parent.querySelector(":scope > .time-division:not(.overflow)");

			if(firstVisibleChild)
				return this._getFirstVisibleSubdivision(firstVisibleChild);
			else {
				if(callFromTop)
					return null;
				else
					return parent;
			}
		}
	}

	/**
	 * 
	 */
	_getLastVisibleSubdivision(parent = null) {
		let callFromTop = (parent == null);
		let lowestVisibleLevelReached;
		
		if(callFromTop) {
			parent = this._timeDiv;
			lowestVisibleLevelReached = false;
		}
		else
			lowestVisibleLevelReached = (parent._getUnit() == this._widgetContainer.className);

		if(lowestVisibleLevelReached)
			return parent;
		else {
			let visibleChilds = parent.querySelectorAll(":scope > .time-division:not(.overflow)");
			
			if(visibleChilds.length > 0) {
				let lastVisibleChild = visibleChilds[visibleChilds.length - 1];
				return this._getLastVisibleSubdivision(lastVisibleChild);
			}
			else {
				if(callFromTop)
					return null;
				else
					return parent;
			}
		}
	}

	/**
	 * 
	 */
	_getActualFirstRepresentedTime() {
		let firstVisibleSubdiv = this._getFirstVisibleSubdivision();

		if(firstVisibleSubdiv)
			return firstVisibleSubdiv._getBeginTime();
		else
			throw new Error("Could not find any visible time division");
	}

	/**
	 * 
	 */
	_getActualLastRepresentedTime() {
		let lastVisibleSubdiv = this._getLastVisibleSubdivision();

		if(lastVisibleSubdiv)
			return lastVisibleSubdiv._getEndTime();
		else
			throw new Error("Could not find any visible time division");
	}

	/**
	 * 
	 */
	_updateRepresentedTime() {
		let oldFirstRepresentedTime = this._firstRepresentedTime;
		let oldLastRepresentedTime = this._lastRepresentedTime;
		this._firstRepresentedTime = this._getActualFirstRepresentedTime();
		this._lastRepresentedTime = this._getActualLastRepresentedTime();

		if((oldFirstRepresentedTime != this._firstRepresentedTime) || (oldLastRepresentedTime != this._lastRepresentedTime))
			this.dispatchEvent(new CustomEvent("update-represented-time"));
	}

	/**
	 * 
	 */
	_hideOverflowTimeDivs(directionIsFromBegining, timeLimit) {
		let units = Object.keys(KTBS4LA2Timeline.minDivisionWidthPerUnit);
		let currentUnitRank = units.indexOf(this._widgetContainer.className);

		for(let i = 0; i <= currentUnitRank; i++) {
			let selector = "";
			
			for(let j = 0; j <= i; j++) {
				let unit = units[j];
				selector += ".time-division-" + unit + ":not(.overflow)";

				if(j < i)
					selector += " > ";
			}

			let hideableTimeDivs = this._timeDiv.querySelectorAll(selector);
			let timeLimitHit = false;

			for(let j = 0; !timeLimitHit && (j < hideableTimeDivs.length); j++) {
				let candidate;

				if(directionIsFromBegining) {
					candidate = hideableTimeDivs[j];
					timeLimitHit = (candidate._getEndTime() > timeLimit);
				}
				else {
					candidate = hideableTimeDivs[hideableTimeDivs.length - (j + 1)];
					timeLimitHit = (candidate._getBeginTime() < timeLimit);
				}

				if(!timeLimitHit)
					candidate.classList.add("overflow");
			}
		}
	}

	/**
	 * 
	 */
	_unHideOverflowTimeDivs(fromTime, toTime) {
		let units = Object.keys(KTBS4LA2Timeline.minDivisionWidthPerUnit);
		let currentUnitRank = units.indexOf(this._widgetContainer.className);

		for(let i = 0; i <= currentUnitRank; i++) {
			let selector = "";
			
			for(let j = 0; j <= i; j++) {
				let unit = units[j];
				selector += ".time-division-" + unit;

				if(j < i)
					selector += ":not(.overflow) > ";
				else
					selector += ".overflow";
			}
			
			let hidenTimeDivs = this._timeDiv.querySelectorAll(selector);

			for(let j = 0; j < hidenTimeDivs.length; j++) {
				let candidate = hidenTimeDivs[j];

				if((candidate._getEndTime() > fromTime) && (candidate._getBeginTime() < toTime))
					candidate.classList.remove("overflow");
			}
		}
	}

	/**
	 * 
	 */
	_updateTimeDivisions(viewBeginTime, viewEndTime) {
		let representedDuration = (this._lastRepresentedTime - this._firstRepresentedTime);
		let timeOverWidthRatio = representedDuration / this._timeDiv.clientWidth;
		let minLeftTime = viewBeginTime - (2 * this._displayWindow.clientWidth * timeOverWidthRatio);
		let maxRightTime = viewEndTime + (2 * this._displayWindow.clientWidth * timeOverWidthRatio);
		this._unHideOverflowTimeDivs(minLeftTime, maxRightTime);
		this._updateViewSubdivisions(minLeftTime, maxRightTime);
		this._hideOverflowTimeDivs(true, minLeftTime);
		this._hideOverflowTimeDivs(false, maxRightTime);
		this._updateRepresentedTime();
	}

	/**
	 * 
	 */
	_incrementZoom(increment) {
		if(increment != 0) {
			let newLevel = this._widgetContainer.className;
			let newWidth = this._currentLevelDivWidth * Math.exp(-increment / 10);

			// user zoomed out
			if(increment > 0) {
				while(newWidth < KTBS4LA2Timeline.minDivisionWidthPerUnit[newLevel]) {
					switch(newLevel) {
						case "millisecond":
							newLevel = "tenmilliseconds";
							newWidth = newWidth * 10;
							break;
						case "tenmilliseconds":
							newLevel = "ahundredmilliseconds";
							newWidth = newWidth * 10;
							break;
						case "ahundredmilliseconds":
							newLevel = "second";
							newWidth = newWidth * 10;
							break;
						case "second":
							newLevel = "tenseconds";
							newWidth = newWidth * 10;
							break;
						case "tenseconds":
							newLevel = "minute";
							newWidth = newWidth * 6;
							break;
						case "minute":
							newLevel = "tenminutes";
							newWidth = newWidth * 10;
							break;
						case "tenminutes":
							newLevel = "hour";
							newWidth = newWidth * 6;
							break;
						case "hour":
							newLevel = "day";
							newWidth = newWidth * 24;
							break;
						case "day":
							newLevel = "month";
							newWidth = newWidth * 31;
							break;
						case "month":
							newLevel = "year";
							newWidth = newWidth * 12;
							break;
					}
				}

				let newLevelHasExceededTop = (
						((this._initialLevel == "month") && (newLevel == "year"))
					||	((this._initialLevel == "day") && ((newLevel == "year") || (newLevel == "month")))
					||	((this._initialLevel == "hour") && ((newLevel == "year") || (newLevel == "month") || (newLevel == "day")))
					||	((this._initialLevel == "tenminutes") && ((newLevel == "year") || (newLevel == "month") || (newLevel == "day") || (newLevel == "hour")))
					||	((this._initialLevel == "minute") && ((newLevel == "year") || (newLevel == "month") || (newLevel == "day") || (newLevel == "hour") || (newLevel == "tenminutes")))
					||	((this._initialLevel == "tenseconds") && ((newLevel == "year") || (newLevel == "month") || (newLevel == "day") || (newLevel == "hour") || (newLevel == "tenminutes") || (newLevel == "minute")))
					||	((this._initialLevel == "second") && ((newLevel == "year") || (newLevel == "month") || (newLevel == "day") || (newLevel == "hour") || (newLevel == "tenminutes") || (newLevel == "minute") || (newLevel == "tenseconds")))
					||	((this._initialLevel == "ahundredmilliseconds") && ((newLevel == "year") || (newLevel == "month") || (newLevel == "day") || (newLevel == "hour") || (newLevel == "tenminutes") || (newLevel == "minute") || (newLevel == "tenseconds") || (newLevel == "second")))
					||	((this._initialLevel == "tenmilliseconds") && ((newLevel == "year") || (newLevel == "month") || (newLevel == "day") || (newLevel == "hour") || (newLevel == "tenminutes") || (newLevel == "minute") || (newLevel == "tenseconds") || (newLevel == "second") || (newLevel == "ahundredmilliseconds")))
					||	((this._initialLevel == "millisecond"))
				);

				// prevent user from zooming out more than the initial zoom settings
				if(newLevelHasExceededTop || ((newLevel == this._initialLevel) && (newWidth <= this._initialDivWidth))) {
					newLevel = this._initialLevel;
					newWidth = this._initialDivWidth;

					this._isZoomedOut = true;

					if(this._displayWindow.classList.contains("scrollable"))
						this._displayWindow.classList.remove("scrollable");

					if(this._scrollBar.classList.contains("scrollable"))
						this._scrollBar.classList.remove("scrollable");
				}
			}
			// user zoomed in
			else {
				if((newLevel == "year") && (newWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["month"] * 12))) {
					newLevel = "month";
					newWidth = newWidth / 12;
				}

				if((newLevel == "month") && (newWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["day"] * 31))) {
					newLevel = "day";
					newWidth = newWidth / 31;
				}

				if((newLevel == "day") && (newWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["hour"] * 24))) {
					newLevel = "hour";
					newWidth = newWidth / 24;
				}

				if((newLevel == "hour") && (newWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["tenminutes"] * 6))) {
					newLevel = "tenminutes";
					newWidth = newWidth / 6;
				}

				if((newLevel == "tenminutes") && (newWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["minute"] * 10))) {
					newLevel = "minute";
					newWidth = newWidth / 10;
				}

				if((newLevel == "minute") && (newWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["tenseconds"] * 6))) {
					newLevel = "tenseconds";
					newWidth = newWidth / 6;
				}

				if((newLevel == "tenseconds") && (newWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["second"] * 10))) {
					newLevel = "second";
					newWidth = newWidth / 10;
				}

				if((newLevel == "second") && (newWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["ahundredmilliseconds"] * 10))) {
					newLevel = "ahundredmilliseconds";
					newWidth = newWidth / 10;
				}

				if((newLevel == "ahundredmilliseconds") && (newWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["tenmilliseconds"] * 10))) {
					newLevel = "tenmilliseconds";
					newWidth = newWidth / 10;
				}

				if((newLevel == "tenmilliseconds") && (newWidth >= (KTBS4LA2Timeline.minDivisionWidthPerUnit["millisecond"] * 10))) {
					newLevel = "millisecond";
					newWidth = newWidth / 10;
				}

				// prevent user from zooming in once we've reached the "millisecond" level
				if((newLevel == "millisecond") && (newWidth > KTBS4LA2Timeline.minDivisionWidthPerUnit["millisecond"]))
					newWidth = KTBS4LA2Timeline.minDivisionWidthPerUnit["millisecond"];

				if(!this._displayWindow.classList.contains("scrollable"))
					this._displayWindow.classList.add("scrollable");

				if(!this._scrollBar.classList.contains("scrollable"))
					this._scrollBar.classList.add("scrollable");

				this._isZoomedOut = false;
			}

			if((newLevel != this._widgetContainer.className) || (newWidth != this._currentLevelDivWidth))
				this._setWidthRules(newLevel, newWidth);
		}
	}

	/**
	 * 
	 */
	_timeDivIsInView(timeDiv) {
		let divClientRect = timeDiv.getBoundingClientRect();
		let divLeft = divClientRect.left;
		let divRight = divClientRect.right;
		let containerClientRect = this._displayWindow.getBoundingClientRect();
		let containerLeft = containerClientRect.left;
		let containerRight = containerClientRect.right;
		return ((divRight >= containerLeft) && (divLeft <= containerRight)); 
	}

	/**
	 * 
	 */
	_updateScrollBarContent() {
		Promise.all([this._componentReady, this._timeDivisionsInitialized]).then(() => {
			let scrollBarWidth = this._scrollBar.clientWidth;
			
			// count how much more event for each pixel of the scrollbar
			let eventsCountPerPixel = new Array();
			let timeStep = (this.endTime - this.beginTime) / scrollBarWidth;
			let eventNodes = this._getAllEventNodes();
			let eventIndex = 0;

			for(let x = 0; x < scrollBarWidth; x++) {
				let currentPixelEventCount = 0;
				let xTime = this.beginTime + ((x + 1) * timeStep);
				
				while((eventIndex < eventNodes.length) && (eventNodes[eventIndex].beginTime <= xTime)) {
					currentPixelEventCount++;
					eventIndex++;
				}

				eventsCountPerPixel[x] = currentPixelEventCount;
			}
			// ---

			// paint the scrollbar
			this._scrollBarBackground.setAttribute("width", scrollBarWidth);
			let scrollBarHeight = this._scrollBar.clientHeight;
			let maxDelta = Math.max(...eventsCountPerPixel);
			let canvasContext = this._scrollBarBackground.getContext('2d');
			canvasContext.clearRect(0, 0, scrollBarWidth, scrollBarHeight);
			
			for(let x = 0; x < eventsCountPerPixel.length; x++) {
				let rawDelta = eventsCountPerPixel[x];
				
				if(rawDelta != 0) {
					let normalizedDelta = (rawDelta / maxDelta);
					let h = (1.0 - normalizedDelta) * 240;
					let color = "hsl(" + h + ", 100%, 50%)";
					canvasContext.strokeStyle = color;
					canvasContext.strokeRect(x, 0, 1, scrollBarHeight);
				}
			}
			// ---
		});
	}
}

KTBS4LA2Timeline.monthNames = {
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

KTBS4LA2Timeline.minDivisionWidthPerUnit = {
	"year" : 25,
	"month" : 20,
	"day" : 13,
	"hour" : 13,
	"tenminutes" : 13,
	"minute" : 13,
	"tenseconds" : 13,
	"second" : 13,
	"ahundredmilliseconds": 19,
	"tenmilliseconds": 19,
	"millisecond": 19
};

customElements.define('ktbs4la2-timeline', KTBS4LA2Timeline);
