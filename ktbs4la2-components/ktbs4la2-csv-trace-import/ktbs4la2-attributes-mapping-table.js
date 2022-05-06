import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

import {ObselType} from '../../ktbs-api/ObselType.js';

import "../ktbs4la2-resource-id-input/ktbs4la2-resource-id-input.js";
import "../ktbs4la2-multiple-translations-text-input/ktbs4la2-multiple-translations-text-input.js";

/**
 * 
 */
class KTBS4LA2AttributesMappingTable extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true);

        this._tableColsCount = 0;
    }

    /**
	 * 
	 */
    onComponentReady() {
        this._tableHeaderTemplate = this.shadowRoot.querySelector("#table-header-template");
        this._doNotImportColsStyle = this.shadowRoot.styleSheets[1];
        this._table = this.shadowRoot.querySelector("table");
        this._caption = this.shadowRoot.querySelector("table caption");
        this._captionLabel1 = this.shadowRoot.querySelector("#caption-label-1");
        this._discriminatingColumnLabel = this.shadowRoot.querySelector("#discriminating-column-label");
        this._captionLabel2 = this.shadowRoot.querySelector("#caption-label-2");
        this._valueLabel = this.shadowRoot.querySelector("#value-label");
        this._headerRow = this.shadowRoot.querySelector("table thead tr");
        this._body = this.shadowRoot.querySelector("table tbody");
    }

    /**
     * 
     */
    get body() {
        return this._body;
    }

    /**
     * 
     */
    set discriminatingColumnIndex(newValue) {
        this._discriminatingColumnIndex = newValue;

        this._componentReady.then(() => {
            if(this._discriminatingColumnLabel.innerText.trim() == "")
                this._discriminatingColumnLabel.innerText = newValue;

            if(this._caption.classList.contains("hidden"))
                this._caption.classList.remove("hidden");
        });
    }

    /**
     * 
     */
    get discriminatingColumnIndex() {
        return this._discriminatingColumnIndex;
    }

    /**
     * 
     */
    set discriminatingColumnLabel(newValue) {
        this._componentReady.then(() => {
            this._discriminatingColumnLabel.innerText = newValue;

            if(this._caption.classList.contains("hidden"))
                this._caption.classList.remove("hidden");
        });
    }

    /**
     * 
     */
    set discriminatingValue(newValue) {
        this._discriminatingValue = newValue;

        this._componentReady.then(() => {
            this._valueLabel.innerText = newValue;
        });
    }

    /**
     * 
     */
    get discriminatingValue() {
        return this._discriminatingValue;
    }

    /**
     * 
     */
    get allow_create_new() {
        return (
                !this.hasAttribute("allow-create-new")
            ||  (
                    (this.getAttribute("allow-create-new") != "1")
                &&  (this.getAttribute("allow-create-new") != "true")
            )
        );
    }

    /**
     * 
     */
    set allow_create_new(newValue) {
        if(newValue != null)
            this.setAttribute("allow-create-new", newValue);
        else
            if(this.hasAttribute("allow-create-new"))
                this.removeAttribute("allow-create-new");
    }

    /**
     * 
     */
     get last_data_row() {
        return this._body.querySelector("tr:last-child");
    }

    /**
     * 
     */
    get data_rows_count() {
        return this._body.querySelectorAll("tr").length;
    }

    /** 
     * 
     */
    get value() {
        const allMappings = new Array();

        if(this._body) {
            const headerCells = this._headerRow.querySelectorAll("th");

            for(let i = 0; (i < headerCells.length); i++) {
                const aHeaderCell = headerCells[i];
                const mappingTypeSelect = aHeaderCell.querySelector(".mapping-type-select");
                const aMapping = {};

                switch(mappingTypeSelect.value) {
                    case "<do-not-import>" :
                        aMapping.mapping_type = "<do-not-import>";
                        break;
                    case "<new>" :
                        if(this.allow_create_new) {
                            aMapping.mapping_type = "<new>";

                            const attributeIdIinput = aHeaderCell.querySelector("ktbs4la2-resource-id-input");

                            if(attributeIdIinput.old_value) {
                                aMapping.attribute_id = attributeIdIinput.old_value;
                                const attributeLabelIinput = aHeaderCell.querySelector("ktbs4la2-multiple-translations-text-input");
                                aMapping.attribute_label = JSON.parse(attributeLabelIinput.value);

                                const attributeDataTypeSelect = aHeaderCell.querySelector(".attribute-data-type-select");
                                aMapping.attribute_data_type = attributeDataTypeSelect.value;
                            }
                        }
                        break;
                    default:
                        aMapping.mapping_type = "<existing>";
                        aMapping.attribute_id = mappingTypeSelect.value;
                }

                allMappings.push(aMapping);
            }
        }

        return allMappings;
    }

    /**
     * 
     */
    set_value(newValue) {
        if(newValue instanceof Array) {
            let resolveReturnedPromise, rejectReturnedPromise;

            const returnedPromise = new Promise((resolve, reject) => {
                resolveReturnedPromise = resolve;
                rejectReturnedPromise = reject;
            });

            this._setValue = newValue;

            this._componentReady.then(() => {
                const headers = this._headerRow.querySelectorAll("th");

                for(let i = 0; i < headers.length; i++)
                    headers[i].remove();

                const parametersPromises = new Array();

                for(let i = 0; i < this._setValue.length; i++) {
                    const aMappingSetValue = this._setValue[i];
                    const aHeader = this._tableHeaderTemplate.content.cloneNode(true);
                    const aMappingTypeSelect = aHeader.querySelector(".mapping-type-select");

                    if(this._additionalAttributeTypes instanceof Array) {
                        // rebuild additional types options
                        for(let attributeTypeIndex = 0; attributeTypeIndex < this._additionalAttributeTypes.length; attributeTypeIndex++) {
                            const anAttributeType = this._additionalAttributeTypes[attributeTypeIndex];
                            const newOption = document.createElement("option");
                            newOption.setAttribute("value", anAttributeType.id);

                            if(anAttributeType.label)
                                newOption.innerText = anAttributeType.label;
                            else
                                newOption.innerText = anAttributeType.id;

                            aMappingTypeSelect.insertBefore(newOption, aMappingTypeSelect.options[aMappingTypeSelect.options.length - 1]);
                        }
                    }

                    aMappingTypeSelect.setAttribute("tabindex", (4 * i + 1));
                    aMappingTypeSelect.addEventListener("change", this._onChangeMappingTypeSelect.bind(this));

                    if(aMappingSetValue && aMappingSetValue.mapping_type) {
                        if((aMappingSetValue.mapping_type == "<new>") || (aMappingSetValue.mapping_type == "<do-not-import>"))
                            aMappingTypeSelect.value = aMappingSetValue.mapping_type;
                        else
                            aMappingTypeSelect.value = aMappingSetValue.attribute_id;
                    }

                    if((aMappingTypeSelect.value == "<new>") && this.allow_create_new) {
                        const parametersDiv = aHeader.querySelector(".new-attribute-parameters");
                        parametersDiv.classList.remove("hidden");
                    }

                    if(aMappingTypeSelect.value == "<do-not-import>")
                        this._setDoNotImportColumnStyle(i);

                    const anIdInputLabel = aHeader.querySelector(".new-attribute-id-label-label");
                    const anIdInput = document.createElement("ktbs4la2-resource-id-input");
                    anIdInput.setAttribute("placeholder", "<id>");
                    anIdInput.setAttribute("required", true);
                    anIdInput.setAttribute("tabindex", (4 * i + 2));
                    anIdInput.addEventListener("change", this._onChangeIdInput.bind(this));
                    anIdInput.addEventListener("input", this._onChangeIdInput.bind(this));

                    if(aMappingSetValue && aMappingSetValue.attribute_id) {
                        let resolveIdInputSetValuePromise , rejectIdInputSetValuePromise ;

                        const idInputSetValuePromise = new Promise((resolve, reject) => {
                            resolveIdInputSetValuePromise = resolve;
                            rejectIdInputSetValuePromise = reject;
                        });

                        anIdInput._componentReady
                            .then(() => {
                                anIdInput.setAttribute("value", aMappingSetValue.attribute_id);
                                    //.then(() => {
                                        anIdInput.old_value = aMappingSetValue.attribute_id;
                                        resolveIdInputSetValuePromise();
                                    //})
                                    //.catch(rejectIdInputSetValuePromise);
                            })
                            .catch(rejectIdInputSetValuePromise);

                        parametersPromises.push(idInputSetValuePromise);
                    }

                    anIdInputLabel.appendChild(anIdInput);

                    const aLabelInputLabel  = aHeader.querySelector(".new-attribute-label-label");
                    const aLabelInput  = document.createElement("ktbs4la2-multiple-translations-text-input");
                    aLabelInput.setAttribute("placeholder", this._translateString("Label"));
                    aLabelInput.setAttribute("tabindex", (4 * i + 3));
                    aLabelInput.addEventListener("change", this._onChangeLabelInput.bind(this));
                    aLabelInput.addEventListener("input", this._onChangeLabelInput.bind(this));

                    if(aMappingSetValue && aMappingSetValue.attribute_label) {
                        let resolveLabelInputSetValuePromise , rejectLabelInputSetValuePromise ;

                        const labelInputSetValuePromise = new Promise((resolve, reject) => {
                            resolveLabelInputSetValuePromise = resolve;
                            rejectLabelInputSetValuePromise = reject;
                        });

                        aLabelInput._componentReady
                            .then(() => {
                                aLabelInput.setAttribute("value", aMappingSetValue.attribute_label)
                                    .then(resolveLabelInputSetValuePromise)
                                    .catch(rejectLabelInputSetValuePromise);
                            })
                            .catch(rejectLabelInputSetValuePromise);

                        parametersPromises.push(labelInputSetValuePromise);
                    }

                    aLabelInputLabel.appendChild(aLabelInput);

                    const aDataTypeSelect = aHeader.querySelector(".attribute-data-type-select");
                    aDataTypeSelect.setAttribute("tabindex", (4 * i + 4));
                    aDataTypeSelect.addEventListener("change", this._onChangeAttributeDataTypeSelect.bind(this));

                    if(aMappingSetValue && aMappingSetValue.attribute_data_type)
                        aDataTypeSelect.value = aMappingSetValue.attribute_data_type;

                    this._headerRow.appendChild(aHeader);
                }

                Promise.all(parametersPromises)
                    .then(resolveReturnedPromise)
                    .catch(rejectReturnedPromise);
            });

            return returnedPromise;
        }
        else
            throw new TypeError("New value for property \"value\" must be an Array");
    }

    /**
     * 
     */
    setAdditionalAttributeTypes(new_additionalAttributeTypes) {
        if(new_additionalAttributeTypes instanceof Array) {
            this._additionalAttributeTypes = new_additionalAttributeTypes;

            let resolveReturnedPromise, rejectReturnedPromise;

            const returnedPromise = new Promise((resolve, reject) => {
                resolveReturnedPromise = resolve;
                rejectReturnedPromise = reject;
            });

            this._componentReady.then(() => {
                const headerCells = this._headerRow.querySelectorAll("th");

                for(let colIndex = 0; colIndex < headerCells.length; colIndex++) {
                    const aHeaderCell = headerCells[colIndex];
                    const aMappingTypeSelect = aHeaderCell.querySelector(".mapping-type-select");
                    const aMappingTypeSelect_valueBefore = aMappingTypeSelect.value;
                    const anIdInput = aHeaderCell.querySelector("ktbs4la2-resource-id-input");

                    // remove previously set additional types options
                    for(let optionIndex = aMappingTypeSelect.options.length - 2; optionIndex >= 7; optionIndex--)
                        aMappingTypeSelect.options[optionIndex].remove();

                    // rebuild additional types options
                    for(let attributeTypeIndex = 0; attributeTypeIndex < this._additionalAttributeTypes.length; attributeTypeIndex++) {
                        const anAttributeType = this._additionalAttributeTypes[attributeTypeIndex];

                        if(!(
                                (aMappingTypeSelect_valueBefore == "<new>")
                            &&  (anIdInput.old_value == anAttributeType.id)
                        )) {
                            const newOption = document.createElement("option");
                            newOption.setAttribute("value", anAttributeType.id);

                            if(anAttributeType.label)
                                newOption.innerText = anAttributeType.label;
                            else
                                newOption.innerText = anAttributeType.id;

                            aMappingTypeSelect.insertBefore(newOption, aMappingTypeSelect.options[aMappingTypeSelect.options.length - 1]);
                        }
                    }

                    aMappingTypeSelect.value = aMappingTypeSelect_valueBefore;
                }

                resolveReturnedPromise();
            })
            .catch(rejectReturnedPromise);

            return returnedPromise;
        }
        else
            throw new TypeError("Parameter for method \"setAdditionalAttributeTypes\" must be an Array");
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._captionLabel1.innerText = this._translateString("Attribute mapping for lines whose value for column");
        this._captionLabel2.innerText = this._translateString("equals");
        // @TODO translate table headers
    }

    /**
     * 
     */
    addBodyContent(new_content) {
        let resolveReturnedPromise, rejectReturnedPromise;

        const returnedPromise = new Promise((resolve, reject) => {
            resolveReturnedPromise = resolve;
            rejectReturnedPromise = reject;
        });

        this._componentReady
            .then(() => {
                this.body.appendChild(new_content);
                resolveReturnedPromise();
            })
            .catch((error) => {
                rejectReturnedPromise(error);
            });

        return returnedPromise;
    }

    /**
     * 
     */
    _setDoNotImportColumnStyle(col_index) {
        let previousRuleFound = false;

        for(let i = 0; !previousRuleFound && (i < this._doNotImportColsStyle.cssRules.length); i++)
            previousRuleFound = this._doNotImportColsStyle.cssRules[i].cssText.includes("nth-child(" + (col_index + 1) + ")");

        if(!previousRuleFound)
            this._doNotImportColsStyle.insertRule("tbody td:nth-child(" + (col_index + 1) + ") {background-color: #CCC !important; opacity: 0.3 !important; font-style: italic !important;}");
    }

    /**
     * 
     */
     _unsetDoNotImportColumnStyle(col_index) {
        for(let i = (this._doNotImportColsStyle.cssRules.length - 1); i > 0; i--)
            if(this._doNotImportColsStyle.cssRules[i - 1].cssText.includes("nth-child(" + (col_index + 1) + ")"))
                this._doNotImportColsStyle.deleteRule(i - 1);
    }

    /**
     * 
     */
    checkValidity() {
        if(this._body) {
            const headerCells = this._headerRow.querySelectorAll("th");
            let isValid = true;

            for(let i = 0; isValid && (i < headerCells.length); i++) {
                const aHeaderCell = headerCells[i];
                const mappingTypeSelect = aHeaderCell.querySelector(".mapping-type-select");

                if(mappingTypeSelect.value == "<new>") {
                    if(this.allow_create_new) {
                        const attributeIdIinput = aHeaderCell.querySelector("ktbs4la2-resource-id-input");
                        isValid = attributeIdIinput.checkValidity();
                    }
                    else
                        isValid = false;
                }
                else
                    isValid = (mappingTypeSelect.value.trim().length > 0);
            }
            return isValid;
        }
        else
            return false;
    }

    /**
     * 
     */
    _onChangeMappingTypeSelect(event) {
        const select = event.target;
        const headerCell = select.closest("th");
        const newAttributeParametersDiv = headerCell.querySelector("div.new-attribute-parameters");

        if((select.value == "<new>") && this.allow_create_new) {
            if(newAttributeParametersDiv.classList.contains("hidden"))
                newAttributeParametersDiv.classList.remove("hidden");
        }
        else {
            if(!newAttributeParametersDiv.classList.contains("hidden"))
                newAttributeParametersDiv.classList.add("hidden");
        }

        if(select.value == "<do-not-import>")
            this._setDoNotImportColumnStyle(headerCell.cellIndex);
        else
            this._unsetDoNotImportColumnStyle(headerCell.cellIndex);

        this._emitChangeEvent();
    }

    /**
     * 
     */
    _onChangeIdInput(event) {
        const changedInput = event.target;

        if(changedInput.checkValidity())
            changedInput.old_value = changedInput.value;
        else
            changedInput.reportValidity();

        this._emitChangeEvent();
    }

    /**
     * 
     */
    _onChangeLabelInput(event) {
        this._emitChangeEvent();
    }

    /**
     * 
     */
    _onChangeAttributeDataTypeSelect(event) {
        this._emitChangeEvent();
    }

    /**
     * 
     */
    _emitChangeEvent() {
        this.dispatchEvent(new Event("change", {bubbles: true, cancelable: false, composed: false}));
    }
}

customElements.define('ktbs4la2-attributes-mapping-table', KTBS4LA2AttributesMappingTable);