import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";
import {ObselType} from "../../ktbs-api/ObselType.js";
import {AttributeType} from "../../ktbs-api/AttributeType.js";
import {lightOrDark, colorNameToHex} from "../common/colors-utils.js";
import {KtbsError} from "../../ktbs-api/Errors.js";

import "../ktbs4la2-document-header/ktbs4la2-document-header.js";
import "../ktbs4la2-multiple-translations-text-input/ktbs4la2-multiple-translations-text-input.js";
import "../ktbs4la2-obsel-type-select/ktbs4la2-obsel-type-select.js";
import "../ktbs4la2-resource-id-input/ktbs4la2-resource-id-input.js";

/**
 * 
 */
class KTBS4LA2ModelDiagramObseltypeDetails extends TemplatedHTMLElement {

    /**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true);
    }

    /**
     * 
     */
    checkValidity() {
        let isValid = true;
        const ownAttributesLines = this._attributesListTableBody.querySelectorAll("tr.own");

        for(let i = 0; i < ownAttributesLines.length; i++) {
            const anAttributeLine = ownAttributesLines[i];
            const idInput = anAttributeLine.querySelector("td.id-cell ktbs4la2-resource-id-input");
            const dataTypesSelect = anAttributeLine.querySelector("td.datatypes-cell select");
            
            if(!idInput.checkValidity() || !dataTypesSelect.checkValidity()) {
                isValid = false;
                break;
            }
        }

        return isValid;
    }

    /**
     * 
     */
    reportValidity() {
        const isValid = this.checkValidity();
        const criticalInputs = this._attributesListTableBody.querySelectorAll("tr.own td.id-cell ktbs4la2-resource-id-input, tr.own td.datatypes-cell select");

        for(let i = 0; i < criticalInputs.length; i++)
            if(!criticalInputs[i].checkValidity()) {
                criticalInputs[i].reportValidity();
                break;
            }

        return isValid;
	}

    /**
	 * 
	 */
	static get observedAttributes() {
		let _observedAttributes = super.observedAttributes;
        _observedAttributes.push("mode");
        _observedAttributes.push("reserved-attributetypes-ids");
		return _observedAttributes;
    }

    /**
	 * 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		super.attributeChangedCallback(name, oldValue, newValue);

        if(name == "mode") {
            if(newValue == "edit") {
                if(this._obsel_type)
                    this._obsel_type_copy = this._obsel_type.clone();
            }
            else if(newValue == "create") {
                
            }
            else if(newValue == "view") {

            }
            else
                throw new RangeError("Value for attribute \"mode\" must be either \"view\", \"edit\" or \"create\"");
        }
        else if(name == "reserved-attributetypes-ids") {
            this._componentReady.then(() => {
                const allIdInputs = this._attributesListTableBody.querySelectorAll("tr.own td.id-cell ktbs4la2-resource-id-input");

                for(let i = 0; i < allIdInputs.length; i++) {
                    const anIdInput = allIdInputs[i];
                    const reserved_ids = this.reserved_attributetypes_ids.slice();
                    
                    if(anIdInput._lastValidValue && (reserved_ids.indexOf(anIdInput._lastValidValue) != -1))
                        reserved_ids.splice(reserved_ids.indexOf(anIdInput._lastValidValue), 1);

                    if(reserved_ids.length > 1)
                        anIdInput.setAttribute("reserved-ids", reserved_ids.join(" "));
                }
            });
        }
    }

    /**
     * 
     */
    get mode() {
        if(
                this.hasAttribute("mode")
            &&  (
                    (this.getAttribute("mode") == "view")
                ||  (this.getAttribute("mode") == "edit")
                ||  (this.getAttribute("mode") == "create")
            )
        )
            return this.getAttribute("mode");
        else
            return "view";
    }

    /**
     * 
     */
    set mode(newValue) {
        if(newValue)
            this.setAttribute("mode", newValue);
        else
            if(this.hasAttribute("mode"))
                this.removeAttribute("mode");
    }

    /**
     * 
     */
    get reserved_attributetypes_ids() {
        if(this.hasAttribute("reserved-attributetypes-ids"))
            return this.getAttribute("reserved-attributetypes-ids").split(" ").filter(Boolean);
        else
            return [];
    }

    /**
     * 
     */
    set reserved_attributetypes_ids(newValue) {
        if(newValue) {
            if(newValue instanceof Array)
                this.setAttribute("reserved-attributetypes-ids", newValue.join(" "));
            else
                throw new TypeError("Value for property \"\" must be an instance of Array");
        }
        else
            if(this.hasAttribute("reserved-attributetypes-ids"))
                this.removeAttribute("reserved-attributetypes-ids");
    }

