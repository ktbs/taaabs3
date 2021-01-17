import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

import {ResourceMultiton} from "../../ktbs-api/ResourceMultiton.js";
import {Trace} from "../../ktbs-api/Trace.js";
import {Model} from "../../ktbs-api/Model.js";
import {Stylesheet} from "../../ktbs-api/Stylesheet.js";
import {HubbleRule} from "../../ktbs-api/HubbleRule.js";
import {HubbleSubRule} from "../../ktbs-api/HubbleSubRule.js";

import "./ktbs4la2-trace-timeline-style-legend.js";
import "../ktbs4la2-timeline/ktbs4la2-timeline.js";
import "../ktbs4la2-obsel-attributes/ktbs4la2-obsel-attributes.js";
import "../ktbs4la2-hrules-rule-input/ktbs4la2-hrules-rule-input.js";

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
		this._currentStylesheet_rank = null;
		this._originTime = 0;
		this._obselsLoadingAbortController = new AbortController();
		this._allowFullScreen = true;
		this._allowChangeStylesheet = true;
		this._bindedOnBeforeUnloadWindowMethod = this._onBeforeUnloadWindow.bind(this);
        this._bindedOnBeforeRemoveMethod = this._onBeforeRemove.bind(this);
	}

	/**
	 * 
	 */
	get allow_edit_stylesheets() {
		return !(this.hasAttribute("allow-edit-stylesheet") && ((this.getAttribute("allow-edit-stylesheet") == "false") || (this.getAttribute("allow-edit-stylesheet") == "0")));
	}

	/**
	 * 
	 */
	set allow_edit_stylesheets(newValue) {
		if((newValue != null) && (newValue != undefined))
			this.setAttribute("allow-edit-stylesheet", newValue);
		else
			if(this.hasAttribute("allow-edit-stylesheet"))
				this.removeAttribute("allow-edit-stylesheet");
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
		this._addStyleButton = this.shadowRoot.querySelector("#add-style-button");
		this._addStyleButton.addEventListener("click", this._onClickAddStyleButton.bind(this));
		this._stylesheetTools = this.shadowRoot.querySelector("#stylesheet-tools");
		this._currentStylesheetTools = this.shadowRoot.querySelector("#current-stylesheet-tools");
		this._editStylesheetButton = this.shadowRoot.querySelector("#edit-stylesheet-button");
		this._editStylesheetButton.addEventListener("click", this._onClickEditStylesheetButton.bind(this));
		this._saveStylesheetButton = this.shadowRoot.querySelector("#save-stylesheet-button");
		this._saveStylesheetButton.addEventListener("click", this._onClickSaveStylesheetButton.bind(this));
		this._cancelStylesheetModificationsButton = this.shadowRoot.querySelector("#cancel-stylesheet-modifications-button");
		this._cancelStylesheetModificationsButton.addEventListener("click", this._onClickCancelStylesheetModificationsButton.bind(this));
		this._duplicateStylesheetButton = this.shadowRoot.querySelector("#duplicate-stylesheet-button");
		this._duplicateStylesheetButton.addEventListener("click", this._onClickDuplicateStylesheetButton.bind(this));
		this._createComputedTraceFromStylesheetButton = this.shadowRoot.querySelector("#create-computed-trace-from-stylesheet-button");
		this._createComputedTraceFromStylesheetButton.addEventListener("click", this._onClickCreateComputedTraceFromStylesheetButton.bind(this));
		this._deleteStylesheetButton = this.shadowRoot.querySelector("#delete-stylesheet-button");
		this._deleteStylesheetButton.addEventListener("click", this._onClickDeleteStylesheetButton.bind(this));
		this._waitMessage = this.shadowRoot.querySelector("#wait-message");
		this._errorMessage = this.shadowRoot.querySelector("#error-message");
		this._emptyMessage = this.shadowRoot.querySelector("#empty-message");
		this._timeline = document.createElement("ktbs4la2-timeline");
		this._timeline.setAttribute("lang", this._lang);
		this._timeline.setAttribute("slot", "timeline");
		this._timeline.style.height = "100%";
		this._timeline.setAttribute("allow-fullscreen", this.hasAttribute("allow-fullscreen")?this.getAttribute("allow-fullscreen"):"true");
		this._timeline.addEventListener("request-fullscreen", this._onTimelineRequestFullscreen.bind(this), true);
		this._timeline.addEventListener("click", this._onClickTimeline.bind(this), true);
		this._obselsLoadingIndications = this.shadowRoot.querySelector("#obsels-loading-indications");
		this._obselsLoadControlButton = this.shadowRoot.querySelector("#obsels-load-control-button");
		this._obselsLoadControlButton.addEventListener("click", this._onClickObselsLoadControlButton.bind(this));
		this._loadingStatusIcon = this.shadowRoot.querySelector("#loading-status-icon");
		this._progressBar = this.shadowRoot.querySelector("#progress-bar");
		this._styleEditPopup = this.shadowRoot.querySelector("#style-edit-popup");
		this._styleEditInput = this.shadowRoot.querySelector("#style-edit-input");
		this._styleEditInput.setAttribute("lang", this._lang);
		this._styleEditInput.addEventListener("change", this._onChangeStyleEditInput.bind(this));
		this._styleEditInput.addEventListener("input", this._onChangeStyleEditInput.bind(this));
		this._closeStyleEditPopupButton = this.shadowRoot.querySelector("#close-style-edit-popup-button");
		this._closeStyleEditPopupButton.addEventListener("click", this._onClickCloseStyleEditButton.bind(this));
		this._cancelStyleModificationsButton = this.shadowRoot.querySelector("#cancel-style-modifications-button");
		this._cancelStyleModificationsButton.addEventListener("click", this._onClickCancelStyleModificationsButton.bind(this));
		this._deleteStyleButton = this.shadowRoot.querySelector("#delete-style-button");
		this._deleteStyleButton.addEventListener("click", this._onClickDeleteStyleButton.bind(this));
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
		window.removeEventListener("beforeunload", this._bindedOnBeforeUnloadWindowMethod);
		this.removeEventListener("beforeremove", this._bindedOnBeforeRemoveMethod);
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
		defaultStyleSheet.automatically_generated = true;
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

		if(this._model)
			this._componentReady.then(() => {
				this._styleEditInput.setAttribute("model-uri", this._model.uri);
			});

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
		defaultStyleSheet.automatically_generated = true;
		defaultStyleSheet.name = this._translateString("Default");
		defaultStyleSheet.description = this._translateString("Automatically generated stylesheet (one symbol and color for each obsel type)");
		defaultStyleSheet.generated_from_model = true;
		let obselTypes = this._model.obsel_types;
		let defaultStyleSheetRules = new Array();

		for(let i = 0; i < obselTypes.length; i++) {
			let obselType = obselTypes[i];
			let aRule = new HubbleRule({}, defaultStyleSheet);
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

			let aSubRule = new HubbleSubRule({}, aRule);
			aSubRule.type = obselType.uri;
			let aRuleSubRules = new Array();
			aRuleSubRules.push(aSubRule);
			aRule.rules = aRuleSubRules;
			defaultStyleSheetRules.push(aRule);
		}
		
		// add a default "catch-all" rule
		let catchAllRule = HubbleRule.get_catchAllRule(defaultStyleSheet);
		catchAllRule.id = this._translateString("Unknown obsel type");
		catchAllRule.symbol = new Object();
		catchAllRule.symbol.color = "#888888";
		defaultStyleSheetRules.push(catchAllRule);
		defaultStyleSheet.rules = defaultStyleSheetRules;
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

			if(this.allow_edit_stylesheets) {
				const addNewStylesheetSelectorEntry = document.createElement("option");
				addNewStylesheetSelectorEntry.setAttribute("id", "create-new-stylesheet");
				addNewStylesheetSelectorEntry.setAttribute("value", "<create-new>");
				addNewStylesheetSelectorEntry.innerText = this._translateString("+ New");
				addNewStylesheetSelectorEntry.setAttribute("title", this._translateString("Add a new stylesheet"));
				this._styleSheetSelector.appendChild(addNewStylesheetSelectorEntry);
			}

			if(((modelStyleSheets.length > 0) || this.allow_edit_stylesheets) && (this._allowChangeStylesheet) && (this._styleSheetSelector.hasAttribute("disabled")))
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
				// user selected "New stylesheet"
				if(this._styleSheetSelector.value == "<create-new>") {
					let newStylesheet_ID = "";

					// loops if the user validates an empty string, exits loop when the user enters a non-empty sting OR cancels the dialog
					while(newStylesheet_ID == "") {
						newStylesheet_ID = window.prompt(this._translateString("Please enter an ID for the new stylesheet") + " :");
					}

					// user didn't cancel the dialog popup
					if(newStylesheet_ID != null) {
						let newStylesheet = new Stylesheet();
						newStylesheet.name = newStylesheet_ID;
						newStylesheet.is_new = true;
						this._styleSheets.push(newStylesheet);
						const newStylesheetRank = this._styleSheets.length - 1;
						const newStylesheetOption = document.createElement("option");
						newStylesheetOption.setAttribute("value", newStylesheetRank);
						newStylesheetOption.innerText = newStylesheet_ID;
						const createNewStylesheetOption = this._styleSheetSelector.querySelector("option#create-new-stylesheet");
						
						if(createNewStylesheetOption)
							this._styleSheetSelector.insertBefore(newStylesheetOption, createNewStylesheetOption);
						else
							this._styleSheetSelector.appendChild(newStylesheetOption);

						this._applyStyleSheet(newStylesheet, true);
						this._editedStylesheet_original = null;
						this._enterEditStylesheetMode();
						this._current_stylesheet_has_unsaved_modifications = true;
					}
					// user canceled the dialog popup
					else {
						let currentStylesheetRankInSelect = null;

						for(let i = 0; i < this._styleSheets.length; i++)
							if(this._styleSheets[i] == this._currentStylesheet) {
								currentStylesheetRankInSelect = i;
								break;
							}

						if(currentStylesheetRankInSelect != null)
							this._styleSheetSelector.value = currentStylesheetRankInSelect;
						else
							throw new Error("Could not find the selector option matching the current stylesheet");
					}
				}
				else {
					let styleSheetID = parseInt(this._styleSheetSelector.value);

					if(!isNaN(styleSheetID)) {
						let newStyleSheet = this._styleSheets[styleSheetID];

						if(newStyleSheet != this._currentStylesheet)
							this._applyStyleSheet(newStyleSheet, true);
					}
				}
			});
	}

	/**
	 * 
	 */
	get _current_stylesheet_has_unsaved_modifications() {
		return this._currentStylesheetTools.classList.contains("has-unsaved-modifications");
	}

	/**
	 * 
	 */
	set _current_stylesheet_has_unsaved_modifications(new_value) {
		if((new_value === true) || (new_value === false)) {
			if(new_value) {
				if(!this._currentStylesheetTools.classList.contains("has-unsaved-modifications"))
					this._currentStylesheetTools.classList.add("has-unsaved-modifications");

				window.addEventListener("beforeunload", this._bindedOnBeforeUnloadWindowMethod);
				this.addEventListener("beforeremove", this._bindedOnBeforeRemoveMethod);
			}
			else {
				if(this._currentStylesheetTools.classList.contains("has-unsaved-modifications"))
					this._currentStylesheetTools.classList.remove("has-unsaved-modifications");

				window.removeEventListener("beforeunload", this._bindedOnBeforeUnloadWindowMethod);
				this.removeEventListener("beforeremove", this._bindedOnBeforeRemoveMethod);
			}
		}
		else
			throw new TypeError("New value for _has_unsaved_modifications must be a Boolean");
	}

	/**
	 * 
	 */
	_enterEditStylesheetMode() {
		const stylesLegends = this._legend.querySelectorAll("ktbs4la2-trace-timeline-style-legend");

		for(let i = 0; i < stylesLegends.length; i++) {
			stylesLegends[i].setAttribute("title", this._translateString("Edit this style"));
		}

		if(!this._stylesheetTools.classList.contains("edit-mode"))
			this._stylesheetTools.classList.add("edit-mode");

		if((!this._styleSheetSelector.hasAttribute("disabled")) || (this._styleSheetSelector.setAttribute("disabled") != "disabled"))
			this._styleSheetSelector.setAttribute("disabled", "disabled");
	}

	/**
	 * 
	 */
	_exitEditStylesheetMode() {
		const stylesLegends = this._legend.querySelectorAll("ktbs4la2-trace-timeline-style-legend");

		for(let i = 0; i < stylesLegends.length; i++) {
			if(stylesLegends[i].hasAttribute("title"))
				stylesLegends[i].removeAttribute("title");
		}

		if(this._stylesheetTools.classList.contains("edit-mode"))
			this._stylesheetTools.classList.remove("edit-mode");

		if(this._styleSheetSelector.hasAttribute("disabled"))
			this._styleSheetSelector.removeAttribute("disabled");

		this._current_stylesheet_has_unsaved_modifications = false;
	}

	/**
	 * 
	 */
	_onClickEditStylesheetButton(event) {
		// we can't delete stylesheet #0, as it always should be the default stylesheet (automatically generated "on the fly" and not stored)
		if(this._styleSheetSelector.value != 0) {
			this._editedStylesheet_original = this._currentStylesheet.clone();
			this._enterEditStylesheetMode();
		}
	}

	/**
	 * 
	 */
	_onClickSaveStylesheetButton(event) {
		if(this._current_stylesheet_has_unsaved_modifications) {
			const stylesheet_name = this._currentStylesheet.name;
			const model_copy = new Model(this._model.uri);

			model_copy.get(this._abortController.signal)
				.then(() => {
					let model_copy_stylesheets_copy = model_copy.stylesheets;
					let stylesheet_overwritten = false;

					for(let i = 0; i < model_copy_stylesheets_copy.length; i++)
						if(model_copy_stylesheets_copy[i].name == stylesheet_name) {
							model_copy_stylesheets_copy[i] = this._currentStylesheet;
							stylesheet_overwritten = true;
							break;
						}

					if(!stylesheet_overwritten)
						model_copy_stylesheets_copy.push(this._currentStylesheet);

					model_copy.stylesheets = model_copy_stylesheets_copy;

					model_copy.put()
						.then(() => {
							if(this._currentStylesheet.is_new === true)
								delete this._currentStylesheet.is_new;

							this._exitEditStylesheetMode();
						})
						.catch((error) => {
							this.emitErrorEvent(error);
							alert(this._translateString("An error occured while attempting to save the stylesheet in its model") + " : \n" + error.name + " : " + error.message);
						});
				})
				.catch((error) => {
					this.emitErrorEvent(error);
					alert(this._translateString("An error occured while attempting to save the stylesheet in its model") + " : \n" + error.name + " : " + error.message);
				});
		}
	}

	/**
	 * 
	 */
	_onClickCancelStylesheetModificationsButton(event) {
		if(this._current_stylesheet_has_unsaved_modifications) {
			if(confirm(this._translateString("This stylesheet has unsaved modifications that will be lost.\nAre you sure ?"))) {
				if(this._currentStylesheet.is_new == true) {
					this._styleSheets.splice(this._currentStylesheet_rank, 1);
					const deletedStylesheetOption = this._styleSheetSelector.querySelector("option[value = \"" + CSS.escape(this._currentStylesheet_rank) + "\"]");

					if(deletedStylesheetOption) {
						let nextOption = deletedStylesheetOption.nextSibling;
						deletedStylesheetOption.remove();

						// update selector options indexing
						while(nextOption && (nextOption.tagName == "OPTION")) {
							if(nextOption.hasAttribute("value")) {
								const optionRank = parseInt(nextOption.getAttribute("value"), 10);

								if(!isNaN(optionRank))
									nextOption.setAttribute("value", optionRank - 1);
							}

							nextOption = nextOption.nextSibling;
						}
					}

					this._applyStyleSheet(this._styleSheets[this._currentStylesheet_rank - 1]);
				}
				else {
					this._styleSheets[this._currentStylesheet_rank] = this._editedStylesheet_original;
					this._applyStyleSheet(this._editedStylesheet_original);
				}

				this._exitEditStylesheetMode();
			}
		}
		else
			this._exitEditStylesheetMode();
	}

	/**
	 * 
	 */
	_onClickDuplicateStylesheetButton(event) {
		let newStylesheet_ID = "";

		while(newStylesheet_ID == "") {
			newStylesheet_ID = window.prompt(this._translateString("Please enter an ID for the new stylesheet") + " :");
		}

		if(newStylesheet_ID != null) {
			let newStylesheet = this._currentStylesheet.clone();
			newStylesheet.name = newStylesheet_ID;
			newStylesheet.is_new = true;
			this._styleSheets.push(newStylesheet);
			const newStylesheetRank = this._styleSheets.length - 1;
			const newStylesheetOption = document.createElement("option");
			newStylesheetOption.setAttribute("value", newStylesheetRank);
			newStylesheetOption.innerText = newStylesheet_ID;
			const createNewStylesheetOption = this._styleSheetSelector.querySelector("option#create-new-stylesheet");
			
			if(createNewStylesheetOption)
				this._styleSheetSelector.insertBefore(newStylesheetOption, createNewStylesheetOption);
			else
				this._styleSheetSelector.appendChild(newStylesheetOption);

			this._applyStyleSheet(newStylesheet, true);
			this._editedStylesheet_original = null;
			this._enterEditStylesheetMode();
			this._current_stylesheet_has_unsaved_modifications = true;
		}
	}

	/**
	 * 
	 */
	_onClickCreateComputedTraceFromStylesheetButton(event) {
		// @TODO
	}

	/**
	 * 
	 */
	_onClickDeleteStylesheetButton(event) {
		// we can't delete stylesheet #0, as it always should be the default stylesheet (automatically generated "on the fly" and not stored)
		if(this._styleSheetSelector.value != 0) {
			const stylesheet_name = this._currentStylesheet.name;

			if(confirm(this._translateString("You are about to permanently delete this stylesheet.\nAre you sure ?"))) {			
				const model_copy = new Model(this._model.uri);

				model_copy.get(this._abortController.signal)
					.then(() => {
						let model_copy_stylesheets_copy = model_copy.stylesheets;
						let stylesheet_removed = false;

						for(let i = 0; i < model_copy_stylesheets_copy.length; i++)
							if(model_copy_stylesheets_copy[i].name == stylesheet_name) {
								model_copy_stylesheets_copy.splice(i, 1);
								stylesheet_removed = true;
								break;
							}

						if(stylesheet_removed) {
							model_copy.stylesheets = model_copy_stylesheets_copy;

							model_copy.put()
								.then(() => {
									for(let i = 0; i < this._styleSheets.length; i++) {
										if(this._styleSheets[i].name == stylesheet_name) {
											this._styleSheets.splice(i, 1);
											const deletedStylesheetOption = this._styleSheetSelector.querySelector("option[value = \"" + CSS.escape(i) + "\"]");

											if(deletedStylesheetOption) {
												let nextOption = deletedStylesheetOption.nextSibling;
												deletedStylesheetOption.remove();

												// update selector options indexing
												while(nextOption && (nextOption.tagName == "OPTION")) {
													if(nextOption.hasAttribute("value")) {
														const optionRank = parseInt(nextOption.getAttribute("value"), 10);

														if(!isNaN(optionRank))
															nextOption.setAttribute("value", optionRank - 1);
													}

													nextOption = nextOption.nextSibling;
												}
											}

											this._applyStyleSheet(this._styleSheets[i - 1]);
											break;
										}
									}

									this._exitEditStylesheetMode();
								})
								.catch((error) => {
									this.emitErrorEvent(error);
									alert(this._translateString("An error occured while attempting to delete the stylesheet in its model") + " : \n" + error.name + " : " + error.message);
								});
						}
						else {
							const error = new Error("Could not find stylesheet \"" + stylesheet_name + "\" in the Model");
							this.emitErrorEvent(error);
							alert(this._translateString("An error occured while attempting to delete the stylesheet in its model") + " : \n" + error.name + " : " + error.message);
						}

					})
					.catch((error) => {
						this.emitErrorEvent(error);
						alert(this._translateString("An error occured while attempting to delete the stylesheet in its model") + " : \n" + error.name + " : " + error.message);
					});
			}
		}
	}

	/**
	 * 
	 */
	_onClickAddStyleButton(event) {
		if(this._stylesheetTools.classList.contains("edit-mode") && !this._stylesheetTools.classList.contains("style-being-edited")) {
			this._editedRule_rank = this._currentStylesheet.rules.length;
			const newStyleLegend = document.createElement("ktbs4la2-trace-timeline-style-legend");
			newStyleLegend.setAttribute("rule-id", this._translateString("New style"));
			newStyleLegend.setAttribute("color", "#000000");
			newStyleLegend.classList.add("is-being-edited");
			this._legend.insertBefore(newStyleLegend, this._addStyleButton);
			this._editedStyleLegend = newStyleLegend;
			this._editedRule = new HubbleRule({}, this._currentStylesheet);
			this._editedRule.is_new = true;
			this._styleEditPopup.classList.add("is-new");
			this._styleEditPopup.classList.add("is-invalid");

			if(!this._styleEditPopup.classList.contains("visible"))
				this._styleEditPopup.classList.add("visible");

			this._styleEditInput.setAttribute("value", "{}");
			this._styleEditInput.focus();
		}
	}

	/**
	 * 
	 */
	_onClickStyleLegend(event) {
		if(this._stylesheetTools.classList.contains("edit-mode") && !this._stylesheetTools.classList.contains("style-being-edited")) {
			const clickedStyleLegend = event.target;
			const styleRuleID = clickedStyleLegend.getAttribute("rule-id");

			if(styleRuleID) {
				const editedRule = this._currentStylesheet.getRuleByID(styleRuleID);
				
				if(editedRule != null) {
					this._editedRule_rank = this._currentStylesheet.get_rule_rank(editedRule);
					this._editedRule_original = editedRule.clone();
					this._editedStyleLegend = clickedStyleLegend;
					this._edited_rule_has_been_modified = false;

					this._styleEditInput.setAttribute("value", JSON.stringify(editedRule._JSONData))
						.then(() => {
							if(this._styleEditInput.checkValidity()) {
								if(this._styleEditPopup.classList.contains("is-invalid"))
									this._styleEditPopup.classList.remove("is-invalid");
							}
							else {
								if(!this._styleEditPopup.classList.contains("is-invalid"))
									this._styleEditPopup.classList.add("is-invalid");
							}

							if(!this._styleEditPopup.classList.contains("visible"))
								this._styleEditPopup.classList.add("visible");

							this._styleEditInput.focus();
						})
						.catch((error) => {
							this.emitErrorEvent(error);
						});

					this._stylesheetTools.classList.add("style-being-edited");

					if(!clickedStyleLegend.classList.contains("is-being-edited"))
						clickedStyleLegend.classList.add("is-being-edited");

					if(this._styleEditPopup.classList.contains("is-new"))
						this._styleEditPopup.classList.remove("is-new");
				}
				else {
					const error = new Error("Cannot find a rule with ID \"" + styleRuleID + "\" in the current stylesheet");
					this.emitErrorEvent(error);
				}
			}
			else {
				const error = new Error("Cannot find rule-id for the clicked style legend");
				this.emitErrorEvent(error);
			}
		}
	}

	/**
	 * 
	 */
	_exitStyleEdition() {
		if(this._editedStyleLegend) {
			this._styleEditInput.removeAttribute("value");

			if(this._editedStyleLegend.classList.contains("is-being-edited"))
				this._editedStyleLegend.classList.remove("is-being-edited");

			if(this._styleEditPopup.classList.contains("visible"))
				this._styleEditPopup.classList.remove("visible");
			
			this._stylesheetTools.classList.remove("style-being-edited");

			if(this._editedRule_rank)
				delete this._editedRule_rank;

			if(this._editedRule_original)
				delete this._editedRule_original;

			delete this._editedStyleLegend;
		}
		else {
			const error = new Error("Could not find style legend for rule \"" + this._editedRule.id + "\"");
			this.emitErrorEvent(error);
		}
	}

	/**
	 * 
	 */
	_onClickCloseStyleEditButton(event) {
		if(this._styleEditInput.checkValidity()) {
			this._exitStyleEdition();

			if(this._edited_rule_has_been_modified = true)
				this._current_stylesheet_has_unsaved_modifications = true;
		}
	}

	/**
	 * 
	 */
	_onClickCancelStyleModificationsButton(event) {
		if(!this._edited_rule_has_been_modified || confirm(this._translateString("This style has unsaved modifications that will be lost.\nAre you sure ?"))) {
			if(this._editedRule && this._editedRule.is_new) {
				// remove the new unrecorded style from the current stylesheet
				let styleSheetRules = this._currentStylesheet.rules;
				styleSheetRules.splice(this._editedRule_rank, 1);
				this._currentStylesheet.rules = styleSheetRules;
				this._editedStyleLegend.remove();
				this._edited_rule_has_been_modified = false;
				this._exitStyleEdition();
				this._applyStyleSheet(this._currentStylesheet);
			}
			else {
				// overwrite the modified style with its original copy in the parent stylesheet
				let styleSheetRules = this._currentStylesheet.rules;
				styleSheetRules[this._editedRule_rank] = this._editedRule_original;
				this._currentStylesheet.rules = styleSheetRules;
				this._edited_rule_has_been_modified = false;
				this._exitStyleEdition();
				this._applyStyleSheet(this._currentStylesheet);
			}
		}
	}

	/**
	 * 
	 */
	_onClickDeleteStyleButton(event) {
		if(confirm(this._translateString("Are you sure you want to remove this style ?\n(Please note this won't erase the style's data from the model until you save the modified stylesheet)"))) {
			let styleSheetRules = this._currentStylesheet.rules;
			styleSheetRules.splice(this._editedRule_rank, 1);
			this._currentStylesheet.rules = styleSheetRules;
			this._edited_rule_has_been_modified = true;
			this._applyStyleSheet(this._currentStylesheet);
			this._exitStyleEdition();
		}
	}

	/**
	 * 
	 */
	_onChangeStyleEditInput(event) {
		if(this._styleEditInput.checkValidity()) {
			if(this._styleEditPopup.classList.contains("is-invalid"))
				this._styleEditPopup.classList.remove("is-invalid");
		}
		else {
			if(!this._styleEditPopup.classList.contains("is-invalid"))
				this._styleEditPopup.classList.add("is-invalid");
		}

		const newRuleVersion = new HubbleRule(JSON.parse(this._styleEditInput.value), this._currentStylesheet);
		// overwrite the modified style with its original copy in the parent stylesheet
		let styleSheetRules = this._currentStylesheet.rules;
		styleSheetRules[this._editedRule_rank] = newRuleVersion;
		this._currentStylesheet.rules = styleSheetRules;
		this._edited_rule_has_been_modified = true;
		this._applyStyleSheet(this._currentStylesheet);
	}

	/**
	 * 
	 * @param Object stylesheet 
	 */
	_rebuildLegend(stylesheet) {
		// rebuild the styles legends
		let legendContent = new DocumentFragment();

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

			styleNode.addEventListener("click", this._onClickStyleLegend.bind(this));
			legendContent.appendChild(styleNode);
		}

		// add "add style" button
		this._addStyleButton = document.createElement("button");
		this._addStyleButton.setAttribute("id", "add-style-button");
		this._addStyleButton.setAttribute("title", this._translateString("Add a new style"));
		this._addStyleButton.innerText = "+";
		this._addStyleButton.addEventListener("click", this._onClickAddStyleButton.bind(this));
		legendContent.appendChild(this._addStyleButton);

		// replace the content of the legend
		this._legend.innerHTML = "";
		this._legend.appendChild(legendContent);
	}

	/**
	 * 
	 */
	_applyStyleSheet(stylesheet, emit_event = false) {
		this._currentStylesheet = stylesheet;

		for(let i = 0; i < this._styleSheets.length; i++)
			if(this._styleSheets[i] == stylesheet) {
				this._currentStylesheet_rank = i;
				break;
			}


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

		if(stylesheet.automatically_generated) {
			if(!this._currentStylesheetTools.classList.contains("stylesheet-automatically-generated"))
				this._currentStylesheetTools.classList.add("stylesheet-automatically-generated");
		}
		else {
			if(this._currentStylesheetTools.classList.contains("stylesheet-automatically-generated"))
				this._currentStylesheetTools.classList.remove("stylesheet-automatically-generated");
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
		
		if(this._stylesheetTools.classList.contains("edit-mode")) {
			const stylesLegends = this._legend.querySelectorAll("ktbs4la2-trace-timeline-style-legend");

			for(let i = 0; i < stylesLegends.length; i++)
				stylesLegends[i].setAttribute("title", this._translateString("Edit this style"));
		}
		
		this._addStyleButton.setAttribute("title", this._translateString("Add a new style"));
		this._editStylesheetButton.setAttribute("title", this._translateString("Edit this stylesheet"));
		this._saveStylesheetButton.setAttribute("title", this._translateString("Save this stylesheet"));
		this._cancelStylesheetModificationsButton.setAttribute("title", this._translateString("Cancel modifications of this stylesheet"));
		this._duplicateStylesheetButton.setAttribute("title", this._translateString("Duplicate this stylesheet"));
		this._createComputedTraceFromStylesheetButton.setAttribute("title", this._translateString("Create a computed trace from this stylesheet"));
		this._deleteStylesheetButton.setAttribute("title", this._translateString("Delete this stylesheet"));
		this._waitMessage.innerText = this._translateString("Waiting for server response...");
		this._emptyMessage.innerText = this._translateString("No obsel to display");
		this._timeline.setAttribute("lang", this._lang);
		this._styleEditInput.setAttribute("lang", this._lang);
		this._closeStyleEditPopupButton.setAttribute("title", this._translateString("Close"));
		this._cancelStyleModificationsButton.setAttribute("title", this._translateString("Cancel modifications of this style"));
		this._deleteStyleButton.setAttribute("title", this._translateString("Delete this style"));

		// rebuild the default stylesheet and it's legend if it is the currently applied stylesheet
		for(let i = 0; i < this._styleSheets.length; i++) {
			if(this._styleSheets[i].generated_from_model) {
				let defaultStyleSheet = this._generateDefaultStylesheetFromModel();
				this._styleSheets[i] = defaultStyleSheet;

				if(this._currentStylesheet.generated_from_model) {
					this._currentStylesheet = defaultStyleSheet;
					this._currentStylesheet_rank = i;
					
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

	/**
     * 
     */
    _onBeforeUnloadWindow(event) {
        if(this._current_stylesheet_has_unsaved_modifications) {
            event.preventDefault();
            const confirmMessage = this._translateString("Your modifications haven't been saved. Are you sure you want to leave ?");
            event.returnValue = confirmMessage;
            return confirmMessage;
        }
        else if(event.returnValue)
            delete event.returnValue;
    }

    /**
     * 
     */
    _onBeforeRemove(event) {
        if(this._current_stylesheet_has_unsaved_modifications && !confirm(this._translateString("Your modifications haven't been saved. Are you sure you want to leave ?")))
            event.preventDefault();
    }
}

customElements.define('ktbs4la2-trace-timeline', KTBS4LA2TraceTimeline);
