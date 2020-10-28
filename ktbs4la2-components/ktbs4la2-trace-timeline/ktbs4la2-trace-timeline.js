import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

import {ResourceMultiton} from "../../ktbs-api/ResourceMultiton.js";
import {Trace} from "../../ktbs-api/Trace.js";
import {Stylesheet} from "../../ktbs-api/Stylesheet.js";
import {HubbleRule} from "../../ktbs-api/HubbleRule.js";
import {HubbleSubRule} from "../../ktbs-api/HubbleSubRule.js";

import "./ktbs4la2-trace-timeline-style-legend.js";
import "../ktbs4la2-timeline/ktbs4la2-timeline.js";
import "../ktbs4la2-obsel-attributes/ktbs4la2-obsel-attributes.js";

import {getDistinctColor} from "../common/colors-utils.js";

/**
 * Encodes a string containing a Javascript special character to it's HTML hexadecimal entity
 */
function JSSpecialCharToHTMLHex(str) {
    return "&#x" + str.codePointAt(0).toString(16) + ";";
}

/**
 * 
 */
class KTBS4LA2TraceTimeline extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true);
		this._obsels = new Array();
		this._resolveStylesheetsBuilded;

		this._stylesheetsBuilded =  new Promise((resolve, reject) => {
			this._resolveStylesheetsBuilded = resolve;
		});

		this._styleSheets = new Array();
		this._currentStylesheet = null;
		this._originTime = 0;
		this._obselsLoadingAbortController = new AbortController();
		this._allowFullScreen = true;
		this._allowChangeStylesheet = true;
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._container = this.shadowRoot.querySelector("#container");
		this._styleSheetSelector = this.shadowRoot.querySelector("#slylesheet-selector");
		this._styleSheetIcon = this.shadowRoot.querySelector("#stylesheet-icon");
		this._defaultStylesheetSelectorEntry = this.shadowRoot.querySelector("#default");
		this._styleSheetSelector.addEventListener("change", this._onChangeStyleSheetSelector.bind(this));
		this._legend = this.shadowRoot.querySelector("#legend");
		this._waitMessage = this.shadowRoot.querySelector("#wait-message");
		this._errorMessage = this.shadowRoot.querySelector("#error-message");
		this._emptyMessage = this.shadowRoot.querySelector("#empty-message");
		this._timeline = document.createElement("ktbs4la2-timeline");
		this._timeline.setAttribute("lang", this._lang);
		this._timeline.setAttribute("slot", "timeline");
		this._timeline.setAttribute("allow-fullscreen", this.hasAttribute("allow-fullscreen")?this.getAttribute("allow-fullscreen"):"true");
		this._timeline.addEventListener("request-fullscreen", this._onTimelineRequestFullscreen.bind(this), true);
		this._timeline.addEventListener("click", this._onClickTimeline.bind(this), true);
		this._obselsLoadingIndications = this.shadowRoot.querySelector("#obsels-loading-indications");
		this._obselsLoadControlButton = this.shadowRoot.querySelector("#obsels-load-control-button");
		this._obselsLoadControlButton.addEventListener("click", this._onClickObselsLoadControlButton.bind(this));
		this._loadingStatusIcon = this.shadowRoot.querySelector("#loading-status-icon");
		this._progressBar = this.shadowRoot.querySelector("#progress-bar");
		this.appendChild(this._timeline);
		let obselsStylesheetURL = import.meta.url.substr(0, import.meta.url.lastIndexOf('/')) + '/obsels-popup.css';
		let obselsStyleLink = document.createElement("link");
		obselsStyleLink.setAttribute("rel", "stylesheet");
		obselsStyleLink.setAttribute("href", obselsStylesheetURL);
		this.appendChild(obselsStyleLink);
	}

	/**
	 * 
	 */
	disconnectedCallback() {
		super.disconnectedCallback();
		this._obselsLoadingAbortController.abort();
	}

	/**
	 * 
	 */
	_getObselById(obselID) {
		let obsel = undefined;

		for(let i = 0; !obsel && (i < this._obsels.length); i++)
			if(this._obsels[i].id == obselID)
				obsel = this._obsels[i];

		return obsel;
	}

	/**
	 * 
	 * @param {*} event 
	 */
	_onClickTimeline(event) {
		if(event.target.localName == "ktbs4la2-timeline-event") {
			let eventNode = event.target;

			if(!eventNode.classList.contains("selected") && (eventNode.innerHTML == "")) {
				let obsel = this._getObselById(eventNode.id);

				if(obsel)
					this._fillObselEventContent(eventNode, obsel);
			}
		}
	}

	/**
	 * 
	 */
	_onClickObselsLoadControlButton(event) {
		switch(this._obselsLoadingIndications.className) {
			case "loading":
				this._stopObselsLoading();
				break;
			default:
				this._reloadObsels();
		}
	}

	/**
	 * 
	 */
	_stopObselsLoading() {
		this._obselsLoadingAbortController.abort();
		this._obselsLoadingIndications.className = "stopped";
		this._obselsLoadControlButton.setAttribute("title", this._translateString("Reload"));
		this._loadingStatusIcon.setAttribute("title", this._translateString("Loading stopped by user"));
	}

	/**
	 * 
	 */
	_reloadObsels() {
		this._obselsLoadingAbortController = new AbortController();
		this._timeline.innerHTML = "";
		this._obsels = new Array();
		this._progressBar.style.width = "0%";
		this._obselsLoadControlButton.setAttribute("title", this._translateString("Stop loading"));
		this._loadingStatusIcon.setAttribute("title", this._translateString("Loading"));
		this._obselsLoadingIndications.className = "loading";
		this._initObselsLoading();
	}

	/**
	 * 
	 */
	_onTimelineRequestFullscreen(event) {
		event.preventDefault();

		if(this._allowFullScreen)
			this._container.requestFullscreen();
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push('uri');
		observedAttributes.push("allow-fullscreen");
		observedAttributes.push("allow-change-stylesheet");
		observedAttributes.push("stylesheet");
		return observedAttributes;
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "uri") {
			if(newValue) {
				if(!this._trace || (this._trace.uri.toString() != newValue)) {
					try {
						const trace_uri = new URL(newValue);

						if(this._trace) {
							this._trace.unregisterObserver(this._onTraceNotification.bind(this));
							delete this._trace;
						}

						this._trace = ResourceMultiton.get_resource(Trace, trace_uri);
						this._trace.registerObserver(this._onTraceNotification.bind(this), "sync-status-change");
						this._onTraceNotification(this._trace, "sync-status-change");
					}
					catch(error) {
						this._setError(error);
					}
				}
			}
			else
				this._setError(new DOMException("Missing value for required attribute \"uri\""));
		}
		
		if(attributeName == "allow-fullscreen") {
			this._allowFullScreen = !((newValue == "0") || (newValue == "false"));

			this._componentReady.then(() => {
				this._timeline.setAttribute("allow-fullscreen", newValue);
			});

			if(!this._allowFullScreen && (document.fullscreenElement === this))
				document.exitFullscreen();
		}

		if(attributeName == "allow-change-stylesheet") {
			this._allowChangeStylesheet = !((newValue == "0") || (newValue == "false"));

			this._componentReady.then(() => {
				if(this._allowChangeStylesheet)
					this._styleSheetSelector.removeAttribute("disabled");
				else
					this._styleSheetSelector.setAttribute("disabled", true);
			});
		}

		if(attributeName == "stylesheet") {
			this._stylesheetsBuilded.then(() => {
				let newStyleSheet = null;
				
				for(let i = 0; i < this._styleSheets.length; i++) {
					let aStylesheet = this._styleSheets[i];

					if(aStylesheet.name.toLowerCase() == newValue.toLowerCase()) {
						newStyleSheet = aStylesheet;
						break;
					}
				}

				if((newStyleSheet) && (newStyleSheet != this._currentStylesheet))
					this._componentReady.then(() => {
						this._applyStyleSheet(newStyleSheet, false);
					});
			});
		}
	}

	/**
	 * 
	 */
	_onTraceNotification(sender, type, old_value) {
		switch(sender.syncStatus) {
			case "needs_sync":
				this._onTraceOrStatsPending();
				this._trace.get(this._abortController.signal);
				break;
			case "pending":
				this._onTraceOrStatsPending();
				break;
			case "in_sync" :
				this._onTraceReady();
				break;
			default:
				this._setError(this._trace.error);
				break;
		}
	}

	/**
	 * 
	 */
	_onTraceOrStatsPending() {
		this._componentReady.then(() => {
			this._container.className = "waiting";
		});
	}

	/**
	 * 
	 */
	hasStylesheet(stylesheet_id) {
		let stylesheetFound = false;

		for(let i = 0; i < this._styleSheets.length; i++) {
			let aStylesheet = this._styleSheets[i];

			if(aStylesheet.name.toLowerCase() == stylesheet_id.toLowerCase()) {
				stylesheetFound = true;
				break;
			}
		}

		return stylesheetFound;
	}

	/**
	 * 
	 */
	_initObselsLoading() {
		this._obselList = this._trace.obsel_list;

		this._allObselsLoaded = new Promise(function(resolve, reject) {
			this._resolveAllObselsLoaded = resolve;
			this._rejectAllObselsLoaded = reject;
		}.bind(this));
		
		let firstObselPage = this._obselList.get_first_page(100);

		firstObselPage.get(this._obselsLoadingAbortController.signal)
			.then((response) => {
				this._onObselListPageRead(firstObselPage);
			})
			.catch((error) => {
				if((error.name != "AbortError") || !this._obselsLoadingAbortController.signal.aborted)
					this._onObselListPageReadFailed(error);
			});

		this._allObselsLoaded
			.then(() => {
				this._componentReady.then(() => {
					this._progressBar.style.width = "100%";
					this._obselsLoadControlButton.setAttribute("title", this._translateString("Reload"));
					this._loadingStatusIcon.setAttribute("title", this._translateString("Loading complete"));
					this._obselsLoadingIndications.className = "loaded";
				});
			});
	}

	/**
	 * 
	 */
	_generateDefaultStylesheetFromObsels() {
		let defaultStyleSheet = new Stylesheet();
		defaultStyleSheet.name = this._translateString("Default");
		defaultStyleSheet.description = this._translateString("Automatically generated stylesheet (duration bar symbol, with one different color for each obsel type)");
		let knownObselTypes = new Array();
	
		// build list of all distinct obsel types in the obsel list
		for(let i = 0; i < this._obsels.length; i++) {
			let anObsel = this._obsels[i];
			let obselType = anObsel.type_id;

			if(!knownObselTypes.includes(obselType))
				knownObselTypes.push(obselType);
		}

		for(let i = 0; i < knownObselTypes.length; i++) {
			let obselTypeID = knownObselTypes[i];
			let aRule = new HubbleRule();
			aRule.id = obselTypeID;
			aRule.symbol = new Object();
			aRule.symbol.color = getDistinctColor(i, knownObselTypes.length);
			aRule.symbol.shape = "duration-bar";
			let aSubRule = new HubbleSubRule();
			aSubRule.type = obselTypeID;
			aRule.rules.push(aSubRule);
			defaultStyleSheet.rules.push(aRule);
		}
		
		return defaultStyleSheet;
	}

	/**
	 * 
	 */
	_onTraceReady() {
		const traceOriginString = this._trace.origin;

		if(traceOriginString != undefined) {
			let parsedOrigin = Date.parse(traceOriginString);

			if(!isNaN(parsedOrigin))
				this._originTime = parsedOrigin;
		}

		if(!this._model || (this._trace.model != this._model)) {
			if(this._model) {
				this._model.unregisterObserver(this._onModelNotification.bind(this));
				delete this._model;
			}

			this._model = this._trace.model;
			this._model.registerObserver(this._onModelNotification.bind(this), "sync-status-change");
			this._onModelNotification(this._model, "sync-status-change");
		}

		if(this._stats) {
			this._stats.unregisterObserver(this._onStatsNotification.bind(this), "sync-status-change");
			delete this._stats;
		}

		this._stats = this._trace.stats;
		this._stats.registerObserver(this._onStatsNotification.bind(this));
		this._onStatsNotification(this._stats, "sync-status-change");
		
		this._componentReady.then(() => {
			this._reloadObsels();
		});
	}

	/**
	 * 
	 */
	_onModelNotification() {
		switch(this._model.syncStatus) {
			case "needs_sync":
				this._model.get(this._abortController.signal);
				break;
			case "in_sync" :
				this._onModelReady();
				break;
			case "pending" :
				break;
			default:
				this._onModelError();
				break;
		}
	}

	/**
	 * 
	 */
	_onStatsNotification() {
		switch(this._stats.syncStatus) {
			case "needs_sync":
				this._onTraceOrStatsPending();
				this._stats.get(this._abortController.signal);
				break;
			case "pending":
				this._onTraceOrStatsPending();
				break;
			case "in_sync" :
				this._onStatsReady();
				break;
			default:
				this._setError(this._stats.error);;
				break;
		}
	}

	/**
	 * 
	 */
	_setError(error) {
		this.emitErrorEvent(error);

		this._componentReady.then(() => {
			this._container.className = "error";
			this._errorMessage.innerText = "Error : " + error;
		});
	}

	/**
	 * 
	 */
	_generateDefaultStylesheetFromModel() {
		let defaultStyleSheet = new Stylesheet();
		defaultStyleSheet.name = this._translateString("Default");
		defaultStyleSheet.description = this._translateString("Automatically generated stylesheet (one symbol and color for each obsel type)");
		defaultStyleSheet.generated_from_model = true;
		let obselTypes = this._model.obsel_types;

		for(let i = 0; i < obselTypes.length; i++) {
			let obselType = obselTypes[i];
			let aRule = new HubbleRule();
			let obselTypeLabel = obselType.get_translated_label(this._lang);

			if(obselTypeLabel)
				aRule.id = obselTypeLabel;
			else
				aRule.id = obselType.id;

			aRule.symbol = new Object();

			if(obselType.suggestedColor)
				aRule.symbol.color = obselType.suggestedColor;
			else
				aRule.symbol.color = getDistinctColor(i, obselTypes.length);

			if(obselType.suggestedSymbol)
				aRule.symbol.symbol = obselType.suggestedSymbol;
			else
				aRule.symbol.shape = "duration-bar";

			let aSubRule = new HubbleSubRule();
			aSubRule.type = obselType.uri;
			aRule.rules.push(aSubRule);
			defaultStyleSheet.rules.push(aRule);
		}
		
		// add a default "catch-all" rule
		let catchAllRule = HubbleRule.catchAllRule;
		catchAllRule.id = this._translateString("Unknown obsel type");
		defaultStyleSheet.rules.push(catchAllRule);
		return defaultStyleSheet;
	}

	/**
	 * 
	 */
	_onModelReady() {
		this._componentReady.then(() => {
			let defaultStylesheetGeneratedFromModel = this._generateDefaultStylesheetFromModel();
			
			if(defaultStylesheetGeneratedFromModel != null) {
				this._styleSheets.unshift(defaultStylesheetGeneratedFromModel);

				if(!this.hasAttribute("stylesheet") || (this.getAttribute("stylesheet").toLowerCase() == "default"))
					setTimeout(() => {
						this._applyStyleSheet(defaultStylesheetGeneratedFromModel, false);
					});
			}

			let modelStyleSheets = this._model.stylesheets;

			for(let i = 0; i < modelStyleSheets.length; i++) {
				let aStyleSheet = modelStyleSheets[i];
				this._styleSheets.push(aStyleSheet);
				let styleSheetSelectorEntry = document.createElement("option");
				styleSheetSelectorEntry.setAttribute("value", i+1);
				styleSheetSelectorEntry.innerText = aStyleSheet.name;
				styleSheetSelectorEntry.setAttribute("title", aStyleSheet.description);
				this._styleSheetSelector.appendChild(styleSheetSelectorEntry);
			}

			if((modelStyleSheets.length > 0) && (this._allowChangeStylesheet) && (this._styleSheetSelector.hasAttribute("disabled")))
				this._styleSheetSelector.removeAttribute("disabled");

			this._resolveStylesheetsBuilded();
		});
	}

	/**
	 * 
	 */
	_onModelError() {
		this._componentReady.then(() => {
			let defaultStyleSheet = this._generateDefaultStylesheetFromObsels();

			if((defaultStyleSheet != null) && (!this.hasAttribute("stylesheet") || (this.getAttribute("stylesheet").toLowerCase() == "default")))
				this._applyStyleSheet(defaultStyleSheet, false);

			this._resolveStylesheetsBuilded();
		});
	}

	/**
	 * 
	 */
	_onChangeStyleSheetSelector(event) {
		if(this._allowChangeStylesheet)
			setTimeout(() => {
				let styleSheetID = parseInt(this._styleSheetSelector.value);

				if(!isNaN(styleSheetID)) {
					let newStyleSheet = this._styleSheets[styleSheetID];

					if(newStyleSheet != this._currentStylesheet)
						this._applyStyleSheet(newStyleSheet, true);
				}
			});
	}

	/**
	 * 
	 * @param Object stylesheet 
	 */
	_rebuildLegend(stylesheet) {
		while(this._legend.firstChild)
			this._legend.removeChild(this._legend.firstChild);

		for(let i = 0; i < stylesheet.rules.length; i++) {
			let aRule = stylesheet.rules[i];
			let styleNode = document.createElement("ktbs4la2-trace-timeline-style-legend");
			styleNode.setAttribute("rule-id", aRule.id);

			if(aRule.label)
				styleNode.setAttribute("label", this._translateString(aRule.label));

			if(aRule.symbol.symbol)
				styleNode.setAttribute("symbol", JSSpecialCharToHTMLHex(aRule.symbol.symbol));
			else if(aRule.symbol.shape)
				styleNode.setAttribute("shape", aRule.symbol.shape);

			if(aRule.symbol.color)
				styleNode.setAttribute("color", aRule.symbol.color);

			if(aRule.visible != undefined)
				styleNode.setAttribute("visible", aRule.visible);

			this._legend.appendChild(styleNode);
		}
	}

	/**
	 * 
	 */
	_applyStyleSheet(stylesheet, emit_event = false) {
		if(!this._currentStylesheet || (this._currentStylesheet != stylesheet)) {
			this._currentStylesheet = stylesheet;

			// rebuild the legend
			this._rebuildLegend(stylesheet);

			// update stylesheet selector if needed (i.e. the stylesheet has been changed, not from the selector, but from the "stylesheet" attribute)
			if(stylesheet.name != this._styleSheetSelector.value) {
				let selectorEntries = this._styleSheetSelector.options;
				
				for(let i = 0; i < selectorEntries.length; i++) {
					let anEntry = selectorEntries[i];

					if(anEntry.selected && (anEntry.innerText != stylesheet.name))
						anEntry.selected = false;
					else if(!anEntry.selected && (anEntry.innerText == stylesheet.name))
						anEntry.selected = true;
				}
			}
		}
		
		// --- apply rules to obsels ---
		for(let i = 0; i < this._obsels.length; i++) {
			let anObsel = this._obsels[i];
			let obselEventNode = this.querySelector("#" + CSS.escape(anObsel.id));

			if(obselEventNode) {
				let matchedRule = stylesheet.getFirstRuleMatchedByObsel(anObsel);
				
				if(matchedRule) {
					if(matchedRule.symbol.symbol) {
						obselEventNode.setAttribute("symbol", JSSpecialCharToHTMLHex(matchedRule.symbol.symbol));

						if(obselEventNode.hasAttribute("shape"))
							obselEventNode.removeAttribute("shape");
					}
					else if(matchedRule.symbol.shape) {
						obselEventNode.setAttribute("shape", matchedRule.symbol.shape);

						if(obselEventNode.hasAttribute("symbol"))
							obselEventNode.removeAttribute("symbol");
					}

					if(matchedRule.symbol.color)
						obselEventNode.setAttribute("color", matchedRule.symbol.color);
					else if(obselEventNode.hasAttribute("color"))
						obselEventNode.removeAttribute("color");

					if(!matchedRule.visible)
						obselEventNode.setAttribute("visible", false);
					else if(obselEventNode.hasAttribute("visible"))
						obselEventNode.removeAttribute("visible");
				}
				else
					obselEventNode.setAttribute("visible", false);
			}
			else
				this.emitErrorEvent(new Error("Could not found event node for obsel " + anObsel.id));
		}

		if(emit_event)
			this.dispatchEvent(
				new CustomEvent("set-stylesheet", {
					bubbles: true,
					cancelable: false,
					detail : {stylesheetId: stylesheet.name}
				})
			);
	}

	/**
	 * 
	 */
	_updateBeginEnd() {
		if((this._stats.min_time != undefined) && (this._stats.max_time != undefined)) {
			let minTime = this._stats.min_time + this._originTime;
			let maxTime = this._stats.max_time + this._originTime;
			
			this._componentReady.then(() => {
				this._timeline.setAttribute("begin", minTime);
				this._timeline.setAttribute("end", maxTime);

				if(this._container.classList.contains("waiting"))
					this._container.classList.remove("waiting");
			});
		}
		else
			this._setError("Cannot retrieve minTime and/or maxTime attributes froms stats");
	}

	/**
	 * 
	 */
	_onStatsReady() {
		this._expectedObselCount = (this._stats.obsel_count != undefined)?this._stats.obsel_count:0;

		if(this._expectedObselCount != 0) {
			this._updateBeginEnd();
		}
		else {
			this._componentReady.then(() => {
				this._container.className = "empty";
			});
		}
	}

	/**
	 * 
	 */
	_getObselTitleHint(obsel) {
		let eventBeginDate = new Date(obsel.begin + this._originTime);

		let beginDateString = eventBeginDate.getFullYear() + "-" 
						+ (eventBeginDate.getMonth() + 1).toString().padStart(2, '0') + "-" 
						+ eventBeginDate.getDate().toString().padStart(2, '0') + " "
						+ eventBeginDate.getHours().toString().padStart(2, '0') + ":"
						+ eventBeginDate.getMinutes().toString().padStart(2, '0') + ":"
						+ eventBeginDate.getSeconds().toString().padStart(2, '0') + ":"
						+ eventBeginDate.getMilliseconds().toString().padStart(3, '0');

		let obselTypeLabel;
		let obselType = obsel.type;

		if(obselType) {
			let obselTypeTranslatedLabel = obselType.get_translated_label(this._lang);

			if(obselTypeTranslatedLabel)
				obselTypeLabel = obselTypeTranslatedLabel;
			else
				obselTypeLabel = obselType.label?obselType.label:obselType.id;
		}
		else
			obselTypeLabel = obsel.type_id;

		let hint = obsel.id + "\n" + 
					obselTypeLabel + "\n" + 
					beginDateString;

		if(obsel.end != obsel.begin) {
			let eventEndDate = new Date(obsel.end + this._originTime);
		
			let endDateString = eventEndDate.getFullYear() + "-" 
						+ (eventEndDate.getMonth() + 1).toString().padStart(2, '0') + "-" 
						+ eventEndDate.getDate().toString().padStart(2, '0') + " "
						+ eventEndDate.getHours().toString().padStart(2, '0') + ":"
						+ eventEndDate.getMinutes().toString().padStart(2, '0') + ":"
						+ eventEndDate.getSeconds().toString().padStart(2, '0') + ":"
						+ eventEndDate.getMilliseconds().toString().padStart(3, '0');

			hint += " => " + endDateString;
		}

		return hint;
	}

	/**
	 * 
	 */
	_fillObselEventContent(eventNode, obsel) {
		let eventNodeContent = document.createElement("ktbs4la2-obsel-attributes");
		eventNodeContent.setAttribute("uri", obsel.uri);
		eventNode.appendChild(eventNodeContent);
	}

	/**
	 * 
	 */
	_addObsels(obsels) {
		let eventsFragment = document.createDocumentFragment();
		
		for(let i = 0; i < obsels.length; i++) {
			let obsel = obsels[i];
			let eventElement = document.createElement("ktbs4la2-timeline-event");
			eventElement.setAttribute("begin", (obsel.begin + this._originTime));
			eventElement.setAttribute("end", (obsel.end + this._originTime));
			eventElement.setAttribute("id", obsel.id);
			eventElement.setAttribute("title", this._getObselTitleHint(obsel));
			eventElement.setAttribute("href", obsel.uri);

			if(this._currentStylesheet) {
				let matchedRule = this._currentStylesheet.getFirstRuleMatchedByObsel(obsel);

				if(matchedRule) {
					if(matchedRule["symbol"].symbol)
						eventElement.setAttribute("symbol", JSSpecialCharToHTMLHex(matchedRule["symbol"].symbol));
					else if(matchedRule["symbol"].shape)
						eventElement.setAttribute("shape", matchedRule["symbol"].shape);

					if(matchedRule["symbol"].color)
						eventElement.setAttribute("color", matchedRule["symbol"].color);

					if(matchedRule["visible"] != undefined)
						eventElement.setAttribute("visible", matchedRule["visible"]);
				}
				else
					eventElement.setAttribute("visible", false);
			}

			eventsFragment.appendChild(eventElement);
		}

		this._obsels.push(...obsels);
		this._timeline.appendChild(eventsFragment);
	}

	/**
	 * 
	 */
	_onObselListPageReadFailed(error) {
		this._obselsLoadingAbortController.abort();

		this._componentReady.then(() => {
			this._obselsLoadControlButton.setAttribute("title", this._translateString("Reload"));
			this._loadingStatusIcon.setAttribute("title", this._translateString("Error : ") + error);
			this._obselsLoadingIndications.className = "error";
			this._rejectAllObselsLoaded(error);
		});
	}

	/**
	 * 
	 */
	_onObselListPageRead(obselsListPage) {
		if(!this._obselsLoadingAbortController.signal.aborted) {
			this._componentReady.then(() => {
				if(this._expectedObselCount) {
					let currentObselCount = this._obsels.length + obselsListPage.obsels.length;
					let loadedObselsPercentage = (currentObselCount / this._expectedObselCount) * 100;
					this._progressBar.style.width = loadedObselsPercentage + "%";
					this._loadingStatusIcon.setAttribute("title", this._translateString("Loading") + " (" + Math.floor(loadedObselsPercentage) + "%)");
				}

				setTimeout(() => {
					this._addObsels(obselsListPage.obsels);
				});
			});
			
			let nextPage = obselsListPage.next_page;

			if(!nextPage) {
				this._resolveAllObselsLoaded();
			}
			else {
				setTimeout(() => {
					if(!this._obselsLoadingAbortController.signal.aborted)
						nextPage.get(this._obselsLoadingAbortController.signal)
							.then(() => {
								if(!this._obselsLoadingAbortController.signal.aborted)
									this._onObselListPageRead(nextPage);
							})
							.catch((error) => {
								if(!(error instanceof DOMException) && (error.name !== "AbortError") && !this._obselsLoadingAbortController.signal.aborted)
									this._onObselListPageReadFailed(error);
							});
				});
			}
		}
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		this._styleSheetIcon.setAttribute("title", this._translateString("Stylesheet"));
		this._styleSheetIcon.setAttribute("alt", this._translateString("Stylesheet"));
		this._styleSheetSelector.setAttribute("title", this._translateString("Stylesheet"));
		this._defaultStylesheetSelectorEntry.setAttribute("title", this._translateString("Default stylesheet generated automatically"));
		this._defaultStylesheetSelectorEntry.innerText = this._translateString("Default");
		this._waitMessage.innerText = this._translateString("Waiting for server response...");
		this._emptyMessage.innerText = this._translateString("No obsel to display");
		this._timeline.setAttribute("lang", this._lang);

		// rebuild the default stylesheet and it's legend if it is the currently applied stylesheet
		for(let i = 0; i < this._styleSheets.length; i++) {
			if(this._styleSheets[i].generated_from_model) {
				let defaultStyleSheet = this._generateDefaultStylesheetFromModel();
				this._styleSheets[i] = defaultStyleSheet;

				if(this._currentStylesheet.generated_from_model) {
					this._currentStylesheet = defaultStyleSheet;
					
					// rebuild the legend
					this._rebuildLegend(this._currentStylesheet);
				}

				break;
			}
		}

		// translate obsel events' title attribute
		for(let i = 0; i < this._obsels.length; i++) {
			let obsel = this._obsels[i];
			let eventElement = this.querySelector("ktbs4la2-timeline-event#" + CSS.escape(obsel.id));

			if(eventElement)
				eventElement.setAttribute("title", this._getObselTitleHint(obsel));
		}
	}
}

customElements.define('ktbs4la2-trace-timeline', KTBS4LA2TraceTimeline);
