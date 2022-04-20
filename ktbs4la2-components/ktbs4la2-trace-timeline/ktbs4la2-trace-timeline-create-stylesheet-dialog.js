import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

import {Trace} from "../../ktbs-api/Trace.js";
import {ResourceMultiton} from "../../ktbs-api/ResourceMultiton.js";
import {Stylesheet} from "../../ktbs-api/Stylesheet.js";
import {HubbleRule} from "../../ktbs-api/HubbleRule.js";
import {HubbleSubRule} from "../../ktbs-api/HubbleSubRule.js";
import {HubbleAttributeConstraint} from "../../ktbs-api/HubbleAttributeConstraint.js";
import {AttributeType} from "../../ktbs-api/AttributeType.js";

import "../ktbs4la2-resource-id-input/ktbs4la2-resource-id-input.js";

import {getDistinctColor} from "../common/colors-utils.js";

/**
 * 
 */
class KTBS4LA2TraceTimelineCreateStylesheetDialog extends TemplatedHTMLElement {

    /**
	 * 
	 */
	constructor() {
        super(import.meta.url, true, true);

        this._resolveUriSet;
        this._rejectUriSet;

        this._uriSet = new Promise((resolve, reject) => {
            this._resolveUriSet = resolve;
            this._rejectUriSet = reject;
        });

        this._uriSet.then(this._initTrace.bind(this));
    }

    /**
	 * 
	 */
	onComponentReady() {
        this._form = this.shadowRoot.querySelector("#form");
        this._titleTag = this.shadowRoot.querySelector("#title");
        this._idInputLabel = this.shadowRoot.querySelector("#stylesheet-id-input-label");
        this._idInput = this.shadowRoot.querySelector("#stylesheet-id-input");
        this._idInput.addEventListener("input", this._onChangeIdInput.bind(this));
        this._idInput.addEventListener("change", this._onChangeIdInput.bind(this));
        this._stylesheetDescriptionTextarea = this.shadowRoot.querySelector("#stylesheet-description-textarea");
        this._stylesheetDescriptionTextarea.addEventListener("input", this._onChangeDescriptionTextarea.bind(this));
        this._stylesheetDescriptionTextarea.addEventListener("change", this._onChangeDescriptionTextarea.bind(this));
        this._createMethodRadioEmpty = this.shadowRoot.querySelector("#create-method-radio-empty");
        this._createMethodRadioEmptyLabel = this.shadowRoot.querySelector("#create-method-radio-empty-label");
        this._createMethodRadioDistinctValues = this.shadowRoot.querySelector("#create-method-radio-distinct-values");
        this._createMethodRadioDistinctValuesLabel = this.shadowRoot.querySelector("#create-method-radio-distinct-values-label");
        this._createMethodRadioEmpty.addEventListener("change", this._onChangeCreateMethodRadio.bind(this));
        this._createMethodRadioDistinctValues.addEventListener("change", this._onChangeCreateMethodRadio.bind(this));
        this._criteriasFieldset = this.shadowRoot.querySelector("#criterias");
        this._addCriteriaParagraph = this.shadowRoot.querySelector("#add-criteria-paragraph");
        this._addCriteriaButton = this.shadowRoot.querySelector("#add-criteria");
        this._addCriteriaButton.addEventListener("click", this._onClickAddCriteriaButton.bind(this));
        this._createEmptyValueRulesCheckbox = this.shadowRoot.querySelector("#create-empty-value-rules");
        this._createEmptyValueRulesCheckbox.addEventListener("change", this._onChangeCreateEmptyValueRulesCheckbox.bind(this));
        this._messageP = this.shadowRoot.querySelector("#message");
        this._validateButton = this.shadowRoot.querySelector("#validate");
        this._validateButton.addEventListener("click", this._onClickValidateButton.bind(this));
        this._cancelButton = this.shadowRoot.querySelector("#cancel");
        this._cancelButton.addEventListener("click", this._onClickCancelButton.bind(this));
        this._addCriteriaSelector();
        this._updateStylesheetData();
    }

