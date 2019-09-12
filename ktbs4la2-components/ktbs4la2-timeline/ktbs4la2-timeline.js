import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";
import "./ktbs4la2-timeline-event.js";

class KTBS4LA2Timeline extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url);

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

		this._firstRepresentedTime;
		this._lastRepresentedTime;
		this._lowestLevelDivWidth;
		this._minDivisionWidth = 10;
		this._bindedDragFunction = this._onDrag.bind(this);
		this._bindedStopDraggingFunction = this._onStopDragging.bind(this);
		this._is_dragging = false;
		this._drag_origin_x = null;
		this._initial_scroll = 0;

		Promise.all([this._beginSet, this._endSet])
			.then(function() {
				this._componentReady.then(() => {
					this._initTimeDivisions();
				});
			}.bind(this))
			.catch(function() {
				this.emitErrorEvent(new Error("Missing required attribute \"begin\" and/or \"end\""));
			}.bind(this));

		this._eventsNodesObserver = new MutationObserver(this._onEventsNodesMutation.bind(this));
		this._eventsNodesObserver.observe(this, { childList: true, subtree: true, attributes: true});
		this._updateEventViewMinDelay = 100;
		this._requestUpdateEventsID = null;
		this._requestZoomIncrementID = null;
		this._requestedZoomIncrementAmount = 0;
		this._requestedZoomIncrementMouseX = null;
		this._updateZoomDelay = 50;
		this._requestUpdateVisibleDivisionsID = null;
		this._updateVisibleDivisionsDelay = 100;
		this._requestUpdateStylesID = null;
		this._updateStylesDelay = 100;

		this._resolveTimeDivisionsInitialized;
		this._rejectTimeDivisionsInitialized;

		this._timeDivisionsInitialized = new Promise(function(resolve, reject) {
			this._resolveTimeDivisionsInitialized = resolve;
			this._rejectTimeDivisionsInitialized = reject;
		}.bind(this));

		this.addEventListener("select-timeline-event", this._onSelectTimelineEvent.bind(this));
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
	_getLastEventBeforeTime(endTime) {
		let lastEvent = null;
		let allEvents = this._getAllEventNodes();
		
		for(let i = 0; i < allEvents.length; i++) {
			let currentEvent = allEvents[i];
			let currentEventTime = parseInt(currentEvent.getAttribute("begin"));

			if(currentEventTime >= endTime) {
				if(i > 0)
					lastEvent = allEvents[i - 1];

				break;
			}
		}

		if((lastEvent == null) && (allEvents.length > 0))
			lastEvent = allEvents[allEvents.length - 1];

		return lastEvent;
	}

	/**
	 * 
	 */
	_getFirstEventAfterTime(startTime) {
		let firstEvent = null;
		let allEvents = this._getAllEventNodes();
		
		for(let i = 0; i < allEvents.length; i++) {
			let currentEvent = allEvents[i];
			let currentEventTime = parseInt(currentEvent.getAttribute("begin"));

			if(currentEventTime >= startTime) {
				firstEvent = currentEvent;
				break;
			}
		}
		
		return firstEvent;
	}

	/**
	 *
	 */
	_getFirstVisibleTime() {
		let totalTime = this._lastRepresentedTime - this._firstRepresentedTime;
		let ratio = totalTime / this._timeDiv.clientWidth;
		let leftBorderTimeOffset = this._displayWindow.scrollLeft * ratio;
		return (this._firstRepresentedTime + leftBorderTimeOffset);
	}

	/**
	 * 
	 */
	_getFirstVisibleEvent() {
		return this._getFirstEventAfterTime(this._getFirstVisibleTime());
	}

	/**
	 * 
	 */
	_getLastVisibleTime() {
		let totalTime = this._lastRepresentedTime - this._firstRepresentedTime;
		let ratio = totalTime / this._timeDiv.clientWidth;
		let rightBorderTimeOffset = (this._displayWindow.scrollLeft + this._displayWindow.clientWidth) * ratio;
		let lastVisibleTime = this._firstRepresentedTime + rightBorderTimeOffset;

		if(lastVisibleTime > this._lastRepresentedTime)
			lastVisibleTime = this._lastRepresentedTime;

		return (lastVisibleTime);
	}
	
	/**
	 * 
	 */
	_getLastVisibleEvent() {
		return this._getLastEventBeforeTime(this._getLastVisibleTime());
	}

	/**
	 * 
	 */
	_getEventNodeRank(eventNode) {
		return Array.prototype.indexOf.call(this.children, eventNode);
	}

	/**
	 * 
	 */
	_getVisibleEventNodes() {
		let visibleEventsSelector = "ktbs4la2-timeline-event[slot = \"visible\"]:not([visible = \"false\"]):not([visible = \"0\"])";
		return this.querySelectorAll(visibleEventsSelector);
	}

	/**
	 * 
	 */
	_getInvisibleEventNodes() {
		let outOfFrameEventsSelector = "ktbs4la2-timeline-event:not([slot = \"visible\"]), ktbs4la2-timeline-event:[visible = \"false\"], ktbs4la2-timeline-event:[visible = \"0\"]";
		return this.querySelectorAll(outOfFrameEventsSelector);
	}

	/**
	 * 
	 */
	_getEventNodesInDisplayedTime() {
		let firstVisibleRank = this._getEventNodeRank(this._getFirstVisibleEvent());
		let lastVisibleRank = this._getEventNodeRank(this._getLastVisibleEvent());
		let visibleEventsSelector = "ktbs4la2-timeline-event:nth-child(n+" + (firstVisibleRank + 1) + "):not(:nth-child(n+" + (lastVisibleRank + 2) + "))";
		return this.querySelectorAll(visibleEventsSelector);
	}

	/**
	 * 
	 */
	_getEventNodesOutOfDisplayedTime() {
		let firstVisibleRank = this._getEventNodeRank(this._getFirstVisibleEvent());
		let lastVisibleRank = this._getEventNodeRank(this._getLastVisibleEvent());
		let outOfFrameEventsSelector = "ktbs4la2-timeline-event:not(:nth-child(n+" + (firstVisibleRank + 1) + ")), ktbs4la2-timeline-event:nth-child(n+" + (lastVisibleRank + 2) + ")";
		return this.querySelectorAll(outOfFrameEventsSelector);
	}

	/**
	 * 
	 */
	_getNotUpdatedVisibleEventNodes() {
		let firstVisibleRank = this._getEventNodeRank(this._getFirstVisibleEvent());
		let lastVisibleRank = this._getEventNodeRank(this._getLastVisibleEvent());
		let visibleEventsSelector = "ktbs4la2-timeline-event:not([slot = \"visible\"]):nth-child(n+" + (firstVisibleRank + 1) + "):not(:nth-child(n+" + (lastVisibleRank + 2) + ")):not([visible = \"0\"]):not([visible = \"false\"])";
		return this.querySelectorAll(visibleEventsSelector);
	}

	/**
	 * 
	 */
	_getNotUpdatedOutOfFrameEventNodes() {
		let firstVisibleRank = this._getEventNodeRank(this._getFirstVisibleEvent());
		let lastVisibleRank = this._getEventNodeRank(this._getLastVisibleEvent());
		let outOfFrameEventsSelector = "ktbs4la2-timeline-event[slot = \"visible\"][visible = \"0\"], ktbs4la2-timeline-event[slot = \"visible\"][visible = \"false\"], ktbs4la2-timeline-event[slot = \"visible\"]:not(:nth-child(n+" + (firstVisibleRank + 1) + ")), ktbs4la2-timeline-event[slot = \"visible\"]:nth-child(n+" + (lastVisibleRank + 2) + ")";
		return this.querySelectorAll(outOfFrameEventsSelector);
	}

	/**
	 * 
	 */
	_hideOutOfFrameEventNodes() {
		let outOfFrameEventNodes = this._getNotUpdatedOutOfFrameEventNodes();

		for(let i = 0; i < outOfFrameEventNodes.length; i++) {
			let eventNode = outOfFrameEventNodes[i];
			eventNode.removeAttribute("slot");
		}
	}

	/**
	 * 
	 */
	_sortEventNodes() {
		let inversionProcessed;
		
		do {
			inversionProcessed = false;
			let eventNodes = this._getAllEventNodes();

			for(let i = 0; i < (eventNodes.length - 1); i++)
				if(parseInt(eventNodes[i].getAttribute("begin")) > parseInt(eventNodes[i+1].getAttribute("begin"))) {
					eventNodes[i].before(eventNodes[i+1]);
					inversionProcessed = true;
				}
		} while(inversionProcessed);
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

		if(addedOrRemovedEvent)
			this._updateIsEmpty();

		if(addedOrRemovedEvent || changedEventVisibility)
			this._componentReady.then(() => {
				if(addedOrRemovedEvent)
					this._sortEventNodes();
					
				this._requestUpdateEventsView();
			});
	}

	/**
	 * 
	 */
	_updateEventsRows() {
		this._componentReady.then(function() {
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
				let events = this._getEventNodesInDisplayedTime();

				for(let i = 0; i < events.length; i++) {
					let currentEvent = events[i];
					let currentEventVisibleAttrValue = currentEvent.getAttribute("visible");
					let currentEventIsHidden = ((currentEventVisibleAttrValue == "false") || (currentEventVisibleAttrValue == "0"));

					if(!currentEventIsHidden) {
						let currentEventTime = parseInt(currentEvent.getAttribute("begin"));
						let availableRow = null;

						if(currentEventTime >= minDisplayableTime) {
							for(let j = 0; (j < previousEventsPerRow.length) && (j <= 19) && (availableRow == null); j++) {
								let previousEvent = previousEventsPerRow[j];

								if(previousEvent.getAttribute("shape") && (previousEvent.getAttribute("shape") != "duration-bar")) {
									let previousEventTime = parseInt(previousEvent.getAttribute("begin"));
									let timeDelta = currentEventTime - previousEventTime;

									if(timeDelta >= timeBeginThreshold)
										availableRow = j;
								}
								else {
									let previousEventBeginTime = parseInt(previousEvent.getAttribute("begin"));
									let previousEventEndTime = parseInt(previousEvent.getAttribute("end"));

									let timeBeginDelta = currentEventTime - previousEventBeginTime;
									let timeEndDelta = currentEventTime - previousEventEndTime;

									if((timeBeginDelta >= timeBeginThreshold) && (timeEndDelta > timeEndThreshold))
										availableRow = j;
								}
							}
						}

						if(availableRow == null)
							availableRow = previousEventsPerRow.length;

						if(availableRow <= 18) {
							if(!currentEvent.getAttribute("slot"))
								currentEvent.setAttribute("slot", "visible");

							currentEvent.setAttribute("row", availableRow);

							previousEventsPerRow[availableRow] = currentEvent;
							previousEventsTimePerRow[availableRow] = currentEventTime;

							if(previousEventsPerRow.length >= 18)
								minDisplayableTime = Math.min(...previousEventsTimePerRow) + timeBeginThreshold;	
						}
						else {
							if(currentEvent.getAttribute("row"))
								currentEvent.removeAttribute("row");

							if(currentEvent.getAttribute("slot"))
								currentEvent.removeAttribute("slot");
						}
					}
					/*else {
						if(currentEvent.getAttribute("row"))
							currentEvent.removeAttribute("row");

						if(currentEvent.getAttribute("slot"))
							currentEvent.removeAttribute("slot");
					}*/
				}
			}
		}.bind(this));
	}

	/**
	 * Gets the time unit of a time division node
	 * @param HTMLElement node the time division node to get the time unit from
	 * @return string the time unit (can be one of "year", "month", "day", "hour", "minute", "second" of "millisecond"
	 */
	_getDivisionUnit(node) {
		let divisionUnit;

		for(let i = 0; (!divisionUnit) && (i < node.classList.length); i++) {
			let className = node.classList[i];

			if(className.substring(0,14) == "time-division-")
				divisionUnit = className.substring(14);
		}

		return divisionUnit;
	}

	/**
	 * Gets the timestamp  of a time division node
	 * @param HTMLElement node the time division node to get the timestamp from
	 * @param boolean divisionEnd whether of not we should return the time corresponding to the end of the division (default : false)
	 * @return int
	 */
	_getDivisionTimeStamp(node, divisionEnd = false) {
		let divisionType = this._getDivisionUnit(node);

		let dateString;

		if(divisionEnd != true) {
			switch(divisionType) {
				case "year":
					dateString = node.getAttribute("id") + "-01-01T00:00:00.000";
					break;
				case "month":
					dateString = node.getAttribute("id") + "-01T00:00:00.000";
					break;
				case "day":
					dateString = node.getAttribute("id") + "T00:00:00.000";
					break;
				case "hour":
					dateString = node.getAttribute("id").substring(0,10) + "T" + node.getAttribute("id").substring(11,13) +":00:00.000";
					break;
				case "minute":
					dateString = node.getAttribute("id").substring(0,10) + "T" + node.getAttribute("id").substring(11,13) +":" + node.getAttribute("id").substring(14,16) + ":00.000";
					break;
				case "second":
					dateString = node.getAttribute("id").substring(0,10) + "T" + node.getAttribute("id").substring(11,13) +":" + node.getAttribute("id").substring(14,16) + ":" + node.getAttribute("id").substring(17,19) + ".000";
					break;
			}
		}
		else {
			switch(divisionType) {
				case "year":
					dateString = node.getAttribute("id") + "-12-31T23:59:59.999";
					break;
				case "month":
					let year = node.getAttribute("id").substring(0, 4);
					let month = node.getAttribute("id").substring(5, 7);
					dateString = year + "-" + month + "-" + this._getNumberOfDaysInMonth(parseInt(month), parseInt(year)) + "T23:59:59.999";
					break;
				case "day":
					dateString = node.getAttribute("id") + "T23:59:59.999";
					break;
				case "hour":
					dateString = node.getAttribute("id").substring(0,10) + "T" + node.getAttribute("id").substring(11,13) +":59:59.999";
					break;
				case "minute":
					dateString = node.getAttribute("id").substring(0,10) + "T" + node.getAttribute("id").substring(11,13) +":" + node.getAttribute("id").substring(14,16) + ":59.999";
					break;
				case "second":
					dateString = node.getAttribute("id").substring(0,10) + "T" + node.getAttribute("id").substring(11,13) +":" + node.getAttribute("id").substring(14,16) + ":" + node.getAttribute("id").substring(17,19) + ".999";
					break;
			}
		}
		
		let dateObject = new Date(dateString);
		return(dateObject.getTime());
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push("begin");
		observedAttributes.push("end");
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
		this._displayWindow = this.shadowRoot.querySelector("#display-window");
		this._timeDiv = this.shadowRoot.querySelector("#time");
		this._eventsDiv = this.shadowRoot.querySelector("#events");

		this._divWidthRulesStylesheet = this.shadowRoot.styleSheets[1];
		this._divWidthRulesStylesheet.insertRule("#events {}");
		this._divWidthRulesStylesheet.insertRule(".time-division-second {}");
		this._divWidthRulesStylesheet.insertRule(".time-division-minute {}");
		this._divWidthRulesStylesheet.insertRule(".time-division-hour {}");
		this._divWidthRulesStylesheet.insertRule(".time-division-day {}");
		this._divWidthRulesStylesheet.insertRule(".time-division-month.month-28 {}");
		this._divWidthRulesStylesheet.insertRule(".time-division-month.month-29 {}");
		this._divWidthRulesStylesheet.insertRule(".time-division-month.month-30 {}");
		this._divWidthRulesStylesheet.insertRule(".time-division-month.month-31 {}");
		this._divWidthRulesStylesheet.insertRule(".time-division-year.year-365 {}");
		this._divWidthRulesStylesheet.insertRule(".time-division-year.year-366 {}");
		this._divWidthRulesIndexes = {"year.year-366": 0, "year.year-365": 1, "month.month-31": 2, "month.month-30": 3, "month.month-29": 4, "month.month-28": 5, "day": 6, "hour": 7, "minute": 8, "second": 9};

		this._displayWindow.addEventListener("wheel", this._onMouseWheel.bind(this));
		this._displayWindow.addEventListener("mousedown", this._onMouseDown.bind(this));
		this._displayWindow.addEventListener("scroll", this._onScroll.bind(this));

		this._updateIsEmpty();
	}

	/**
	 * 
	 */
	_onScroll(event) {
		event.preventDefault();
		this._requestUpdateEventsView();
		this._requestUpdateVisibleDivisions();
	}

	/**
	 * 
	 */
	_requestUpdateVisibleDivisions() {
		if(this._requestUpdateVisibleDivisionsID != null)
			clearTimeout(this._requestUpdateVisibleDivisionsID);

		this._requestUpdateVisibleDivisionsID = setTimeout(function() {
			window.requestAnimationFrame(function() {
				this._updateVisibleDivisions();
				this._requestUpdateVisibleDivisionsID = null;
			}.bind(this));
		}.bind(this), this._updateVisibleDivisionsDelay);
	}

	/**
	 * 
	 */
	_updateVisibleDivisions() {
		let currentDivisionLevel = this._widgetContainer.className;

		if(currentDivisionLevel != "year") {
			let timeBegin = parseInt(this.getAttribute("begin"));
			let timeBeginDate = new Date(timeBegin);
			let timeBeginYear = timeBeginDate.getFullYear();
			let timeBeginMonth = timeBeginDate.getMonth() + 1;
			let timeBeginDay = timeBeginDate.getDate();
			let timeBeginHour = timeBeginDate.getHours();
			let timeBeginMinute = timeBeginDate.getMinutes();
			let timeBeginSecond = timeBeginDate.getSeconds();

			let timeEnd = parseInt(this.getAttribute("end"));
			let timeEndDate = new Date(timeEnd);
			let timeEndYear = timeEndDate.getFullYear();
			let timeEndMonth = timeEndDate.getMonth() + 1;
			let timeEndDay = timeEndDate.getDate();
			let timeEndHour = timeEndDate.getHours();
			let timeEndMinute = timeEndDate.getMinutes();
			let timeEndSecond = timeEndDate.getSeconds();

			let viewBegin = this._getFirstVisibleTime();
			let viewBeginDate = new Date(viewBegin);
			let viewBeginYear = viewBeginDate.getFullYear();
			let viewBeginMonth = viewBeginDate.getMonth() + 1;
			let viewBeginDay = viewBeginDate.getDate();
			let viewBeginHour = viewBeginDate.getHours();
			let viewBeginMinute = viewBeginDate.getMinutes();
			let viewBeginSecond = viewBeginDate.getSeconds();

			let viewEnd = this._getLastVisibleTime();
			let viewEndDate = new Date(viewEnd);
			let viewEndYear = viewEndDate.getFullYear();
			let viewEndMonth = viewEndDate.getMonth() + 1;
			let viewEndDay = viewEndDate.getDate();
			let viewEndHour = viewEndDate.getHours();
			let viewEndMinute = viewEndDate.getMinutes();
			let viewEndSecond = viewEndDate.getSeconds();

			for(let currentYear = viewBeginYear; currentYear <= viewEndYear; currentYear++) {
				let currentYearDivisionID = currentYear;
				let currentYearDivision = this.shadowRoot.getElementById(currentYearDivisionID);

				if(currentYearDivision) {
					if(!currentYearDivision.classList.contains("subdivided")) {
						let currentYearBeginMonth, currentYearEndMonth;

						if((currentYear == timeBeginYear) && (this._initialLevel == "month"))
							currentYearBeginMonth = timeBeginMonth;
						else
							currentYearBeginMonth = 1;

						if((currentYear == timeEndYear) &&  (this._initialLevel == "month"))
							currentYearEndMonth = timeEndMonth;
						else
							currentYearEndMonth = 12;

						this._addDivisions(currentYearBeginMonth, currentYearEndMonth, "month", currentYearDivision);
					}

					if((currentDivisionLevel == "day") || (currentDivisionLevel == "hour") || (currentDivisionLevel == "minute") || (currentDivisionLevel == "second")) {
						let currentYearViewBeginMonth, currentYearViewEndMonth;

						if(currentYear == viewBeginYear)
							currentYearViewBeginMonth = viewBeginMonth;
						else
							currentYearViewBeginMonth = 1;

						if(currentYear == viewEndYear)
							currentYearViewEndMonth = viewEndMonth;
						else
							currentYearViewEndMonth = 12;
					
						for(let currentMonth = currentYearViewBeginMonth; currentMonth <= currentYearViewEndMonth; currentMonth++) {
							let currentMonthDivisionID = currentYear + "-" + currentMonth.toString().padStart(2, '0');
							let currentMonthDivision = this.shadowRoot.getElementById(currentMonthDivisionID);

							if(currentMonthDivision) {
								if(!currentMonthDivision.classList.contains("subdivided")) {
									let currentMonthBeginDay, currentMonthEndDay;
									
									if((currentYear == timeBeginYear) && (currentMonth == timeBeginMonth) && (this._initialLevel == "day"))
										currentMonthBeginDay = timeBeginDay;
									else
										currentMonthBeginDay = 1;

									if((currentYear == timeEndYear) && (currentMonth == timeEndMonth) && (this._initialLevel == "day"))
										currentMonthEndDay = timeEndDay;
									else
										currentMonthEndDay = this._getNumberOfDaysInMonth(currentMonth, currentYear);
	

									this._addDivisions(currentMonthBeginDay, currentMonthEndDay, "day", currentMonthDivision);
								}

								if((currentDivisionLevel == "hour") || (currentDivisionLevel == "minute") || (currentDivisionLevel == "second")) {
									let currentMonthViewBeginDay, currentMonthViewEndDay;

									if((currentYear == viewBeginYear) && (currentMonth == viewBeginMonth))
										currentMonthViewBeginDay = viewBeginDay;
									else
										currentMonthViewBeginDay = 1;

									if((currentYear == viewEndYear) && (currentMonth == viewEndMonth))
										currentMonthViewEndDay = viewEndDay;
									else
										currentMonthViewEndDay = this._getNumberOfDaysInMonth(currentMonth, currentYear);

									for(let currentDay = currentMonthViewBeginDay; currentDay <= currentMonthViewEndDay; currentDay++) {
										let currentDayDivisionID = currentYear + "-" + currentMonth.toString().padStart(2, '0') + "-" + currentDay.toString().padStart(2, '0');
										let currentDayDivision = this.shadowRoot.getElementById(currentDayDivisionID);

										if(currentDayDivision) {
											if(!currentDayDivision.classList.contains("subdivided")) {
												let currentDayBeginHour, currentDayEndHour;
												
												if((currentYear == timeBeginYear) && (currentMonth == timeBeginMonth) && (currentDay == timeBeginDay) && (this._initialLevel == "hour"))
													currentDayBeginHour = timeBeginHour;
												else
													currentDayBeginHour = 0;
			
												if((currentYear == timeEndYear) && (currentMonth == timeEndMonth) && (currentDay == timeEndDay) && (this._initialLevel == "hour"))
													currentDayEndHour = timeEndHour;
												else
													currentDayEndHour = 23;
			
												this._addDivisions(currentDayBeginHour, currentDayEndHour, "hour", currentDayDivision);
											}

											if((currentDivisionLevel == "minute") || (currentDivisionLevel == "second")) {
												let currentDayViewBeginHour, currentDayViewEndHour;

												if((currentYear == viewBeginYear) && (currentMonth == viewBeginMonth) && (currentDay == viewBeginDay))
													currentDayViewBeginHour = viewBeginHour;
												else
													currentDayViewBeginHour = 0;

												if((currentYear == viewEndYear) && (currentMonth == viewEndMonth) && (currentDay == viewEndDay))
													currentDayViewEndHour = viewEndHour;
												else
													currentDayViewEndHour = 23;

												for(let currentHour = currentDayViewBeginHour; currentHour <= currentDayViewEndHour; currentHour++) {
													let currentHourDivisionID = currentYear + "-" + currentMonth.toString().padStart(2, '0') + "-" + currentDay.toString().padStart(2, '0') + "-" + currentHour.toString().padStart(2, '0');
													let currentHourDivision = this.shadowRoot.getElementById(currentHourDivisionID);

													if(currentHourDivision) {
														if(!currentHourDivision.classList.contains("subdivided")) {
															let currentHourBeginMinute, currentHourEndMinute;
															
															if((currentYear == timeBeginYear) && (currentMonth == timeBeginMonth) && (currentDay == timeBeginDay) && (currentHour == timeBeginHour) && (this._initialLevel == "minute"))
																currentHourBeginMinute = timeBeginMinute;
															else
																currentHourBeginMinute = 0;
						
															if((currentYear == timeEndYear) && (currentMonth == timeEndMonth) && (currentDay == timeEndDay) && (currentHour == timeEndHour) && (this._initialLevel == "minute"))
																currentHourEndMinute = timeEndMinute;
															else
																currentHourEndMinute = 59;
						
															this._addDivisions(currentHourBeginMinute, currentHourEndMinute, "minute", currentHourDivision);
														}

														if(currentDivisionLevel == "second") {
															let currentHourViewBeginMinute, currentHourViewEndMinute;

															if((currentYear == viewBeginYear) && (currentMonth == viewBeginMonth) && (currentDay == viewBeginDay) && (currentHour == viewBeginHour))
																currentHourViewBeginMinute = viewBeginMinute;
															else
																currentHourViewBeginMinute = 0;

															if((currentYear == viewEndYear) && (currentMonth == viewEndMonth) && (currentDay == viewEndDay) && (currentHour == viewEndHour))
																currentHourViewEndMinute = viewEndMinute;
															else
																currentHourViewEndMinute = 23;

															for(let currentMinute = currentHourViewBeginMinute; currentMinute <= currentHourViewEndMinute; currentMinute++) {
																let currentMinuteDivisionID = currentYear + "-" + currentMonth.toString().padStart(2, '0') + "-" + currentDay.toString().padStart(2, '0') + "-" + currentHour.toString().padStart(2, '0') + "-" + currentMinute.toString().padStart(2, '0');
																let currentMinuteDivision = this.shadowRoot.getElementById(currentMinuteDivisionID);

																if(currentMinuteDivision) {
																	if(!currentMinuteDivision.classList.contains("subdivided")) {
																		let currentMinuteBeginSecond, currentMinuteEndSecond;
																		
																		if((currentYear == timeBeginYear) && (currentMonth == timeBeginMonth) && (currentDay == timeBeginDay) && (currentHour == timeBeginHour) && (currentMinute == timeBeginMinute) && (this._initialLevel == "second"))
																			currentMinuteBeginSecond = timeBeginSecond;
																		else
																			currentMinuteBeginSecond = 0;
									
																		if((currentYear == timeEndYear) && (currentMonth == timeEndMonth) && (currentDay == timeEndDay) && (currentHour == timeEndHour) && (currentMinute == timeEndMinute) && (this._initialLevel == "second"))
																			currentMinuteEndSecond = timeEndSecond;
																		else
																			currentMinuteEndSecond = 59;
									
																		this._addDivisions(currentMinuteBeginSecond, currentMinuteEndSecond, "second", currentMinuteDivision);
																	}
																}
																else
																	console.error("minute subdivision #" + currentMinuteDivisionID + " not found");
															}
														}
													}
													else
														console.error("hour subdivision #" + currentHourDivisionID + " not found");
												}
											}
										}
										else
											console.error("day subdivision #" + currentDayDivisionID + " not found");
									}
								}
							}
							else
								console.error("month subdivision #" + currentMonthDivisionID + " not found");
						}
					}
				}
				else
					console.error("year subdivision #" + currentYearDivisionID + " not found");
			}
		}
	}

	/**
	 * 
	 */
	_onMouseDown(event) {
		event.preventDefault();

		if(this._displayWindow.classList.contains("scrollable")) {
			this._is_dragging = true;
			this._drag_origin_x = event.clientX;
			this._initial_scroll = this._displayWindow.scrollLeft;

			if(!this._displayWindow.classList.contains("scrolled"))
				this._displayWindow.classList.add("scrolled");

			this._displayWindow.addEventListener("mousemove", this._bindedDragFunction, true);
			window.document.addEventListener("mouseup", this._bindedStopDraggingFunction, true);
		}
	}

	/**
	 * 
	 */
	_onDrag(event) {
		event.preventDefault();
		let mouseX = event.clientX;
		let dragDelta = this._drag_origin_x - mouseX;
		let newScrollLeft = this._initial_scroll + dragDelta;
		this._displayWindow.scrollLeft = newScrollLeft;
	}

	/**
	 * 
	 */
	_onStopDragging(event) {
		event.preventDefault();
		this._displayWindow.removeEventListener("mousemove", this._bindedDragFunction, true);
		window.document.removeEventListener("mouseup", this._bindedStopDraggingFunction, true);

		if(this._displayWindow.classList.contains("scrolled"))
			this._displayWindow.classList.remove("scrolled");

		this._is_dragging = false;
		this._drag_origin_x = null;
	}

	/**
	 * 
	 */
	_requestUpdateEventsView() {
		if(this._requestUpdateEventsID != null)
			clearTimeout(this._requestUpdateEventsID);

		this._requestUpdateEventsID = setTimeout(function() {
			window.requestAnimationFrame(function() {
				this._hideOutOfFrameEventNodes();			
				this._updateEventsRows();
				this._requestUpdateEventsID = null;
			}.bind(this));
		}.bind(this), this._updateEventViewMinDelay);
	}

	/**
	 * 
	 */
	_removeDivWidthRule(type) {
		this._divWidthRulesStylesheet.deleteRule(this._divWidthRulesIndexes[type]);
		this._divWidthRulesStylesheet.insertRule(".time-division-" + type + " {}", this._divWidthRulesIndexes[type]);
	}

	/**
	 * 
	 */
	_setSingleDivWidthRule(type, width, lowestLevel = false) {
		this._divWidthRulesStylesheet.deleteRule(this._divWidthRulesIndexes[type]);
		let ruleString;

		if(lowestLevel == true) {
			ruleString = ".time-division-" + type + " {width: " + width + "px;}";
		}
		else {
			ruleString = ".time-division-" + type + ":not(.subdivided) {width: " + width + "px;}";
		}

		this._divWidthRulesStylesheet.insertRule(ruleString, this._divWidthRulesIndexes[type]);
	}

	/**
	 * 
	 */
	_setWidthRules(newLevel, newDivWidth) {
		this._widgetContainer.className = newLevel;
		this._lowestLevelDivWidth = newDivWidth;

		switch(newLevel) {
			case "year":
				this._setSingleDivWidthRule("year.year-366", newDivWidth, true);
				this._setSingleDivWidthRule("year.year-365", (newDivWidth * 365) /366, true);
				this._removeDivWidthRule("month.month-31");
				this._removeDivWidthRule("month.month-30");
				this._removeDivWidthRule("month.month-29");
				this._removeDivWidthRule("month.month-28");
				this._removeDivWidthRule("day");
				this._removeDivWidthRule("hour");
				this._removeDivWidthRule("minute");
				this._removeDivWidthRule("second");
				break;
			case "month":
				this._setSingleDivWidthRule("year.year-366", newDivWidth * 12);
				this._setSingleDivWidthRule("year.year-365", (newDivWidth * 12 * 365) /366);
				this._setSingleDivWidthRule("month.month-31", newDivWidth, true);
				this._setSingleDivWidthRule("month.month-30", (newDivWidth * 30) /31, true);
				this._setSingleDivWidthRule("month.month-29", (newDivWidth * 29) /31, true);
				this._setSingleDivWidthRule("month.month-28", (newDivWidth * 28) /31, true);
				this._removeDivWidthRule("day");
				this._removeDivWidthRule("hour");
				this._removeDivWidthRule("minute");
				this._removeDivWidthRule("second");
				break;
			case "day":
				this._setSingleDivWidthRule("year.year-366", newDivWidth * 366);
				this._setSingleDivWidthRule("year.year-365", newDivWidth * 365);
				this._setSingleDivWidthRule("month.month-31", newDivWidth * 31);
				this._setSingleDivWidthRule("month.month-30", newDivWidth * 30);
				this._setSingleDivWidthRule("month.month-29", newDivWidth * 29);
				this._setSingleDivWidthRule("month.month-28", newDivWidth * 28);
				this._setSingleDivWidthRule("day", newDivWidth, true);
				this._removeDivWidthRule("hour");
				this._removeDivWidthRule("minute");
				this._removeDivWidthRule("second");
				break;
			case "hour":
				this._setSingleDivWidthRule("year.year-366", newDivWidth * (366 * 24));
				this._setSingleDivWidthRule("year.year-365", newDivWidth * (365 * 24));
				this._setSingleDivWidthRule("month.month-31", newDivWidth * (31 * 24));
				this._setSingleDivWidthRule("month.month-30", newDivWidth * (30 * 24));
				this._setSingleDivWidthRule("month.month-29", newDivWidth * (29 * 24));
				this._setSingleDivWidthRule("month.month-28", newDivWidth * (28 * 24));
				this._setSingleDivWidthRule("day", newDivWidth * 24);
				this._setSingleDivWidthRule("hour", newDivWidth, true);
				this._removeDivWidthRule("minute");
				this._removeDivWidthRule("second");
				break;
			case "minute":
				this._setSingleDivWidthRule("year.year-366", newDivWidth * (366 * 24 * 60));
				this._setSingleDivWidthRule("year.year-365", newDivWidth * (365 * 24 * 60));
				this._setSingleDivWidthRule("month.month-31", newDivWidth * (31 * 24 * 60));
				this._setSingleDivWidthRule("month.month-30", newDivWidth * (30 * 24 * 60));
				this._setSingleDivWidthRule("month.month-29", newDivWidth * (29 * 24 * 60));
				this._setSingleDivWidthRule("month.month-28", newDivWidth * (28 * 24 * 60));
				this._setSingleDivWidthRule("day", newDivWidth * (24 * 60));
				this._setSingleDivWidthRule("hour", newDivWidth * 60);
				this._setSingleDivWidthRule("minute", newDivWidth, true);
				this._removeDivWidthRule("second");
				break;
			case "second":
				this._setSingleDivWidthRule("year.year-366", newDivWidth * (366 * 24 * 60 * 60));
				this._setSingleDivWidthRule("year.year-365", newDivWidth * (365 * 24 * 60 * 60));
				this._setSingleDivWidthRule("month.month-31", newDivWidth * (31 * 24 * 60 * 60));
				this._setSingleDivWidthRule("month.month-30", newDivWidth * (30 * 24 * 60 * 60));
				this._setSingleDivWidthRule("month.month-29", newDivWidth * (29 * 24 * 60 * 60));
				this._setSingleDivWidthRule("month.month-28", newDivWidth * (28 * 24 * 60 * 60));
				this._setSingleDivWidthRule("day", newDivWidth * (24 * 60 * 60));
				this._setSingleDivWidthRule("hour", newDivWidth * (60 * 60));
				this._setSingleDivWidthRule("minute", newDivWidth * 60);
				this._setSingleDivWidthRule("second", newDivWidth, true);
				break;
		}
	}

	/**
	 * 
	 */
	_addDivisions(begin, end, unit, parent) {
		let intanciatedDivisionsCount = 0;

		if(!parent.classList.contains("subdivided")) {
			for(let current = begin; current <= end; current++) {
				let division = document.createElement("div");

				let division_id;

				if(unit == "year")
					division_id = current;
				else
					division_id = parent.getAttribute("id") + "-" + current.toString().padStart(2, '0');

				division.setAttribute("id", division_id);
				division.classList.add("time-division");
				division.classList.add("time-division-" + unit);

				if(unit == "year") {
					let nbOfDays = this._getNumberOfDaysInYear(current);
					division.classList.add("year-" + nbOfDays);
				}
				if(unit == "month") {
					let year = parent.getAttribute("id");
					let month = current;
					let nbOfDays = this._getNumberOfDaysInMonth(month, year);
					division.classList.add("month-" + nbOfDays);
				}

				let label = document.createElement("span");
				label.classList.add("label");

				switch(unit) {
					case "year" :
						label.innerText = current;
						break;
					case "month" :
						label.innerText = this._translateString(KTBS4LA2Timeline.monthNames[current]);
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
	 * Gets the number of days in a particular year
	 * @param int year
	 * @return int
	 */
	_getNumberOfDaysInYear(year) {
		let isLeapYear = (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0));
		return isLeapYear ? 366 : 365;
	}

	/**
	 * Gets trhe number of days in a particular month
	 * @param int month the number of the month 
	 * @param int year the year
	 */
	_getNumberOfDaysInMonth(month, year) {
		return new Date(year, month, 0).getDate();
	}

	/**
	 * Creates the time divisions for the initial view of the timeline, so it fits to the space available for display, with a relevant time granularity
	 */
	_initTimeDivisions() {
		if(this.getAttribute("begin") && this.getAttribute("end")) {
			let beginTime = parseInt(this.getAttribute("begin"));
			let endTime = parseInt(this.getAttribute("end"));

			if((beginTime != NaN) && (endTime != NaN) && (beginTime <= endTime)) {
				let lowestFullyInstanciatedLevel = "year";
				let beginDate = new Date(beginTime);
				let endDate = new Date(endTime);
				let availableWidth = this._displayWindow.clientWidth;
				let displayableDivCount = Math.round(availableWidth / this._minDivisionWidth);

				// create the "years" subdivisions
				let lowestLevelntanciatedDivisionsCount = this._addDivisions(beginDate.getFullYear(), endDate.getFullYear(), "year", this._timeDiv);

				// calculate how many new subdivisions would be created if we go to "month" level
				let yearDivisions = this._timeDiv.querySelectorAll(".time-division-year");
				let requiredSubDivisionsCount = 0;

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
						lowestLevelntanciatedDivisionsCount += this._addDivisions(beginMonth, endMonth, "month", yearDivision);
					}

					// calculate how many new subdivisions would be created if we go to "day" level
					let monthDivisions = this._timeDiv.querySelectorAll(".time-division-month");
					let requiredSubDivisionsCount = 0;
					
					for(let i = 0; i < monthDivisions.length; i++) {
						let monthDivision = monthDivisions[i];
						let currentMonth = parseInt(monthDivision.getAttribute("id").substring(5,7));
						let currentYear = parseInt(monthDivision.getAttribute("id").substring(0,4));
						let daysCountInCurrentMonth = this._getNumberOfDaysInMonth(currentMonth, currentYear);
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
							let daysCountInCurrentMonth = this._getNumberOfDaysInMonth(currentMonth, currentYear);
							let beginDay = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)))?(beginDate.getDate()):1;
							let endDay = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)))?(endDate.getDate()):daysCountInCurrentMonth;

							// ... add new day subdivision in the current month subdivision 
							lowestLevelntanciatedDivisionsCount += this._addDivisions(beginDay, endDay, "day", monthDivision);
						}

						// calculate how many new subdivisions would be created if we go to "hour" level
						let dayDivisions = this._timeDiv.querySelectorAll(".time-division-day");
						let requiredSubDivisionsCount = 0;

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
								lowestLevelntanciatedDivisionsCount += this._addDivisions(beginHour, endHour, "hour", dayDivision);
							}

							// calculate how many new subdivisions would be created if we go to "minute" level
							let hourDivisions = this._timeDiv.querySelectorAll(".time-division-hour");
							let requiredSubDivisionsCount = 0;

							for(let i = 0; i < hourDivisions.length; i++) {
								let hourDivision = hourDivisions[i];
								let currentHour = parseInt(hourDivision.getAttribute("id").substring(11,13));
								let currentDay = parseInt(hourDivision.getAttribute("id").substring(8,10));
								let currentMonth = parseInt(hourDivision.getAttribute("id").substring(5,7));
								let currentYear = parseInt(hourDivision.getAttribute("id").substring(0,4));
								let beginMinute = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()))?(beginDate.getMinutes()):0;
								let endMinute = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()))?(endDate.getMinutes()):59;
								let minuteDifference = (endMinute - beginMinute) + 1;
								requiredSubDivisionsCount += minuteDifference;
							}

							// if minutes subdivisions would fit in the display area, create them
							if(requiredSubDivisionsCount <= displayableDivCount) {
								lowestFullyInstanciatedLevel = "minute";
								lowestLevelntanciatedDivisionsCount = 0;

								for(let i = 0; i < hourDivisions.length; i++) {
									let hourDivision = hourDivisions[i];
									let currentHour = parseInt(hourDivision.getAttribute("id").substring(11,13));
									let currentDay = parseInt(hourDivision.getAttribute("id").substring(8,10));
									let currentMonth = parseInt(hourDivision.getAttribute("id").substring(5,7));
									let currentYear = parseInt(hourDivision.getAttribute("id").substring(0,4));
									let beginMinute = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()))?(beginDate.getMinutes()):0;
									let endMinute = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()))?(endDate.getMinutes()):59;
								
									// ... add new minute subdivisions in the current hour subdivision
									lowestLevelntanciatedDivisionsCount += this._addDivisions(beginMinute, endMinute, "minute", hourDivision);
								}

								// calculate how many new subdivisions would be created if we go to "minute" level
								let minuteDivisions = this._timeDiv.querySelectorAll(".time-division-minute");
								let requiredSubDivisionsCount = 0;

								for(let i = 0; i < minuteDivisions.length; i++) {
									let minuteDivision = minuteDivisions[i];
									let currentMinute = parseInt(minuteDivision.getAttribute("id").substring(14,16));
									let currentHour = parseInt(minuteDivision.getAttribute("id").substring(11,13));
									let currentDay = parseInt(minuteDivision.getAttribute("id").substring(8,10));
									let currentMonth = parseInt(minuteDivision.getAttribute("id").substring(5,7));
									let currentYear = parseInt(minuteDivision.getAttribute("id").substring(0,4));
									let beginSecond = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()) && (currentMinute == beginDate.getMinutes()))?(beginDate.getSeconds()):0;
									let endSecond = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()) && (currentMinute == endDate.getMinutes()))?(endDate.getSeconds()):59;
									let secondDifference = (endSecond - beginSecond) + 1;
									requiredSubDivisionsCount += secondDifference;
								}

								// if seconds subdivisions would fit in the display area, create them
								if(requiredSubDivisionsCount <= displayableDivCount) {
									lowestFullyInstanciatedLevel = "second";
									lowestLevelntanciatedDivisionsCount = 0;

									for(let i = 0; i < minuteDivisions.length; i++) {
										let minuteDivision = minuteDivisions[i];
										let currentMinute = parseInt(minuteDivision.getAttribute("id").substring(14,16));
										let currentHour = parseInt(minuteDivision.getAttribute("id").substring(11,13));
										let currentDay = parseInt(minuteDivision.getAttribute("id").substring(8,10));
										let currentMonth = parseInt(minuteDivision.getAttribute("id").substring(5,7));
										let currentYear = parseInt(minuteDivision.getAttribute("id").substring(0,4));
										let beginSecond = ((currentYear == beginDate.getFullYear()) && (currentMonth == (beginDate.getMonth() + 1)) && (currentDay == beginDate.getDate()) && (currentHour == beginDate.getHours()) && (currentMinute == beginDate.getMinutes()))?(beginDate.getSeconds()):0;
										let endSecond = ((currentYear == endDate.getFullYear()) && (currentMonth == (endDate.getMonth() + 1)) && (currentDay == endDate.getDate()) && (currentHour == endDate.getHours()) && (currentMinute == endDate.getMinutes()))?(endDate.getSeconds()):59;

										// ... add new seconds subdivisions in the current minute subdivision
										lowestLevelntanciatedDivisionsCount += this._addDivisions(beginSecond, endSecond, "second", minuteDivision);
									}
								}
							}
						}
					}
				}

				this._widgetContainer.className = lowestFullyInstanciatedLevel;
				this._initZoom();
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
	_initZoom() {
		this._initialLevel = this._widgetContainer.className;
		let timeDivs = this._timeDiv.querySelectorAll(".time-division-" + this._initialLevel);
		this._firstRepresentedTime = this._getDivisionTimeStamp(timeDivs[0]);
		this._lastRepresentedTime = this._getDivisionTimeStamp(timeDivs[timeDivs.length - 1], true);
		let availableWidth = this._displayWindow.clientWidth - 15;
		this._initialDivWidth = Math.floor(availableWidth / timeDivs.length);
		this._setWidthRules(this._initialLevel, this._initialDivWidth);
		this._resolveTimeDivisionsInitialized();
		this._requestUpdateEventsView();
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

				let posX = event.offsetX;
				this._requestZoomIncrement(verticalMovement, posX);
			}
		}
	}

	/**
	 * 
	 */
	_requestZoomIncrement(incrementAmount, mouseX) {
		this._requestedZoomIncrementAmount += incrementAmount;
		this._requestedZoomIncrementMouseX = mouseX;

		if(this._requestZoomIncrementID == null) {	
			this._requestZoomIncrementID = setTimeout(function() {
				window.requestAnimationFrame(function() {
					this._incrementZoom(this._requestedZoomIncrementAmount, this._requestedZoomIncrementMouseX);
					this._requestZoomIncrementID = null;
					this._requestedZoomIncrementAmount = 0;
				}.bind(this));
			}.bind(this), this._updateZoomDelay);
		}
	}

	/**
	 * 
	 */
	_incrementZoom(increment, mouseX) {
		let newLevel = this._widgetContainer.className;
		let newWidth = this._lowestLevelDivWidth * Math.exp(-increment / 10);

		// user zoomed out
		if(increment > 0) {
			while(newWidth < this._minDivisionWidth) {
				switch(newLevel) {
					case "second":
						newLevel = "minute";
						newWidth = newWidth * 60;
						break;
					case "minute":
						newLevel = "hour";
						newWidth = newWidth * 60;
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

			let newLevelHasReachedTop = (
					(newLevel == this._initialLevel)
				||	(newLevel == "year")
				||	(this._initialLevel == "second")
				||	((this._initialLevel == "minute") && (newLevel != "second"))
				||	((this._initialLevel == "hour") && (newLevel == "day"))
				||	((this._initialLevel == "hour") && (newLevel == "month"))
				||	((this._initialLevel == "hour") && (newLevel == "year"))
				||	((this._initialLevel == "day") && (newLevel == "month"))
				||	((this._initialLevel == "day") && (newLevel == "year"))
				||	((this._initialLevel == "month") && (newLevel == "year"))
			);

			if(newLevelHasReachedTop && (newWidth <= this._initialDivWidth)) {
				newLevel = this._initialLevel;
				newWidth = this._initialDivWidth;

				if(this._displayWindow.classList.contains("scrollable"))
					this._displayWindow.classList.remove("scrollable");
			}
		}
		// user zoomed in
		else {
			if((newLevel == "year") && (newWidth >= (this._minDivisionWidth * 12))) {
				newLevel = "month";
				newWidth = newWidth / 12;
			}

			if((newLevel == "month") && (newWidth >= (this._minDivisionWidth * 31))) {
				newLevel = "day";
				newWidth = newWidth / 31;
			}

			if((newLevel == "day") && (newWidth >= (this._minDivisionWidth * 24))) {
				newLevel = "hour";
				newWidth = newWidth / 24;
			}

			if((newLevel == "hour") && (newWidth >= (this._minDivisionWidth * 60))) {
				newLevel = "minute";
				newWidth = newWidth / 60;
			}

			if((newLevel == "minute") && (newWidth >= (this._minDivisionWidth * 60))) {
				newLevel = "second";
				newWidth = newWidth / 60;
			}

			if((newLevel == "second") && (newWidth > this._displayWindow.clienWidth))
				newWidth = this._displayWindow.clientWidth;

			//
			let newTimeDivWidth = this._timeDiv.clientWidth * Math.exp(-increment / 10);

			if(newTimeDivWidth >= 11000000) {
				newLevel = this._widgetContainer.className; 
				newWidth = this._lowestLevelDivWidth;
			}
			// ---

			if(!this._displayWindow.classList.contains("scrollable"))
				this._displayWindow.classList.add("scrollable");
		}

		if((newLevel != this._widgetContainer.className) || (newWidth != this._lowestLevelDivWidth)) {
			let mouseOffset = mouseX - this._displayWindow.scrollLeft;
			let ratioBefore = (this._lastRepresentedTime - this._firstRepresentedTime) / this._timeDiv.clientWidth;
			let mouseTime = this._firstRepresentedTime + mouseX * ratioBefore;
			this._setWidthRules(newLevel, newWidth);
			let ratioAfter = (this._lastRepresentedTime - this._firstRepresentedTime) / this._timeDiv.clientWidth;
			this._displayWindow.scrollLeft = ((mouseTime - this._firstRepresentedTime) / ratioAfter) - mouseOffset;
			this._requestUpdateEventsView();
			this._requestUpdateVisibleDivisions();
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
	_getLowestLevelVisibleDivisions() {
		let lowestFullyInstanciatedLevel = this._widgetContainer.className;
		let allYearDivs = this.shadowRoot.querySelectorAll(".time-division-year");
		let visibleYearDivs = new Array();

		for(let i = 0; i < allYearDivs.length; i++) {
			let yearDiv = allYearDivs[i];

			if(this._timeDivIsInView(yearDiv))
				visibleYearDivs.push(yearDiv);
		}

		if(lowestFullyInstanciatedLevel == "year")
			return visibleYearDivs;
		else {
			let visibleMonthDivs = new Array();

			for(let i = 0; i < visibleYearDivs.length; i++) {
				let yearDiv = visibleYearDivs[i];
				let childMonthDivs = yearDiv.querySelectorAll(".time-division-month");
				
				for(let j = 0; j < childMonthDivs.length; j++) {
					let monthDiv = childMonthDivs[j];

					if(this._timeDivIsInView(monthDiv))
						visibleMonthDivs.push(monthDiv);
				}
			}

			if(lowestFullyInstanciatedLevel == "month")
				return visibleMonthDivs;
			else {
				let visibleDayDivs = new Array();

				for(let i = 0; i < visibleMonthDivs.length; i++) {
					let monthDiv = visibleMonthDivs[i];
					let childDayDivs = monthDiv.querySelectorAll(".time-division-day");
					
					for(let j = 0; j < childDayDivs.length; j++) {
						let dayDiv = childDayDivs[j];

						if(this._timeDivIsInView(dayDiv))
							visibleDayDivs.push(dayDiv);
					}
				}

				if(lowestFullyInstanciatedLevel == "day")
					return visibleDayDivs;
				else {
					let visibleHourDivs = new Array();

					for(let i = 0; i < visibleDayDivs.length; i++) {
						let dayDiv = visibleDayDivs[i];
						let childHourDivs = dayDiv.querySelectorAll(".time-division-hour");

						for(let j = 0; j < childHourDivs.length; j++) {
							let hourDiv = childHourDivs[j];

							if(this._timeDivIsInView(hourDiv))
								visibleHourDivs.push(hourDiv);
						}
					}

					if(lowestFullyInstanciatedLevel == "hour")
						return visibleHourDivs;
					else {
						let visibleMinuteDivs = new Array();

						for(let i = 0; i < visibleHourDivs.length; i++) {
							let hourDiv = visibleHourDivs[i];
							let childMinuteDivs = hourDiv.querySelectorAll(".time-division-minute");

							for(let j = 0; j < childMinuteDivs.length; j++) {
								let minuteDiv = childMinuteDivs[j];

								if(this._timeDivIsInView(minuteDiv))
									visibleMinuteDivs.push(minuteDiv);
							}
						}

						if(lowestFullyInstanciatedLevel == "minute")
							return visibleMinuteDivs;
						else {
							let visibleSecondDivs = new Array();

							for(let i = 0; i < visibleMinuteDivs.length; i++) {
								let minuteDiv = visibleMinuteDivs[i];
								let childSecondDivs = minuteDiv.querySelectorAll(".time-division-second");

								for(let j = 0; j < childSecondDivs.length; j++) {
									let secondDiv = childSecondDivs[j];

									if(this._timeDivIsInView(secondDiv))
										visibleSecondDivs.push(secondDiv);
								}
							}

							return visibleSecondDivs;
						}
					}
				}
			}
		}
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

customElements.define('ktbs4la2-timeline', KTBS4LA2Timeline);