    /**
	 * 
	 */
	onComponentReady() {
        this._obseltypeSymbolSpan = this.shadowRoot.querySelector("#obseltype-symbol");
        this._labelDisplayP = this.shadowRoot.querySelector("#label-display");
        this._labelSpan = this.shadowRoot.querySelector("#label");
        this._labelInput = this.shadowRoot.querySelector("#label-input");
        this._labelInput.addEventListener("input", this._onChangeLabelInput.bind(this));
        this._labelInput.addEventListener("change", this._onChangeLabelInput.bind(this));
        this._idDisplaySpan = this.shadowRoot.querySelector("#id-display");
        this._obseltypeColorInput = this.shadowRoot.querySelector("#obseltype-color-input");
        this._obseltypeColorInput.addEventListener("input", this._onChangeColorInput.bind(this));
        this._obseltypeColorInput.addEventListener("change", this._onChangeColorInput.bind(this));
        this._obseltypeSymbolInput = this.shadowRoot.querySelector("#obseltype-symbol-input");
        this._obseltypeSymbolInput.addEventListener("input", this._onChangeSymbolInput.bind(this));
        this._obseltypeSymbolInput.addEventListener("change", this._onChangeSymbolInput.bind(this));
        this._parentObseltypeSelectLabel = this.shadowRoot.querySelector("#parent-obseltype-select-label");
        this._parentObseltypeSelect = this.shadowRoot.querySelector("#parent-obseltype-select");
        this._parentObseltypeSelect.addEventListener("change", this._onChangeParentSelect.bind(this));
        this._parentObseltypeDisplaySpan = this.shadowRoot.querySelector("#parent-obseltype-display");
        this._attributesListTable = this.shadowRoot.querySelector("#attributes-list-table");
        this._attributesListTableBody = this._attributesListTable.querySelector("tbody");

        for(let i = 0; i < AttributeType.builtin_attribute_types.length; i++) {
            const aBuiltinAttribute = AttributeType.builtin_attribute_types[i];
            const aBuilitinAttributeRowElement = document.createElement("tr");
            aBuilitinAttributeRowElement.setAttribute("id", aBuiltinAttribute.id);
            aBuilitinAttributeRowElement.classList.add("default");

            const idCell = document.createElement("td");
            idCell.innerText = aBuiltinAttribute.id;
            aBuilitinAttributeRowElement.appendChild(idCell);

            const labelCell = document.createElement("td");
            labelCell.innerText = aBuiltinAttribute.get_preferred_label(this._lang);
            aBuilitinAttributeRowElement.appendChild(labelCell);

            const typeCell = document.createElement("td");
            typeCell.innerText = aBuiltinAttribute.data_types.join(", ");
            aBuilitinAttributeRowElement.appendChild(typeCell);

            const actionCell = document.createElement("td");
            actionCell.classList.add("edit");
            aBuilitinAttributeRowElement.appendChild(actionCell);
            
            this._attributesListTableBody.appendChild(aBuilitinAttributeRowElement);
        }

        this._addAttributetypeSelect = this.shadowRoot.querySelector("#add-attribute-type-select");
        this._addAttributeButton = this.shadowRoot.querySelector("#add-attribute-button");
        this._addAttributeButton.addEventListener("click", this._onClickAddAttributeButton.bind(this));
    }

    /**
     * 
     */
    _onChangeLabelInput(event) {
        const labelInputValueArray = JSON.parse(this._labelInput.value);

        // overwrite previous translations in this._obsel_type for each language set in the input
        for(let i = 0; i < labelInputValueArray.length; i++) {
            const anInputTranslation = labelInputValueArray[i];

            if(anInputTranslation.lang == "*")
                this._obsel_type.label = anInputTranslation.value;
            else
                this._obsel_type.set_translated_label(anInputTranslation.value, anInputTranslation.lang);
        }

        // remove old translations in this._obsel_type that are not set in the input anymore
        const label_translations = this._obsel_type.label_translations;

        for(let i = 0; i < label_translations.length; i++) {
            const aTranslation = label_translations[i];
            const translationLang = aTranslation["@language"];
            let langIsSetInInput = false;

            for(let j = 0; !langIsSetInInput && (j < labelInputValueArray.length); j++)
                langIsSetInInput = labelInputValueArray[i].lang == translationLang;

            if(!langIsSetInInput)
                this._obsel_type.remove_label_translation(translationLang);
        }

        // update attributes tables' vertical cell content
        const verticalCell = this._attributesListTableBody.querySelector("tr.own td.vertical-cell");

        if(verticalCell)
            verticalCell.innerText = this._obsel_type.get_preferred_label(this._lang);
        
        this._emitChangeEvent();
    }

    /**
     * 
     */
    _onChangeColorInput(event) {
        this._obsel_type.suggestedColor = this._obseltypeColorInput.value;
        this._emitChangeEvent();
    }

    /**
     * 
     */
    _onChangeSymbolInput(event) {
        this._obsel_type.suggestedSymbol = this._obseltypeSymbolInput.value;
        this._emitChangeEvent();
    }

