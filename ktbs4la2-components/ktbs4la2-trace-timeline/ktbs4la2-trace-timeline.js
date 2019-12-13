import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";
import {KtbsResourceElement} from "../common/KtbsResourceElement.js";

import {Trace} from "../../ktbs-api/Trace.js";
import {Model} from "../../ktbs-api/Model.js";
import {TraceStats} from "../../ktbs-api/TraceStats.js";
import {ObselList} from "../../ktbs-api/ObselList.js";

import "./ktbs4la2-trace-timeline-style-legend.js";
import "../ktbs4la2-timeline/ktbs4la2-timeline.js";

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

		this._resolveAllObselsLoaded;
		this._rejectAllObselsLoaded;

		/*this._allObselsLoaded = new Promise(function(resolve, reject) {
			this._resolveAllObselsLoaded = resolve;
			this._rejectAllObselsLoaded = reject;
		}.bind(this));*/

		this._context = null;
		this._styleSheets = new Array();
		this._currentStylesheet = null;
		this._traceUri = null;

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
		this._timeline = document.createElement("ktbs4la2-timeline");
		this._timeline.setAttribute("lang", this._lang);
		this._timeline.setAttribute("slot", "timeline");
		this._timeline.addEventListener("request-fullscreen", this._onTimelineRequestFullscreen.bind(this), true);
		this._obselsLoadingIndications = this.shadowRoot.querySelector("#obsels-loading-indications");
		this._obselsLoadControlButton = this.shadowRoot.querySelector("#obsels-load-control-button");
		this._obselsLoadControlButton.addEventListener("click", this._onClickObselsLoadControlButton.bind(this));
		this._loadingStatusIcon = this.shadowRoot.querySelector("#loading-status-icon");
		this._progressBar = this.shadowRoot.querySelector("#progress-bar");
		this.appendChild(this._timeline);
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
			this._trace = new Trace(newValue);

			this._trace._read_data(this._abortController.signal)
				.then(() => {
					this._onTraceLoaded();
				})
				.catch((error) => {
					if((error.name != "AbortError") || !this._abortController.signal.aborted)
						this._setError(error);
				});
			// ---

			// load stats, in order to get trace begin and trace end dates
			let statsUri = newValue + "@stats";
			this._stats = new TraceStats(statsUri);

			this._stats._read_data(this._abortController.signal)
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
		this._obselList = new ObselList(obselsUri);

		this._allObselsLoaded = new Promise(function(resolve, reject) {
			this._resolveAllObselsLoaded = resolve;
			this._rejectAllObselsLoaded = reject;
		}.bind(this));

		this._obselList._read_first_obsel_page(100, this._obselsLoadingAbortController.signal)
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
				this._progressBar.style.width = "100%";
				this._obselsLoadControlButton.setAttribute("title", this._translateString("Reload"));
				this._loadingStatusIcon.setAttribute("title", this._translateString("Loading complete"));
				this._obselsLoadingIndications.className = "loaded";
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
			aRule.symbol.color = this._getDistinctColor(i, knownObselTypes.length);
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
		let model_uri = this._trace.get_model_uri();
		this._model = new Model(model_uri);

		this._model._read_data(this._abortController.signal).then(() => {
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
		this._container.className = "error";
		this._errorMessage.innerText = "Error : " + error;
	}

	/**
	 * 
	 * @param {*} h 
	 * @param {*} s 
	 * @param {*} v 
	 */
	_hsvToRgb(h, s, v) {
		let r, g, b;
		let i;
		let f, p, q, t;
	 
		// Make sure our arguments stay in-range
		h = Math.max(0, Math.min(360, h));
		s = Math.max(0, Math.min(100, s));
		v = Math.max(0, Math.min(100, v));
	 
		// We accept saturation and value arguments from 0 to 100 because that's
		// how Photoshop represents those values. Internally, however, the
		// saturation and value are calculated from a range of 0 to 1. We make
		// That conversion here.
		s /= 100;
		v /= 100;
	 
		if(s == 0) {
			// Achromatic (grey)
			r = g = b = v;
			return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
		}
	 
		h /= 60; // sector 0 to 5
		i = Math.floor(h);
		f = h - i; // factorial part of h
		p = v * (1 - s);
		q = v * (1 - s * f);
		t = v * (1 - s * (1 - f));
	 
		switch(i) {
			case 0:
				r = v;
				g = t;
				b = p;
				break;
	 
			case 1:
				r = q;
				g = v;
				b = p;
				break;
	 
			case 2:
				r = p;
				g = v;
				b = t;
				break;
	 
			case 3:
				r = p;
				g = q;
				b = v;
				break;
	 
			case 4:
				r = t;
				g = p;
				b = v;
				break;
	 
			default: // case 5:
				r = v;
				g = p;
				b = q;
		}
	 
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	/**
	 * 
	 */
	_rgb2hex(r,g,b) {
		let rgb = [r.toString(16), g.toString(16), b.toString(16)];

		for (let i = 0; i < 3; i++) {
		  if (rgb[i].length==1) rgb[i]=rgb[i]+rgb[i];
		}
		if(rgb[0][0]==rgb[0][1] && rgb[1][0]==rgb[1][1] && rgb[2][0]==rgb[2][1])
		  return '#'+rgb[0][0]+rgb[1][0]+rgb[2][0];
		return '#'+rgb[0]+rgb[1]+rgb[2];
	  }

	/**
	 * 
	 * @param {*} colorRank 
	 * @param {*} totalColorCount 
	 */
	_getDistinctColor(colorRank, totalColorCount) {
		let rgbColor;

		if(totalColorCount > 1) {
			let hueCoef = 360 / (totalColorCount - 1); // distribute the colors evenly on the hue range
			rgbColor = this._hsvToRgb(hueCoef * colorRank, 80 , 80);
		}
		else
			rgbColor = this._hsvToRgb(0, 80 , 80);

		let colorCode = this._rgb2hex(rgbColor[0], rgbColor[1], rgbColor[2]);
		return colorCode;
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
		defaultStyleSheet.rules = new Array();
		let model_uri = this._model._uri;
		let obselTypes = this._model.list_obsel_types();

		for(let i = 0; i < obselTypes.length; i++) {
			let rawObselTypeID = obselTypes[i]["@id"];
			let cleanObselTypeID;
			let colonPosition = rawObselTypeID.indexOf('#');

			if(colonPosition != -1)
				cleanObselTypeID = rawObselTypeID.substring(colonPosition + 1);
			else
				cleanObselTypeID = rawObselTypeID;

			let aRule = new Object();
			aRule.id = cleanObselTypeID;
			aRule.symbol = new Object();

			if(obselTypes[i].suggestedColor)
				aRule.symbol.color = obselTypes[i].suggestedColor;
			else
				aRule.symbol.color = this._getDistinctColor(i, obselTypes.length);

			if(obselTypes[i].suggestedSymbol)
				aRule.symbol.symbol = obselTypes[i].suggestedSymbol;
			else
				aRule.symbol.shape = "duration-bar";

			aRule.rules = new Array();
			let aRuleRule = new Object();
			aRuleRule.type = model_uri + '#' + cleanObselTypeID;
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
				this._styleSheets.push(defaultStylesheetGeneratedFromModel);

				setTimeout(() => {
					this._applyStyleSheet(defaultStylesheetGeneratedFromModel);
				});
			}

			let modelStyleSheets = this._model.get_stylesheets();

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
	_getHashPartFromURI(uri) {
		let hash_char_position = uri.indexOf('#');

		if(hash_char_position != -1)
			return uri.substring(hash_char_position + 1);
		else
			return uri;
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
			else {
				let potentialModels = this._context[1];

				for(let shortName in potentialModels) {
					let fullURI = potentialModels[shortName];
					substitutedString = fullURI + originalString;
					break;
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
	 */
	_applyStyleSheet(stylesheet) {
		this._currentStylesheet = stylesheet;

		// rebuild the legend
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
				console.error("Could not found event node for obsel " + anObsel["@id"]);
		}
	}

	/**
	 * 
	 */
	_onStatsLoaded() {
		this._componentReady.then(function() {
			let minTime = this._stats.get_min_time();
			let maxTime = this._stats.get_max_time();

			if((minTime != null) && (minTime != undefined) && (maxTime != null) && (maxTime != undefined)) {
				this._timeline.setAttribute("begin", minTime);
				this._timeline.setAttribute("end", maxTime);

				if(this._container.classList.contains("waiting"))
					this._container.classList.remove("waiting");
			}
			else {
				this._setError("Cannot retrieve minTime and/or maxTime attributes froms stats");
			}

			this._expectedObselCount = this._stats.get_obsel_count();
		}.bind(this));
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
		let eventBeginDate = new Date(obsel.begin);

		let beginDateString = eventBeginDate.getFullYear() + "-" 
						+ (eventBeginDate.getMonth() + 1).toString().padStart(2, '0') + "-" 
						+ eventBeginDate.getDate().toString().padStart(2, '0') + " "
						+ eventBeginDate.getHours().toString().padStart(2, '0') + ":"
						+ eventBeginDate.getMinutes().toString().padStart(2, '0') + ":"
						+ eventBeginDate.getSeconds().toString().padStart(2, '0') + ":"
						+ eventBeginDate.getMilliseconds().toString().padStart(3, '0');

		let hint = obsel["@id"] + "\n" + 
					obsel["@type"] + "\n" + 
					beginDateString;

		if(obsel.end != obsel.begin) {
			let eventEndDate = new Date(obsel.end);
		
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
	_addObsels(obsels) {
		let sysAttributes = ["@id", "@type", "begin", "beginDT", "end", "hasSourceObsel"];
		let eventsFragment = document.createDocumentFragment();
		
		for(let i = 0; i < obsels.length; i++) {
			let obsel = obsels[i];
			let eventElement = document.createElement("ktbs4la2-timeline-event");
			eventElement.setAttribute("begin", obsel.begin);
			eventElement.setAttribute("end", obsel.end);
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

			let eventContent = document.createDocumentFragment();

			let idTitle = document.createElement("h3");
			let eventLink = document.createElement("a");
			eventLink.setAttribute("href", this.getAttribute("uri") + obsel["@id"]);
			eventLink.setAttribute("target", "_blank");
			eventLink.innerText = obsel["@id"];
			idTitle.appendChild(eventLink);
			eventContent.appendChild(idTitle);

			let typeLine = document.createElement("p");
			let typeLabel = document.createElement("strong");
			typeLabel.innerText = this._translateString("Type") + " : ";
			typeLine.appendChild(typeLabel);

			let typeValue = document.createElement("span");
			typeValue.innerText = obsel["@type"];
			typeLine.appendChild(typeValue);
			eventContent.appendChild(typeLine);

			let beginLine = document.createElement("p");
			let beginLabel = document.createElement("strong");
			beginLabel.innerText = this._translateString("Begin") + " : ";
			beginLine.appendChild(beginLabel);

			let beginValue = document.createElement("span");
			beginValue.innerText = this._getFormattedDate(parseInt(obsel.begin));
			beginLine.appendChild(beginValue);
			eventContent.appendChild(beginLine);

			let endLine = document.createElement("p");
			let endLabel = document.createElement("strong");
			endLabel.innerText = this._translateString("End") + " : ";
			endLine.appendChild(endLabel);

			let endValue = document.createElement("span");
			endValue.innerText = this._getFormattedDate(parseInt(obsel.end));
			endLine.appendChild(endValue);
			eventContent.appendChild(endLine);

			// display other attributes (custom attributes)
			let otherAttributesList = document.createElement("ul");

			for(let property_key in obsel) {
				if(!sysAttributes.includes(property_key)) {
					let attribute_value = obsel[property_key];
					let listItem = document.createElement("li");
					listItem.innerText = property_key + " : " + attribute_value;
					otherAttributesList.appendChild(listItem);
				}
			}

			eventContent.appendChild(otherAttributesList);
			// ---

			eventElement.appendChild(eventContent);
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
					this._obselList._read_obsel_page(nextPageURI, this._obselsLoadingAbortController.signal)
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
		this._timeline.setAttribute("lang", this._lang);

		let unknownObselTypeLegend = this._legend.querySelector("ktbs4la2-trace-timeline-style-legend[rule-id=\"unknown\"]");

		if(unknownObselTypeLegend)
			unknownObselTypeLegend.setAttribute("label", this._translateString("Unknown obsel type"));
	}
}

customElements.define('ktbs4la2-trace-timeline', KTBS4LA2TraceTimeline);