    /**
     * 
     */
    _onChangeIdInput(event) {
        if(!this._idInput.checkValidity())
            this._idInput.reportValidity();
        
        this._updateStylesheetData();
        this._updateValidateButton();
    }

    /**
     * 
     */
    _onChangeDescriptionTextarea(event) {
        this._updateStylesheetData();
    }

    /**
     * 
     */
    _onChangeCreateMethodRadio(event) {
        if(this._createMethodRadioDistinctValues.checked) {
            if(this._criteriasFieldset.classList.contains("hidden"))
                this._criteriasFieldset.classList.remove("hidden");
        }
        else {
            if(!this._criteriasFieldset.classList.contains("hidden"))
                this._criteriasFieldset.classList.add("hidden");
        }

        this._updateStylesheetData();
        this._updateValidateButton();
    }

    /**
     * 
     */
    _onClickValidateButton(event) {
        event.preventDefault();
        event.stopPropagation();

        if(this.checkValidity() && this._stylesheet) {
            this.dispatchEvent(
                new CustomEvent(
                    "validate-stylesheet-creation-dialog", {
                        bubbles: false,
                        composed: true,
                        cancelable: true,
                        detail: {
                            stylesheet: this._stylesheet
                        }
                    })
            );
        }
    }

    /**
     * 
     */
    _onClickCancelButton(event) {
        this.dispatchEvent(
            new CustomEvent(
                "cancel-stylesheet-creation-dialog", {
                    bubbles: false,
                    composed: true,
                    cancelable: true
                })
        );
    }

    /**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
        observedAttributes.push("trace-uri");
        observedAttributes.push("reserved-ids");
		return observedAttributes;
    }

    /**
     * 
     */
    _initTrace() {
        this._resolveTraceReady;
        this._rejectTraceReady;

        this._traceReady = new Promise((resolve, reject) => {
            this._resolveTraceReady = resolve;
            this._rejectTraceReady = reject;
        });

        this._resolveModelReady;
        this._rejectModelReady;

        this._modelReady = new Promise((resolve, reject) => {
            this._resolveModelReady = resolve;
            this._rejectModelReady = reject;
        });

        this._trace = ResourceMultiton.get_resource(Trace, this.getAttribute("trace-uri"));

        this._trace.get(this._abortController.signal)
            .then(() => {
                this._model = this._trace.model;

                this._model.get(this._abortController.signal)
                    .then(this._resolveModelReady.bind(this))
                    .catch(this._rejectModelReady.bind(this));

                this._resolveTraceReady();
            })
            .catch(this._rejectTraceReady.bind(this));
    }

    /**
     * 
     */
    _resetTrace() {
        if(this._traceReady)
            delete this._traceReady;
        
        if(this._resolveTraceReady)
            delete this._resolveTraceReady;

        if(this._rejectTraceReady)
            delete this._rejectTraceReady;

        if(this._trace)
            delete this._trace;

        if(this._modelReady)
            delete this._modelReady;
        
        if(this._resolveModelReady)
            delete this._resolveModelReady;

        if(this._rejectModelReady)
            delete this._rejectModelReady;

        if(this._model)
            delete this._model;
    }
    
    /**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

        if(attributeName == "trace-uri") {
            if(newValue)
			    this._resolveUriSet();
        }

        if(attributeName == "reserved-ids") {
            if(newValue)
                this._componentReady.then(() => {
                    this._idInput.setAttribute("reserved-ids", newValue);
                });
            else
                this._componentReady.then(() => {
                    if(this._idInput.hasAttribute("reserved-ids"))
                        this._idInput.removeAttribute("reserved-ids");
                });
        }
    }

    /**
     * 
     */
    _onClickAddCriteriaButton(event) {
        this._addCriteriaSelector();
    }