    /**
     * 
     */
    _onChangeParentSelect(event) {
        const new_parent_obselTypes = new Array();

        if(this._parentObseltypeSelect.value) {
            const parent_obseltypes_uri_strings = this._parentObseltypeSelect.value.split(" ");
            
            for(let i = 0; i< parent_obseltypes_uri_strings.length; i++) {
                const new_parent_obseltype_uri = new URL(parent_obseltypes_uri_strings[i]);

                if(new_parent_obseltype_uri.hash) {
                    const new_parent_obselType_id = new_parent_obseltype_uri.hash.substring(1);
                    const new_parent_model_uri = new_parent_obseltype_uri.href.replace("#" + new_parent_obselType_id, "");
                    
                    if(new_parent_model_uri == this._obsel_type.parent_model.uri) {
                        const new_parent_obselType = this._obsel_type.parent_model.get_obsel_type(new_parent_obselType_id);

                        if(new_parent_obselType)
                            new_parent_obselTypes.push(new_parent_obselType);
                        else
                            this.emitErrorEvent(new KtbsError("Could not find obsel type #" + new_parent_obselType_id + " in the model"));
                    }
                    else
                        this.emitErrorEvent(new KtbsError("New parent obsel type does not belong to the same model"));
                }
            }
        }

        this._obsel_type.super_obsel_types = new_parent_obselTypes;

        // purge inherited attributes from the table
        const inheritedAttributeTableLines = this._attributesListTableBody.querySelectorAll("tr.inherited");

        for(let i = 0; i < inheritedAttributeTableLines.length; i++)
            inheritedAttributeTableLines[i].remove();

        // rebuild the inherited attributes list table...
        const firstOwnAttributeLine = this._attributesListTableBody.querySelector("tr.own");
        
        // ... with attributes inherited from parent obsel types
        for(let i = 0; i < this._obsel_type.super_obsel_types.length; i++) {
            const aParentObselType = this._obsel_type.super_obsel_types[i];

            for(let j = 0; j < aParentObselType.attribute_types.length; j++) {
                const anAttribute = aParentObselType.attribute_types[j];
                const attributeRowElement = document.createElement("tr");
                attributeRowElement.classList.add("inherited");
                attributeRowElement.setAttribute("id", anAttribute.id);

                if(j == 0) {
                    const originCell = document.createElement("td");
                    originCell.setAttribute("rowspan", aParentObselType.attribute_types.length);
                    originCell.classList.add("vertical-cell");
                    originCell.innerText = aParentObselType.get_preferred_label(this._lang);
                    attributeRowElement.appendChild(originCell);
                }

                const idCell = document.createElement("td");
                idCell.innerText = anAttribute.id;
                attributeRowElement.appendChild(idCell);

                const labelCell = document.createElement("td");
                labelCell.innerText = anAttribute.get_preferred_label(this._lang);
                attributeRowElement.appendChild(labelCell);

                const typeCell = document.createElement("td");
                typeCell.innerText = anAttribute.data_types.join(", ");
                attributeRowElement.appendChild(typeCell);

                const actionCell = document.createElement("td");
                actionCell.classList.add("edit");
                attributeRowElement.appendChild(actionCell);
                
                if(firstOwnAttributeLine)
                    this._attributesListTableBody.insertBefore(attributeRowElement, firstOwnAttributeLine);
                else
                    this._attributesListTableBody.appendChild(attributeRowElement);
            }
        }

        this._emitChangeEvent();
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        if(this._obsel_type)
            this._labelSpan.innerText = this._obsel_type.get_preferred_label(this._lang);

        this._labelInput.setAttribute("lang", this._lang);
        this._labelInput.setAttribute("placeholder", this._translateString("Obsel type label"));
        this._parentObseltypeSelectLabel.innerText = this._translateString("Parent obsel type(s) :");
        this._parentObseltypeSelect.setAttribute("lang", this._lang);
        const parentObseltypesLabels = new Array();

        if(this._obsel_type) {
            const parentObselType = this._obsel_type.super_obsel_types;

            for(let i = 0; i < this._obsel_type.super_obsel_types.length; i++)
                parentObseltypesLabels.push(parentObselType[i].get_preferred_label(this._lang));
        }

        if(parentObseltypesLabels.length > 0)
            this._parentObseltypeDisplaySpan.innerText = parentObseltypesLabels.join(", ");
        else
            this._parentObseltypeDisplaySpan.innerText = this._translateString("None");

        const allIdInputs = this._attributesListTableBody.querySelectorAll("tr.own td.id-cell ktbs4la2-resource-id-input");

        for(let i = 0; i < allIdInputs.length; i++)
            allIdInputs[i].setAttribute("lang", this._lang);
    }

    /**
     * 
     */
     set obsel_type(new_obsel_type) {
        if(new_obsel_type instanceof ObselType) {
            this._obsel_type = new_obsel_type.clone();

            if(this.mode == "edit")
                this._obsel_type_copy = new_obsel_type.clone();

            this._set_obsel_type(this._obsel_type);
        }
        else
            throw new TypeError("new value for property obsel_type must be an instance of ObselType");
    }

