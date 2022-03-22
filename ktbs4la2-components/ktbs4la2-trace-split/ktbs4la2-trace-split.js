import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {KtbsError} from "../../ktbs-api/Errors.js";
import {Stylesheet} from "../../ktbs-api/Stylesheet.js";
import {HubbleRule} from "../../ktbs-api/HubbleRule.js";
import {HubbleSubRule} from "../../ktbs-api/HubbleSubRule.js";

import "../ktbs4la2-trace-timeline/ktbs4la2-trace-timeline.js";
import "../ktbs4la2-trace-timeline-synchronizer/ktbs4la2-trace-timeline-synchronizer.js";

import {getDistinctColor} from "../common/colors-utils.js";

/**
 * 
 */
class KTBS4LA2TraceSplit extends KtbsResourceElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true);
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
		let obselTypes = this._ktbsResource.model.obsel_types;
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
	_onKtbsResourceSyncInSync() {
		this._componentReady.then(() => {
            this._ktbsResource.model.get(this._abortController.signal)
                .then(() => {
                    let splitStylesheet;
                    const modelStylesheets = this._ktbsResource.model.stylesheets;
                    modelStylesheets.unshift(this._generateDefaultStylesheetFromModel());

                    for(let i = 0; i < modelStylesheets.length; i++) {
                        const aStylesheet = modelStylesheets[i];

                        if(aStylesheet.name == this.getAttribute("split-stylesheet")) {
                            splitStylesheet = aStylesheet;
                            break;
                        }
                    }

                    if(splitStylesheet) {
                        for(let i = 0; i < splitStylesheet.rules.length; i++) {
                            const aRule = splitStylesheet.rules[i];

                            const aDiv = document.createElement("div");
                                aDiv.classList.add("timeline-div");

                                const divTitle = document.createElement("h2");
                                    divTitle.innerText = aRule.id;
                                aDiv.appendChild(divTitle);

                                const aTimeLine = document.createElement("ktbs4la2-trace-timeline");
                                    aTimeLine.setAttribute("uri", this.getAttribute("uri"));
                                    aTimeLine.setAttribute("resource-type", this.getAttribute("resource-type"));
                                    aTimeLine.setAttribute("filter-stylesheet", splitStylesheet.name);
                                    aTimeLine.setAttribute("filter-stylesheet-rule", aRule.id);
                                    aTimeLine.setAttribute("stylesheet", this.getAttribute("display-stylesheet"));
                                    aTimeLine.setAttribute("allow-edit-stylesheet", "false");
                                    aTimeLine.setAttribute("allow-split-trace", "false");

                                    if(i != 0) {
                                        aTimeLine.setAttribute("allow-change-stylesheet", "false");
                                        aTimeLine.setAttribute("show-stylesheet-legend", "false");
                                        aTimeLine.setAttribute("show-mode-buttons", "false");
                                    }

                                    if(this.hasAttribute("view-mode"))
                                        aTimeLine.setAttribute("view-mode", this.getAttribute("view-mode"));

                                aDiv.appendChild(aTimeLine);
                            this._timelineSynchronizer.appendChild(aDiv);
                        }
                    }
                    else
                        this.emitErrorEvent(new KtbsError("Cannot find stylesheet \"" + this.getAttribute("split-stylesheet") + "\""));
                })
                .catch(this.emitErrorEvent);
        })
		.catch(this.emitErrorEvent);
	}

	/**
	 * 
	 */
	onComponentReady() {
        this._timelineSynchronizer = this.shadowRoot.querySelector("#timeline-synchronizer");
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        // ...
    }
}

customElements.define('ktbs4la2-trace-split', KTBS4LA2TraceSplit);