    /**
     * 
     */
    _addCriteriaSelector() {
        Promise.all([this._componentReady, this._traceReady, this._modelReady])
            .then(() => {
                const isFirstCriteria = (this._criteriasFieldset.querySelectorAll("p.criteria").length == 0);

                const selectorFragment = document.createDocumentFragment();
                    const p = document.createElement("p");
                        p.classList.add("criteria");

                        const select = document.createElement("select");
                            const obselTypeOption = document.createElement("option");
                                obselTypeOption.value = "obseltype";
                                obselTypeOption.innerText = this._translateString("Obsel type");
                            select.appendChild(obselTypeOption);

                            const option = document.createElement("option");
                                option.value = "attribute-id";
                                option.innerText = this._translateString("Attribute : ") + this._translateString("Obsel ID");
                            select.appendChild(option);

                            const builtin_attribute_types = AttributeType.builtin_attribute_types;

                            for(let i = 0; i < builtin_attribute_types.length; i++) {
                                const anAttributeType = builtin_attribute_types[i];

                                const option = document.createElement("option");
                                    option.value = "attribute-" + anAttributeType.id;
                                    option.innerText = this._translateString("Attribute : ") + anAttributeType.get_preferred_label(this._lang);
                                select.appendChild(option);
                            }

                            const model_attribute_types = this._model.attribute_types;

                            for(let i = 0; i < model_attribute_types.length; i++) {
                                const anAttributeType = this._model.attribute_types[i];

                                const option = document.createElement("option");
                                    option.value = "attribute-" + anAttributeType.id;
                                    option.innerText = this._translateString("Attribute : ") + anAttributeType.get_preferred_label(this._lang);
                                select.appendChild(option);
                            }

                            select.addEventListener("change", this._onChangeSelect.bind(this));
                        p.appendChild(select);

                        if(!isFirstCriteria) {
                            const deleteButton = document.createElement("button");
                                deleteButton.innerText = "❌";
                                deleteButton.classList.add("remove-criteria-button");
                                deleteButton.setAttribute("title", this._translateString("Remove"));
                                deleteButton.addEventListener("click", this._onClickRemoveCriteriaButton.bind(this));
                            p.appendChild(deleteButton);

                            p.classList.add("with-remove-button");
                        }
                    selectorFragment.appendChild(p);
                this._criteriasFieldset.insertBefore(selectorFragment, this._addCriteriaParagraph);

                this._updateStylesheetData();
                this._updateValidateButton();
            })
            .catch(this.emitErrorEvent.bind(this));
    }

    /**
     * 
     */
    _onClickRemoveCriteriaButton(event) {
        event.target.closest("p.criteria").remove();
        this._updateStylesheetData();
        this._updateValidateButton();
    }

    /**
     * 
     */
    _onChangeSelect(event) {
        this._updateStylesheetData();
        this._updateValidateButton();
    }

    /**
     * 
     */
    _onChangeCreateEmptyValueRulesCheckbox(event) {
        this._updateStylesheetData();
    }