    /**
     * 
     */
    _set_obsel_type(obsel_type) {
        if(obsel_type.suggestedSymbol) {
            this._obseltypeSymbolSpan.innerText = obsel_type.suggestedSymbol;
            this._obseltypeSymbolInput.setAttribute("value", obsel_type.suggestedSymbol);
            this._obseltypeSymbolInput.value = obsel_type.suggestedSymbol;
        }
        else {
            this._obseltypeSymbolSpan.innerText = "";
            this._obseltypeSymbolInput.removeAttribute("value");
            this._obseltypeSymbolInput.value = null;
        }

        this._labelSpan.innerText = obsel_type.get_preferred_label(this._lang);
        
        if(obsel_type.suggestedColor) {
            this._labelDisplayP.style.backgroundColor = obsel_type.suggestedColor;
            const isColorCode = /^#[0-9A-F]{6}$/i.test(obsel_type.suggestedColor);

            if(isColorCode) {
                this._obseltypeColorInput.setAttribute("value", obsel_type.suggestedColor);
                this._obseltypeColorInput.value = obsel_type.suggestedColor;
            }
            else {
                const colorCode = colorNameToHex(obsel_type.suggestedColor);

                if(colorCode) {
                    this._obseltypeColorInput.setAttribute("value", colorCode);
                    this._obseltypeColorInput.value = colorCode;
                }
                else {
                    if(this._obseltypeColorInput.hasAttribute("value"))
                        this._obseltypeColorInput.removeAttribute("value");

                    this._obseltypeColorInput.value = null;
                }
            }
        }
        else {
            this._labelDisplayP.style.backgroundColor = null;

            if(this._obseltypeColorInput.hasAttribute("value"))
                this._obseltypeColorInput.removeAttribute("value");

            this._obseltypeColorInput.value = null;
        }

        if(obsel_type.suggestedColor)
            this._labelDisplayP.className = "view "+lightOrDark(obsel_type.suggestedColor);
        else
            this._labelDisplayP.className = "view";

        if(obsel_type.label_translations instanceof Array) {
            const labelTranslationsArray = new Array();

            for(let i = 0; i < obsel_type.label_translations.length; i++)
                labelTranslationsArray.push({"value": obsel_type.label_translations[i]["@value"], "lang": obsel_type.label_translations[i]["@language"]})
            
            this._labelInput.setAttribute("value", JSON.stringify(labelTranslationsArray));
        }
        else
            this._labelInput.removeAttribute("value");

        this._idDisplaySpan.innerText = "#" + obsel_type.id;

        this._parentObseltypeSelect.setAttribute("model-uri", obsel_type.parent_model.uri.toString());
        this._parentObseltypeSelect.setAttribute("excluded-obseltypes-uris", obsel_type.uri);

        const parentObselTypesUris = new Array();
        const parentObseltypesLabels = new Array();
        const parentObselType = obsel_type.super_obsel_types;

        for(let i = 0; i < obsel_type.super_obsel_types.length; i++) {
            parentObselTypesUris.push(parentObselType[i].uri);
            parentObseltypesLabels.push(parentObselType[i].get_preferred_label(this._lang));
        }

        this._parentObseltypeSelect.setAttribute("value", parentObselTypesUris.join(" "));

        if(parentObseltypesLabels.length > 0) {
            this._parentObseltypeDisplaySpan.innerText = parentObseltypesLabels.join(", ");

            if(this._parentObseltypeDisplaySpan.classList.contains("disabled"))
                this._parentObseltypeDisplaySpan.classList.remove("disabled");
        }
        else {
            this._parentObseltypeDisplaySpan.innerText = this._translateString("None");

            if(!this._parentObseltypeDisplaySpan.classList.contains("disabled"))
                this._parentObseltypeDisplaySpan.classList.add("disabled");
        }

        // purge attributes from the table
        const attributeTableLines = this._attributesListTableBody.querySelectorAll("tr:not(.default)");

        for(let i = 0; i < attributeTableLines.length; i++)
            attributeTableLines[i].remove();

        // populate the attribute list table...
        
        // ... with attributes inherited from parent obsel types
        for(let i = 0; i < obsel_type.super_obsel_types.length; i++) {
            const aParentObselType = obsel_type.super_obsel_types[i];

            for(let j = 0; j < aParentObselType.attribute_types.length; j++) {
                const anAttribute = aParentObselType.attribute_types[j];
                const attributeRowElement = document.createElement("tr");
                attributeRowElement.classList.add("inherited");
                attributeRowElement.setAttribute("id", anAttribute.id);

                if(j == 0) {
                    const originCell = document.createElement("td");
                    originCell.setAttribute("rowspan", aParentObselType.attribute_types.length);
                    originCell.classList.add("vertical-cell");
                    originCell.innerText = aParentObselType.get_preferred_label(this._lang);
                    attributeRowElement.appendChild(originCell);
                }

                const idCell = document.createElement("td");
                idCell.classList.add("id-cell");
                idCell.innerText = anAttribute.id;
                attributeRowElement.appendChild(idCell);

                const labelCell = document.createElement("td");
                idCell.classList.add("label-cell");
                labelCell.innerText = anAttribute.get_preferred_label(this._lang);
                attributeRowElement.appendChild(labelCell);

                const typeCell = document.createElement("td");
                idCell.classList.add("datatypes-cell");
                typeCell.innerText = anAttribute.data_types.join(", ");
                attributeRowElement.appendChild(typeCell);

                const actionCell = document.createElement("td");
                actionCell.classList.add("edit");
                attributeRowElement.appendChild(actionCell);
                
                this._attributesListTableBody.appendChild(attributeRowElement);
            }
        }

        // ... with current obsel type's own attributes
        for(let i = 0; i < obsel_type.attribute_types.length; i++) {
            const anAttribute = obsel_type.attribute_types[i];

            const attributeRowElement = document.createElement("tr");
                attributeRowElement.classList.add("own");
                attributeRowElement.setAttribute("id", anAttribute.id);

                if(i == 0) {
                    const originCell = document.createElement("td");
                    originCell.setAttribute("rowspan", obsel_type.attribute_types.length);
                    originCell.classList.add("vertical-cell");
                    originCell.innerText = obsel_type.get_preferred_label(this._lang);
                    attributeRowElement.appendChild(originCell);
                }

                const idCell = document.createElement("td");
                    idCell.classList.add("id-cell");

                    if(anAttribute.obsel_types.length > 1) {
                        attributeRowElement.classList.add("is-shared-attributetype");

                        const sharedAttributeTypeIndicator = document.createElement("span");
                            sharedAttributeTypeIndicator.classList.add("shared-attribute-indicator");
                            let sharedAttributeTypeMsg = this._translateString("This attribute type is shared between several obsel types :");
                            
                            for(let j = 0; j < anAttribute.obsel_types.length; j++)
                                sharedAttributeTypeMsg += "\n" + anAttribute.obsel_types[j].get_preferred_label(this._lang);

                            sharedAttributeTypeIndicator.setAttribute("title", sharedAttributeTypeMsg);
                        idCell.appendChild(sharedAttributeTypeIndicator);
                    }

                    const idInput = document.createElement("ktbs4la2-resource-id-input");
                        idInput.classList.add("create");
                        idInput.classList.add("edit");
                        idInput.setAttribute("value", anAttribute.id);
                        idInput._lastValidValue = anAttribute.id;
                        idInput.setAttribute("placeholder", "<id>");
                        idInput.setAttribute("required", true);
                        idInput.setAttribute("lang", this._lang);

                        const reserved_ids = this.reserved_attributetypes_ids.slice();
                        reserved_ids.splice(reserved_ids.indexOf(anAttribute.id), 1);

                        if(reserved_ids.length > 1)
                            idInput.setAttribute("reserved-ids", reserved_ids.join(" "));

                        idInput.addEventListener("input", this._onChangeIdInput.bind(this));
                        idInput.addEventListener("change", this._onChangeIdInput.bind(this));
                    idCell.appendChild(idInput);

                    const idDisplaySpan = document.createElement("span");
                        idDisplaySpan.classList.add("view");
                        idDisplaySpan.innerText = anAttribute.id;
                    idCell.appendChild(idDisplaySpan);
                attributeRowElement.appendChild(idCell);

                const labelCell = document.createElement("td");
                    labelCell.classList.add("label-cell");

                    const labelSpan = document.createElement("span");
                        labelSpan.classList.add("view");
                        labelSpan.innerText = anAttribute.get_preferred_label(this._lang);
                    labelCell.appendChild(labelSpan);

                    const labelInput = document.createElement("ktbs4la2-multiple-translations-text-input");
                        labelInput.setAttribute("placeholder", this._translateString("Attribute type label"));
                        labelInput.setAttribute("lang", this._lang);
                        labelInput.classList.add("edit");

                        if(anAttribute.label_translations instanceof Array) {
                            const labelTranslationsArray = new Array();

                            for(let j = 0; j < anAttribute.label_translations.length; j++)
                                labelTranslationsArray.push({"value": anAttribute.label_translations[j]["@value"], "lang": anAttribute.label_translations[j]["@language"]})
                            
                            labelInput.setAttribute("value", JSON.stringify(labelTranslationsArray));
                        }

                        labelInput.addEventListener("input", this._onChangeAttributeType.bind(this));
                        labelInput.addEventListener("change", this._onChangeAttributeType.bind(this));
                    labelCell.appendChild(labelInput);
                attributeRowElement.appendChild(labelCell);

                const typeCell = document.createElement("td");
                    typeCell.classList.add("datatypes-cell");

                    const typeSpan = document.createElement("span");
                        typeSpan.classList.add("view");
                        typeSpan.innerText = anAttribute.data_types.join(", ");
                    typeCell.appendChild(typeSpan);

                    const typeSelect = document.createElement("select");
                        typeSelect.classList.add("edit");
                        typeSelect.setAttribute("multiple", "true");
                        typeSelect.setAttribute("required", true);

                        const availableTypes = ["xsd:string", "xsd:integer", "xsd:float", "xsd:dateTime", "xsd:boolean", "Obsel"];

                        for(let j = 0; j < availableTypes.length; j++) {
                            const aTypeOption = document.createElement("option");
                            aTypeOption.setAttribute("value", availableTypes[j]);
                            aTypeOption.innerText = availableTypes[j];

                            if(anAttribute.data_types.includes(availableTypes[j]))
                                aTypeOption.setAttribute("selected", "true");

                            typeSelect.appendChild(aTypeOption);
                        }

                        typeSelect.addEventListener("change", this._onChangeAttributeType.bind(this));
                    typeCell.appendChild(typeSelect);
                attributeRowElement.appendChild(typeCell);

                const actionCell = document.createElement("td");
                    actionCell.classList.add("edit");

                    const removeButton = document.createElement("button");
                        removeButton.classList.add("remove-attribute-button");
                        removeButton.setAttribute("title", this._translateString("Remove this attribute type from the obsel type"));
                        removeButton.innerText = "❌";
                        removeButton.addEventListener("mouseover", this._onMouseOverRemoveAttributeButton.bind(this));
                        removeButton.addEventListener("mouseout", this._onMouseOutRemoveAttributeButton.bind(this));
                        removeButton.addEventListener("click", this._onClickRemoveAttributeButton.bind(this));
                    actionCell.appendChild(removeButton);
                attributeRowElement.appendChild(actionCell);
            this._attributesListTableBody.appendChild(attributeRowElement);
        }

        this._updateAvailableAttributeTypesSelect();
    }

