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
import "../ktbs4la2-resource-id-input/ktbs4la2-resource-id-input.js";

import {getDistinctColor} from "../common/colors-utils.js";

/**
 * Encodes a string containing a Javascript special character to it's HTML hexadecimal entity
 */
function JSSpecialCharToHTMLHex(str) {
    return "&#x" + str.codePointAt(0).toString(16) + ";";
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
class KTBS4LA2TraceTimeline extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true);
		this._obsels = new Array();
		this._already_instanciated_obsels_ids = new Array();
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
		this._stylesheetIdInput = this.shadowRoot.querySelector("#stylesheet-id-input");
		this._stylesheetIdInput.addEventListener("change", this._onChangeStylesheetIdInput.bind(this));
		this._stylesheetIdInput.addEventListener("input", this._onChangeStylesheetIdInput.bind(this));
		this._legend = this.shadowRoot.querySelector("#legend");
		this._stylesheetDescriptionArea = this.shadowRoot.querySelector("#stylesheet-description");
		this._stylesheetDescriptionArea.addEventListener("input", this._onInputStylesheetDescriptionArea.bind(this));
		this._addStyleButton = this.shadowRoot.querySelector("#add-style-button");
		this._addStyleButton.addEventListener("click", this._onClickAddStyleButton.bind(this));
		this._stylesheetTools = this.shadowRoot.querySelector("#stylesheet-tools");
		this._currentStylesheetTools = this.shadowRoot.querySelector("#current-stylesheet-tools");
		this._splitButton = this.shadowRoot.querySelector("#split-button");
		this._splitButton.addEventListener("click", this._onClickSplitButton.bind(this));
		this._compareButton = this.shadowRoot.querySelector("#compare-button");
		this._compareButton.addEventListener("click", this._onClickCompareButton.bind(this));
		this._editStylesheetButton = this.shadowRoot.querySelector("#edit-stylesheet-button");
		this._editStylesheetButton.addEventListener("click", this._onClickEditStylesheetButton.bind(this));
		this._saveStylesheetButton = this.shadowRoot.querySelector("#save-stylesheet-button");
		this._saveStylesheetButton.addEventListener("click", this._onClickSaveStylesheetButton.bind(this));
		this._cancelStylesheetModificationsButton = this.shadowRoot.querySelector("#cancel-stylesheet-modifications-button");
		this._cancelStylesheetModificationsButton.addEventListener("click", this._onClickCancelStylesheetModificationsButton.bind(this));
		this._duplicateStylesheetButton = this.shadowRoot.querySelector("#duplicate-stylesheet-button");
		this._duplicateStylesheetButton.addEventListener("click", this._onClickDuplicateStylesheetButton.bind(this));
		this._createMethodFromStylesheetButton = this.shadowRoot.querySelector("#create-method-from-stylesheet-button");
		this._createMethodFromStylesheetButton.addEventListener("click", this._onClickCreateMethodFromStylesheetButton.bind(this));
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
		this._timeline.addEventListener("view-change", this._onTimelineViewChanged.bind(this), true);
		this._viewHistogramModeButton = this.shadowRoot.querySelector("#view-histogram-mode-button");
		this._viewHistogramModeButton.addEventListener("click", this._onClickViewHistogramModeButton.bind(this));
		this._viewObselModeButton = this.shadowRoot.querySelector("#view-obsel-mode-button");
		this._viewObselModeButton.addEventListener("click", this._onClickViewObselModeButton.bind(this));
		this._histogramOptionDurationCheckbox = this.shadowRoot.querySelector("#histogram-option-duration-checkbox");
		this._histogramOptionDurationCheckbox.addEventListener("change", this._onchangeHistogramOptionDurationCheckbox.bind(this));
		this._histogramOptionDurationLabel = this.shadowRoot.querySelector("#histogram-option-duration-label");
		this._histogramOptionNormalizeCheckbox = this.shadowRoot.querySelector("#histogram-option-normalize-checkbox");
		this._histogramOptionNormalizeCheckbox.addEventListener("change", this._onchangeHistogramOptionNormalizeCheckbox.bind(this));
		this._histogramOptionNormalizeLabel = this.shadowRoot.querySelector("#histogram-option-normalize-label");
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
		this._duplicateStyleButton = this.shadowRoot.querySelector("#duplicate-style-button");
		this._duplicateStyleButton.addEventListener("click", this._onClickDuplicateStyleButton.bind(this));
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
	get stylesheetTools() {
		return this._stylesheetTools;
	}

	/**
	 * 
	 */
	disconnectedCallback() {
		this._obselsLoadingAbortController.abort();
		window.removeEventListener("beforeunload", this._bindedOnBeforeUnloadWindowMethod);
		this.removeEventListener("beforeremove", this._bindedOnBeforeRemoveMethod);
		super.disconnectedCallback();
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
				this._trace.obsel_list.force_state_refresh()
					.finally(() => {
						this._loadObsels();
					});
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
	_loadObsels() {
		this._componentReady.then(() => {
			this._timeline.innerHTML = "";
			this._progressBar.style.width = "0%";
			this._obselsLoadControlButton.setAttribute("title", this._translateString("Stop loading"));
			this._loadingStatusIcon.setAttribute("title", this._translateString("Loading"));
			this._obselsLoadingIndications.className = "loading";
		});

		this._obselsLoadingAbortController = new AbortController();
		this._obsels = new Array();
		this._already_instanciated_obsels_ids = new Array();

		this._allObselsLoaded = new Promise(function(resolve, reject) {
			this._resolveAllObselsLoaded = resolve;
			this._rejectAllObselsLoaded = reject;
		}.bind(this));

		this._trace.obsel_list.query({limit: 100}, this._obselsLoadingAbortController.signal)
			.then(this._onObselListQueryResponse.bind(this))
			.catch((error) => {
				if((error.name != "AbortError") || !this._obselsLoadingAbortController.signal.aborted)
					this._onObselListQueryFailed(error);
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
			.catch(() => {});
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
		observedAttributes.push("histogram-normalize");
		observedAttributes.push("histogram-duration");
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

						this._componentReady.then(() => {
							this._styleEditInput.setAttribute("suggestions-source-trace-uri", newValue);
						}).catch(() => {});
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
			Promise.all([this._componentReady, this._stylesheetsBuilded])
				.then(() => {
					for(let i = 0; i < this._styleSheets.length; i++) {
						let aStylesheet = this._styleSheets[i];

						if(aStylesheet.name.toLowerCase() == newValue.toLowerCase())
							setTimeout(() => {
								if(!this._styleSheetSelector.options[i].selected)
									this._styleSheetSelector.options[i].selected = true;

								this._applyStyleSheet(aStylesheet, false);
								this._currentStylesheet_rank = i;
								this._editedStylesheet_original = aStylesheet;
							});
					}
				});
		}

		if(attributeName == "histogram-normalize") {
			if(
					(newValue == "true")
				||	(newValue == "1")
			) {
				this._componentReady.then(() => {
					this._histogramOptionNormalizeCheckbox.checked = true;
					this._requestUpdateHistogram();
				});
			}
			else if(
					(newValue == "false")
				||	(newValue == "0")
				||	(newValue == null)
			) {
				this._componentReady.then(() => {
					this._histogramOptionNormalizeCheckbox.checked = false;
					this._requestUpdateHistogram();
				});
			}
			else
				this.emitErrorEvent(new TypeError("Value for attribute \"histogram-normalize\" must be a boolean"));
		}

		if(attributeName == "histogram-duration") {
			if(
					(newValue == "true")
				||	(newValue == "1")
			) {
				this._componentReady.then(() => {
					this._histogramOptionDurationCheckbox.checked = true;
					this._requestUpdateHistogram();
				});
			}
			else if(
					(newValue == "false")
				||	(newValue == "0")
				||	(newValue == null)
			) {
				this._componentReady.then(() => {
					this._histogramOptionDurationCheckbox.checked = false;
					this._requestUpdateHistogram();
				});
			}
			else
				this.emitErrorEvent(new TypeError("Value for attribute \"histogram-duration\" must be a boolean"));
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
			let aRule = new HubbleRule({}, defaultStyleSheet);
			aRule.id = obselTypeID;
			aRule.symbol = new Object();
			aRule.symbol.color = getDistinctColor(i, knownObselTypes.length);
			aRule.symbol.shape = "duration-bar";
			let aSubRule = new HubbleSubRule({}, aRule);
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
		this._loadObsels();
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
	}

	/**
	 * 
	 */
	_onModelNotification() {
		switch(this._model.syncStatus) {
			case "needs_sync":
				this._model.get(this._abortController.signal).catch(() => {});
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
			aRule.id = obselType.get_preferred_label(this.lang);
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
			this._styleSheets = new Array();

			const previousStylesheetChoices = this._styleSheetSelector.querySelectorAll("option:not(#default)");

			for(let i = 0; i < previousStylesheetChoices.length; i++)
				previousStylesheetChoices[i].remove();

			let defaultStylesheetGeneratedFromModel = this._generateDefaultStylesheetFromModel();

			if(defaultStylesheetGeneratedFromModel != null)
				this._styleSheets.push(defaultStylesheetGeneratedFromModel);

			let stylesheetToApply;
			let modelStyleSheets = this._model.stylesheets;

			for(let i = 0; i < modelStyleSheets.length; i++) {
				let aStyleSheet = modelStyleSheets[i];
				this._styleSheets.push(aStyleSheet);
				let styleSheetSelectorOption = document.createElement("option");
				styleSheetSelectorOption.setAttribute("id", aStyleSheet.name);
				styleSheetSelectorOption.innerText = aStyleSheet.name;

				if(aStyleSheet.description)
					styleSheetSelectorOption.setAttribute("title", aStyleSheet.description);

				if(
					(
							this._currentStylesheet 
						&&	(this._currentStylesheet.name.toLowerCase() == aStyleSheet.name.toLowerCase())
					)
					|| (
							!this._currentStylesheet
						&&	this.hasAttribute("stylesheet")
						&&	(this.getAttribute("stylesheet").toLowerCase() == aStyleSheet.name.toLowerCase())
					)
				) {
					stylesheetToApply = aStyleSheet;
					styleSheetSelectorOption.setAttribute("selected", true);
				}

				this._styleSheetSelector.appendChild(styleSheetSelectorOption);
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

			if(!stylesheetToApply) {
				stylesheetToApply = defaultStylesheetGeneratedFromModel;
				this._styleSheetSelector.selectedIndex = 0;
			}

			if(stylesheetToApply)
				setTimeout(() => {
					this._applyStyleSheet(stylesheetToApply, false);
				});

			this._resolveStylesheetsBuilded();
		})
		.catch(() => {});
	}

	/**
	 * 
	 */
	_onModelError() {
		this._allObselsLoaded
			.finally(() => {
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
				if(this._styleSheetSelector.value == "<create-new>")
					this._onSelectNewStylesheetOption();
				// user selected an existing stylesheet
				else {
					let newStyleSheet = this._styleSheets[this._styleSheetSelector.selectedIndex];
					this._applyStyleSheet(newStyleSheet, true);
					this._editedStylesheet_original = newStyleSheet.clone();
				}
			});
	}

	/**
	 * 
	 */
	_getStylesheetsIDs() {
		const stylesheets_ids = new Array();

		if(this._styleSheets && (this._styleSheets instanceof Array))
			for(let i = 0; i < this._styleSheets.length; i++)
				if(!this._styleSheets[i].automatically_generated && this._styleSheets[i].name && !stylesheets_ids.includes(this._styleSheets[i].name))
					stylesheets_ids.push(this._styleSheets[i].name);

		return stylesheets_ids;
	}

	/**
	 * 
	 */
	_getStylesheetByName(stylesheet_name) {
		let return_stylesheet = null;

		for(let i = 0; i < this._styleSheets.length; i++)
			if(this._styleSheets[i].name.toLowerCase() == stylesheet_name.toLowerCase()) {
				return_stylesheet = this._styleSheets[i];
				break;
			}

		return return_stylesheet;
	}

	/**
	 * 
	 */
	_promptNewStylesheetId() {
		const reserved_ids = this._getStylesheetsIDs();
		const idValidationPattern = new RegExp('^[a-zA-Z0-9\-_]+$');
		let newStylesheet_ID = "";

		// loops if the user validates an invalid string, exits loop when the user enters a valid sting OR cancels the dialog
		while(newStylesheet_ID == "") {
			newStylesheet_ID = window.prompt(this._translateString("Please enter an ID for the new stylesheet :\n(allowed characters : letters, numbers, \"-\" and \"_\")"));
			
			if(newStylesheet_ID != null) {
				let error = null;
				
				if(!idValidationPattern.test(newStylesheet_ID))
					error = "Invalid ID !\nPlease enter an non empty string containing only letters, numbers, \"-\" or \"_\".";
				else if(reserved_ids.includes(newStylesheet_ID))
					error = "This ID is already used by an other stylesheet in the same model !\nPlease choose a different ID.";

				if(error) {
					window.alert(this._translateString(error));
					newStylesheet_ID = "";
				}
			}
		}

		return newStylesheet_ID;
	}

	/**
	 * 
	 */
	_onValidateStylesheetCreationDialog(event) {
		if(event.detail) {
			const newStylesheet = event.detail.stylesheet;

			if(newStylesheet) {
				newStylesheet.is_new = true;
				this._styleSheets.push(newStylesheet);
				const newStylesheetOption = document.createElement("option");
				newStylesheetOption.innerText = newStylesheet.name;
				const createNewStylesheetOption = this._styleSheetSelector.querySelector("option#create-new-stylesheet");
				
				if(createNewStylesheetOption)
					this._styleSheetSelector.insertBefore(newStylesheetOption, createNewStylesheetOption);
				else
					this._styleSheetSelector.appendChild(newStylesheetOption);

				this._applyStyleSheet(newStylesheet, true);
				this._editedStylesheet_original = null;
				this._currentStylesheet_rank = this._styleSheets.length - 1;
				this._current_stylesheet_has_unsaved_modifications = true;
				this._styleSheetSelector.options[this._currentStylesheet_rank].selected = true;
				this._enterEditStylesheetMode();
			}
		}
	}

	/**
	 * 
	 */
	_onCancelStylesheetCreationDialog(event) {
		this._styleSheetSelector.options[this._currentStylesheet_rank].selected = true;
	}

	/**
	 * 
	 */
	_onSelectNewStylesheetOption() {
		const requestStylesheetCreationDialogEvent = new CustomEvent(
			"request-stylesheet-creation-dialog", {
				bubbles: true, 
				composed: true, 
				cancelable: true, 
				detail: {
					"trace_uri": this.getAttribute("uri"),
					"trace_type": this.getAttribute("type"),
					"reserved_ids": this._getStylesheetsIDs()
				}
			}
		);

		if(this.dispatchEvent(requestStylesheetCreationDialogEvent)) {
			const dialog = requestStylesheetCreationDialogEvent.stylesheet_creation_dialog_instance;

			if(dialog) {
				dialog.addEventListener("validate-stylesheet-creation-dialog", this._onValidateStylesheetCreationDialog.bind(this));
				dialog.addEventListener("cancel-stylesheet-creation-dialog", this._onCancelStylesheetCreationDialog.bind(this));
			}
		}
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

		this._stylesheetDescriptionArea.setAttribute("contenteditable", "true");
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

		this._stylesheetDescriptionArea.setAttribute("contenteditable", "false");
		this._current_stylesheet_has_unsaved_modifications = false;
		delete this._editedStylesheet_original;
	}

	/**
	 * 
	 */
	_onClickSplitButton(event) {
		if(this.allow_split_trace) {
			this.dispatchEvent(
				new CustomEvent("request-trace-split", {
					bubbles: true,
					cancelable: false,
					composed: true,
					detail : {
						trace_type: this._trace.constructor.name,
						trace_uri: this._trace.uri.toString(),
						current_stylesheet_name: this._currentStylesheet.name,
						view_mode: this.viewMode
					}
				})
			);
		}
	}

	/**
	 * 
	 */
	_onClickCompareButton(event) {
		if(this.allow_compare) {
			this.dispatchEvent(
				new CustomEvent("request-compare", {
					bubbles: true,
					cancelable: false,
					composed: true,
					detail : {
						trace_type: this._trace.constructor.name,
						trace_uri: this._trace.uri.toString(),
						current_stylesheet_name: this._currentStylesheet.name,
						view_mode: this.viewMode
					}
				})
			);
		}
	}

	/**
	 * 
	 */
	_onClickEditStylesheetButton(event) {
		const stylesheet_rank = this._styleSheetSelector.selectedIndex;

		// we can't delete stylesheet #0, as it always should be the default stylesheet (automatically generated "on the fly" and not stored)
		if(stylesheet_rank != 0) {
			this._editedStylesheet_original = this._currentStylesheet.clone();
			this._enterEditStylesheetMode();
		}
	}

	/**
	 * 
	 */
	_onClickSaveStylesheetButton(event) {
		if(
				this._stylesheetTools.classList.contains("edit-mode") 
			&& 	!this._stylesheetTools.classList.contains("style-being-edited") 
			&& 	!this._currentStylesheetTools.classList.contains("is-invalid") 
			&& this._current_stylesheet_has_unsaved_modifications
		) {
			this._model.get(this._abortController.signal)
				.then(() => {
					const stylesheets_backup_copy = this._model.stylesheets;
					let stylesheets_working_copy = this._model.stylesheets;
					// we have to withdraw 1 from this._currentStylesheet_rank because the model doesn't has the defaut stylesheet at index 0
					stylesheets_working_copy[this._currentStylesheet_rank - 1] = this._currentStylesheet;
					this._model.stylesheets = stylesheets_working_copy;

					this._model.put()
						.then(() => {
							if(this._currentStylesheet.is_new === true)
								delete this._currentStylesheet.is_new;

							this._styleSheets[this._currentStylesheet_rank] = this._currentStylesheet;
							this._styleSheetSelector.options[this._currentStylesheet_rank].innerText = this._currentStylesheet.name;
							this._exitEditStylesheetMode();
						})
						.catch((error) => {
							this._model.stylesheets = stylesheets_backup_copy;
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
		if(this._stylesheetTools.classList.contains("edit-mode") && !this._stylesheetTools.classList.contains("style-being-edited")) {
			if(this._current_stylesheet_has_unsaved_modifications) {
				if(confirm(this._translateString("This stylesheet has unsaved modifications that will be lost.\nAre you sure ?"))) {
					if(this._currentStylesheet.is_new == true) {
						this._styleSheets.splice(this._currentStylesheet_rank, 1);
						this._styleSheetSelector.options[this._currentStylesheet_rank].remove();
						this._currentStylesheet_rank--;
						this._styleSheetSelector.options[this._currentStylesheet_rank].selected = true;
						this._applyStyleSheet(this._styleSheets[this._currentStylesheet_rank]);
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
	}

	/**
	 * 
	 */
	_onClickDuplicateStylesheetButton(event) {
		// displays a dialog popup that asks the user for the new stylesheet's id
		const newStylesheet_ID = this._promptNewStylesheetId();

		if(newStylesheet_ID != null) {
			let newStylesheet = this._currentStylesheet.clone();
			newStylesheet.name = newStylesheet_ID;
			newStylesheet.is_new = true;
			this._styleSheets.push(newStylesheet);
			const newStylesheetOption = document.createElement("option");
			newStylesheetOption.innerText = newStylesheet_ID;
			const createNewStylesheetOption = this._styleSheetSelector.querySelector("option#create-new-stylesheet");
			
			if(createNewStylesheetOption)
				this._styleSheetSelector.insertBefore(newStylesheetOption, createNewStylesheetOption);
			else
				this._styleSheetSelector.appendChild(newStylesheetOption);

			this._applyStyleSheet(newStylesheet, true);
			this._editedStylesheet_original = null;
			this._currentStylesheet_rank = this._styleSheets.length - 1;
			this._current_stylesheet_has_unsaved_modifications = true;
			this._styleSheetSelector.options[this._currentStylesheet_rank].selected = true;
			this._enterEditStylesheetMode();
		}
	}

	/**
	 * 
	 */
	_onClickCreateMethodFromStylesheetButton(event) {
		this.dispatchEvent(new CustomEvent("request-create-method-from-stylesheet", {
            bubbles: true, 
			composed: true,
            cancelable: true,
            detail: {
				"stylesheet-id": this._currentStylesheet.name,
				"stylesheet-rules-data": this._currentStylesheet._JSONData["rules"],
				"source-trace-uri": this._trace.uri
            }
        }));
	}

	/**
	 * 
	 */
	_onClickDeleteStylesheetButton(event) {
		// we can't delete stylesheet #0, as it always should be the default stylesheet (automatically generated "on the fly" and not stored)
		if(this._currentStylesheet_rank != 0) {
			if(confirm(this._translateString("You are about to permanently delete this stylesheet.\nAre you sure ?"))) {
				this._model.get(this._abortController.signal)
					.then(() => {
						const stylesheets_backup_copy = this._model.stylesheets;
						let stylesheets_working_copy = this._model.stylesheets;
						// we have to withdraw 1 from this._currentStylesheet_rank because the model doesn't has the defaut stylesheet at index 0
						stylesheets_working_copy.splice(this._currentStylesheet_rank - 1, 1);
						this._model.stylesheets = stylesheets_working_copy;

						this._model.put()
							.then(() => {
								this._styleSheets.splice(this._currentStylesheet_rank, 1);
								this._styleSheetSelector.options[this._currentStylesheet_rank].remove();
								this._currentStylesheet_rank--;
								this._styleSheetSelector.options[this._currentStylesheet_rank].selected = true;
								const newStylesheet = this._styleSheets[this._currentStylesheet_rank];
								this._applyStyleSheet(newStylesheet);
							})
							.catch((error) => {
								this._model.stylesheets = stylesheets_backup_copy;
								this.emitErrorEvent(error);
								alert(this._translateString("An error occured while attempting to delete the stylesheet in its model") + " : \n" + error.name + " : " + error.message);
							});
					})
					.catch((error) => {
						this.emitErrorEvent(error);
						alert(this._translateString("An error occured while attempting to save the stylesheet in its model") + " : \n" + error.name + " : " + error.message);
					});
			}
		}
	}

	/**
	 * 
	 */
	_onClickAddStyleButton(event) {
		if(this._stylesheetTools.classList.contains("edit-mode") && !this._stylesheetTools.classList.contains("style-being-edited")) {
			let newRule_ID = "";

			// loops if the user validates an empty string, exits loop when the user enters a non-empty sting OR cancels the dialog
			while(newRule_ID == "") {
				newRule_ID = window.prompt(this._translateString("Please enter an ID for the new style") + " :");
			}

			// user didn't cancel the dialog popup
			if(newRule_ID != null) {
				this._editedRule_rank = this._currentStylesheet.rules.length;
				this._editedRule = new HubbleRule({}, this._currentStylesheet);
				this._editedRule.id = newRule_ID;

				this._editedRule.symbol = {
					shape: "duration-bar",
					color: "#000000"
				};

				this._editedRule.is_new = true;
				let rules_copy = this._currentStylesheet.rules;
				rules_copy.push(this._editedRule);
				this._currentStylesheet.rules = rules_copy;

				if(!this._stylesheetTools.classList.contains("style-being-edited"))
					this._stylesheetTools.classList.add("style-being-edited");

				this._applyStyleSheet(this._currentStylesheet);

				this._styleEditInput.setAttribute("value", JSON.stringify(this._editedRule._JSONData))
					.then(() => {
						if(this._styleEditInput.checkValidity()) {
							if(this._styleEditPopup.classList.contains("is-invalid"))
								this._styleEditPopup.classList.remove("is-invalid");
						}
						else {
							if(!this._styleEditPopup.classList.contains("is-invalid"))
								this._styleEditPopup.classList.add("is-invalid");
						}

						if(!this._styleEditPopup.classList.contains("is-new"))
							this._styleEditPopup.classList.add("is-new");

						if(!this._styleEditPopup.classList.contains("visible"))
							this._styleEditPopup.classList.add("visible");

						this._styleEditInput.focus();
					});
			}
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
						.catch(this.emitErrorEvent.bind(this));

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
			if(this._styleEditInput.hasAttribute("value"))
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
			delete this._editedRule;
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
	_onClickDuplicateStyleButton(event) {
		let newRule_ID = "";

		// loops if the user validates an empty string, exits loop when the user enters a non-empty sting OR cancels the dialog
		while(newRule_ID == "") {
			newRule_ID = window.prompt(this._translateString("Please enter an ID for the new style") + " :");
		}

		// user didn't cancel the dialog popup
		if(newRule_ID != null) {
			const newRule = new HubbleRule(JSON.parse(this._styleEditInput.value), this._currentStylesheet);
			newRule.id = newRule_ID;
			let styleSheetRules = this._currentStylesheet.rules;
			styleSheetRules.push(newRule);
			this._currentStylesheet.rules = styleSheetRules;
			this._applyStyleSheet(this._currentStylesheet);
			this._current_stylesheet_has_unsaved_modifications = true;
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
			this._current_stylesheet_has_unsaved_modifications = true;
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
		let legendContent = new DocumentFragment();

		// rebuild the styles legends
		for(let i = 0; i < stylesheet.rules.length; i++) {
			let aRule = stylesheet.rules[i];
			let styleNode = document.createElement("ktbs4la2-trace-timeline-style-legend");
			styleNode.setAttribute("rule-id", aRule.id);

			if(this._stylesheetTools.classList.contains("style-being-edited") && (i == this._editedRule_rank)) {
				styleNode.classList.add("is-being-edited");
				this._editedStyleLegend = styleNode;
			}

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

		// add description area
		this._stylesheetDescriptionArea = document.createElement("div");
		this._stylesheetDescriptionArea.setAttribute("id", "stylesheet-description");
		let description = stylesheet.automatically_generated?this._translateString("Default stylesheet generated automatically"):stylesheet.description;

		if(description) {
			this._stylesheetDescriptionArea.innerText = description;

			if(this._stylesheetDescriptionArea.classList.contains("empty"))
				this._stylesheetDescriptionArea.classList.remove("empty");
		}
		else {
			this._stylesheetDescriptionArea.innerText = "";

			if(!this._stylesheetDescriptionArea.classList.contains("empty"))
				this._stylesheetDescriptionArea.classList.add("empty");
		}

		if(this._stylesheetTools.classList.contains("edit-mode"))
			this._stylesheetDescriptionArea.setAttribute("contenteditable", "true");

		this._stylesheetDescriptionArea.addEventListener("input", this._onInputStylesheetDescriptionArea.bind(this));
		legendContent.appendChild(this._stylesheetDescriptionArea);

		// replace the content of the legend
		this._legend.innerHTML = "";
		this._legend.appendChild(legendContent);
	}

	/**
	 * 
	 */
	_onInputStylesheetDescriptionArea(event) {
		if(this._stylesheetTools.classList.contains("edit-mode")) {
			this._currentStylesheet.description = this._stylesheetDescriptionArea.innerText;
			this._current_stylesheet_has_unsaved_modifications = true;
		}
	}

	/**
	 * 
	 */
	_onChangeStylesheetIdInput(event) {
		if(this._stylesheetTools.classList.contains("edit-mode")) {
			this._currentStylesheet.name = this._stylesheetIdInput.value;
			this._current_stylesheet_has_unsaved_modifications = true;

			if(this._stylesheetIdInput.checkValidity()) {
				if(this._currentStylesheetTools.classList.contains("is-invalid"))
					this._currentStylesheetTools.classList.remove("is-invalid");
			}
			else {
				if(!this._currentStylesheetTools.classList.contains("is-invalid"))
					this._currentStylesheetTools.classList.add("is-invalid");
			}
		}
	}

	/**
	 * 
	 */
	_clearHistogram() {
		const histogramBars = this._timeline.querySelectorAll("ktbs4la2-timeline-histogram-bar");

		for(let i = histogramBars.length - 1; i >= 0; i--)
			histogramBars[i].remove();
	}

	/**
	 * 
	 */
	_getObselHistogramBar(histogramData, anObsel) {
		let histogramBar;

		for(let i = 0; i < histogramData.length; i++) {
			histogramBar = histogramData[i];
			
			if(
					(histogramBar.begin <= anObsel.begin)
				&&	(anObsel.begin <= histogramBar.end)
			)
				return histogramBar;
		}

		// the bar for the obsel does not exists yet, let's create it
		histogramBar = {subdivisions: new Array()};
		const obselBeginDate = new Date(anObsel.begin);
		const obselYear = obselBeginDate.getFullYear().toString();
		const obselMonth = (obselBeginDate.getMonth() + 1).toString().padStart(2, '0');
		const obselDay = obselBeginDate.getDate().toString().padStart(2, '0');
		const obselHour = obselBeginDate.getHours().toString().padStart(2, '0');
		const obselMinute = obselBeginDate.getMinutes().toString().padStart(2, '0');
		const obselSecond = obselBeginDate.getSeconds().toString().padStart(2, '0');
		const obselMillisecond = obselBeginDate.getMilliseconds().toString().padStart(3, '0');

		// @TODO prendre en compte la granularité de l'histogramme définie par l'utilisateur
		switch(this._timeline.zoomLevel) {
			case "year": 
				histogramBar.begin = new Date(obselYear + "-01-01T00:00:00.000");
				histogramBar.end = new Date(obselYear + "-12-31T23:59:59.999");
				break;
			case "month":
				histogramBar.begin = new Date(obselYear + "-" + obselMonth + "-01T00:00:00.000");
				histogramBar.end = new Date(obselYear + "-"+ obselMonth + "-" + getNumberOfDaysInMonth(obselMonth, obselYear) + "T23:59:59.999");
				break;
			case "day":
				histogramBar.begin = new Date(obselYear + "-" + obselMonth + "-" + obselDay + "T00:00:00.000");
				histogramBar.end = new Date(obselYear + "-"+ obselMonth + "-" + obselDay + "T23:59:59.999");
				break;
			case "hour":
				histogramBar.begin = new Date(obselYear + "-" + obselMonth + "-" + obselDay + "T"+ obselHour +":00:00.000");
				histogramBar.end = new Date(obselYear + "-"+ obselMonth + "-" + obselDay + "T"+ obselHour +":59:59.999");
				break;
			case "tenminutes":
				histogramBar.begin = new Date(obselYear + "-" + obselMonth + "-" + obselDay + "T"+ obselHour + ":" + obselMinute.substring(0, 1) + "0:00.000");
				histogramBar.end = new Date(obselYear + "-"+ obselMonth + "-" + obselDay + "T"+ obselHour + ":" + obselMinute.substring(0, 1) + "9:59.999");
				break;
			case "minute":
				histogramBar.begin = new Date(obselYear + "-" + obselMonth + "-" + obselDay + "T"+ obselHour + ":" + obselMinute + ":00.000");
				histogramBar.end = new Date(obselYear + "-"+ obselMonth + "-" + obselDay + "T"+ obselHour + ":" + obselMinute + ":59.999");
				break;
			case "tenseconds":
				histogramBar.begin = new Date(obselYear + "-" + obselMonth + "-" + obselDay + "T"+ obselHour + ":" + obselMinute + ":" + obselSecond.substring(0, 1) + "0.000");
				histogramBar.end = new Date(obselYear + "-"+ obselMonth + "-" + obselDay + "T"+ obselHour + ":" + obselMinute + ":" + obselSecond.substring(0, 1) + "9.999");
				break;
			case "second":
				histogramBar.begin = new Date(obselYear + "-" + obselMonth + "-" + obselDay + "T"+ obselHour + ":" + obselMinute + ":" + obselSecond + ".000");
				histogramBar.end = new Date(obselYear + "-"+ obselMonth + "-" + obselDay + "T"+ obselHour + ":" + obselMinute + ":" + obselSecond + ".999");
				break;
			case "ahundredmilliseconds": 
				histogramBar.begin = new Date(obselYear + "-" + obselMonth + "-" + obselDay + "T"+ obselHour + ":" + obselMinute + ":" + obselSecond + "." + obselMillisecond.substring(0, 1) + "00");
				histogramBar.end = new Date(obselYear + "-"+ obselMonth + "-" + obselDay + "T"+ obselHour + ":" + obselMinute + ":" + obselSecond + "." + obselMillisecond.substring(0, 1) + "99");
				break;
			case "tenmilliseconds" :
				histogramBar.begin = new Date(obselYear + "-" + obselMonth + "-" + obselDay + "T"+ obselHour + ":" + obselMinute + ":" + obselSecond + "." + obselMillisecond.substring(0, 2) + "0");
				histogramBar.end = new Date(obselYear + "-"+ obselMonth + "-" + obselDay + "T"+ obselHour + ":" + obselMinute + ":" + obselSecond + "." + obselMillisecond.substring(0, 2) + "9");
				break;
			case "millisecond" :
				histogramBar.begin = new Date(obselYear + "-" + obselMonth + "-" + obselDay + "T"+ obselHour + ":" + obselMinute + ":" + obselSecond + "." + obselMillisecond);
				histogramBar.end = new Date(obselYear + "-"+ obselMonth + "-" + obselDay + "T"+ obselHour + ":" + obselMinute + ":" + obselSecond + "." + obselMillisecond);
				break;
		}

		histogramData.push(histogramBar);
		return histogramBar;
	}

	/**
	 * 
	 */
	_updateHistogram() {
		this._timeline._componentReady.then(() => {
			// --- prepare histogram ---
			this._clearHistogram();
			let histogramData = [];
			// ---

			// --- apply rules to obsels ---
			for(let i = 0; i < this._obsels.length; i++) {
				let anObsel = this._obsels[i];
				let obselEventNode = this.querySelector("#" + CSS.escape(anObsel.id));

				if(obselEventNode) {
					let matchedRule = this._currentStylesheet.getFirstRuleMatchedByObsel(anObsel);
					
					if(matchedRule) {
						let obselHistogramBar = this._getObselHistogramBar(histogramData, anObsel);
						let subdivisionFound = false;

						for(let j = 0; !subdivisionFound && (j < obselHistogramBar.subdivisions.length); j++)
							if(obselHistogramBar.subdivisions[j].id == matchedRule.id) {
								obselHistogramBar.subdivisions[j].amount += this.durationHistogram?(anObsel.end - anObsel.begin):1;
								subdivisionFound = true;
							}

						if(!subdivisionFound) {
							let newSubDivision = {
								id: matchedRule.id,
								rank: this._currentStylesheet.get_rule_rank(matchedRule),
								visible: matchedRule.visible,
								amount: this.durationHistogram?(anObsel.end - anObsel.begin):1
							};

							if(matchedRule.symbol.symbol)
								newSubDivision.symbol = matchedRule.symbol.symbol;
							else if(matchedRule.symbol.shape)
								newSubDivision.shape = matchedRule.symbol.shape;

							if(matchedRule.symbol.color)
								newSubDivision.color = matchedRule.symbol.color;

							obselHistogramBar.subdivisions.push(newSubDivision);
						}
					}
					else
						obselEventNode.setAttribute("visible", false);
				}
				else
					this.emitErrorEvent(new Error("Could not found event node for obsel " + anObsel.id));
			}
			
			// --- re-instanciate histogram bars ---
			const histogramFragment = document.createDocumentFragment();

			for(let i = 0; i < histogramData.length; i++) {
				const barData = histogramData[i];

				const bar = document.createElement("ktbs4la2-timeline-histogram-bar");
					bar.setAttribute("begin", barData.begin.getTime());
					bar.setAttribute("end", barData.end.getTime());

					if(this.normalizeHistogram)
						bar.setAttribute("normalized", "true");

					if(this.durationHistogram)
						bar.setAttribute("show-duration", "true");

					barData.subdivisions.sort((subdivA, subdivB) => {
						return subdivA.rank - subdivB.rank;
					});

					for(let j = 0; j < barData.subdivisions.length; j++) {
						const subDivData = barData.subdivisions[j];
						const subdiv = document.createElement("ktbs4la2-timeline-histogram-bar-subdivision");
						subdiv.setAttribute("label", subDivData.id);
						subdiv.setAttribute("amount", subDivData.amount);

						if(subDivData.symbol)
							subdiv.setAttribute("symbol", subDivData.symbol);
						else if(subDivData.shape)
							subdiv.setAttribute("shape", subDivData.shape);

						if(subDivData.color)
							subdiv.setAttribute("color", subDivData.color);

						bar.appendChild(subdiv);
					}
				histogramFragment.appendChild(bar);
			}

			this._timeline.appendChild(histogramFragment);
			// ---
			
			this._lastHistogramUpdateZoomLevel = this._timeline.zoomLevel;
		});
	}

	/**
	 * 
	 */
	_requestUpdateHistogram() {
		if(this._updateHistogramTaskID)
			delete this._updateHistogramTaskID;

		this._updateHistogramTaskID = setTimeout(() => {
			Promise.all([this._timeline._componentReady, this._timeline._timeDivisionsInitialized, this._timeline._zoomInitialized]).then(() => {
				this._updateHistogram();
				delete this._updateHistogramTaskID;
			}).catch(() => {});
		});
	}

	/**
	 * 
	 */
	_onTimelineViewChanged(event) {
		if(event.detail.zoomLevel != this._lastHistogramUpdateZoomLevel)
			this._requestUpdateHistogram();
	}

	/**
	 * 
	 */
	_applyStyleSheet(stylesheet, emit_event = false) {
		this._currentStylesheet = stylesheet;
		let reserved_ids = this._getStylesheetsIDs();

		// update reserved-ids attribute of stylesheet-id-input
		const stylesheet_id_index = reserved_ids.indexOf(stylesheet.name);

		if(stylesheet_id_index != -1)
			reserved_ids.splice(stylesheet_id_index, 1);

		this._stylesheetIdInput.reserved_ids = reserved_ids;
		// ---

		// update 
		for(let i = 0; i < this._styleSheetSelector.options.length; i++) {
			const anOption = this._styleSheetSelector.options[i];

			if((anOption.id == stylesheet.name) || ((i == 0) && stylesheet.automatically_generated)) {
				this._currentStylesheet_rank = i;

				if(!anOption.selected)
					anOption.selected = true;

				break;
			}
		}
		// ---

		this._stylesheetIdInput.setAttribute("value", stylesheet.name);

		// rebuild the legend
		this._rebuildLegend(stylesheet);

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
		
		this._requestUpdateHistogram();

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

		if(obselType)
			obselTypeLabel = obselType.get_preferred_label(this._lang);
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
	_obselIdIsAlreadyInstanciated(obsel_id) {
		let start = 0;
		let end = this._already_instanciated_obsels_ids.length - 1;

		while (start <= end) {
			let middle = Math.floor((start + end) / 2);

			if(this._already_instanciated_obsels_ids[middle] == obsel_id) // found the obsel id
				return true;
			else if(this._already_instanciated_obsels_ids[middle] < obsel_id) // continue searching to the right
				start = middle + 1;
			else // search searching to the left
				end = middle - 1;
		}

		// obsel wasn't found
		return false;
	}

	/**
	 * 
	 */
	get allow_split_trace() {
		return (
				!this.hasAttribute("allow-split-trace")
			||	(
					(this.getAttribute("allow-split-trace") != "0")
				&&	(this.getAttribute("allow-split-trace") != "false")
			)
		);
	}

	/**
	 * 
	 */
	get allow_compare() {
		return (
				!this.hasAttribute("allow-compare")
			||	(
					(this.getAttribute("allow-compare") != "0")
				&&	(this.getAttribute("allow-compare") != "false")
			)
		);
	}

	/**
	 * 
	 */
	set allow_split_trace(new_value) {
		if(new_value instanceof Boolean) {
			if(new_value && !this.allow_split_trace) {
				this.removeAttribute("allow-split-trace");
			}
			else if(!new_value && this.allow_split_trace)
				this.setAttribute("allow-split-trace", "false");
		}
		else
			throw new TypeError("Value for property allow_split_trace MUST be a boolean");
	}

	/**
	 * 
	 */
	 get show_mode_buttons() {
		return (
				!this.hasAttribute("show-mode-buttons")
			||	(
					(this.hasAttribute("show-mode-buttons") != "0")
				&&	(this.hasAttribute("show-mode-buttons") != "false")
			)
		);
	}

	/**
	 * 
	 */
	set show_mode_buttons(new_value) {
		if(new_value instanceof Boolean) {
			if(new_value && !this.show_mode_buttons) {
				this.removeAttribute("show-mode-buttons");
			}
			else if(!new_value && this.show_mode_buttons)
				this.setAttribute("show-mode-buttons", "false");
		}
		else
			throw new TypeError("Value for property show_mode_buttons MUST be a boolean");
	}

	/**
	 * 
	 */
	_addObsels(obsels) {
		let eventsFragment = document.createDocumentFragment();
		let filterStylesheetRule;

		if(
				this._model
			&&	this.hasAttribute("filter-stylesheet")
			&&	this.hasAttribute("filter-stylesheet-rule")) {
				for(let i = 0; i < this._model.stylesheets.length; i++) {
					const aStylesheet = this._model.stylesheets[i];

					if(aStylesheet.name == this.getAttribute("filter-stylesheet")) {
						for(let j = 0; j < aStylesheet.rules.length; j++) {
							const aRule = aStylesheet.rules[j];

							if(aRule.id == this.getAttribute("filter-stylesheet-rule")) {
								filterStylesheetRule = aRule;
								break;
							}
						}

						break;
					}
				}
		}
		
		for(let i = 0; i < obsels.length; i++) {
			let obsel = obsels[i];
			let filterObselOut = false;

			if(filterStylesheetRule && this._model)
				filterObselOut = !filterStylesheetRule.matchedByObsel(obsel);

			// we check for duplicates with previously instanciated obsels
			if(!filterObselOut && !this._obselIdIsAlreadyInstanciated(obsel.id)) {
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
				this._already_instanciated_obsels_ids.push(obsel.id);
				this._already_instanciated_obsels_ids.sort();
				this._obsels.push(obsel);
			}
		}

		this._timeline.appendChild(eventsFragment);

		if(this._currentStylesheet)
			this._requestUpdateHistogram();
	}

	/**
	 * 
	 */
	_onObselListQueryFailed(error) {
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
	_onObselListQueryResponse(queryResponse) {
		this._componentReady.then(() => {
			if(this._expectedObselCount) {
				let currentObselCount = this._obsels.length + queryResponse.obsels.length;
				let loadedObselsPercentage = (currentObselCount / this._expectedObselCount) * 100;
				this._progressBar.style.width = loadedObselsPercentage + "%";
				this._loadingStatusIcon.setAttribute("title", this._translateString("Loading") + " (" + Math.floor(loadedObselsPercentage) + "%)");
			}

			setTimeout(() => {
				this._addObsels(queryResponse.obsels);

				if(!queryResponse.nextPageLinkAfter)
					this._resolveAllObselsLoaded();
			});
		});
		
		if(queryResponse.nextPageLinkAfter) {
			setTimeout(() => {
				if(!this._obselsLoadingAbortController.signal.aborted)
					this._trace.obsel_list.query({limit: 100, after: queryResponse.nextPageLinkAfter}, this._obselsLoadingAbortController.signal)
						.then(this._onObselListQueryResponse.bind(this))
						.catch((error) => {
							if(!(error instanceof DOMException) && (error.name !== "AbortError") && !this._obselsLoadingAbortController.signal.aborted)
								this._onObselListQueryFailed(error);
						});
			});
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
		this._splitButton.setAttribute("title", this._translateString("Split"));
		this._editStylesheetButton.setAttribute("title", this._translateString("Edit this stylesheet"));
		this._saveStylesheetButton.setAttribute("title", this._translateString("Save this stylesheet"));
		this._cancelStylesheetModificationsButton.setAttribute("title", this._translateString("Cancel modifications of this stylesheet"));
		this._duplicateStylesheetButton.setAttribute("title", this._translateString("Duplicate this stylesheet"));
		this._createMethodFromStylesheetButton.setAttribute("title", this._translateString("Store this stylesheet's rules in a method"));
		this._deleteStylesheetButton.setAttribute("title", this._translateString("Delete this stylesheet"));
		this._waitMessage.innerText = this._translateString("Waiting for server response...");
		this._emptyMessage.innerText = this._translateString("No obsel to display");
		this._timeline.setAttribute("lang", this._lang);
		this._styleEditInput.setAttribute("lang", this._lang);
		this._closeStyleEditPopupButton.setAttribute("title", this._translateString("Close"));
		this._cancelStyleModificationsButton.setAttribute("title", this._translateString("Cancel modifications of this style"));
		this._duplicateStyleButton.setAttribute("title", this._translateString("Duplicate this style"));
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

		this._viewObselModeButton.setAttribute("title", this._translateString("Obsels detail view"));
		this._viewHistogramModeButton.setAttribute("title", this._translateString("Histogram view"));
		this._histogramOptionDurationLabel.innerText = this._translateString("Duration");
		this._histogramOptionNormalizeLabel.innerText = this._translateString("Normalize");
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

	/**
	 * 
	 */
	get viewMode() {
		if(
				this.hasAttribute("view-mode") 
			&& 	(
					(this.getAttribute("view-mode") == "obsels-detail")
				||	(this.getAttribute("view-mode") == "histogram")
			)
		)
				return this.getAttribute("view-mode");
		else
				return "obsels-detail";
	}

	/**
	 * 
	 */
	set viewMode(newValue) {
		if(
				(newValue == "obsels-detail")
			||	(newValue == "histogram")
		)
			this.setAttribute("view-mode", newValue);
		else
			throw new RangeError("New value for property \"viewMode\" must be either \"obsels-detail\" or \"histogram\"");
	}

	/**
	 * 
	 */
	_onClickViewHistogramModeButton(event) {
		if(this.viewMode != "histogram")
			this.viewMode = "histogram";

		this.dispatchEvent(
			new CustomEvent("set-viewmode", {
				bubbles: true,
				cancelable: false,
				composed: true,
				detail : {view_mode: this.viewMode}
			})
		);
	}

	/**
	 * 
	 */
	_onClickViewObselModeButton(event) {
		if(this.viewMode != "obsels-detail")
			this.viewMode = "obsels-detail";

		this.dispatchEvent(
			new CustomEvent("set-viewmode", {
				bubbles: true,
				cancelable: false,
				composed: true,
				detail : {view_mode: this.viewMode}
			})
		);
	}

	/**
	 * 
	 */
	get normalizeHistogram() {
		return this._histogramOptionNormalizeCheckbox.checked;
	}

	/**
	 * 
	 */
	set normalizeHistogram(newValue) {
		if(newValue instanceof Boolean)
			this._histogramOptionNormalizeCheckbox.checked = newValue;
		else
			throw new TypeError("The value for property \"normalizeHistogram\" must be a boolean");
	}

	/**
	 * 
	 */
	get durationHistogram() {
		return this._histogramOptionDurationCheckbox.checked;
	}

	/**
	 * 
	 */
	set durationHistogram(newValue) {
		if(newValue instanceof Boolean)
			this._histogramOptionDurationCheckbox.checked = newValue;
		else
			throw new TypeError("The value for property \"durationHistogram\" must be a boolean");
	}

	/**
	 * 
	 */
	_onchangeHistogramOptionDurationCheckbox(event) {
		this._requestUpdateHistogram();

		this.dispatchEvent(
			new CustomEvent("histogram-set-duration-option", {
				bubbles: true,
				cancelable: false,
				composed: true,
				detail : {duration: this._histogramOptionDurationCheckbox.checked}
			})
		);
	}

	/**
	 * 
	 */
	_onchangeHistogramOptionNormalizeCheckbox(event) {
		this._requestUpdateHistogram();

		this.dispatchEvent(
			new CustomEvent("histogram-set-normalize-option", {
				bubbles: true,
				cancelable: false,
				composed: true,
				detail : {normalize: this._histogramOptionNormalizeCheckbox.checked}
			})
		);
	}
}

customElements.define('ktbs4la2-trace-timeline', KTBS4LA2TraceTimeline);