    /**
     * 
     */
    _updateStylesheetData() {
        Promise.all([this._componentReady, this._traceReady, this._modelReady])
            .then(() => {
                if(this._stylesheet)
                    delete this._stylesheet;
                
                this._stylesheet = new Stylesheet();
                this._stylesheet.name = this._idInput.value;
                this._stylesheet.description = this._stylesheetDescriptionTextarea.value;

                if(this._createMethodRadioDistinctValues.checked) {
                    if(this._checkCriteriasValidity()) {
                        const selects = this._criteriasFieldset.querySelectorAll("select");
                        this._distinctValues = new Array();
                        const allValuesFoundPromises = new Array();

                        for(let i = 0; i < selects.length; i++) {
                            const aCriteria = selects[i].value;

                            if(aCriteria == "obseltype") {
                                let group = new Array();

                                for(let j = 0; j < this._model.obsel_types.length; j++) {
                                    group.push({
                                        type: "obseltype",
                                        value: this._model.obsel_types[j].id
                                    });
                                }

                                if(this._createEmptyValueRulesCheckbox.checked)
                                    group.push({
                                        type: "obseltype",
                                        value: ""
                                    });
                                
                                this._distinctValues.push(group);
                            }
                            else if(aCriteria.startsWith("attribute-")) {
                                const attribute_type_id = (aCriteria.substring(10) == "id")?"@id":aCriteria.substring(10);
                                const aPromise = this._trace.obsel_list.list_attribute_type_distinct_values_by_atrribute_id(attribute_type_id, this._abortController.signal, this._trace.credentials);
                                allValuesFoundPromises.push(aPromise);
                                
                                aPromise
                                    .then((values) => {
                                        if(this._createEmptyValueRulesCheckbox.checked)
                                            values.push("");

                                        let group = new Array();

                                        for(let j = 0; j < values.length; j++) {
                                            group.push({
                                                type: "attributetype",
                                                attribute_type: attribute_type_id,
                                                value: values[j]
                                            });
                                        }

                                        this._distinctValues.push(group);
                                    })
                                    .catch(this.emitErrorEvent.bind(this));
                            }
                            else
                                this.emitErrorEvent(new Error("Unknown criteria value \"" + aCriteria + "\""));
                        }

                        Promise.all(allValuesFoundPromises)
                            .then(() => {
                                const combinations = this._cartesian(...this._distinctValues);
                                const rules = new Array();
                                let distinctValuesGroupRankToUseForAutomaticColor;

                                for(let i = 0; i < combinations.length; i++) {
                                    const aRule = new HubbleRule({}, this._stylesheet);
                                    aRule.symbol = new Object();
                                    
                                    const aSubRule = new HubbleSubRule({}, aRule);
                                    const criterias = (combinations[i] instanceof Array)?combinations[i]:[combinations[i]];
                                    const subrules_labels = [];

                                    for(let j = 0; j < criterias.length; j++) {
                                        const aCriteria = criterias[j];

                                        if(aCriteria.type == "obseltype") {
                                            const obselTypeID = aCriteria.value;
                                            const obselType = this._model.get_obsel_type(obselTypeID);

                                            if(obselType) {
                                                aSubRule.type = obselType.uri.toString();
                                                subrules_labels.push(obselType.get_preferred_label(this._lang));

                                                if(obselType.suggestedSymbol)
                                                    aRule.symbol.symbol = obselType.suggestedSymbol;
                                                else if(obselType.suggestedColor)
                                                    aRule.symbol.color = obselType.suggestedColor;
                                            }
                                            else {
                                                aSubRule.type = new URL(this._model.uri + "#" + aCriteria.value).toString();
                                                subrules_labels.push("ObselType=" + aCriteria.value);
                                            }
                                        }
                                        else {
                                            const constraint = new HubbleAttributeConstraint({});
                                            const attributeTypeId = aCriteria.attribute_type;
                                            const attributeType = this._model.get_attribute_type(attributeTypeId);
                                            constraint.operator = "==";
                                            constraint.value = aCriteria.value;

                                            if(attributeType) {
                                                constraint.uri = attributeType.uri;
                                                subrules_labels.push(attributeType.get_preferred_label(this._lang) + "=" + aCriteria.value);
                                            }
                                            else {
                                                constraint.uri = new URL(this._model.uri + "#" + attributeTypeId);
                                                subrules_labels.push(attributeTypeId + "=" + aCriteria.value);
                                            }

                                            if(!aRule.symbol.color && !distinctValuesGroupRankToUseForAutomaticColor)
                                                distinctValuesGroupRankToUseForAutomaticColor = j;

                                            aSubRule.attributes = [constraint];
                                        }
                                    }

                                    if(!aRule.symbol.color) {
                                        let rankwithingroup;
                                        let groupsize;

                                        if(distinctValuesGroupRankToUseForAutomaticColor) {
                                            groupsize = this._distinctValues[distinctValuesGroupRankToUseForAutomaticColor].length;
                                            rankwithingroup = i%groupsize;
                                        }
                                        else {
                                            rankwithingroup = i;
                                            groupsize = combinations.length;
                                        }

                                        aRule.symbol.color = getDistinctColor(rankwithingroup, groupsize);
                                    }
                                    
                                    if(!aRule.symbol.shape)
                                        aRule.symbol.shape = "duration-bar";
                                    
                                    aRule.id = subrules_labels.join(", ");
                                    aRule.rules = [aSubRule];
                                    rules.push(aRule);
                                }

                                this._stylesheet.rules = rules;

                                this._messageP.innerText = "=> " + combinations.length + this._translateString(" styles will be created");

                                if(this._messageP.classList.contains("hidden"))
                                    this._messageP.classList.remove("hidden");
                            })
                            .catch(this.emitErrorEvent.bind(this));
                    }
                    else {
                        if(!this._messageP.classList.contains("hidden"))
                            this._messageP.classList.add("hidden");

                        this._reportCriteriasValidity();
                    }
                }
            })
            .catch(this.emitErrorEvent.bind(this));
    }