    /**
     * 
     */
    _onChangeIdInput(event) {
        const changedIdInput = event.target;
        changedIdInput.setCustomValidity("");

        if(changedIdInput.checkValidity()) {
            const reserved_ids = this.reserved_attributetypes_ids.slice();
            
            if(changedIdInput._lastValidValue && reserved_ids.indexOf(changedIdInput._lastValidValue) != -1)
                reserved_ids.splice(reserved_ids.indexOf(changedIdInput._lastValidValue), 1);

            changedIdInput._lastValidValue = changedIdInput.value;
            reserved_ids.push(changedIdInput.value);
            this.reserved_attributetypes_ids = reserved_ids;
            this._onChangeAttributeType(event);
        }
        else
            this._emitChangeEvent();
        
        changedIdInput.reportValidity();
    }

    /**
     * 
     */
    _onChangeAttributeType(event) {
        const attributeRow = event.target.closest("tr");

        if(attributeRow) {
            const idInput = attributeRow.querySelector("ktbs4la2-resource-id-input");
            const labelInput = attributeRow.querySelector("ktbs4la2-multiple-translations-text-input");
            const typeSelect = attributeRow.querySelector("select");

            if(idInput && labelInput && typeSelect) {
                if(idInput.value && (typeSelect.selectedOptions.length > 0)) {
                    let attributeType;
                    const attribute_old_id = attributeRow.getAttribute("id");

                    if(attribute_old_id == "<new>") {
                        attributeType = new AttributeType(this._obsel_type.parent_model);

                        const modelAttributeTypes = this._obsel_type.parent_model.attribute_types;
                        modelAttributeTypes.push(attributeType);
                        this._obsel_type.parent_model.attribute_types = modelAttributeTypes;

                        const obselAttributeTypes = this._obsel_type.attribute_types;
                        obselAttributeTypes.push(attributeType);
                        this._obsel_type.attribute_types = obselAttributeTypes;
                    }
                    else {
                        attributeType = this._obsel_type.parent_model.get_attribute_type(attribute_old_id);
                        
                        if(!attributeType) {
                            const error = new KtbsError("Cannot retrieve attribute type " + attribute_old_id + " from the model");
                            this.emitErrorEvent(error);
                            throw error;
                        }
                    }

                    attributeType.id = idInput.value;
                    attributeRow.setAttribute("id", attributeType.id);
                    attributeRow.querySelector("td.id-cell span.view").innerText = attributeType.id;

                    // update label translations
                    const labelTranslationsArray = JSON.parse(labelInput.value);

                    if(labelTranslationsArray instanceof Array) {
                        for(let i = 0; i < labelTranslationsArray.length; i++) {
                            if(labelTranslationsArray[i].lang == "*")
                                attributeType.label = labelTranslationsArray[i].value;
                            else
                                attributeType.set_translated_label(labelTranslationsArray[i].value, labelTranslationsArray[i].lang);
                        }

                        // remove old translations in this._obsel_type that are not set in the input anymore
                        const label_translations = attributeType.label_translations;

                        for(let i = 0; i < label_translations.length; i++) {
                            const aTranslation = label_translations[i];
                            const translationLang = aTranslation["@language"];
                            let langIsSetInInput = false;

                            for(let j = 0; !langIsSetInInput && (j < labelTranslationsArray.length); j++)
                                langIsSetInInput = labelTranslationsArray[i].lang == translationLang;

                            if(!langIsSetInInput)
                                attributeType.remove_label_translation(translationLang);
                        }
                    }
                    else
                        this.emitErrorEvent(new Error("Label translations object is not an Array"));

                    attributeRow.querySelector("td.label-cell span.view").innerText = attributeType.get_preferred_label(this._lang);
                    // ---

                    // update data types
                    const dataTypes = new Array();

                    for(let i = 0; i < typeSelect.selectedOptions.length; i++)
                        dataTypes.push(typeSelect.selectedOptions[i].value);
                    
                    attributeType.data_types = dataTypes;
                    attributeRow.querySelector("td.datatypes-cell span.view").innerText = attributeType.data_types.join(", ");
                    // ---

                    if(attributeRow.classList.contains("is-shared-attributetype"))
                        this.dispatchEvent(new CustomEvent("change-attribute-type", {bubbles: true, cancelable: false, composed: false, detail: {attributeType: attributeType}}));
                }
            }
            else
                this.emitErrorEvent(new Error("Cannot retrieve attribute's table row's form elements"));
        }
        else
            this.emitErrorEvent(new Error("Cannot retrieve attribute's table row"));

        this._emitChangeEvent();
    }

