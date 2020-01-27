import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

import {ResourceProxy} from "../../ktbs-api/ResourceProxy.js";
import {Trace} from "../../ktbs-api/Trace.js";
import {Model} from "../../ktbs-api/Model.js";
import {TraceStats} from "../../ktbs-api/TraceStats.js";
import {ObselList} from "../../ktbs-api/ObselList.js";

import "./ktbs4la2-trace-timeline-style-legend.js";
import "../ktbs4la2-timeline/ktbs4la2-timeline.js";

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


		this._resolveTraceLoaded;
		this._rejectTraceLoaded;

		this._traceLoaded =  new Promise((resolve, reject) => {
			this._resolveTraceLoaded = resolve;
			this._rejectTraceLoaded = reject;
		});


		this._resolveAllObselsLoaded;
		this._rejectAllObselsLoaded;

		this._context = null;
		this._styleSheets = new Array();
		this._currentStylesheet = null;
		this._traceUri = null;
		this._originTime = 0;

		this._obselsLoadingAbortController = new AbortController();
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
			if(this._obsels[i]["@id"] == obselID)
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
		this._context = null;
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
		this._container.requestFullscreen();
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push('uri');
		return observedAttributes;
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "uri") {
			this._trace = ResourceProxy.get_resource(Trace, newValue);

			this._trace.get(this._abortController.signal)
				.then(() => {
					this._resolveTraceLoaded();
				})
				.catch((error) => {
					if((error.name != "AbortError") || !this._abortController.signal.aborted)
						this._setError(error);
				});

			this._traceLoaded.then(() => {
				this._onTraceLoaded();
			});
			// ---

			// load stats, in order to get trace begin and trace end dates
			let statsUri = newValue + "@stats";
			this._stats = ResourceProxy.get_resource(TraceStats, statsUri);

			this._stats.get(this._abortController.signal)
				.then(() => {
					this._onStatsLoaded();
				})
				.catch((error) => {
					if((error.name != "AbortError") || !this._abortController.signal.aborted)
						this._setError(error);
				});
			// ---

			// load obsels, in order to populate the timeline
			this._traceUri = newValue;
			this._initObselsLoading();
			// ---
		}
	}

	/**
	 * 
	 */
	_initObselsLoading() {
		let obselsUri = this._traceUri + "@obsels";
		this._obselList = ResourceProxy.get_resource(ObselList, obselsUri);

		this._allObselsLoaded = new Promise(function(resolve, reject) {
			this._resolveAllObselsLoaded = resolve;
			this._rejectAllObselsLoaded = reject;
		}.bind(this));

		this._obselList.get_first_obsel_page(100, this._obselsLoadingAbortController.signal)
			.then((response) => {
				// we assume the "context" section will be the same for every obsel page
				if(!this._context)
					this._context = response.context;

				this._onObselListPageRead(response.obsels, response.nextPageURI);
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
			})
			.finally(() => {
				this._onObselLoadEnded();
			});
	}

	/**
	 * 
	 */
	_generateDefaultStylesheetFromObsels() {
		let defaultStyleSheet = new Object();
		defaultStyleSheet.name = this._translateString("Default");
		defaultStyleSheet.description = this._translateString("Automatically generated stylesheet (duration bar symbol, with one different color for each obsel type)");
		defaultStyleSheet.rules = new Array();
		let knownObselTypes = new Array();
	
		// build list of all distinct obsel types in the obsel list
		for(let i = 0; i < this._obsels.length; i++) {
			let anObsel = this._obsels[i];
			let obselType = anObsel["@type"];

			if(!knownObselTypes.includes(obselType))
				knownObselTypes.push(obselType);
		}

		for(let i = 0; i < knownObselTypes.length; i++) {
			let obselTypeID = knownObselTypes[i];
			let aRule = new Object();
			aRule.id = obselTypeID;
			aRule.symbol = new Object();
			aRule.symbol.color = getDistinctColor(i, knownObselTypes.length);
			aRule.symbol.shape = "duration-bar";
			aRule.rules = new Array();
			let aRuleRule = new Object();
			aRuleRule.type = obselTypeID;
			aRuleRule.attributes = new Array();
			aRule.rules.push(aRuleRule);
			defaultStyleSheet.rules.push(aRule);
		}
		
		return defaultStyleSheet;
	}

	/**
	 * This callback function is triggered when the loading of obsels stops, wether it is successfull or not
	 */
	_onObselLoadEnded() {
		this._componentReady.then(() => {
			if(this._styleSheets.length == 0) {
				let defaultStyleSheet = this._generateDefaultStylesheetFromObsels();

				if(defaultStyleSheet != null)
					this._applyStyleSheet(defaultStyleSheet);
			}
		});
	}

	/**
	 * 
	 */
	_onTraceLoaded() {
		let traceOriginString = this._trace.origin;

		if(traceOriginString != undefined) {
			let parsedOrigin = Date.parse(traceOriginString);

			if(!isNaN(parsedOrigin))
				this._originTime = parsedOrigin;
		}

		this._model = this._trace.model;

		this._model.get(this._abortController.signal).then(() => {
			this._onModelLoaded();
		});
	}

	/**
	 * 
	 */
	_onTraceLoadFailed(error) {
		this._setError(error);
	}

	/**
	 * 
	 */
	_setError(error) {
		this._componentReady.then(() => {
			this._container.className = "error";
			this._errorMessage.innerText = "Error : " + error;
		});
	}

	/**
	 * 
	 */
	_getCatchAllRule() {
		let catchAllRule = new Object();
		catchAllRule.label = this._translateString("Unknown obsel type");
		catchAllRule.id = "unknown";
		catchAllRule.rules = new Array();
		catchAllRule.symbol = new Object();
		let aRuleRule = new Object();
		aRuleRule.type = "*";
		aRuleRule.attributes = new Array();
		catchAllRule.rules.push(aRuleRule);
		return catchAllRule;
	}

	/**
	 * 
	 */
	_generateDefaultStylesheetFromModel() {
		let defaultStyleSheet = new Object();
		defaultStyleSheet.name = this._translateString("Default");
		defaultStyleSheet.description = this._translateString("Automatically generated stylesheet (one symbol and color for each obsel type)");
		defaultStyleSheet.generated_from_model = true;
		defaultStyleSheet.rules = new Array();
		let model_uri = this._model._uri;
		let obselTypes = this._model.obsel_types;

		for(let i = 0; i < obselTypes.length; i++) {
			let obselType = obselTypes[i];
			let aRule = new Object();
			aRule.id = obselType.id;
			let obselTypeLabel = obselType.get_translated_label(this._lang);

			if(obselTypeLabel)
				aRule.label = obselTypeLabel;

			aRule.symbol = new Object();

			if(obselType.suggestedColor)
				aRule.symbol.color = obselType.suggestedColor;
			else
				aRule.symbol.color = getDistinctColor(i, obselTypes.length);

			if(obselType.suggestedSymbol)
				aRule.symbol.symbol = obselType.suggestedSymbol;
			else
				aRule.symbol.shape = "duration-bar";

			aRule.rules = new Array();
			let aRuleRule = new Object();
			aRuleRule.type = model_uri + '#' + obselType.id;
			aRuleRule.attributes = new Array();
			aRule.rules.push(aRuleRule);
			defaultStyleSheet.rules.push(aRule);
		}
		
		// add a default "catch-all" rule
		defaultStyleSheet.rules.push(this._getCatchAllRule());

		return defaultStyleSheet;
	}

	/**
	 * 
	 */
	_onModelLoaded() {
		this._componentReady.then(() => {
			let defaultStylesheetGeneratedFromModel = this._generateDefaultStylesheetFromModel();
			
			if(defaultStylesheetGeneratedFromModel != null) {
				this._styleSheets.unshift(defaultStylesheetGeneratedFromModel);

				setTimeout(() => {
					this._applyStyleSheet(defaultStylesheetGeneratedFromModel);
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

			if(modelStyleSheets.length > 0)
				if(this._styleSheetSelector.hasAttribute("disabled"))
					this._styleSheetSelector.removeAttribute("disabled");
		});
	}

	/**
	 * 
	 */
	_onChangeStyleSheetSelector(event) {
		setTimeout(() => {
			let styleSheetID = parseInt(this._styleSheetSelector.value);

			if(!isNaN(styleSheetID)) {
				let newStyleSheet = this._styleSheets[styleSheetID];

				if(newStyleSheet != this._currentStylesheet)
					this._applyStyleSheet(newStyleSheet);
			}
		});
	}

	/**
	 * 
	 */
	_substituteContextString(originalString) {
		let substitutedString = originalString;

		if((this._context instanceof Array) && (this._context.length > 1)) {
			let colonPosition = originalString.indexOf(':');

			if(colonPosition != -1) {
				let beforeColonPart = originalString.substring(0, colonPosition);
				let afterColonPart = originalString.substring(colonPosition + 1);
				let potentialModels = this._context[1];

				for(let shortName in potentialModels) {
					if(shortName == beforeColonPart) {
						let fullURI = potentialModels[shortName];

						if(fullURI[fullURI.length - 1] != '#')
							fullURI = fullURI + '#';

						substitutedString = fullURI + afterColonPart;
						break;
					}
				}
			}
		}
		
		return substitutedString;
	}

	_getAbsoluteModelLink(relativeLink) {
		let urlObject = new URL(relativeLink, this.getAttribute("uri"));
		return urlObject.href;
	}

	/**
	 * 
	 * @param obsel 
	 * @param attributeConstraint 
	 * @returns bool
	 */
	_obselMatchesSubruleAttributeContraint(obsel, attributeConstraint) {
		let matches = false;
		let uri = attributeConstraint.uri;
		let value = attributeConstraint.value;
		let operator = attributeConstraint.operator;

		for(let obselAttribute in obsel) {
			if((obselAttribute == uri) || (this._substituteContextString(obselAttribute) == uri)) {
				let obselValue = obsel[obselAttribute];
				let testString = '"' + encodeURIComponent(obselValue) + '"' + operator + '"' + encodeURIComponent(value) + '"';
				matches = eval(testString);

				if(matches)
					break;
			}
		}

		return matches;
	}

	/**
	 * 
	 * @param subrule 
	 * @param obsel 
	 * @returns bool
	 */
	_obselMatchesSubruleType(subrule, obsel) {
		let rawObselType = obsel["@type"];
		
		return(
				(subrule.type == "*")
			||	(rawObselType == subrule.type) 
			|| 	(this._substituteContextString(rawObselType) == subrule.type)
			|| 	(this._getAbsoluteModelLink(rawObselType) == subrule.type)
		);
	}

	/**
	 * 
	 */
	_obselMatchesSubrule(subrule, obsel) {
		let matches = new Array();
		
		if((subrule.type) && (subrule.type != ""))
			matches.push(this._obselMatchesSubruleType(subrule, obsel));
	
		if(!matches.includes(false)) {
			if((subrule.attributes) && (subrule.attributes instanceof Array)) {
				let attributesConstraints = subrule.attributes;
				
				for(let i = 0; (!matches.includes(false)) && (i < attributesConstraints.length); i++) {
					let attributeConstraint = attributesConstraints[i];
					matches.push(this._obselMatchesSubruleAttributeContraint(obsel, attributeConstraint));
				}
			}
		}

		return !matches.includes(false);
	}

	/**
	 * 
	 */
	_obselMatchesRule(rule, obsel) {
		let matches = false;

		for(let i = 0; (!matches) && (i < rule.rules.length); i++) {
			let subrule = rule.rules[i];
			matches = this._obselMatchesSubrule(subrule, obsel);
		}

		return matches;
	}

	/**
	 * 
	 */
	_getFirstRuleMatchedByObsel(obsel) {
		let firstMatchedRule = null;

		if(this._currentStylesheet && this._currentStylesheet.rules && (this._currentStylesheet.rules instanceof Array))
			for(let i = 0; (firstMatchedRule == null) && (i < this._currentStylesheet.rules.length); i++) {
				let testedRule = this._currentStylesheet.rules[i];

				if(this._obselMatchesRule(testedRule, obsel))
					firstMatchedRule = testedRule;
			}

		return firstMatchedRule;
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
	_applyStyleSheet(stylesheet) {
		this._currentStylesheet = stylesheet;

		// rebuild the legend
		this._rebuildLegend(stylesheet);

		// --- apply rules to obsels ---
		for(let i = 0; i < this._obsels.length; i++) {
			let anObsel = this._obsels[i];
			let obselEventNode = this.querySelector("#" + CSS.escape(anObsel["@id"]));

			if(obselEventNode) {
				let matchedRule = this._getFirstRuleMatchedByObsel(anObsel);
				
				if(matchedRule) {
					if(matchedRule["symbol"].symbol) {
						obselEventNode.setAttribute("symbol", JSSpecialCharToHTMLHex(matchedRule["symbol"].symbol));

						if(obselEventNode.hasAttribute("shape"))
							obselEventNode.removeAttribute("shape");
					}
					else if(matchedRule["symbol"].shape) {
						obselEventNode.setAttribute("shape", matchedRule["symbol"].shape);

						if(obselEventNode.hasAttribute("symbol"))
							obselEventNode.removeAttribute("symbol");
					}

					if(matchedRule["symbol"].color)
						obselEventNode.setAttribute("color", matchedRule["symbol"].color);
					else if(obselEventNode.hasAttribute("color"))
						obselEventNode.removeAttribute("color");

					if(matchedRule["visible"] != undefined)
						obselEventNode.setAttribute("visible", matchedRule["visible"]);
					else if(obselEventNode.hasAttribute("visible"))
						obselEventNode.removeAttribute("visible");
				}
				else
					obselEventNode.setAttribute("visible", false);
			}
			else
				this.emitErrorEvent(new Error("Could not found event node for obsel " + anObsel["@id"]));
		}
	}

	/**
	 * 
	 */
	_onStatsLoaded() {
		this._expectedObselCount = (this._stats.obsel_count != undefined)?this._stats.obsel_count:0;

		if(this._expectedObselCount != 0) {
			this._traceLoaded.then(() => {
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
				else {
					this._setError("Cannot retrieve minTime and/or maxTime attributes froms stats");
				}
			});
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
	_getFormattedDate(timestamp) {
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

		try {
			let obselTypeURI = new URL(this._substituteContextString(obsel["@type"]));
			let obselTypeURIHash = obselTypeURI.hash;

			if((obselTypeURIHash != "") && (obselTypeURIHash.charAt(0) == '#')) {
				let obselTypeID = decodeURI(obselTypeURIHash.substring(1));
				let obselType = this._model.get_obsel_type(obselTypeID);

				if(obselType) {
					let obselTypeTranslatedLabel = obselType.get_translated_label(this._lang);

					if(obselTypeTranslatedLabel)
						obselTypeLabel = obselTypeTranslatedLabel;
					else {
						let obselTypeDefaultLabel = obselType.label;

						if(obselTypeDefaultLabel)
							obselTypeLabel = obselTypeDefaultLabel;
						else
							obselTypeLabel = obselTypeID;
					}
				}
				else
					obselTypeLabel = obselTypeID;
			}
			else
				obselTypeLabel = obsel["@type"];
		}
		catch(error) {
			// broken link to model and/or obsel type, we just keep the raw broken obsel type value
			obselTypeLabel = obsel["@type"];
		}

		let hint = obsel["@id"] + "\n" + 
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
		let eventContent = document.createDocumentFragment();
		let typeLine = document.createElement("p");
		typeLine.classList.add("obsel-native-attribute");
		let typeLabel = document.createElement("strong");
		typeLabel.innerText = this._translateString("Type") + " : ";
		typeLine.appendChild(typeLabel);

		let obselTypeLabel;

		try {
			let obselTypeURI = new URL(this._substituteContextString(obsel["@type"]));
			let obselTypeURIHash = obselTypeURI.hash;

			if((obselTypeURIHash != "") && (obselTypeURIHash.charAt(0) == '#')) {
				let obselTypeID = decodeURI(obselTypeURIHash.substring(1));
				let obselType = this._model.get_obsel_type(obselTypeID);

				if(obselType) {
					let obselTypeTranslatedLabel = obselType.get_translated_label(this._lang);

					if(obselTypeTranslatedLabel)
						obselTypeLabel = obselTypeTranslatedLabel;
					else {
						let obselTypeDefaultLabel = obselType.label;

						if(obselTypeDefaultLabel)
							obselTypeLabel = obselTypeDefaultLabel;
						else
							obselTypeLabel = obselTypeID;
					}
				}
				else
					obselTypeLabel = obselTypeID;
			}
			else
				obselTypeLabel = obsel["@type"];
		}
		catch(error) {
			// broken link to model and/or obsel type, we just keep the raw broken obsel type value
			obselTypeLabel = obsel["@type"];
		}

		let typeValue = document.createElement("span");
		typeValue.innerText = obselTypeLabel;
		typeLine.appendChild(typeValue);
		eventContent.appendChild(typeLine);

		let beginLine = document.createElement("p");
		beginLine.classList.add("obsel-native-attribute");
		let beginLabel = document.createElement("strong");
		beginLabel.innerText = this._translateString("Begin") + " : ";
		beginLine.appendChild(beginLabel);

		let beginValue = document.createElement("span");
		beginValue.innerText = this._getFormattedDate(parseInt(obsel.begin));
		beginLine.appendChild(beginValue);
		eventContent.appendChild(beginLine);

		if(obsel.end) {
			let endLine = document.createElement("p");
			endLine.classList.add("obsel-native-attribute");
			let endLabel = document.createElement("strong");
			endLabel.innerText = this._translateString("End") + " : ";
			endLine.appendChild(endLabel);

			let endValue = document.createElement("span");
			endValue.innerText = this._getFormattedDate(parseInt(obsel.end));
			endLine.appendChild(endValue);
			eventContent.appendChild(endLine);
		}

		if(obsel.subject) {
			let subjectLine = document.createElement("p");
			subjectLine.classList.add("obsel-native-attribute");
			let subjectLabel = document.createElement("strong");
			subjectLabel.innerText = this._translateString("Subject") + " : ";
			subjectLine.appendChild(subjectLabel);

			let subjectValue = document.createElement("span");
			subjectValue.innerText = obsel.subject;
			subjectLine.appendChild(subjectValue);
			eventContent.appendChild(subjectLine);
		}

		// display other attributes (custom attributes)
		let otherAttributesList = document.createElement("ul");
		otherAttributesList.classList.add("obsel-other-attributes");

		for(let property_key in obsel) {
			if(!KTBS4LA2TraceTimeline.obselsSysAttributes.includes(property_key)) {
				let attributeTypeLabel;

				try {
					let contextSubstitutedAttributeTypeID = this._substituteContextString(property_key);
					let attributeTypeURI = new URL(contextSubstitutedAttributeTypeID, this._trace.uri);
					let attributeTypeURIHash = attributeTypeURI.hash;

					if((attributeTypeURIHash != "") && (attributeTypeURIHash.charAt(0) == '#')) {
						let attributeTypeID = attributeTypeURIHash.substring(1);
						let attributeType = this._model.get_attribute_type(attributeTypeID);

						if(attributeType) {
							let attributeTypeTranslatedLabel = attributeType.get_translated_label(this._lang);

							if(attributeTypeTranslatedLabel)
								attributeTypeLabel = attributeTypeTranslatedLabel;
							else {
								let attributeTypeDefaultLabel = attributeType.label;

								if(attributeTypeDefaultLabel)
									attributeTypeLabel = attributeTypeDefaultLabel;
								else
									attributeTypeLabel = attributeTypeID;
							}
						}
						else
							attributeTypeLabel = attributeTypeID;
					}
					else
						attributeTypeLabel = contextSubstitutedAttributeTypeID;
				}
				catch(error) {
					// broken link to model and/or obsel type, we just keep the raw broken obsel type value
					attributeTypeLabel = property_key;
				}

				let attribute_value = obsel[property_key];
				let listItem = document.createElement("li");
				listItem.innerText = attributeTypeLabel + " : " + attribute_value;
				otherAttributesList.appendChild(listItem);
			}
		}

		eventContent.appendChild(otherAttributesList);
		// ---

		eventNode.appendChild(eventContent);
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
			eventElement.setAttribute("id", obsel["@id"]);
			eventElement.setAttribute("title", this._getObselTitleHint(obsel));
			eventElement.setAttribute("href", this.getAttribute("uri") + obsel["@id"]);

			if(this._currentStylesheet) {
				let matchedRule = this._getFirstRuleMatchedByObsel(obsel);

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
	_onObselListPageRead(obsels, nextPageURI) {
		if(!this._obselsLoadingAbortController.signal.aborted) {
			this._componentReady.then(() => {
				if(this._expectedObselCount) {
					let currentObselCount = this._obsels.length + obsels.length;
					let loadedObselsPercentage = (currentObselCount / this._expectedObselCount) * 100;
					this._progressBar.style.width = loadedObselsPercentage + "%";
					this._loadingStatusIcon.setAttribute("title", this._translateString("Loading") + " (" + Math.floor(loadedObselsPercentage) + "%)");
				}

				setTimeout(() => {
					this._addObsels(obsels);
				});
			});
			
			if(nextPageURI == null) {
				this._resolveAllObselsLoaded();
			}
			else {
				setTimeout(() => {
					this._obselList.get_obsel_page(nextPageURI, this._obselsLoadingAbortController.signal)
						.then((response) => {
							this._onObselListPageRead(response.obsels, response.nextPageURI);
						})
						.catch((error) => {
							if((error.name != "AbortError") || !this._obselsLoadingAbortController.signal.aborted)
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
			let eventElement = this.querySelector("ktbs4la2-timeline-event#" + CSS.escape(obsel["@id"]));

			if(eventElement)
				eventElement.setAttribute("title", this._getObselTitleHint(obsel));
		}

		// initialises obsels events nodes content
		let eventNodes = this.querySelectorAll("ktbs4la2-timeline-event");

		for(let i = 0; i < eventNodes.length; i++) {
			let eventNode = eventNodes[i];
			eventNode.innerHTML = "";

			// if an event node is selected, fill it with translated content
			if(eventNode.classList.contains("selected")) {
				let obselID = eventNode.getAttribute("id");
				let obsel = null;

				for(let i = 0; i < this._obsels.length; i++) {
					if(this._obsels[i]["@id"] == obselID) {
						obsel = this._obsels[i];
						break;
					}
				}

				if(obsel)
					this._fillObselEventContent(eventNode, obsel);
			}
		}
	}
}

KTBS4LA2TraceTimeline.obselsSysAttributes = ["@id", "@type", "begin", "beginDT", "end", "endDT", "hasSourceObsel", "subject"];

customElements.define('ktbs4la2-trace-timeline', KTBS4LA2TraceTimeline);
