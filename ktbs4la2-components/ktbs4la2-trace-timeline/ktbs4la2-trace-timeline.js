import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";
import {KtbsResourceElement} from "../common/KtbsResourceElement.js";

import {Trace} from "../../ktbs-api/Trace.js";
import {Model} from "../../ktbs-api/Model.js";
import {TraceStats} from "../../ktbs-api/TraceStats.js";
import {ObselList} from "../../ktbs-api/ObselList.js";

import "../ktbs4la2-timeline/ktbs4la2-timeline.js";

/**
 * 
 */
class KTBS4LA2TraceTimeline extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, false);

		this._trace = null;

		this._resolveTraceLoaded;
		this._rejectTraceLoaded;

		this._traceLoaded = new Promise(function(resolve, reject) {
			this._resolveTraceLoaded = resolve;
			this._rejectTraceLoaded = reject;
		}.bind(this));

		this._traceLoaded.then(this._onTraceLoaded.bind(this));

		this._model = null;

		this._resolveModelLoaded;
		this._rejectModelLoaded;

		this._modelLoaded = new Promise(function(resolve, reject) {
			this._resolveModelLoaded = resolve;
			this._rejectModelLoaded = reject;
		}.bind(this));

		this._modelLoaded.then(this._onModelLoaded.bind(this));

		this._stats = null;

		this._resolveStatsLoaded;
		this._rejectStatsLoaded;

		this._statsLoaded = new Promise(function(resolve, reject) {
			this._resolveStatsLoaded = resolve;
			this._rejectStatsLoaded = reject;
		}.bind(this));

		this._statsLoaded.then(this._onStatsLoaded.bind(this));
		this._obselList = null;

		this._obsels = new Array();

		this._resolveAllObselsLoaded;
		this._rejectAllObselsLoaded;

		this._allObselsLoaded = new Promise(function(resolve, reject) {
			this._resolveAllObselsLoaded = resolve;
			this._rejectAllObselsLoaded = reject;
		}.bind(this));

		this._context = null;
		this._currentStylesheet = null;
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._timeline = this.shadowRoot.querySelector("#timeline");
		this._timeline.setAttribute("lang", this._lang);
		this._styleSheetSelector = this.shadowRoot.querySelector("#slylesheet-selector");
		this._styleSheetSelector.addEventListener("change", this._onChangeStyleSheetSelector.bind(this));
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
			// load the trace, in order to get the model URI, in order to get stylesheets from it
			if(!KtbsResourceElement.resourceInstances[newValue])
				KtbsResourceElement.resourceInstances[newValue] = new Trace(newValue);

			this._trace = KtbsResourceElement.resourceInstances[newValue];

			this._trace._read_data()
				.then(function() {
					this._resolveTraceLoaded();
				}.bind(this))
				.catch(function(error) {
					this._rejectTraceLoaded(error);
				}.bind(this));
			// ---

			// load stats, in order to get trace begin and trace end dates
			let statsUri = newValue + "@stats";

			if(!KtbsResourceElement.resourceInstances[statsUri])
				KtbsResourceElement.resourceInstances[statsUri] = new TraceStats(statsUri);

			this._stats = KtbsResourceElement.resourceInstances[statsUri];

			this._stats._read_data()
				.then(function() {
					this._resolveStatsLoaded();
				}.bind(this))
				.catch(function(error) {
					this._rejectStatsLoaded(error);
				}.bind(this));
			// ---

			// load obsels, in order to populate the timeline
			let obselsUri = newValue + "@obsels";

			if(!KtbsResourceElement.resourceInstances[obselsUri])
				KtbsResourceElement.resourceInstances[obselsUri] = new ObselList(obselsUri);

			this._obselList = KtbsResourceElement.resourceInstances[obselsUri];

			this._obselList._read_first_obsel_page(100)
				.then((response) => {
					// we assume the "context" section will be the same for every obsel page
					if(!this._context)
						this._context = response.context;

					this._onObselListPageRead(response.obsels, response.nextPageURI);
				})
				.catch((error) => {
					this._onObselListPageReadFailed(error);
				});

			this._allObselsLoaded.finally(() => {
				this._onObselLoadEnded();
			});
			// ---
		}
	}

	/**
	 * 
	 */
	_generateDefaultStylesheetFromObsels() {
		let defaultStyleSheet = new Object();
		defaultStyleSheet.name = this._translateString("Default");
		defaultStyleSheet.description = this._translateString("Automatically generated stylesheet (one symbol and color for each obsel type)");
		defaultStyleSheet.rules = new Array();
		let knownObselTypes = new Array();
		
		for(let i = 0; i < this._obsels.length; i++) {
			let anObsel = this._obsels[i];
			let rawObselType = anObsel["@type"];
			let cleanObselType;
			let colonPosition = rawObselType.indexOf(':');

			if(colonPosition != -1)
				cleanObselType = rawObselType.substring(colonPosition + 1);
			else
				cleanObselType = rawObselType;

			if(!knownObselTypes.includes(cleanObselType))
				knownObselTypes.push(cleanObselType);
		}

		// --- @TODO utiliser plutôt "context"
		let rawModelUri, cleanModelUri;

		if((this._context instanceof Array) && (this._context.length > 1)) {
			let contectModelUriElement = this._context[1];

			for(let key in contectModelUriElement) {
				rawModelUri = contectModelUriElement[key];
				break;
			}
		}
		else 
			rawModelUri = this._trace.get_model_uri();
		
		let hash_char_position = rawModelUri.indexOf('#');

		if(hash_char_position != -1)
			cleanModelUri = rawModelUri.substring(0, hash_char_position);
		else
			cleanModelUri = rawModelUri;
		// ---

		for(let i = 0; i < knownObselTypes.length; i++) {
			let obselTypeID = knownObselTypes[i];
			let aRule = new Object();
			aRule.id = obselTypeID;
			aRule.symbol = new Object();
			aRule.symbol.color = this._getDistinctColor(i, knownObselTypes.length);
			aRule.symbol.shape = "duration-bar";
			aRule.rules = new Array();
			let aRuleRule = new Object();
			aRuleRule.type = cleanModelUri + '#' + obselTypeID;
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
		// @TODO stop/hide spinner here, when it is implemented

		if(!this._currentStylesheet) {
			let defaultStyleSheet = this._generateDefaultStylesheetFromObsels();
			let styleSheetSelectorEntry = document.createElement("option");
			styleSheetSelectorEntry.setAttribute("value", 0);
			styleSheetSelectorEntry.setAttribute("selected", true);
			styleSheetSelectorEntry.innerText = defaultStyleSheet.name;
			styleSheetSelectorEntry.setAttribute("title", defaultStyleSheet.description);
			this._styleSheetSelector.appendChild(styleSheetSelectorEntry);
			this._applyStyleSheet(defaultStyleSheet);
		}
	}

	/**
	 * 
	 */
	_onTraceLoaded() {
		let model_uri = this._trace.get_model_uri();

		if(!KtbsResourceElement.resourceInstances[model_uri])
			KtbsResourceElement.resourceInstances[model_uri] = new Model(model_uri);

		this._model = KtbsResourceElement.resourceInstances[model_uri];

		this._model._read_data()
			.then(function() {
				this._resolveModelLoaded();
			}.bind(this))
			.catch(function(error) {
				this._rejectModelLoaded(error);
			}.bind(this));
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

	_rgb2hex(r,g,b) {
		let rgb = [r.toString(16), g.toString(16), b.toString(16)];

		for (let i = 0; i < 3; i++) {
		  if (rgb[i].length==1) rgb[i]=rgb[i]+rgb[i];
		}
		if(rgb[0][0]==rgb[0][1] && rgb[1][0]==rgb[1][1] && rgb[2][0]==rgb[2][1])
		  return '#'+rgb[0][0]+rgb[1][0]+rgb[2][0];
		return '#'+rgb[0]+rgb[1]+rgb[2];
	  }


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
	_generateDefaultStylesheetFromModel() {
		let defaultStyleSheet = null;
		let obselTypes = this._model.list_obsel_types();

		if(obselTypes.length > 0) {
			defaultStyleSheet = new Object();
			defaultStyleSheet.name = this._translateString("Default");
			defaultStyleSheet.description = this._translateString("Automatically generated stylesheet (one symbol and color for each obsel type)");
			defaultStyleSheet.rules = new Array();
			let model_uri = this._model.get_id();

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
				aRule.symbol.color = this._getDistinctColor(i, obselTypes.length);
				aRule.symbol.shape = "duration-bar";
				aRule.rules = new Array();
				let aRuleRule = new Object();
				aRuleRule.type = model_uri + '#' + cleanObselTypeID;
				aRuleRule.attributes = new Array();
				aRule.rules.push(aRuleRule);
				defaultStyleSheet.rules.push(aRule);
			}
		}
		
		return defaultStyleSheet;
	}

	/**
	 * 
	 */
	_onModelLoaded() {
		this._styleSheets = this._model.get_stylesheets();

		let defaultStylesheetGeneratedFromModel = this._generateDefaultStylesheetFromModel();

		if(defaultStylesheetGeneratedFromModel != null)
			this._styleSheets.push(defaultStylesheetGeneratedFromModel);

		this._componentReady.then(() => {
			for(let i = 0; i < this._styleSheets.length; i++) {
				let aStyleSheet = this._styleSheets[i];
				let styleSheetSelectorEntry = document.createElement("option");
				styleSheetSelectorEntry.setAttribute("value", i);

				if(i == 0)
					styleSheetSelectorEntry.setAttribute("selected", true);

				styleSheetSelectorEntry.innerText = aStyleSheet.name;
				styleSheetSelectorEntry.setAttribute("title", aStyleSheet.description);
				this._styleSheetSelector.appendChild(styleSheetSelectorEntry);
			}

			if(this._styleSheets.length > 0)
				this._applyStyleSheet(this._styleSheets[0]);
		});
	}

	/**
	 * 
	 */
	_onChangeStyleSheetSelector(event) {
		let styleSheetID = this._styleSheetSelector.value;
		let newStyleSheet = this._styleSheets[parseInt(styleSheetID)];
		this._applyStyleSheet(newStyleSheet);
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
	 */
	_styleSheetRuleConditionMatchesObsel(styleSheetRuleCondition, obsel) {
		let matches = new Array();
		
		if((styleSheetRuleCondition.type) && (styleSheetRuleCondition.type != "")) {
			let rawObselType = obsel["@type"];
			matches.push((rawObselType == styleSheetRuleCondition.type) || (this._substituteContextString(rawObselType) == styleSheetRuleCondition.type) || (this._getAbsoluteModelLink(rawObselType) == styleSheetRuleCondition.type));
		}
	
		if((styleSheetRuleCondition.attributes) && (styleSheetRuleCondition.attributes instanceof Array)) {
			let attributesConditions = styleSheetRuleCondition.attributes;
			
			for(let i = 0; (!matches.includes(false)) && (i < attributesConditions.length); i++) {
				let attributeConditionMatched = false;
				let aCondition = attributesConditions[i];
				let uri = aCondition.uri;
				let value = aCondition.value;
				let operator = aCondition.operator;

				for(let obselAttribute in obsel) {
					if((obselAttribute == uri) || (this._substituteContextString(obselAttribute) == uri)) {
						let obselValue = obsel[obselAttribute];
						let testString = '"' + encodeURIComponent(obselValue) + '"' + operator + '"' + encodeURIComponent(value) + '"';
						attributeConditionMatched = eval(testString);

						if(attributeConditionMatched)
							break;
					}
				}

				matches.push(attributeConditionMatched);
			}
		}

		return !matches.includes(false);
	}

	/**
	 * 
	 */
	_styleSheetRuleMatchesObsel(styleSheetRule, obsel) {
		let matches = false;

		for(let i = 0; (!matches) && (i < styleSheetRule.rules.length); i++) {
			let styleSheetRuleCondition = styleSheetRule.rules[i];
			matches = this._styleSheetRuleConditionMatchesObsel(styleSheetRuleCondition, obsel);
		}

		return matches;
	}

	/**
	 * 
	 */
	_getStylesheetRuleMatchingObsel(obsel) {
		let matchingRule = null;

		if(this._currentStylesheet != null)
			for(let i = 0; (!matchingRule) && (i < this._currentStylesheet.rules.length); i++)
				if(this._styleSheetRuleMatchesObsel(this._currentStylesheet.rules[i], obsel))
					matchingRule = this._currentStylesheet.rules[i];

		return matchingRule;
	}

	/**
	 * 
	 */
	_applyStyleSheet(stylesheet) {
		this._currentStylesheet = stylesheet;
		let styleSheetRules = stylesheet.rules;

		for(let i = 0; i < this._obsels.length; i++) {
			let anObsel = this._obsels[i];
			let obselEventNode = this.shadowRoot.getElementById(anObsel["@id"]);

			if(obselEventNode) {
				let matchingRule = this._getStylesheetRuleMatchingObsel(anObsel);
				
				if(matchingRule) {
					obselEventNode.setAttribute("shape", matchingRule["symbol"].shape);
					obselEventNode.setAttribute("color", matchingRule["symbol"].color);
					obselEventNode.setAttribute("visible", matchingRule["visible"]);
				}
				else {
					obselEventNode.removeAttribute("shape");
					obselEventNode.removeAttribute("color");
					obselEventNode.setAttribute("visible", false);
				}
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
			this._timeline.setAttribute("begin", this._stats.get_min_time());
			this._timeline.setAttribute("end", this._stats.get_max_time());
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
		this._obsels.push(...obsels);

		let sysAttributes = ["@id", "@type", "begin", "beginDT", "end", "hasSourceObsel"];
			let eventsFragments = document.createDocumentFragment();

			for(let i = 0; i < obsels.length; i++) {
				let obsel = obsels[i];
				let event = document.createElement("ktbs4la2-timeline-event");
				event.setAttribute("begin", obsel.begin);
				event.setAttribute("end", obsel.end);
				event.setAttribute("id", obsel["@id"]);
				event.setAttribute("title", this._getObselTitleHint(obsel));
				event.setAttribute("href", this.getAttribute("uri") + obsel["@id"]);

				if(this._currentStylesheet) {
					let matchingRule = this._getStylesheetRuleMatchingObsel(obsel);

					if(matchingRule) {
						event.setAttribute("shape", matchingRule["symbol"].shape);
						event.setAttribute("color", matchingRule["symbol"].color);
						event.setAttribute("visible", matchingRule["visible"]);
					}
					else
						event.setAttribute("visible", false);
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

				event.appendChild(eventContent);

				eventsFragments.append(event);
			}

			this._timeline.appendChild(eventsFragments);
	}

	/**
	 * 
	 */
	_onObselListPageReadFailed(error) {
		this._rejectAllObselsLoaded(error);
	}

	/**
	 * 
	 */
	_onObselListPageRead(obsels, nextPageURI) {
		this._componentReady.then(() => {
			this._addObsels(obsels);
		});
		
		if(nextPageURI == null) {
			this._resolveAllObselsLoaded();
		}
		else {
			this._obselList._read_obsel_page(nextPageURI)
				.then((response) => {
					this._onObselListPageRead(response.obsels, response.nextPageURI);
				})
				.catch((error) => {
					this._onObselListPageReadFailed(error);
				});
			}
	}
}

customElements.define('ktbs4la2-trace-timeline', KTBS4LA2TraceTimeline);