    /**
     * 
     */
    resetObselType() {
        this._obsel_type = this._obsel_type_copy;
        this._set_obsel_type(this._obsel_type);
    }

    /**
     * 
     */
    _onClickRemoveAttributeButton(event) {
        const attributeRow = event.target.closest("tr");

        // remove the attribute type from the obseltype
        const idInput = attributeRow.querySelector("td.id-cell ktbs4la2-resource-id-input");

        if(idInput && idInput._lastValidValue) {
            const attribute_types = this._obsel_type.attribute_types;

            for(let i = 0; i < attribute_types.length; i++)
                if(attribute_types[i].id == idInput._lastValidValue) {
                    this._obsel_type.removeAttributeType(attribute_types[i]);
                    break;
                }
        }
        // ---
        
        // decrease rowspan attribute of the vertical cell for the obsel type's row group
        const obseltypesCells = this._attributesListTableBody.querySelectorAll("tr td[rowspan].vertical-cell");

        if(
                (obseltypesCells.length > 1)
            &&  (obseltypesCells[obseltypesCells.length - 1].innerText == this._obsel_type.get_preferred_label(this._lang))
        ) {
            const currentObselTypeVerticalCell = obseltypesCells[obseltypesCells.length - 1];
            const currentRowspan = parseInt(currentObselTypeVerticalCell.getAttribute("rowspan"), 10);
            currentObselTypeVerticalCell.setAttribute("rowspan", (currentRowspan - 1));

            // move the vertical cell for the obsel type's row group, if necessary
            if(currentObselTypeVerticalCell.parentNode == attributeRow) {
                const nextAttributeRow = attributeRow.nextSibling;

                if(nextAttributeRow)
                    nextAttributeRow.prepend(currentObselTypeVerticalCell);
            }
        }

        // remove current attribute row
        attributeRow.remove();

        this._updateAvailableAttributeTypesSelect();

        // notify of changes
        this._emitChangeEvent();
    }