    /**
     * 
     */
    _cartesian(...a) {
        return a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._titleTag.innerText = this._translateString("Create a new stylesheet");
        this._idInputLabel.innerText = this._translateString("ID :");
        this._createMethodRadioEmptyLabel.innerText = this._translateString("Empty");
        this._createMethodRadioDistinctValuesLabel.innerText = this._translateString("Create a style for each combination of distinct values from...");
        this._addCriteriaButton.setAttribute("title", this._translateString("Add a criteria"));
        this._validateButton.innerText = this._translateString("Create");
        this._cancelButton.innerText = this._translateString("Cancel");
    }

    /**
     * 
     */
    _updateValidateButton() {
        if(this.checkValidity()) {
            if(this._validateButton.disabled)
                this._validateButton.disabled = false;
        }
        else {
            if(!this._validateButton.disabled)
                this._validateButton.disabled = true;
        }
    }

    /**
     * 
     */
    _checkCriteriasValidity() {
        const selects = this._criteriasFieldset.querySelectorAll("select");

        if(selects.length >= 1) {
            const distinctValues = new Array();

            for(let i = 0; i < selects.length; i++) {
                const aSelect = selects[i];
                const aCriteria = aSelect.value;

                if(
                    (
                            aCriteria == "obseltype"
                        ||  aCriteria.startsWith("attribute-")
                    )
                    &&  !distinctValues.includes(aCriteria)
                ) {
                    distinctValues.push(aCriteria);
                    aSelect.setCustomValidity("");
                }
                else {
                    aSelect.setCustomValidity(this._translateString("This criteria is a duplicate of a previous one. Please choose another value"));
                    return false;
                }
            }
        }
        else
            return false;

        return true;
    }

    /**
     * 
     */
    _reportCriteriasValidity() {
        const selects = this._criteriasFieldset.querySelectorAll("select");

        for(let i = 0; i < selects.length; i++) {
            const aSelect = selects[i];

            if(!aSelect.checkValidity()) {
                aSelect.reportValidity();
                break;
            }
        }
    }

    /**
     * 
     */
    checkValidity() {
        if(this._idInput && this._criteriasFieldset) {
            if(this._idInput.checkValidity()) {
                if(this._createMethodRadioDistinctValues.checked)
                    return this._checkCriteriasValidity();
                else
                    return true;
            }
            else
                return false;
        }
        else
            return false;
    }


}

customElements.define('ktbs4la2-trace-timeline-create-stylesheet-dialog', KTBS4LA2TraceTimelineCreateStylesheetDialog);