import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";
import {KTBS4LA2TimelineEvent} from "./ktbs4la2-timeline-event.js";

import "./ktbs4la2-timeline-histogram-bar.js";
import "../ktbs4la2-document-header/ktbs4la2-document-header.js";

/**
 * 
 */
function getFormattedDate(timestamp) {
	let date = new Date(parseInt(timestamp));

	return (date.getFullYear() + "-" 
		+ (date.getMonth() + 1).toString().padStart(2, '0') + "-" 
		+ date.getDate().toString().padStart(2, '0') + " "
		+ date.getHours().toString().padStart(2, '0') + ":"
		+ date.getMinutes().toString().padStart(2, '0') + ":"
		+ date.getSeconds().toString().padStart(2, '0') + ":"
		+ date.getMilliseconds().toString().padStart(3, '0'));
}

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
						let year = parseInt(this.getAttribute("id").substring(0, 4), 10);
						let month = parseInt(this.getAttribute("id").substring(5, 7), 10);
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
		super(import.meta.url, true, true);

		let updateEventsRowWorkerURL = import.meta.url.substr(0, import.meta.url.lastIndexOf('/')) + '/update-events-row-worker.js';
		
		this._resolveFetchUpdateEventsRowWorker;
		this._rejectFetchUpdateEventsRowWorker;

		this._fetchUpdateEventsRowWorkerPromise = new Promise((resolve, reject) => {
			this._resolveFetchUpdateEventsRowWorker = resolve;
			this._rejectFetchUpdateEventsRowWorker = reject;
		});
		
		fetch(updateEventsRowWorkerURL, {signal: this._abortController.signal}).then((response) => {
				if(response.ok) {
					response.text().then((responseText) => {
						let codeBlob = new Blob([responseText], {type: 'application/javascript'});
						this._updateEventsRowWorkerObjectURL = URL.createObjectURL(codeBlob);
						this._resolveFetchUpdateEventsRowWorker();
					});
				}
				else {
					this._rejectFetchUpdateEventsRowWorker();
					this.emitErrorEvent(new Error("Could not fetch update-events-row-worker.js"));
				}
			})
			.catch((error) => {
				this._rejectFetchUpdateEventsRowWorker();
				this.emitErrorEvent(error);
			});

		this._beginTime = null;
		this._endTime = null;
		
		this._firstRepresentedTime;
		this._lastRepresentedTime;
		this._currentLevelDivWidth;

		this._allEventNodes = null;
		this._visibleEventsNodes = null;
		this._eventsData = null;

		this._histogramBars = null;

		this._bindedOnDragFunction = this._onDrag.bind(this);
		this._bindedOnStopDraggingFunction = this._onStopDragging.bind(this);
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

		this._requestZoomIncrementID = null;
		this._requestedZoomIncrementAmount = 0;
		this._requestUpdateTimeDivisionsID = null;
		this._maxDisplayableRows = null;
		this._requestUnsetZoomCursorID = null;

		this._onDisplayWindowChangeHeightID = null;
		this._onDisplayWindowChangeWidthID = null;

		this._lastKnownDisplayWindowWidth = null;
		this._lastKnownDisplayWindowHeight = null;

		this._updateTimeLineCursorID = null;

		this._displayWindowResizeObserver = null;

		this._timeDivisionsAreInitialized = false;
		this._resolveTimeDivisionsInitialized;
		this._rejectTimeDivisionsInitialized;

		this._timeDivisionsInitialized = new Promise(function(resolve, reject) {
			this._resolveTimeDivisionsInitialized = resolve;
			this._rejectTimeDivisionsInitialized = reject;
		}.bind(this));

		this._timeDivisionsInitialized.then(() => {
			this._timeDivisionsAreInitialized = true;
		});

		this._resolveZoomInitialized;

		this._zoomInitialized = new Promise((resolve) => {
			this._resolveZoomInitialized = resolve;
		});

		this._eventsNodesObserver = new MutationObserver(this._onEventsNodesMutation.bind(this));
		this._eventsNodesObserver.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["visible"]});

		this.addEventListener("select-timeline-event", this._onSelectTimelineEvent.bind(this));
		this._updateEventsRowWorker = null;
		this._requestUpdateEventsRowID = null;
		this._updateEventsRowID = null;
	
		this._allowFullScreen = true;
	}

	/**
	 * 
	 */
	_initDisplay() {
		this._initTimeDivisions();
		this._initZoom();
		this._timelineCursor.style.display = "block";
		this._timelineCursorLabel.innerText = getFormattedDate(this._getMouseTime(0));
		this._updateMaxDisplayableRows();
		this._updateEventsPosX(this._getVisibleEventNodes());
		this._updateHistogramBarsPosX(this._getHistogramBars());
		this._requestUpdateEventsRow();
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push("begin");
		observedAttributes.push("end");
		observedAttributes.push("view-begin");
		observedAttributes.push("zoom-level");
		observedAttributes.push("div-width");
		observedAttributes.push("allow-fullscreen");
		observedAttributes.push("cursor-time");
		return observedAttributes;
	}

	/**
	 * 
	 */
	_clearTimeDivisions() {
		this._timeDiv.innerHTML = "";

		if(this._timeDiv.classList.contains("subdivided"))
			this._timeDiv.classList.remove("subdivided");

		if(this._widgetContainer.hasAttribute("hidden"))
			this._widgetContainer.removeAttribute("hidden");

		this._timeDivisionsAreInitialized = false;

		this._timeDivisionsInitialized = new Promise(function(resolve, reject) {
			this._resolveTimeDivisionsInitialized = resolve;
			this._rejectTimeDivisionsInitialized = reject;
		}.bind(this));

		this._timeDivisionsInitialized.then(() => {
			this._timeDivisionsAreInitialized = true;
		});
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "begin")
			this._beginTime = null;

		if(attributeName == "end")
			this._endTime = null;

		if(((attributeName == "begin") || (attributeName == "end")) && this.hasAttribute("begin") && this.hasAttribute("end"))
			this._componentReady.then(() => {
				this._clearTimeDivisions();

				if(this._displayWindow.clientWidth > 0)
					this._initDisplay();
			});

		if(attributeName == "allow-fullscreen") {
			this._allowFullScreen = !((newValue == "0") || (newValue == "false"));

			if(!this._allowFullScreen && (document.fullscreenElement === this))
				document.exitFullscreen();
		}

		if(attributeName == "cursor-time") {
			Promise.all([this._componentReady, this._timeDivisionsInitialized, this._zoomInitialized]).then(() => {
				let cursorTime = parseFloat(newValue, 10);

				if(!isNaN(cursorTime)) {
					this._setTimelineCursorPositionForTime(cursorTime);
					this._timelineCursorLabel.innerText = getFormattedDate(cursorTime);
				}
			}).catch(() => {});
		}

		if((attributeName == "view-begin") && (newValue)) {
			Promise.all([this._componentReady, this._timeDivisionsInitialized, this._zoomInitialized]).then(() => {
				let newViewBeginTime = parseFloat(newValue, 10);

				if(!isNaN(newViewBeginTime))
					this._requestSetView(newViewBeginTime, null, null, false);
				else
					this.emitErrorEvent(new TypeError("Value for \"view-begin\" is not a number"));
			}).catch(() => {});
		}

		if((attributeName == "zoom-level") && (newValue)) {
			Promise.all([this._componentReady, this._timeDivisionsInitialized, this._zoomInitialized]).then(() => {
				if(Object.keys(KTBS4LA2Timeline.minDivisionWidthPerUnit).includes(newValue))
					this._requestSetView(null, newValue, null, false);
				else
					this.emitErrorEvent(new TypeError("Value for \"zoom-level\" is not a valid time subdivision unit"));
			}).catch(() => {});
		}

		if((attributeName == "div-width") && (newValue)) {
			Promise.all([this._componentReady, this._timeDivisionsInitialized, this._zoomInitialized]).then(() => {
				let newDivWidth = parseFloat(newValue, 10);

				if(!isNaN(newDivWidth))
					this._requestSetView(null, null, newDivWidth, false);
				else
					this.emitErrorEvent(new TypeError("Value for \"div-width\" is not a number"));
			}).catch(() => {});
		}
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._widthRulesStylesheet = this.shadowRoot.styleSheets[1];
		this._widgetContainer = this.shadowRoot.querySelector("#widget-container");

		this._timeDiv = this.shadowRoot.querySelector("#time");

		this._displayWindow = this.shadowRoot.querySelector("#display-window");
		this._displayWindow.addEventListener("wheel", this._onMouseWheel.bind(this), { passive: false });
		this._displayWindow.addEventListener("scroll", this._onScroll.bind(this));
		this._displayWindow.addEventListener("mousemove", this._onDisplayWindowMouseMove.bind(this));
		this._displayWindow.addEventListener("mousedown", this._onDisplayWindowMouseDown.bind(this));
		
		this._timelineCursor = this.shadowRoot.querySelector("#timeline-cursor");
		this._timelineCursorLabel = this.shadowRoot.querySelector("#timeline-cursor-label");
		
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

		this._toggleFullscreenButton = this.shadowRoot.querySelector("#toggle-fullscreen-button");
		this._toggleFullscreenButton.addEventListener("click", this._onClickToggleFullscreenButton.bind(this));

		try {
			this._displayWindowResizeObserver = new ResizeObserver(this._onResizeWidgetContainer.bind(this));
			this._displayWindowResizeObserver.observe(this._widgetContainer);
		}
		catch(error) {
			this.emitErrorEvent(error);
		}

		this._yearLabel = this.shadowRoot.querySelector("#year-label");
		this._monthLabel = this.shadowRoot.querySelector("#month-label");
		this._dayLabel = this.shadowRoot.querySelector("#day-label");
		this._hourLabel = this.shadowRoot.querySelector("#hour-label");
		this._minuteLabel = this.shadowRoot.querySelector("#minute-label");
		this._secondLabel = this.shadowRoot.querySelector("#second-label");
		this._millisecondLabel = this.shadowRoot.querySelector("#millisecond-label");

		document.addEventListener("fullscreenchange", this._onDocumentFullScreenChange.bind(this));
	}

	/**
	 * 
	 */
	disconnectedCallback() {
		super.disconnectedCallback();

		if(this._requestUpdateEventsRowID != null)
			clearTimeout(this._requestUpdateEventsRowID);

		if(this._updateEventsRowWorker != null)
			this._updateEventsRowWorker.terminate();

		if(this._displayWindowResizeObserver != null)
			this._displayWindowResizeObserver.disconnect();
	}

	/**
	 * 
	 */
	_onClickToggleFullscreenButton(event) {
		event.stopPropagation();
		this._wasZoomedOutBeforeLastFullscreenChange = this._isZoomedOut;

		if(this._allowFullScreen) {
			if(document.fullscreenElement === null) {
				if(this.dispatchEvent(new Event("request-fullscreen", {cancelable: true})))
					this._widgetContainer.requestFullscreen();
			}
			else
				document.exitFullscreen();
		}
	}

	/**
	 * 
	 */
	_onDocumentFullScreenChange(event) {
		setTimeout(() => {
			setTimeout(() => {
				if(this._wasZoomedOutBeforeLastFullscreenChange)
					this._onClickDezoomButton();

				delete this._wasZoomedOutBeforeLastFullscreenChange;
			});
		});
	}

	/**
	 * 
	 */
	_updateVerticalCursor(event) {
		let timeDivRelativeMouseX = event.clientX - this._displayWindow.getBoundingClientRect().left + this._displayWindow.scrollLeft;
		this._timelineCursor.style.left = timeDivRelativeMouseX + "px";
		let mouseTime = this._getMouseTime(timeDivRelativeMouseX)
		this._timelineCursorLabel.innerText = getFormattedDate(mouseTime);

		this.dispatchEvent(new CustomEvent("cursor-move", {
			bubbles: true,
			cancelable: false,
			detail : {cursorTime: mouseTime}
		}));
	}

	/**
	 * 
	 */
	_onDisplayWindowMouseMove(event) {
		if(this._timeDivisionsAreInitialized && !this._displayWindow.classList.contains("scrolled")) {
			event.preventDefault();
			
			if(this._updateTimeLineCursorID)
				clearTimeout(this._updateTimeLineCursorID);

			this._updateTimeLineCursorID = setTimeout(() => {
				this._updateVerticalCursor(event);
				this._updateTimeLineCursorID = null;
			});
		}
	}

	/**
	 * 
	 */
	_onResizeWidgetContainer(entries, observer) {
		if((this._displayWindow.clientWidth != 0) && !this._timeDivisionsAreInitialized)
			this._initDisplay();

		// widget's height has changed
		if((this._displayWindow.clientHeight != 0) && (this._lastKnownDisplayWindowHeight != this._displayWindow.clientHeight)) {		
			this._lastKnownDisplayWindowHeight = this._displayWindow.clientHeight;

			if(this._onDisplayWindowChangeHeightID != null)
				clearTimeout(this._onDisplayWindowChangeHeightID);

			this._onDisplayWindowChangeHeightID = setTimeout(() => {
				if(this._updateMaxDisplayableRows()) {
					this._requestUpdateEventsRow();
				}

				this._onDisplayWindowChangeHeightID = null;
			});
		}

		// widget's width has changed
		if((this._displayWindow.clientWidth != 0) && (this._lastKnownDisplayWindowWidth != this._displayWindow.clientWidth)) {
			if(this._onDisplayWindowChangeWidthID != null)
				clearTimeout(this._onDisplayWindowChangeWidthID);

			this._onDisplayWindowChangeWidthID = setTimeout(() => {
				this._lastKnownDisplayWindowWidth = this._displayWindow.clientWidth;

				this._timeDivisionsInitialized.then(() => {
					this._initZoomParams();

					if(this._isZoomedOut) {
						this._setWidthRules(this._initialLevel, this._initialDivWidth);
						this._updateTimeDivisions(this.beginTime, this.endTime);
					}

					this._requestUpdateEventsRow();
					this._updateScrollBarContent();
					this._updateScrollBarCursor();
					this._updateScrollButtons();
					this._notifyViewChange();
				});

				this._onDisplayWindowChangeWidthID = null;
			});
		}
	}

	/**
	 * 
	 */
	get availableHeight() {
		let widgetHeight = this._displayWindow.getBoundingClientRect().height;
		let currentLevel = this._widgetContainer.className;
		let availableHeight;
		
		switch(currentLevel) {
			case "year" :
				availableHeight = widgetHeight - 25;
				break;
			case "month" :
				availableHeight = widgetHeight - 45;
				break;
			case "day" :
				availableHeight = widgetHeight - 65;
				break;
			case "hour" :
				availableHeight = widgetHeight - 85;
				break;
			case "tenminutes" :
				availableHeight = widgetHeight - 105;
				break;
			case "minute" :
				availableHeight = widgetHeight - 105;
				break;
			case "tenseconds" :
				availableHeight = widgetHeight - 125;
				break;
			case "second" :
				availableHeight = widgetHeight - 125;
				break;
			case "ahundredmilliseconds" :
				availableHeight = widgetHeight - 145;
				break;
			case "tenmilliseconds" :
				availableHeight = widgetHeight - 145;
				break;
			case "millisecond" :
				availableHeight = widgetHeight - 145;
				break;
		}

		return availableHeight;
	}

	/**
	 * 
	 */
	_updateMaxDisplayableRows() {
		let newMaxDisplayableRows = Math.floor(this.availableHeight / 15);
		
		if(newMaxDisplayableRows != this._maxDisplayableRows) {
			this._maxDisplayableRows = newMaxDisplayableRows;
			return true;
		}
		else
			return false;
	}

	/**
	 * 
	 */
	_onSelectTimelineEvent(event) {
		let timelineEventID = event.target.getAttribute("id");
		let previouslySelectedEvents = this.querySelectorAll("ktbs4la2-timeline-event.selected:not([id = \"" + CSS.escape(timelineEventID) + "\"])");

		for(let i = 0; i < previouslySelectedEvents.length; i++)
			previouslySelectedEvents[i].classList.remove("selected");
	}

	/**
	 * 
	 */
	_getAllEventNodes() {
		if(this._allEventNodes == null)
			this._allEventNodes = Array.from(this.querySelectorAll("ktbs4la2-timeline-event")).sort(KTBS4LA2TimelineEvent.compareEventsOrder);

		return this._allEventNodes;
	}

	/**
	 * 
	 */
	_getVisibleEventNodes() {
		if(this._visibleEventsNodes == null)
			this._visibleEventsNodes = Array.from(this.querySelectorAll("ktbs4la2-timeline-event:not([visible = \"false\"]):not([visible = \"0\"])")).sort(KTBS4LA2TimelineEvent.compareEventsOrder);

		return this._visibleEventsNodes;
	}

	/**
	 * 
	 */
	 _getHistogramBars() {
		if(this._histogramBars == null)
			this._histogramBars = Array.from(this.querySelectorAll("ktbs4la2-timeline-histogram-bar"));

		return this._histogramBars;
	}

	/**
	 * 
	 */
	_getDisplayedEventsOverlappingInterval(minTime, maxTime) {
		let overlappingEvents = new Array();
		let visibleEvents = this._getVisibleEventNodes();

		for(let i = 0; i < visibleEvents.length; i++) {
			let currentEvent = visibleEvents[i];
			let eventOverlapsInterval = ((currentEvent.endTime >= minTime) && (currentEvent.beginTime <= maxTime));
			
			if(eventOverlapsInterval && currentEvent.hasAttribute("row"))
				overlappingEvents.push(currentEvent);
		}
		
		return overlappingEvents;
	}

	/**
	 * 
	 */
	 _getHistoBarsOverlappingInterval(minTime, maxTime) {
		const overlappingBars = new Array();
		const bars = this._getHistogramBars();

		for(let i = 0; i < bars.length; i++) {
			const currentBar = bars[i];

			if((currentBar.endTime >= minTime) && (currentBar.beginTime <= maxTime))
				overlappingBars.push(currentBar);
		}
		
		return overlappingBars;
	}

	/**
	 * 
	 */
	_getAllEventsOverlappingInterval(minTime, maxTime) {
		let overlappingEvents = new Array();
		let allEvents = this._getAllEventNodes();

		for(let i = 0; i < allEvents.length; i++) {
			let currentEvent = allEvents[i];
			let eventOverlapsInterval = ((currentEvent.endTime >= minTime) && (currentEvent.beginTime <= maxTime));
			
			if(eventOverlapsInterval && currentEvent.hasAttribute("row"))
				overlappingEvents.push(currentEvent);
		}
		
		return overlappingEvents;
	}


	/**
	 * 
	 */
	_getIntervalUnion(intervalA, intervalB) {
		if((intervalA.begin >= intervalB.begin) && (intervalA.end <= intervalB.end)) {
			// intervalA is included in intervalB
			return [intervalB];
		}
		else if((intervalB.begin >= intervalA.begin) && (intervalB.end <= intervalA.end)) {
			// intervalB is included in intervalA
			return [intervalA];
		}
		else if(
				((intervalA.begin >= intervalB.begin) && (intervalA.begin <= intervalB.end))
			||	((intervalA.end >= intervalB.begin) && (intervalA.end <= intervalB.end))) {
				// one interval is not included in the other, but the two of them intersect, so their union is one merged interval, which we calculate 
				let unionBegin = Math.min(intervalA.begin, intervalB.begin);
				let unionEnd = Math.max(intervalA.end, intervalB.end);
				return [{begin: unionBegin, end: unionEnd}];
			}
		else {
			// if the two intervals don't intersect, their union is composed of the two distincts intervals
			return [intervalA, intervalB];
		}
	}

	/**
	 *
	 */
	get viewBeginTime() {
		let totalTime = this._lastRepresentedTime - this._firstRepresentedTime;
		let timeOverWidthRatio = totalTime / this._timeDiv.clientWidth;
		let leftBorderTimeOffsetTime = this._displayWindow.scrollLeft * timeOverWidthRatio;
		return (this._firstRepresentedTime + leftBorderTimeOffsetTime);
	}

	/**
	 * 
	 */
	get viewEndTime() {
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
	_onEventsNodesMutation(mutationRecords, observer) {
		let eventAdded = false;
		let eventRemoved = false;
		let changedEventVisibility = false;
		let newlyAddedEvents = new Array();
		let histoBarAdded = false;
		let histoBarRemoved = false;
		let newlyAddedHistoBars = new Array();

		for(let i = 0; i < mutationRecords.length; i++) {
			let currentMutationRecord = mutationRecords[i];

			if(currentMutationRecord.type == "childList") {
				for(let j = 0; j < currentMutationRecord.addedNodes.length; j++) {
					let addedNode = currentMutationRecord.addedNodes[j];
					
					if(addedNode.localName == "ktbs4la2-timeline-event") {
						newlyAddedEvents.push(addedNode);
						eventAdded = true;
					}
					else if(addedNode.localName == "ktbs4la2-timeline-histogram-bar") {
						addedNode.addEventListener("click", this._onClickHistogramBar.bind(this));
						newlyAddedHistoBars.push(addedNode);
						histoBarAdded = true;
					}
				}

				for(let j = 0; j < currentMutationRecord.removedNodes.length; j++) {
					let removedNode = currentMutationRecord.removedNodes[j];
					
					if(removedNode.localName == "ktbs4la2-timeline-event")
						eventRemoved = true;
					else if(removedNode.localName == "ktbs4la2-timeline-histogram-bar")
						histoBarRemoved = true;
				}
			}
			else if(	(currentMutationRecord.type == "attributes")
					&&	(currentMutationRecord.target.localName == "ktbs4la2-timeline-event")
					&&	(currentMutationRecord.attributeName == "visible"))
						changedEventVisibility = true;
		}

		if(histoBarAdded || histoBarRemoved) {
			setTimeout(() => {
				this._histogramBars = null;
				
				this._timeDivisionsInitialized.then(() => {
					this._updateHistogramBarsPosX(newlyAddedHistoBars);
				});
			});
		}

		if(eventAdded || eventRemoved) {
			setTimeout(() => {
				this._allEventNodes = null;
				this._visibleEventsNodes = null;
				this._eventsData = null;

				this._eventsIndexByBeginTime = null;
				this._eventsIndexByEndTime = null;
				this._eventsBeginTimes = null;
				this._eventsEndTimes = null;

				this._timeDivisionsInitialized.then(() => {
					this._updateScrollBarContent();
					this._updateEventsPosX(newlyAddedEvents);
					this._requestUpdateEventsRow();
				});
			});
		}
		else if(changedEventVisibility) {
			this._visibleEventsNodes = null;
			this._eventsData = null;
			
			//this._componentReady.then(() => {
			this._timeDivisionsInitialized.then(() => {
				this._updateScrollBarContent();
				this._requestUpdateEventsRow();
			});
		}
	}

	/**
	 * 
	 */
	_setViewBeginEnd(newViewBegin, newViewEnd) {
		const newViewDuration = newViewEnd - newViewBegin;
		const candidateNewZoomLevels = ["millisecond", "tenmilliseconds", "ahundredmilliseconds", "second", "tenseconds", "minute", "tenminutes", "hour", "day", "month", "year"];

		for(let i = 0; i < candidateNewZoomLevels.length; i++) {
			const candidateNewZoomLevel = candidateNewZoomLevels[i];
			const maxFittableDivNumber = this._displayWindow.clientWidth / KTBS4LA2Timeline.minDivisionWidthPerUnit[candidateNewZoomLevel];

			let requiredDivNumber;

			switch(candidateNewZoomLevel) {
				case "millisecond":
					requiredDivNumber = newViewDuration;
					break;
				case "tenmilliseconds":
					requiredDivNumber = newViewDuration / 10;
					break;
				case "ahundredmilliseconds":
					requiredDivNumber = newViewDuration / 100;
					break;
				case "second":
					requiredDivNumber = newViewDuration / 1000;
					break;
				case "tenseconds":
					requiredDivNumber = newViewDuration / 10000;
					break;
				case "minute":
					requiredDivNumber = newViewDuration / 60000;
					break;
				case "tenminutes":
					requiredDivNumber = newViewDuration / 600000;
					break;
				case "hour":
					requiredDivNumber = newViewDuration / 3600000;
					break;
				case "day":
					requiredDivNumber = newViewDuration / 86400000;
					break;
				case "month":
					requiredDivNumber = newViewDuration / 2678400000;
					break;
				case "year":
					requiredDivNumber = newViewDuration / 31622400000;
					break;
			}

			if(maxFittableDivNumber >= requiredDivNumber) {
				let newDivWidth;

				if(candidateNewZoomLevel == "millisecond")
					newDivWidth = 19;
				else
					newDivWidth = this._displayWindow.clientWidth / requiredDivNumber;

				this._requestSetView(newViewBegin, candidateNewZoomLevel, newDivWidth);
				return;
			}
		}

		throw new Exception("Cannot render specified duration in available width");
	}

	/**
	 * 
	 */
	_onClickHistogramBar(event) {
		const clickedBar = event.target.closest("ktbs4la2-timeline-histogram-bar");

		if(
				clickedBar
			&&	(clickedBar.hasAttribute("begin"))
			&&	(clickedBar.hasAttribute("end"))
		)
			this._setViewBeginEnd(clickedBar.beginTime, clickedBar.endTime);
	}

	/**
	 * 
	 */
	_updateEventsPosX(events) {
		let timelineDuration = this._lastRepresentedTime - this._firstRepresentedTime;
							
		// we browse events
		for(let i = 0; i < events.length; i++) {
			let currentEvent = events[i];
			let eventPosXIsOverflow = ((currentEvent.endTime < this._firstRepresentedTime) || (currentEvent.beginTime > this._lastRepresentedTime));

			if(!eventPosXIsOverflow) {
				let eventPaintBeginTime = (currentEvent.beginTime >= this._firstRepresentedTime)?currentEvent.beginTime:this._firstRepresentedTime;
				let timeOffset = eventPaintBeginTime - this._firstRepresentedTime;
				let posX = (timeOffset / timelineDuration) * 100;
				currentEvent.style.left = posX + "%";

				if(currentEvent.hasAttribute("end") && (!(currentEvent.hasAttribute("shape") || currentEvent.hasAttribute("symbol")) || (currentEvent.getAttribute("shape") == "duration-bar"))) {
					let eventPaintEndTime = (currentEvent.endTime <= this._lastRepresentedTime)?currentEvent.endTime:this._lastRepresentedTime;
					let eventPaintDuration = eventPaintEndTime - eventPaintBeginTime;
					let eventPercentageWidth = (eventPaintDuration / timelineDuration) * 100;
					currentEvent.style.width = eventPercentageWidth + "%";
				}

				if(currentEvent.classList.contains("posx-is-overflow"))
					currentEvent.classList.remove("posx-is-overflow");
			}
			else
				if(!currentEvent.classList.contains("posx-is-overflow"))
					currentEvent.classList.add("posx-is-overflow");

			if(!currentEvent.hasAttribute("posx-initialized"))
				currentEvent.setAttribute("posx-initialized", "");
		}
	}

	/**
	 * 
	 */
	_updateHistogramBarsPosX(histogramBars) {
		let timelineDuration = this._lastRepresentedTime - this._firstRepresentedTime;
							
		// we browse bars
		for(let i = 0; i < histogramBars.length; i++) {
			let currentBar = histogramBars[i];
			let barPosXIsOverflow = ((currentBar.endTime < this._firstRepresentedTime) || (currentBar.beginTime > this._lastRepresentedTime));

			if(!barPosXIsOverflow) {
				let barPaintBeginTime = (currentBar.beginTime >= this._firstRepresentedTime)?currentBar.beginTime:this._firstRepresentedTime;
				let timeOffset = barPaintBeginTime - this._firstRepresentedTime;
				let posX = (timeOffset / timelineDuration) * 100;
				currentBar.style.left = posX + "%";

				let barPaintEndTime = (currentBar.endTime <= this._lastRepresentedTime)?currentBar.endTime:this._lastRepresentedTime;
				let barPaintDuration = barPaintEndTime - barPaintBeginTime;

				if(barPaintDuration > 0) {
					let barPercentageWidth = (barPaintDuration / timelineDuration) * 100;
					currentBar.style.width = barPercentageWidth + "%";
				}
				else
					currentBar.style.width = KTBS4LA2Timeline.minDivisionWidthPerUnit["millisecond"] + "px";

				if(currentBar.classList.contains("posx-is-overflow"))
					currentBar.classList.remove("posx-is-overflow");
			}
			else
				if(!currentBar.classList.contains("posx-is-overflow"))
					currentBar.classList.add("posx-is-overflow");

			if(!currentBar.hasAttribute("posx-initialized"))
				currentBar.setAttribute("posx-initialized", "");
		}
	}

	/**
	 * 
	 */
	_getEventsData() {
		if(this._eventsData == null) {
			this._eventsData = new Array();
			let visibleEventsNodes = this._getVisibleEventNodes();

			visibleEventsNodes.forEach((eventNode) => {
				this._eventsData.push({
					id: eventNode.id,
					beginTime: eventNode.beginTime,
					endTime: eventNode.endTime,
					shape: eventNode.getAttribute("shape"),
					hasSymbol: eventNode.hasAttribute("symbol"),
					row: eventNode.hasAttribute("row")?parseInt(eventNode.getAttribute("row"), 10):null,
					hasHiddenSiblings: eventNode.hasAttribute("hidden-siblinbgs-count")
				});
			});
		}

		return this._eventsData;
	}

	/**
	 * 
	 */
	_requestUpdateEventsRow() {
		if(this._requestUpdateEventsRowID != null)
			clearTimeout(this._requestUpdateEventsRowID);

		if(this._updateEventsRowWorker != null) {
			this._updateEventsRowWorker.terminate();
			this._updateEventsRowWorker = null;
		}

		this._requestUpdateEventsRowID = setTimeout(() => {
			let timeLineDuration = this._lastRepresentedTime - this._firstRepresentedTime;
			let timeOverWidthRatio = timeLineDuration / this._timeDiv.clientWidth;

			if(!isNaN(timeOverWidthRatio)) {
				let pixelsBeginThreshold = 13;
				let timeBeginThreshold = timeOverWidthRatio * pixelsBeginThreshold;
				let pixelsEndThreshold = 1;
				let timeEndThreshold = timeOverWidthRatio * pixelsEndThreshold;

				let updateEventsRowWorkerData = {
					eventsData: this._getEventsData(),
					maxDisplayableRows: this._maxDisplayableRows,
					firstRepresentedTime: this._firstRepresentedTime,
					timeBeginThreshold: timeBeginThreshold,
					timeEndThreshold: timeEndThreshold
				};

				this._fetchUpdateEventsRowWorkerPromise.then(() => {
					this._updateEventsRowWorker = new Worker(this._updateEventsRowWorkerObjectURL);
					
					this._updateEventsRowWorker.onmessage = ((event) => {
						this._updateEventsRowWorker = null;
						this._eventsData = event.data.eventsNewData;

						if(this._updateEventsRowID != null)
							clearTimeout(this._updateEventsRowID);

						this._updateEventsRowID = setTimeout(() => {
							let eventsNewRows = event.data.eventsNewRows;
							let eventsNewHiddenSiblinbgsCounts = event.data.eventsNewHiddenSiblinbgsCounts;
							this._updateEventsRow(eventsNewRows, eventsNewHiddenSiblinbgsCounts);
						});
					});
					
					this._updateEventsRowWorker.postMessage(updateEventsRowWorkerData);
				});
			}
			else
				throw new Error("Could not determine time/width ratio");
		});
	}

	/**
	 * 
	 */
	_updateEventsRow(eventsNewRows, eventsNewHiddenSiblinbgsCounts) {
		let eventsToUpdatePosX = new Array();
		
		for(let eventId in eventsNewRows) {
			let event = this.querySelector("#" + CSS.escape(eventId));

			if(event) {
				let row = eventsNewRows[eventId];

				if(row != null) {
					if(!event.hasAttribute("row") && !event.classList.contains("posx-is-overflow"))
						eventsToUpdatePosX.push(event);

					event.setAttribute("row", row);
					event.style.bottom = (row * 15) + "px";
				}
				else
					event.removeAttribute("row");
			}
		}

		this._updateEventsPosX(eventsToUpdatePosX);

		for(let eventId in eventsNewHiddenSiblinbgsCounts) {
			let event = this.querySelector("#" + CSS.escape(eventId));

			if(event) {
				let hiddenSiblingsCount = eventsNewHiddenSiblinbgsCounts[eventId];

				if(hiddenSiblingsCount != null)
					event.setAttribute("hidden-siblinbgs-count", hiddenSiblingsCount);
				else
					event.removeAttribute("hidden-siblinbgs-count");
			}
		}
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

		if(this._isZoomedOut) {
			if(!this._dezoomButton.hasAttribute("disabled"))
				this._dezoomButton.setAttribute("disabled", "");

			if(this._scrollBar.classList.contains("scrollable"))
				this._scrollBar.classList.remove("scrollable");
		}
		else {
			if(this._dezoomButton.hasAttribute("disabled"))
				this._dezoomButton.removeAttribute("disabled");

			if(!this._scrollBar.classList.contains("scrollable"))
				this._scrollBar.classList.add("scrollable");
		}
	}

	/**
	 * 
	 */
	get _isZoomedOut() {
		return (this._beginIsInView() && this._endIsInView());
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
			let viewBeginTime = this.viewBeginTime;
			let viewEndTime = this.viewEndTime;
			let newTimeDivBoundaries = this._getTimeDivBoundariesForView(viewBeginTime, viewEndTime);
			let timeDivNeedsToChange = ((newTimeDivBoundaries.beginTime != this._firstRepresentedTime) || (newTimeDivBoundaries.endTime != this._lastRepresentedTime));

			if(timeDivNeedsToChange) {
				let firstBefore = this._firstRepresentedTime;
				let lastBefore = this._lastRepresentedTime;

				// memorise the position of timeline's cursor
				let timelineCursorPosition = this._timelineCursor.getBoundingClientRect().left - this._displayWindow.getBoundingClientRect().left + this._displayWindow.scrollLeft;
				let timelineCursorTime = this._getMouseTime(timelineCursorPosition);

				this._updateTimeDivisions(newTimeDivBoundaries.beginTime, newTimeDivBoundaries.endTime);

				let affectedIntervals = this._getIntervalUnion({begin: firstBefore, end: lastBefore}, {begin: this._firstRepresentedTime, end: this._lastRepresentedTime});
								
				for(let i = 0; i < affectedIntervals.length; i++) {
					let interval = affectedIntervals[i];
					let eventsToUpdate = this._getDisplayedEventsOverlappingInterval(interval.begin, interval.end);
					this._updateEventsPosX(eventsToUpdate);
					const histoBarsToUpdate = this._getHistoBarsOverlappingInterval(interval.begin, interval.end);
					this._updateHistogramBarsPosX(histoBarsToUpdate);
				}

				let widthOverTimeRatio = this._timeDiv.clientWidth / (this._lastRepresentedTime - this._firstRepresentedTime);
				let newTimeOffset = viewBeginTime - this._firstRepresentedTime;
				let newScrollLeft = newTimeOffset * widthOverTimeRatio;
				this._setSilentScroll(newScrollLeft);

				// re-position timeline's cursor at the right place
				this._setTimelineCursorPositionForTime(timelineCursorTime);
			}

			this._requestUpdateTimeDivisionsID = null;
		});
	}

	/**
	 * 
	 */
	_updateTimeDivisions(fromTime, toTime, parent = this._timeDiv) {
		let subDivs = parent.querySelectorAll(":scope > ktbs4la2-timeline-subdivision");

		// browse parent's sub-divs
		for(let i = 0; i < subDivs.length; i++) {
			let aSubDiv = subDivs[i];

			// if the child subdivs overlaps the [fromTime - toTime] interval
			if((aSubDiv._getEndTime() > fromTime) && (aSubDiv._getBeginTime() < toTime)) {
				if(aSubDiv.classList.contains("overflow"))
					aSubDiv.classList.remove("overflow");
				
				let subDivUnit = aSubDiv._getUnit();

				// if we haven't reached the maximum useful level of subdivisions
				if(subDivUnit != this._widgetContainer.className) {
					// instanciate sub-divs if needed
					if(!aSubDiv.classList.contains("subdivided")) {
						let begin, end, childrenUnit;

						switch(subDivUnit) {
							case "year":
								begin = 1;
								end = 12;
								childrenUnit = "month";
								break;
							case "month":
								begin = 1;
								let month = parseInt(aSubDiv.getAttribute("id").substring(5,7), 10);
								let year = parseInt(aSubDiv.getAttribute("id").substring(0,4), 10);
								end = getNumberOfDaysInMonth(month, year);
								childrenUnit = "day";
								break;
							case "day":
								begin = 0;
								end = 23;
								childrenUnit = "hour";
								break;
							case "hour":
								begin = 0;
								end = 5;
								childrenUnit = "tenminutes";
								break;
							case "tenminutes":
								begin = 0;
								end = 9;
								childrenUnit = "minute";
								break;
							case "minute":
								begin = 0;
								end = 5;
								childrenUnit = "tenseconds";
								break;
							case "tenseconds":
								begin = 0;
								end = 9;
								childrenUnit = "second";
								break;
							case "second":
								begin = 0;
								end = 9;
								childrenUnit = "ahundredmilliseconds";
								break;
							case "ahundredmilliseconds":
								begin = 0;
								end = 9;
								childrenUnit = "tenmilliseconds";
								break;
							case "tenmilliseconds":
								begin = 0;
								end = 9;
								childrenUnit = "millisecond";
								break;
						}

						this._instanciateSubdivisions(begin, end, childrenUnit, aSubDiv);
					}

					// recursive call
					this._updateTimeDivisions(fromTime, toTime, aSubDiv);
				}
			}
			else
				if(!aSubDiv.classList.contains("overflow"))
					aSubDiv.classList.add("overflow");
		}

		if(parent == this._timeDiv)
			this._updateRepresentedTime();
	}

	/**
	 * 
	 */
	_getTimeDivBoundariesForView(viewBeginTime, viewEndTime) {
		let representedDuration = (this._lastRepresentedTime - this._firstRepresentedTime);
		let timeOverWidthRatio = representedDuration / this._timeDiv.clientWidth;
		let minLeftTime = viewBeginTime - (3 * this._displayWindow.clientWidth * timeOverWidthRatio);
		let maxLeftTime = viewBeginTime - (1 * this._displayWindow.clientWidth * timeOverWidthRatio);
		let minRightTime = viewEndTime + (1 * this._displayWindow.clientWidth * timeOverWidthRatio);
		let maxRightTime = viewEndTime + (3 * this._displayWindow.clientWidth * timeOverWidthRatio);
		 
		let newTimeDivBeginTime = this._firstRepresentedTime;

		if(newTimeDivBeginTime < minLeftTime)
			newTimeDivBeginTime = minLeftTime;
		else if(newTimeDivBeginTime > maxLeftTime)
			newTimeDivBeginTime = maxLeftTime;

		if(newTimeDivBeginTime < this.beginTime)
			newTimeDivBeginTime = this.beginTime;
		
		let newTimeDivEndTime = this._lastRepresentedTime;

		if(newTimeDivEndTime < minRightTime)
			newTimeDivEndTime = minRightTime;
		else if(newTimeDivEndTime > maxRightTime)
			newTimeDivEndTime = maxRightTime;

		if(newTimeDivEndTime > this.endTime)
			newTimeDivEndTime = this.endTime;

		return {beginTime : newTimeDivBeginTime, endTime : newTimeDivEndTime};
	}

	/**
	 * 
	 */
	_requestSetView(newViewBegin = null, newZoomLevel = null, newDivWidth = null, user_initiated = true) {
		if(newViewBegin)
			this._requestedNewViewBegin = newViewBegin;

		if(newZoomLevel)
			this._requestedNewZoomLevel = newZoomLevel;

		if(newDivWidth)
			this._requestedNewDivWidth = newDivWidth;

		if(this._requestSetViewID)
			clearTimeout(this._requestSetViewID);

		this._requestSetViewID = setTimeout(() => {
			let newLevelHasExceededTop = (
					((this._initialLevel == "month") && (this._requestedNewZoomLevel == "year"))
				||	((this._initialLevel == "day") && ((this._requestedNewZoomLevel == "year") || (this._requestedNewZoomLevel == "month")))
				||	((this._initialLevel == "hour") && ((this._requestedNewZoomLevel == "year") || (this._requestedNewZoomLevel == "month") || (this._requestedNewZoomLevel == "day")))
				||	((this._initialLevel == "tenminutes") && ((this._requestedNewZoomLevel == "year") || (this._requestedNewZoomLevel == "month") || (this._requestedNewZoomLevel == "day") || (this._requestedNewZoomLevel == "hour")))
				||	((this._initialLevel == "minute") && ((this._requestedNewZoomLevel == "year") || (this._requestedNewZoomLevel == "month") || (this._requestedNewZoomLevel == "day") || (this._requestedNewZoomLevel == "hour") || (this._requestedNewZoomLevel == "tenminutes")))
				||	((this._initialLevel == "tenseconds") && ((this._requestedNewZoomLevel == "year") || (this._requestedNewZoomLevel == "month") || (this._requestedNewZoomLevel == "day") || (this._requestedNewZoomLevel == "hour") || (this._requestedNewZoomLevel == "tenminutes") || (this._requestedNewZoomLevel == "minute")))
				||	((this._initialLevel == "second") && ((this._requestedNewZoomLevel == "year") || (this._requestedNewZoomLevel == "month") || (this._requestedNewZoomLevel == "day") || (this._requestedNewZoomLevel == "hour") || (this._requestedNewZoomLevel == "tenminutes") || (this._requestedNewZoomLevel == "minute") || (this._requestedNewZoomLevel == "tenseconds")))
				||	((this._initialLevel == "ahundredmilliseconds") && ((this._requestedNewZoomLevel == "year") || (this._requestedNewZoomLevel == "month") || (this._requestedNewZoomLevel == "day") || (this._requestedNewZoomLevel == "hour") || (this._requestedNewZoomLevel == "tenminutes") || (this._requestedNewZoomLevel == "minute") || (this._requestedNewZoomLevel == "tenseconds") || (this._requestedNewZoomLevel == "second")))
				||	((this._initialLevel == "tenmilliseconds") && ((this._requestedNewZoomLevel == "year") || (this._requestedNewZoomLevel == "month") || (this._requestedNewZoomLevel == "day") || (this._requestedNewZoomLevel == "hour") || (this._requestedNewZoomLevel == "tenminutes") || (this._requestedNewZoomLevel == "minute") || (this._requestedNewZoomLevel == "tenseconds") || (this._requestedNewZoomLevel == "second") || (this._requestedNewZoomLevel == "ahundredmilliseconds")))
				||	((this._initialLevel == "millisecond"))
			);

			if(newLevelHasExceededTop)
				this._requestedNewZoomLevel = this._initialLevel;

			if((this._requestedNewZoomLevel == this._initialLevel) && (this._requestedNewDivWidth < this._initialDivWidth))
				this._requestedNewDivWidth = this._initialDivWidth;

			this._updateRepresentedTime();

			if(!this._requestedNewViewBegin)
				this._requestedNewViewBegin = this.viewBeginTime;

			let timelineCursorPosition = this._timelineCursor.getBoundingClientRect().left - this._displayWindow.getBoundingClientRect().left + this._displayWindow.scrollLeft;
			let timelineCursorTime = this._getMouseTime(timelineCursorPosition);
			let divisionsLevelHasChanged = false;
			
			if(this._requestedNewZoomLevel || this._requestedNewDivWidth) {
				let zoomLevel = this._requestedNewZoomLevel?this._requestedNewZoomLevel:this.zoomLevel;
				divisionsLevelHasChanged = (zoomLevel != this.zoomLevel);
				let divWidth = this._requestedNewDivWidth?this._requestedNewDivWidth:this.divWidth;
				this._setWidthRules(zoomLevel, divWidth);
				this._requestedNewZoomLevel = null;
				this._requestedNewDivWidth = null;
			}

			let timeOverWidthRatio = (this._lastRepresentedTime - this._firstRepresentedTime) / this._timeDiv.clientWidth;
			let newViewEndTime = this._requestedNewViewBegin + (this._displayWindow.clientWidth * timeOverWidthRatio);
			let newTimeDivBoundaries = this._getTimeDivBoundariesForView(this._requestedNewViewBegin, newViewEndTime);
			let timeDivNeedsToChange = ((newTimeDivBoundaries.beginTime != this._firstRepresentedTime) || (newTimeDivBoundaries.endTime != this._lastRepresentedTime));

			if(timeDivNeedsToChange || divisionsLevelHasChanged) {
				let firstBefore = this._firstRepresentedTime;
				let lastBefore = this._lastRepresentedTime;
				this._updateTimeDivisions(newTimeDivBoundaries.beginTime, newTimeDivBoundaries.endTime);
				this._updateRepresentedTime();
				let timeDivHasChanged = ((this._firstRepresentedTime != firstBefore) || (this._lastRepresentedTime != lastBefore));

				if(timeDivHasChanged) {
					let affectedIntervals = this._getIntervalUnion({begin: firstBefore, end: lastBefore}, {begin: this._firstRepresentedTime, end: this._lastRepresentedTime});
					
					for(let i = 0; i < affectedIntervals.length; i++) {
						let interval = affectedIntervals[i];
						let eventsToUpdate = this._getAllEventsOverlappingInterval(interval.begin, interval.end);
						this._updateEventsPosX(eventsToUpdate);
						const histoBarsToUpdate = this._getHistoBarsOverlappingInterval(interval.begin, interval.end);
						this._updateHistogramBarsPosX(histoBarsToUpdate);
					}
				}
			}

			this._setScrollForMousePositionAndTime(this._requestedNewViewBegin, 0);
			this._updateScrollBarCursor();
			this._requestedNewViewBegin = null;

			if((this._requestedNewZoomLevel == this._initialLevel) && (this._requestedNewDivWidth == this._initialDivWidth)) {
				if(this._displayWindow.classList.contains("scrollable"))
					this._displayWindow.classList.remove("scrollable");

				if(this._scrollBar.classList.contains("scrollable"))
					this._scrollBar.classList.remove("scrollable");
			}
			else {
				if(!this._displayWindow.classList.contains("scrollable"))
					this._displayWindow.classList.add("scrollable");

				if(!this._scrollBar.classList.contains("scrollable"))
					this._scrollBar.classList.add("scrollable");
			}

			this._updateScrollButtons();
			
			if(divisionsLevelHasChanged)
				this._updateMaxDisplayableRows();

			this._requestUpdateEventsRow();
			this._setTimelineCursorPositionForTime(timelineCursorTime);
			this._notifyViewChange(user_initiated);
			this._requestSetViewID = null;
		});
	}

	/**
	 * 
	 */
	_setViewBegin(newViewBegin) {
		let timeDivHasChanged = false;

		if(newViewBegin < this.beginTime)
			newViewBegin = this.beginTime;

		let newViewEnd = newViewBegin + (this._displayWindow.clientWidth * ((this._lastRepresentedTime - this._firstRepresentedTime) / this._timeDiv.clientWidth));

		if(newViewEnd > this.endTime)
			newViewEnd = this.endTime;

		let newTimeDivBoundaries = this._getTimeDivBoundariesForView(newViewBegin, newViewEnd);
		let timeDivNeedsToChange = ((newTimeDivBoundaries.beginTime != this._firstRepresentedTime) || (newTimeDivBoundaries.endTime != this._lastRepresentedTime));

		if(timeDivNeedsToChange) {
			let firstRepTimeBefore = this._firstRepresentedTime;
			let lastRepTimeBefore = this._lastRepresentedTime;
			// memorise the position of timeline's cursor
			let timelineCursorPosition = this._timelineCursor.getBoundingClientRect().left - this._displayWindow.getBoundingClientRect().left + this._displayWindow.scrollLeft;
			let timelineCursorTime = this._getMouseTime(timelineCursorPosition);
			
			this._updateTimeDivisions(newTimeDivBoundaries.beginTime, newTimeDivBoundaries.endTime);
			timeDivHasChanged = ((this._firstRepresentedTime != firstRepTimeBefore) || (this._lastRepresentedTime != lastRepTimeBefore));
			
			// re-position timeline's cursor at the right place
			this._setTimelineCursorPositionForTime(timelineCursorTime);
		}

		let viewWidthOverTimeRatio = this._timeDiv.clientWidth / (this._lastRepresentedTime - this._firstRepresentedTime);
		let timeOffset = newViewBegin - this._firstRepresentedTime;
		let newTimeDivScroll = timeOffset * viewWidthOverTimeRatio;
		this._setSilentScroll(newTimeDivScroll);
		this._updateScrollBarCursor();
		return timeDivHasChanged;
	}

	/**
	 * 
	 */
	_onDisplayWindowMouseDown(event) {
		if(!(event.target instanceof KTBS4LA2TimelineEvent) && this._displayWindow.classList.contains("scrollable")) {
			let timeDivRelativeMouseX = event.clientX - this._displayWindow.getBoundingClientRect().left + this._displayWindow.scrollLeft;
			this._displayWindowDragMouseTime = this._getMouseTime(timeDivRelativeMouseX);
			
			if(!this._displayWindow.classList.contains("scrolled"))
				this._displayWindow.classList.add("scrolled");

			window.document.addEventListener("mousemove", this._bindedOnDragFunction, true);
			window.document.addEventListener("mouseup", this._bindedOnStopDraggingFunction, true);
		}
	}

	/**
	 * 
	 */
	_onDrag(event) {
		event.preventDefault();
		let displayWindowRelativeMouseX = event.clientX - this._displayWindow.getBoundingClientRect().left;
		let widthOverTimeRatio = this._timeDiv.clientWidth / (this._lastRepresentedTime - this._firstRepresentedTime);
		let mouseTimeOffset = this._displayWindowDragMouseTime - this._firstRepresentedTime;
		let newMouseAbsoluteX = mouseTimeOffset * widthOverTimeRatio;
		let newScrollLeft = newMouseAbsoluteX - displayWindowRelativeMouseX;
		this._displayWindow.scrollLeft = newScrollLeft;
		this._notifyViewChange();
	}

	/**
	 * 
	 */
	_onStopDragging(event) {
		event.preventDefault();
		window.document.removeEventListener("mousemove", this._bindedOnDragFunction, true);
		window.document.removeEventListener("mouseup", this._bindedOnStopDraggingFunction, true);

		if(this._displayWindow.classList.contains("scrolled"))
			this._displayWindow.classList.remove("scrolled");

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
			this._scrollBarDragViewBeginOrigin = this.viewBeginTime;
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

		if(this._dragScrollBarCursorUpdateViewID != null)
			clearTimeout(this._dragScrollBarCursorUpdateViewID);

		this._dragScrollBarCursorUpdateViewID = setTimeout(() => {
			let newViewBegin = this._scrollBarDragViewBeginOrigin + (mouseXDelta * scrollBarTimeOverWidthRatio);
			let firstBefore = this._firstRepresentedTime;
			let lastBefore = this._lastRepresentedTime;
			let timeDivChanged = this._setViewBegin(newViewBegin);

			if(timeDivChanged) {
				let affectedIntervals = this._getIntervalUnion({begin: firstBefore, end: lastBefore}, {begin: this._firstRepresentedTime, end: this._lastRepresentedTime});
								
				for(let i = 0; i < affectedIntervals.length; i++) {
					let interval = affectedIntervals[i];
					let eventsToUpdate = this._getDisplayedEventsOverlappingInterval(interval.begin, interval.end);
					this._updateEventsPosX(eventsToUpdate);
					const histoBarsToUpdate = this._getHistoBarsOverlappingInterval(interval.begin, interval.end);
					this._updateHistogramBarsPosX(histoBarsToUpdate);
				}
			}

			this._notifyViewChange();
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

		let firstBefore = this._firstRepresentedTime;
		let lastBefore = this._lastRepresentedTime;
		
		let mouseX = event.offsetX;
		let totalDuration = this.endTime - this.beginTime;
		let scrollBarTimeOverWidthRatio = totalDuration / this._scrollBar.clientWidth;
		let mouseTime = this.beginTime + (mouseX * scrollBarTimeOverWidthRatio);
		let viewDuration = this.viewEndTime - this.viewBeginTime;
		let newViewBeginTime = mouseTime - (viewDuration / 2);
		let timeDivChanged = this._setViewBegin(newViewBeginTime);

		if(timeDivChanged) {
			let affectedIntervals = this._getIntervalUnion({begin: firstBefore, end: lastBefore}, {begin: this._firstRepresentedTime, end: this._lastRepresentedTime});
								
			for(let i = 0; i < affectedIntervals.length; i++) {
				let interval = affectedIntervals[i];
				let eventsToUpdate = this._getDisplayedEventsOverlappingInterval(interval.begin, interval.end);
				this._updateEventsPosX(eventsToUpdate);
				const histoBarsToUpdate = this._getHistoBarsOverlappingInterval(interval.begin, interval.end);
				this._updateHistogramBarsPosX(histoBarsToUpdate);
			}
		}

		this._notifyViewChange();
	}

	/**
	 * 
	 */
	_requestIncrementScroll(scrollIncrement) {
		this._requestedScrollAmount += scrollIncrement;
		
		if(this._scrollRequestID != null)
			clearTimeout(this._scrollRequestID);

		this._scrollRequestID = setTimeout(() => {
			this._incrementScroll();
		});
	}

	/**
	 * 
	 */
	_incrementScroll() {
		let widthIncrementUnit = 40;
		let representedDuration = this._lastRepresentedTime - this._firstRepresentedTime;
		let timeOverWidthRatio = representedDuration / this._timeDiv.clientWidth;
		let viewWidthIncrement = widthIncrementUnit * this._requestedScrollAmount;
		let viewTimeIncrement = timeOverWidthRatio * viewWidthIncrement;
		let newViewBeginTime = this.viewBeginTime + viewTimeIncrement;
		let firstBefore = this._firstRepresentedTime;
		let lastBefore = this._lastRepresentedTime;
		let timeDivChanged = this._setViewBegin(newViewBeginTime);

		if(timeDivChanged) {
			let affectedIntervals = this._getIntervalUnion({begin: firstBefore, end: lastBefore}, {begin: this._firstRepresentedTime, end: this._lastRepresentedTime});
								
			for(let i = 0; i < affectedIntervals.length; i++) {
				let interval = affectedIntervals[i];
				let eventsToUpdate = this._getDisplayedEventsOverlappingInterval(interval.begin, interval.end);
				this._updateEventsPosX(eventsToUpdate);
				const histoBarsToUpdate = this._getHistoBarsOverlappingInterval(interval.begin, interval.end);
				this._updateHistogramBarsPosX(histoBarsToUpdate);
			}
		}

		this._notifyViewChange();
		this._requestedScrollAmount = 0;
	}

	/**
	 * 
	 */
	_beginIsInView() {
		return ((this._firstRepresentedTime <= this.beginTime) && (this._displayWindow.scrollLeft <= 0));
	}

	/**
	 * 
	 */
	_endIsInView() {
		return ((this._lastRepresentedTime >= this.endTime) && (Math.ceil(this._displayWindow.scrollLeft) >= Math.floor(this._timeDiv.clientWidth - this._displayWindow.clientWidth)));
	}

	/**
	 * 
	 */
	_onClickDezoomButton() {
		if(this._timeDivisionsAreInitialized == true) {
			let levelBefore = this._widgetContainer.className;

			// memorise the position of timeline's cursor
			let timelineCursorPosition = this._timelineCursor.getBoundingClientRect().left - this._displayWindow.getBoundingClientRect().left + this._displayWindow.scrollLeft;
			let timelineCursorTime = this._getMouseTime(timelineCursorPosition);
						
			this._setWidthRules(this._initialLevel, this._initialDivWidth);
			this._updateTimeDivisions(this.beginTime, this.endTime);
			this._setSilentScroll(0);

			// re-position timeline's cursor at the right place
			this._setTimelineCursorPositionForTime(timelineCursorTime);

			this._updateScrollBarCursor();
			this._updateScrollButtons();

			if(levelBefore != this._widgetContainer.className)
				this._updateMaxDisplayableRows();

			if(this._displayWindow.classList.contains("scrollable"))
				this._displayWindow.classList.remove("scrollable");

			this._updateEventsPosX(this._getVisibleEventNodes());
			this._updateHistogramBarsPosX(this._getHistogramBars());
			this._requestUpdateEventsRow();
			this._notifyViewChange();
		}
	}

	/**
	 * 
	 */
	_onScrollLeftButtonMouseDown(event) {
		event.preventDefault();
		this._requestIncrementScroll(-1);

		if(this._scrollLeftButtonPressedIntervalID != null)
			clearInterval(this._scrollLeftButtonPressedIntervalID);
		
		this._scrollLeftButtonPressedIntervalID = setInterval(() => {
			if(!this._beginIsInView())
				this._requestIncrementScroll(-1);
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
		this._requestIncrementScroll(1);

		if(this._scrollRightButtonPressedIntervalID != null)
			clearInterval(this._scrollRightButtonPressedIntervalID);

		this._scrollRightButtonPressedIntervalID = setInterval(() => {
			if(!this._endIsInView())
				this._requestIncrementScroll(1);
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
	_setWidthRules(newLevel, newDivWidth) {
		while(this._widthRulesStylesheet.cssRules.length > 0)
			this._widthRulesStylesheet.deleteRule(0);

		switch(newLevel) {
			case "year":
				this._widthRulesStylesheet.insertRule(".time-division-year.year-366 { width: " + newDivWidth + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-year.year-365 { width: " + (newDivWidth * 365 / 366) + "px; }");
				break;
			case "month":
				this._widthRulesStylesheet.insertRule(".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 12) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 12 * 365 / 365) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-31 { width: " + newDivWidth + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-30 { width: " + (newDivWidth * 30 / 31) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-29 { width: " + (newDivWidth * 29 / 31) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-28 { width: " + (newDivWidth * 28 / 31) + "px; }");
				break;
			case "day":
				this._widthRulesStylesheet.insertRule(".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-day { width: " + newDivWidth + "px; }");
				break;
			case "hour":
				this._widthRulesStylesheet.insertRule(".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366 * 24) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365 * 24) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31 * 24) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30 * 24) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29 * 24) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28 * 24) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-day:not(.subdivided) { width: " + (newDivWidth * 24) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-hour { width: " + newDivWidth + "px; }");
				break;
			case "tenminutes":
				this._widthRulesStylesheet.insertRule(".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366 * 24 * 6) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365 * 24 * 6) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31 * 24 * 6) + "px }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30 * 24 * 6) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29 * 24 * 6) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28 * 24 * 6) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-day:not(.subdivided) { width: " + (newDivWidth * 24 * 6) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-hour:not(.subdivided) { width: " + (newDivWidth * 6) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-tenminutes { width: " + newDivWidth + "px; }");
				break;
			case "minute":
				this._widthRulesStylesheet.insertRule(".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366 * 24 * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365 * 24 * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31 * 24 * 60) + "px }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30 * 24 * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29 * 24 * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28 * 24 * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-day:not(.subdivided) { width: " + (newDivWidth * 24 * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-hour:not(.subdivided) { width: " + (newDivWidth * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-tenminutes:not(.subdivided) { width: " + (newDivWidth * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-minute { width: " + newDivWidth + "px; }");
				break;
			case "tenseconds":
				this._widthRulesStylesheet.insertRule(".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366 * 24 * 6 * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365 * 24 * 6 * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31 * 24 * 6 * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30 * 24 * 6 * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29 * 24 * 6 * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28 * 24 * 6 * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-day:not(.subdivided) { width: " + (newDivWidth * 24 * 6 * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-hour:not(.subdivided) { width: " + (newDivWidth * 6 * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-tenminutes:not(.subdivided) { width: " + (newDivWidth * 6 * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-minute:not(.subdivided) { width: " + (newDivWidth * 6) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-tenseconds { width: " + newDivWidth + "px; }");
				break;
			case "second":
				this._widthRulesStylesheet.insertRule(".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366 * 24 * 3600) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365 * 24 * 3600) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31 * 24 * 3600) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30 * 24 * 3600) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29 * 24 * 3600) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28 * 24 * 3600) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-day:not(.subdivided) { width: " + (newDivWidth * 24 * 3600) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-hour:not(.subdivided) { width: " + (newDivWidth * 3600) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-tenminutes:not(.subdivided) { width: " + (newDivWidth * 10 * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-minute:not(.subdivided) { width: " + (newDivWidth * 60) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-tenseconds:not(.subdivided) { width: " + (newDivWidth * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-second { width: " + newDivWidth + "px; }");
				break;
			case "ahundredmilliseconds":
				this._widthRulesStylesheet.insertRule(".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366 * 24 * 3600 * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365 * 24 * 3600 * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31 * 24 * 3600 * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30 * 24 * 3600 * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29 * 24 * 3600 * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28 * 24 * 3600 * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-day:not(.subdivided) { width: " + (newDivWidth * 24 * 3600 * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-hour:not(.subdivided) { width: " + (newDivWidth * 3600 * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-tenminutes:not(.subdivided) { width: " + (newDivWidth * 10 * 60 * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-minute:not(.subdivided) { width: " + (newDivWidth * 60 * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-tenseconds:not(.subdivided) { width: " + (newDivWidth * 10 * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-second:not(.subdivided) { width: " + (newDivWidth * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-ahundredmilliseconds { width: " + newDivWidth + "px; }");
				break;
			case "tenmilliseconds":
				this._widthRulesStylesheet.insertRule(".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366 * 24 * 3600 * 100) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365 * 24 * 3600 * 100) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31 * 24 * 3600 * 100) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30 * 24 * 3600 * 100) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29 * 24 * 3600 * 100) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28 * 24 * 3600 * 100) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-day:not(.subdivided) { width: " + (newDivWidth * 24 * 3600 * 100) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-hour:not(.subdivided) { width: " + (newDivWidth * 3600 * 100) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-tenminutes:not(.subdivided) { width: " + (newDivWidth * 10 * 60 * 100) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-minute:not(.subdivided) { width: " + (newDivWidth * 60 * 100) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-tenseconds:not(.subdivided) { width: " + (newDivWidth * 10 * 100) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-second:not(.subdivided) { width: " + (newDivWidth * 100) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-ahundredmilliseconds:not(.subdivided) { width: " + (newDivWidth * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-tenmilliseconds { width: " + newDivWidth + "px; }");
				break;
			case "millisecond":
				this._widthRulesStylesheet.insertRule(".time-division-year.year-366:not(.subdivided) { width: " + (newDivWidth * 366 * 24 * 3600 * 1000) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-year.year-365:not(.subdivided) { width: " + (newDivWidth * 365 * 24 * 3600 * 1000) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-31:not(.subdivided) { width: " + (newDivWidth * 31 * 24 * 3600 * 1000) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-30:not(.subdivided) { width: " + (newDivWidth * 30 * 24 * 3600 * 1000) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-29:not(.subdivided) { width: " + (newDivWidth * 29 * 24 * 3600 * 1000) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-month.month-28:not(.subdivided) { width: " + (newDivWidth * 28 * 24 * 3600 * 1000) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-day:not(.subdivided) { width: " + (newDivWidth * 24 * 3600 * 1000) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-hour:not(.subdivided) { width: " + (newDivWidth * 3600 * 1000) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-tenminutes:not(.subdivided) { width: " + (newDivWidth * 10 * 60 * 1000) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-minute:not(.subdivided) { width: " + (newDivWidth * 60 * 1000) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-tenseconds:not(.subdivided) { width: " + (newDivWidth * 10 * 1000) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-second:not(.subdivided) { width: " + (newDivWidth * 1000) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-ahundredmilliseconds:not(.subdivided) { width: " + (newDivWidth * 100) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-tenmilliseconds:not(.subdivided) { width: " + (newDivWidth * 10) + "px; }");
				this._widthRulesStylesheet.insertRule(".time-division-millisecond { width: " + newDivWidth + "px; }");
				break;
		}

		this._widgetContainer.className = newLevel;
		this._currentLevelDivWidth = newDivWidth;
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
						tens = parseInt(parent.getAttribute("id").substring(14,15), 10);
						label.innerText = tens.toString() + current.toString();
						break;
					case "tenseconds" :
						label.innerText = current.toString() + "0";
						break;
					case "second" :
						tens = parseInt(parent.getAttribute("id").substring(18,19), 10);
						label.innerText = tens.toString() + current.toString();
						break;
					case "ahundredmilliseconds" :
						label.innerText = current.toString() + "00";
						break;
					case "tenmilliseconds" :
						hundreds = parseInt(parent.getAttribute("id").substring(22,23), 10);
						label.innerText = hundreds.toString() + current.toString() + "0";
						break;
					case "millisecond" :
						hundreds = parseInt(parent.getAttribute("id").substring(22,23), 10);
						tens = parseInt(parent.getAttribute("id").substring(24,25), 10);
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
			let beginTime = parseInt(this.getAttribute("begin"), 10);
			let endTime = parseInt(this.getAttribute("end"), 10);

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
					let currentYear = parseInt(yearDivision.getAttribute("id").substring(0,4), 10);
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
						let currentYear = parseInt(yearDivision.getAttribute("id").substring(0,4), 10);
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
						let currentMonth = parseInt(monthDivision.getAttribute("id").substring(5,7), 10);
						let currentYear = parseInt(monthDivision.getAttribute("id").substring(0,4), 10);
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
							let currentMonth = parseInt(monthDivision.getAttribute("id").substring(5,7), 10);
							let currentYear = parseInt(monthDivision.getAttribute("id").substring(0,4), 10);
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
							let currentDay = parseInt(dayDivision.getAttribute("id").substring(8,10), 10);
							let currentMonth = parseInt(dayDivision.getAttribute("id").substring(5,7), 10);
							let currentYear = parseInt(dayDivision.getAttribute("id").substring(0,4), 10);
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
								let currentDay = parseInt(dayDivision.getAttribute("id").substring(8,10), 10);
								let currentMonth = parseInt(dayDivision.getAttribute("id").substring(5,7), 10);
								let currentYear = parseInt(dayDivision.getAttribute("id").substring(0,4), 10);
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
								let currentHour = parseInt(hourDivision.getAttribute("id").substring(11,13), 10);
								let currentDay = parseInt(hourDivision.getAttribute("id").substring(8,10), 10);
								let currentMonth = parseInt(hourDivision.getAttribute("id").substring(5,7), 10);
								let currentYear = parseInt(hourDivision.getAttribute("id").substring(0,4), 10);
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
									let currentHour = parseInt(hourDivision.getAttribute("id").substring(11,13), 10);
									let currentDay = parseInt(hourDivision.getAttribute("id").substring(8,10), 10);
									let currentMonth = parseInt(hourDivision.getAttribute("id").substring(5,7), 10);
									let currentYear = parseInt(hourDivision.getAttribute("id").substring(0,4), 10);
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
									let currentTenMinutes = parseInt(hourDivision.getAttribute("id").substring(14,15), 10);
									let currentHour = parseInt(hourDivision.getAttribute("id").substring(11,13), 10);
									let currentDay = parseInt(hourDivision.getAttribute("id").substring(8,10), 10);
									let currentMonth = parseInt(hourDivision.getAttribute("id").substring(5,7), 10);
									let currentYear = parseInt(hourDivision.getAttribute("id").substring(0,4), 10);
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
										let currentTenMinutes = parseInt(tenMinutesDivision.getAttribute("id").substring(14,15), 10);
										let currentHour = parseInt(tenMinutesDivision.getAttribute("id").substring(11,13), 10);
										let currentDay = parseInt(tenMinutesDivision.getAttribute("id").substring(8,10), 10);
										let currentMonth = parseInt(tenMinutesDivision.getAttribute("id").substring(5,7), 10);
										let currentYear = parseInt(tenMinutesDivision.getAttribute("id").substring(0,4), 10);
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
										let currentMinute = parseInt(minuteDivision.getAttribute("id").substring(16,17), 10);
										let currentTenMinutes = parseInt(minuteDivision.getAttribute("id").substring(14,15), 10);
										let currentHour = parseInt(minuteDivision.getAttribute("id").substring(11,13), 10);
										let currentDay = parseInt(minuteDivision.getAttribute("id").substring(8,10), 10);
										let currentMonth = parseInt(minuteDivision.getAttribute("id").substring(5,7), 10);
										let currentYear = parseInt(minuteDivision.getAttribute("id").substring(0,4), 10);
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
											let currentMinute = parseInt(minuteDivision.getAttribute("id").substring(16,17), 10);
											let currentTenMinutes = parseInt(minuteDivision.getAttribute("id").substring(14,15), 10);
											let currentHour = parseInt(minuteDivision.getAttribute("id").substring(11,13), 10);
											let currentDay = parseInt(minuteDivision.getAttribute("id").substring(8,10), 10);
											let currentMonth = parseInt(minuteDivision.getAttribute("id").substring(5,7), 10);
											let currentYear = parseInt(minuteDivision.getAttribute("id").substring(0,4), 10);
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
											let currentTenSeconds = parseInt(tenSecondDivision.getAttribute("id").substring(18,19), 10);
											let currentMinute = parseInt(tenSecondDivision.getAttribute("id").substring(16,17), 10);
											let currentTenMinutes = parseInt(tenSecondDivision.getAttribute("id").substring(14,15), 10);
											let currentHour = parseInt(tenSecondDivision.getAttribute("id").substring(11,13), 10);
											let currentDay = parseInt(tenSecondDivision.getAttribute("id").substring(8,10), 10);
											let currentMonth = parseInt(tenSecondDivision.getAttribute("id").substring(5,7), 10);
											let currentYear = parseInt(tenSecondDivision.getAttribute("id").substring(0,4), 10);
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
												let currentTenSeconds = parseInt(tenSecondDivision.getAttribute("id").substring(18,19), 10);
												let currentMinute = parseInt(tenSecondDivision.getAttribute("id").substring(16,17), 10);
												let currentTenMinutes = parseInt(tenSecondDivision.getAttribute("id").substring(14,15), 10);
												let currentHour = parseInt(tenSecondDivision.getAttribute("id").substring(11,13), 10);
												let currentDay = parseInt(tenSecondDivision.getAttribute("id").substring(8,10), 10);
												let currentMonth = parseInt(tenSecondDivision.getAttribute("id").substring(5,7), 10);
												let currentYear = parseInt(tenSecondDivision.getAttribute("id").substring(0,4), 10);
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
												let currentSecond = parseInt(secondDivision.getAttribute("id").substring(20,21), 10);
												let currentTenSeconds = parseInt(secondDivision.getAttribute("id").substring(18,19), 10);
												let currentMinute = parseInt(secondDivision.getAttribute("id").substring(16,17), 10);
												let currentTenMinutes = parseInt(secondDivision.getAttribute("id").substring(14,15), 10);
												let currentHour = parseInt(secondDivision.getAttribute("id").substring(11,13), 10);
												let currentDay = parseInt(secondDivision.getAttribute("id").substring(8,10), 10);
												let currentMonth = parseInt(secondDivision.getAttribute("id").substring(5,7), 10);
												let currentYear = parseInt(secondDivision.getAttribute("id").substring(0,4), 10);
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
													let currentSecond = parseInt(secondDivision.getAttribute("id").substring(20,21), 10);
													let currentTenSeconds = parseInt(secondDivision.getAttribute("id").substring(18,19), 10);
													let currentMinute = parseInt(secondDivision.getAttribute("id").substring(16,17), 10);
													let currentTenMinutes = parseInt(secondDivision.getAttribute("id").substring(14,15), 10);
													let currentHour = parseInt(secondDivision.getAttribute("id").substring(11,13), 10);
													let currentDay = parseInt(secondDivision.getAttribute("id").substring(8,10), 10);
													let currentMonth = parseInt(secondDivision.getAttribute("id").substring(5,7), 10);
													let currentYear = parseInt(secondDivision.getAttribute("id").substring(0,4), 10);
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
													let currentHundredMillisecond = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(22,23), 10);
													let currentSecond = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(20,21), 10);
													let currentTenSeconds = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(18,19), 10);
													let currentMinute = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(16,17), 10);
													let currentTenMinutes = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(14,15), 10);
													let currentHour = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(11,13), 10);
													let currentDay = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(8,10), 10);
													let currentMonth = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(5,7), 10);
													let currentYear = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(0,4), 10);
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
														let currentHundredMillisecond = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(22,23), 10);
														let currentSecond = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(20,21), 10);
														let currentTenSeconds = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(18,19), 10);
														let currentMinute = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(16,17), 10);
														let currentTenMinutes = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(14,15), 10);
														let currentHour = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(11,13), 10);
														let currentDay = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(8,10), 10);
														let currentMonth = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(5,7), 10);
														let currentYear = parseInt(hundredMillisecondsDivision.getAttribute("id").substring(0,4), 10);
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
														let currentTenMillisecond = parseInt(tenMillisecondsDivision.getAttribute("id").substring(24,25), 10);
														let currentHundredMillisecond = parseInt(tenMillisecondsDivision.getAttribute("id").substring(22,23), 10);
														let currentSecond = parseInt(tenMillisecondsDivision.getAttribute("id").substring(20,21), 10);
														let currentTenSeconds = parseInt(tenMillisecondsDivision.getAttribute("id").substring(18,19), 10);
														let currentMinute = parseInt(tenMillisecondsDivision.getAttribute("id").substring(16,17), 10);
														let currentTenMinutes = parseInt(tenMillisecondsDivision.getAttribute("id").substring(14,15), 10);
														let currentHour = parseInt(tenMillisecondsDivision.getAttribute("id").substring(11,13), 10);
														let currentDay = parseInt(tenMillisecondsDivision.getAttribute("id").substring(8,10), 10);
														let currentMonth = parseInt(tenMillisecondsDivision.getAttribute("id").substring(5,7), 10);
														let currentYear = parseInt(tenMillisecondsDivision.getAttribute("id").substring(0,4), 10);
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
															let currentTenMillisecond = parseInt(tenMillisecondsDivision.getAttribute("id").substring(24,25), 10);
															let currentHundredMillisecond = parseInt(tenMillisecondsDivision.getAttribute("id").substring(22,23), 10);
															let currentSecond = parseInt(tenMillisecondsDivision.getAttribute("id").substring(20,21), 10);
															let currentTenSeconds = parseInt(tenMillisecondsDivision.getAttribute("id").substring(18,19), 10);
															let currentMinute = parseInt(tenMillisecondsDivision.getAttribute("id").substring(16,17), 10);
															let currentTenMinutes = parseInt(tenMillisecondsDivision.getAttribute("id").substring(14,15), 10);
															let currentHour = parseInt(tenMillisecondsDivision.getAttribute("id").substring(11,13), 10);
															let currentDay = parseInt(tenMillisecondsDivision.getAttribute("id").substring(8,10), 10);
															let currentMonth = parseInt(tenMillisecondsDivision.getAttribute("id").substring(5,7), 10);
															let currentYear = parseInt(tenMillisecondsDivision.getAttribute("id").substring(0,4), 10);
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

		while((newLevel != "year") && (newDivWidth < KTBS4LA2Timeline.minDivisionWidthPerUnit[newLevel])) {
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
		this._initialLevel = newLevel;
	}

	/**
	 * 
	 */
	_initZoom() {
		this._initZoomParams();
		this._setWidthRules(this._initialLevel, this._initialDivWidth);
		this._resolveZoomInitialized();
	}

	/**
	 * 
	 */
	_onMouseWheel(event) {
		// Ctrl+Wheel = Zoom in/out
		if(event.ctrlKey) {
			event.preventDefault();

			if(this._timeDivisionsAreInitialized == true) {
				let verticalMovement = event.deltaY;
				
				if(verticalMovement && (verticalMovement != 0)) {
					let movementUnit = event.deltaMode;

					if(movementUnit == 0)
						verticalMovement = verticalMovement / 28;

					let displayWindowRelativeMouseX = event.clientX - this._displayWindow.getBoundingClientRect().left;
					let timeDivRelativeMouseX = displayWindowRelativeMouseX + this._displayWindow.scrollLeft;
					let mouseTime = this._getMouseTime(timeDivRelativeMouseX);
					this._requestZoomIncrement(verticalMovement, mouseTime, displayWindowRelativeMouseX);
				}
			}
		}
		// Shift+Wheel = Scroll left/right
		else if(event.shiftKey) {
			event.preventDefault();
			
			if(this._timeDivisionsAreInitialized == true) {
				// when the users scrolls with a mouse wheel, event.deltaX is always equals to 0
				// but when the users uses a trackpad, event can have non 0 values for both deltaX and deltaY, and the usefull one is deltaX
				// at this point, there is no way to determine wether the user uses a mouse or a trackpad
				// so, we can only guess that when deltaX has a value != 0, that's the one to use, and if deltaX == 0, it's probably a mouse, so we use deltaY
				// the inconvenient with this method, is that if the user does a vertical movement with a trackpad, it will be mistaken for a mouse wheel scroll, so scrolling can be triggered by Shift+vertical movement 
				let horizontalMovement = (event.deltaX == 0)?event.deltaY:event.deltaX;
				
				if(horizontalMovement && (horizontalMovement != 0)) {
					let movementUnit = event.deltaMode;

					if(movementUnit == 0)
						horizontalMovement = horizontalMovement / (28 * 3);
					
					if(((horizontalMovement < 0 ) && !this._beginIsInView()) || ((horizontalMovement > 0 ) && !this._endIsInView())) {
						this._requestedScrollAmount += horizontalMovement;

						if(this._scrollRequestID != null)
							clearTimeout(this._scrollRequestID);

						this._scrollRequestID = setTimeout(() => {
							this._incrementScroll();
							this._updateVerticalCursor(event);
						});
					}
				}
			}
		}
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
			}, 500);
		}
	}

	/**
	 * 
	 */
	_getMouseTime(timeDivRelativeMouseX) {
		let timeOverWidthRatio = (this._lastRepresentedTime - this._firstRepresentedTime) / this._timeDiv.clientWidth;
		return (this._firstRepresentedTime + (timeDivRelativeMouseX * timeOverWidthRatio));
	}

	/**
	 * 
	 */
	_setTimelineCursorPositionForTime(timelineCursorTime) {
		let widthOverTimeRatio = this._timeDiv.clientWidth / (this._lastRepresentedTime - this._firstRepresentedTime);
		let timelineCursorTimeOffset = timelineCursorTime - this._firstRepresentedTime;
		let newTimelineCursorLeft = timelineCursorTimeOffset * widthOverTimeRatio;
		this._timelineCursor.style.left = newTimelineCursorLeft + "px";
	}

	/**
	 * 
	 */
	_setScrollForMousePositionAndTime(mouseTime, displayWindowRelativeMouseX) {
		let widthOverTimeRatio = this._timeDiv.clientWidth / (this._lastRepresentedTime - this._firstRepresentedTime);
		let mouseTimeOffset = mouseTime - this._firstRepresentedTime;
		let timeDivRelativeMouseX = mouseTimeOffset * widthOverTimeRatio;
		let newScrollLeft = timeDivRelativeMouseX - displayWindowRelativeMouseX;
		this._setSilentScroll(newScrollLeft);
	}

	/**
	 * 
	 */
	_requestZoomIncrement(incrementAmount, mouseTime, displayWindowRelativeMouseX) {
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

			if(this._requestedZoomIncrementAmount != 0) {
				if(this._requestedZoomIncrementAmount > 0)
					this._setZoomCursor("zooming-out");
				else if(this._requestedZoomIncrementAmount < 0)
					this._setZoomCursor("zooming-in");

				if(this._requestZoomIncrementID != null)
					clearTimeout(this._requestZoomIncrementID);

				this._requestZoomIncrementID = setTimeout(() => {
					Promise.all([this._timeDivisionsInitialized, this._zoomInitialized]).then(() => {
						let zoomAmount = this._requestedZoomIncrementAmount;
						this._requestedZoomIncrementAmount = 0;

						// memorise the position of timeline's cursor
						let timelineCursorPosition = this._timelineCursor.getBoundingClientRect().left - this._displayWindow.getBoundingClientRect().left + this._displayWindow.scrollLeft;
						let timelineCursorTime = this._getMouseTime(timelineCursorPosition);
						
						let divisionsLevelHasChanged = this._incrementZoom(zoomAmount);

						let timeOverWidthRatio = (this._lastRepresentedTime - this._firstRepresentedTime) / this._timeDiv.clientWidth;
						
						let newViewBeginTime = mouseTime - (displayWindowRelativeMouseX * timeOverWidthRatio);
						let newViewEndTime = mouseTime + ((this._displayWindow.clientWidth - displayWindowRelativeMouseX) * timeOverWidthRatio);
						
						let newTimeDivBoundaries = this._getTimeDivBoundariesForView(newViewBeginTime, newViewEndTime);
						let timeDivNeedsToChange = ((newTimeDivBoundaries.beginTime != this._firstRepresentedTime) || (newTimeDivBoundaries.endTime != this._lastRepresentedTime));

						if(timeDivNeedsToChange || divisionsLevelHasChanged) {
							let firstBefore = this._firstRepresentedTime;
							let lastBefore = this._lastRepresentedTime;
							this._updateTimeDivisions(newTimeDivBoundaries.beginTime, newTimeDivBoundaries.endTime);
							let timeDivHasChanged = ((this._firstRepresentedTime != firstBefore) || (this._lastRepresentedTime != lastBefore));

							if(timeDivHasChanged) {
								let affectedIntervals = this._getIntervalUnion({begin: firstBefore, end: lastBefore}, {begin: this._firstRepresentedTime, end: this._lastRepresentedTime});
								
								for(let i = 0; i < affectedIntervals.length; i++) {
									let interval = affectedIntervals[i];
									let eventsToUpdate = this._getDisplayedEventsOverlappingInterval(interval.begin, interval.end);
									this._updateEventsPosX(eventsToUpdate);
									const histoBarsToUpdate = this._getHistoBarsOverlappingInterval(interval.begin, interval.end);
									this._updateHistogramBarsPosX(histoBarsToUpdate);
								}
							}
						}
						
						if(divisionsLevelHasChanged)
							this._updateMaxDisplayableRows();

						this._requestUpdateEventsRow();
						this._setScrollForMousePositionAndTime(mouseTime, displayWindowRelativeMouseX);
						this._updateScrollBarCursor();

						// re-position timeline's cursor at the right place
						this._setTimelineCursorPositionForTime(timelineCursorTime);

						this._requestZoomIncrementID = null;
						this._notifyViewChange();
					});
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
		this._firstRepresentedTime = this._getActualFirstRepresentedTime();
		this._lastRepresentedTime = this._getActualLastRepresentedTime();
	}

	/**
	 * 
	 */
	_incrementZoom(increment) {
		let divisionsLevelHasChanged = false;

		if(increment != 0) {
			let newLevel = this._widgetContainer.className;
			let newWidth = this._currentLevelDivWidth * Math.exp(-increment / 10);

			// user zoomed out
			if(increment > 0) {
				while((newLevel != "year") && (newWidth < KTBS4LA2Timeline.minDivisionWidthPerUnit[newLevel])) {
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
			}

			divisionsLevelHasChanged = (newLevel != this._widgetContainer.className);

			if((newLevel != this._widgetContainer.className) || (newWidth != this._currentLevelDivWidth))
				this._setWidthRules(newLevel, newWidth);
		}

		return divisionsLevelHasChanged;
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
					if(eventNodes[eventIndex].isVisible)
						currentPixelEventCount++;

					eventIndex++;
				}

				eventsCountPerPixel[x] = currentPixelEventCount;
			}

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
					canvasContext.fillStyle = color;
					canvasContext.fillRect(x, 0, 1, scrollBarHeight);
				}
			}
		});
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		this._yearLabel.innerText = this._translateString("Year");
		this._monthLabel.innerText = this._translateString("Month");
		this._dayLabel.innerText = this._translateString("Day");
		this._hourLabel.innerText = this._translateString("Hour");
		this._minuteLabel.innerText = this._translateString("Minute");
		this._secondLabel.innerText = this._translateString("Second");
		this._millisecondLabel.innerText = this._translateString("Millisecond");
		this._dezoomButton.setAttribute("title", this._translateString("Zoom all the way out"));
		this._scrollLeftButton.setAttribute("title", this._translateString("Scroll left"));
		this._scrollRightButton.setAttribute("title", this._translateString("Scroll right"));
		this._toggleFullscreenButton.setAttribute("title", this._translateString("Toggle fullscreen"));

		// update month time divisions labels
		let monthSubdivsLabels = this._timeDiv.querySelectorAll(".time-division-month > .label");
		
		for(let i = 0; i < monthSubdivsLabels.length; i++) {
			let aMonthLabel = monthSubdivsLabels[i];
			let monthNumber = parseInt(aMonthLabel.parentNode.getAttribute("id").substring(5,7), 10);
			aMonthLabel.innerText = this._translateString(KTBS4LA2Timeline.monthNames[monthNumber]);
		}
	}

	/**
	 * 
	 */
	get zoomLevel() {
		return this._widgetContainer.className;
	}

	get divWidth() {
		return this._currentLevelDivWidth;
	}

	/**
	 * 
	 */
	_notifyViewChange(user_initiated = true) {
		this.dispatchEvent(
			new CustomEvent("view-change", {
				bubbles: true,
				cancelable: false,
				composed: true,
				detail : {
					begin: this.viewBeginTime,
					zoomLevel: this.zoomLevel,
					divWidth: this.divWidth,
					user_initiated: user_initiated
				}
			})
		);
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