    /**
     * 
     * @param {*} event 
     */
    _onMouseOverRemoveAttributeButton(event) {
        const attributeRow = event.target.closest("tr");

        if(!attributeRow.classList.contains("remove"))
            attributeRow.classList.add("remove");
    }

    /**
     * 
     * @param {*} event 
     */
    _onMouseOutRemoveAttributeButton(event) {
        const attributeRow = event.target.closest("tr");

        if(attributeRow.classList.contains("remove"))
            attributeRow.classList.remove("remove");
    }

    /**
     * 
     */
    get obsel_type() {
        return this._obsel_type;
    }

    /**
     * 
     */
    _updateAvailableAttributeTypesSelect() {
        const options = this._addAttributetypeSelect.options;

        for(let i = (options.length -1); i >= 0; i--)
            if(options[i].id != "new")
                options[i].remove();

        const model_attribute_types = this._obsel_type.parent_model.attribute_types;

        for(let i = 0; i < model_attribute_types.length; i++) {
            const anAttributeType = model_attribute_types[i];

            if(!this._obsel_type.available_attribute_types.includes(anAttributeType)) {
                const option = document.createElement("option");
                option.setAttribute("value", anAttributeType.id);
                option.innerText = anAttributeType.get_preferred_label(this._lang);
                this._addAttributetypeSelect.appendChild(option);
            }      
        }
    }

    /**
     * 
     */
    _onClickAddAttributeButton() {
        const selectAttributeOption = this._addAttributetypeSelect.value;
        let selectedSharedAttribute = null;

        if(selectAttributeOption != "<new>")
            selectedSharedAttribute = this._obsel_type.parent_model.get_attribute_type(selectAttributeOption);
        
        if(selectedSharedAttribute instanceof AttributeType) {
            selectedSharedAttribute.assignToObselType(this._obsel_type);
            this.dispatchEvent(new CustomEvent("change-attribute-type", {bubbles: true, cancelable: false, composed: false, detail: {attributeType: selectedSharedAttribute}}));
        }

        // check if the table already has a row group for the current obsel type
        const obseltypesCells = this._attributesListTableBody.querySelectorAll("tr td[rowspan].vertical-cell");
        let currentObselTypeVerticalCell;

        if(
                (obseltypesCells.length > 1)
            &&  (obseltypesCells[obseltypesCells.length - 1].innerText == this._obsel_type.get_preferred_label(this._lang))
        ) 
            currentObselTypeVerticalCell = obseltypesCells[obseltypesCells.length - 1];

        // create the new table line for the attribute
        const newTableRow = document.createElement("tr");
            newTableRow.classList.add("own");
            newTableRow.setAttribute("id", selectAttributeOption);

            if(selectedSharedAttribute instanceof AttributeType)
                newTableRow.classList.add("is-shared-attributetype");

            if(!currentObselTypeVerticalCell) {
                currentObselTypeVerticalCell = document.createElement("td");
                    currentObselTypeVerticalCell.className = "vertical-cell";
                    currentObselTypeVerticalCell.setAttribute("rowspan", "0");
                    currentObselTypeVerticalCell.innerText = this._obsel_type.get_preferred_label(this._lang);
                newTableRow.appendChild(currentObselTypeVerticalCell);
            }

            const idCell = document.createElement("td");
                idCell.classList.add("id-cell");

                if(selectedSharedAttribute instanceof AttributeType) {
                    const sharedAttributeTypeIndicator = document.createElement("span");
                        sharedAttributeTypeIndicator.classList.add("shared-attribute-indicator");
                        let sharedAttributeTypeMsg = this._translateString("This attribute type is shared between several obsel types :");
                        
                        for(let j = 0; j < selectedSharedAttribute.obsel_types.length; j++)
                            sharedAttributeTypeMsg += "\n" + selectedSharedAttribute.obsel_types[j].get_preferred_label(this._lang);
    
                        sharedAttributeTypeIndicator.setAttribute("title", sharedAttributeTypeMsg);
                    idCell.appendChild(sharedAttributeTypeIndicator);
                }

                const idInput = document.createElement("ktbs4la2-resource-id-input");
                    idInput.classList.add("create");
                    idInput.classList.add("edit");
                    idInput.setAttribute("required", true);
                    idInput.setAttribute("placeholder", "<id>");
                    idInput.setAttribute("lang", this._lang);

                    if(this.reserved_attributetypes_ids > 1)
                        idInput.setAttribute("reserved-ids", this.reserved_attributetypes_ids.join(" "));

                    if(selectedSharedAttribute instanceof AttributeType) {
                        idInput.setAttribute("value", selectedSharedAttribute.id);
                        idInput._lastValidValue = selectedSharedAttribute.id;
                    }

                    idInput.addEventListener("input", this._onChangeIdInput.bind(this));
                    idInput.addEventListener("change", this._onChangeIdInput.bind(this));
                idCell.appendChild(idInput);

                const idDisplaySpan = document.createElement("span");
                    idDisplaySpan.classList.add("view");
                idCell.appendChild(idDisplaySpan);
            newTableRow.appendChild(idCell);

            const labelCell = document.createElement("td");
                labelCell.classList.add("label-cell");

                const labelSpan = document.createElement("span");
                    labelSpan.classList.add("view");
                labelCell.appendChild(labelSpan);

                const labelInput = document.createElement("ktbs4la2-multiple-translations-text-input");
                    labelInput.setAttribute("placeholder", this._translateString("Attribute type label"));
                    labelInput.setAttribute("lang", this._lang);
                    labelInput.classList.add("edit");

                    if(
                            (selectedSharedAttribute instanceof AttributeType)
                        &&  (selectedSharedAttribute.label_translations instanceof Array)
                    ) {
                        const labelTranslationsArray = new Array();

                        for(let j = 0; j < selectedSharedAttribute.label_translations.length; j++)
                            labelTranslationsArray.push({"value": selectedSharedAttribute.label_translations[j]["@value"], "lang": selectedSharedAttribute.label_translations[j]["@language"]})
                        
                        labelInput.setAttribute("value", JSON.stringify(labelTranslationsArray));
                    }

                    labelInput.addEventListener("input", this._onChangeAttributeType.bind(this));
                    labelInput.addEventListener("change", this._onChangeAttributeType.bind(this));
                labelCell.appendChild(labelInput);
            newTableRow.appendChild(labelCell);

            const typeCell = document.createElement("td");
                typeCell.classList.add("datatypes-cell");

                const typeSpan = document.createElement("span");
                    typeSpan.classList.add("view");
                typeCell.appendChild(typeSpan);

                const typeSelect = document.createElement("select");
                    typeSelect.classList.add("edit");
                    typeSelect.setAttribute("multiple", "true");
                    typeSelect.setAttribute("required", true);

                    const availableTypes = ["xsd:string", "xsd:integer", "xsd:float", "xsd:dateTime", "xsd:boolean", "Obsel"];

                    for(let j = 0; j < availableTypes.length; j++) {
                        const aTypeOption = document.createElement("option");
                        aTypeOption.setAttribute("value", availableTypes[j]);
                        aTypeOption.innerText = availableTypes[j];

                        if(
                                (selectedSharedAttribute instanceof AttributeType)
                            &&  (selectedSharedAttribute.data_types.includes(availableTypes[j]))
                        )
                            aTypeOption.setAttribute("selected", "true");

                        typeSelect.appendChild(aTypeOption);
                    }

                    typeSelect.addEventListener("change", this._onChangeAttributeType.bind(this));
                typeCell.appendChild(typeSelect);
            newTableRow.appendChild(typeCell);

            const actionCell = document.createElement("td");
                actionCell.classList.add("edit");
                const removeButton = document.createElement("button");
                    removeButton.classList.add("remove-attribute-button");
                    removeButton.setAttribute("title", this._translateString("Remove this attribute type from the obsel type"));
                    removeButton.innerText = "❌";
                    removeButton.addEventListener("mouseover", this._onMouseOverRemoveAttributeButton.bind(this));
                    removeButton.addEventListener("mouseout", this._onMouseOutRemoveAttributeButton.bind(this));
                    removeButton.addEventListener("click", this._onClickRemoveAttributeButton.bind(this));
                actionCell.appendChild(removeButton);
            newTableRow.appendChild(actionCell);
        this._attributesListTableBody.appendChild(newTableRow);

        // increase rowspan attribute of the vertical cell for the obsel type's row group
        const currentRowspan = parseInt(currentObselTypeVerticalCell.getAttribute("rowspan"), 10);
        currentObselTypeVerticalCell.setAttribute("rowspan", (currentRowspan + 1));
        this._updateAvailableAttributeTypesSelect();

        this._emitChangeEvent();

        idInput._componentReady.then(() => {
            setTimeout(() => {
                idInput.focus();
            });
        });
    }

    /**
     * 
     */
    _emitChangeEvent() {
        this.dispatchEvent(new CustomEvent("change", {bubbles: true, cancelable: false, composed: false}));
    }
}

customElements.define('ktbs4la2-model-diagram-obseltype-details', KTBS4LA2ModelDiagramObseltypeDetails);