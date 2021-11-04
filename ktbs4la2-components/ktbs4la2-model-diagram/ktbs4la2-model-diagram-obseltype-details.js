import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";
import {ObselType} from "../../ktbs-api/ObselType.js";
import {AttributeType} from "../../ktbs-api/AttributeType.js";
import {lightOrDark, colorNameToHex} from "../common/colors-utils.js";

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
	static get observedAttributes() {
		let _observedAttributes = super.observedAttributes;
        _observedAttributes.push("mode");
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
        }
    }

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
	onComponentReady() {
        this._obseltypeSymbolSpan = this.shadowRoot.querySelector("#obseltype-symbol");
        this._labelDisplayP = this.shadowRoot.querySelector("#label-display");
        this._labelSpan = this.shadowRoot.querySelector("#label");
        this._labelInput = this.shadowRoot.querySelector("#label-input");
        this._labelInput.addEventListener("input", this._emitChangeEvent.bind(this));
        this._labelInput.addEventListener("change", this._emitChangeEvent.bind(this));
        this._idDisplaySpan = this.shadowRoot.querySelector("#id-display");
        this._obseltypeColorInput = this.shadowRoot.querySelector("#obseltype-color-input");
        this._obseltypeColorInput.addEventListener("input", this._emitChangeEvent.bind(this));
        this._obseltypeColorInput.addEventListener("change", this._emitChangeEvent.bind(this));
        this._obseltypeSymbolInput = this.shadowRoot.querySelector("#obseltype-symbol-input");
        this._obseltypeSymbolInput.addEventListener("input", this._emitChangeEvent.bind(this));
        this._obseltypeSymbolInput.addEventListener("change", this._emitChangeEvent.bind(this));
        this._parentObseltypeSelectLabel = this.shadowRoot.querySelector("#parent-obseltype-select-label");
        this._parentObseltypeSelect = this.shadowRoot.querySelector("#parent-obseltype-select");
        this._parentObseltypeSelect.addEventListener("change", this._emitChangeEvent.bind(this));
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

        this._addAttributeButton = this.shadowRoot.querySelector("#add-attribute-button");
        this._addAttributeButton.addEventListener("click", this._onClickAddAttributeButton.bind(this));
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
    }

    /**
     * 
     */
     set obsel_type(new_obsel_type) {
        if(new_obsel_type instanceof ObselType) {
            if(new_obsel_type != this._obsel_type) {
                this._obsel_type = new_obsel_type;

                if(this.mode == "edit")
                    this._obsel_type_copy = this._obsel_type.clone();

                if(this._obsel_type.suggestedSymbol) {
                    this._obseltypeSymbolSpan.innerText = this._obsel_type.suggestedSymbol;
                    this._obseltypeSymbolInput.setAttribute("value", this._obsel_type.suggestedSymbol);
                }
                else {
                    this._obseltypeSymbolSpan.innerText = "";
                    this._obseltypeSymbolInput.setAttribute("value", "");
                }

                this._labelSpan.innerText = this._obsel_type.get_preferred_label(this._lang);
                
                if(this._obsel_type.suggestedColor) {
                    this._labelDisplayP.style.backgroundColor = this._obsel_type.suggestedColor;
                    const isColorCode = /^#[0-9A-F]{6}$/i.test(this._obsel_type.suggestedColor);

                    if(isColorCode)
                        this._obseltypeColorInput.setAttribute("value", this._obsel_type.suggestedColor);
                    else {
                        const colorCode = colorNameToHex(this._obsel_type.suggestedColor);

                        if(colorCode)
                            this._obseltypeColorInput.setAttribute("value", colorCode);
                        else
                            if(this._obseltypeColorInput.hasAttribute("value"))
                                this._obseltypeColorInput.removeAttribute("value");
                    }
                }
                else {
                    this._labelDisplayP.style.backgroundColor = null;

                    if(this._obseltypeColorInput.hasAttribute("value"))
                        this._obseltypeColorInput.removeAttribute("value");
                }

                if(this._obsel_type.suggestedColor)
                    this._labelDisplayP.className = "view "+lightOrDark(this._obsel_type.suggestedColor);
                else
                    this._labelDisplayP.className = "view";

                if(this._obsel_type.label_translations instanceof Array) {
                    const labelTranslationsArray = new Array();

                    for(let i = 0; i < this._obsel_type.label_translations.length; i++)
                        labelTranslationsArray.push({"value": this._obsel_type.label_translations[i]["@value"], "lang": this._obsel_type.label_translations[i]["@language"]})
                    
                    this._labelInput.setAttribute("value", JSON.stringify(labelTranslationsArray));
                }
                else
                    this._labelInput.removeAttribute("value");

                this._idDisplaySpan.innerText = "#" + this._obsel_type.id;
                this._parentObseltypeSelect.setAttribute("model-uri", this._obsel_type.parent_model.uri.toString());

                const parentObselTypesUris = new Array();
                const parentObseltypesLabels = new Array();
                const parentObselType = this._obsel_type.super_obsel_types;

                for(let i = 0; i < this._obsel_type.super_obsel_types.length; i++) {
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
                for(let i = 0; i < this._obsel_type.super_obsel_types.length; i++) {
                    const aParentObselType = this._obsel_type.super_obsel_types[i];

                    for(let j = 0; j < aParentObselType.attribute_types.length; j++) {
                        const anAttribute = aParentObselType.attribute_types[j];
                        const attributeRowElement = document.createElement("tr");
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
                        
                        this._attributesListTableBody.appendChild(attributeRowElement);
                    }
                }

                // ... with current obsel type's own attributes

                for(let i = 0; i < this._obsel_type.attribute_types.length; i++) {
                    const anAttribute = this._obsel_type.attribute_types[i];
                    const attributeRowElement = document.createElement("tr");
                    attributeRowElement.setAttribute("id", anAttribute.id);

                    if(i == 0) {
                        const originCell = document.createElement("td");
                        originCell.setAttribute("rowspan", this._obsel_type.attribute_types.length);
                        originCell.classList.add("vertical-cell");
                        originCell.innerText = this._obsel_type.get_preferred_label(this._lang);
                        attributeRowElement.appendChild(originCell);
                    }

                    const idCell = document.createElement("td");
                        const idInput = document.createElement("ktbs4la2-resource-id-input");
                            idInput.classList.add("create");
                            idInput.classList.add("edit");
                            idInput.setAttribute("value", anAttribute.id);
                            idInput.setAttribute("placeholder", "<id>");
                            idInput.addEventListener("input", this._emitChangeEvent.bind(this));
                            idInput.addEventListener("change", this._emitChangeEvent.bind(this));
                        idCell.appendChild(idInput);

                        const idDisplaySpan = document.createElement("span");
                            idDisplaySpan.classList.add("view");
                            idDisplaySpan.innerText = anAttribute.id;
                        idCell.appendChild(idDisplaySpan);
                    attributeRowElement.appendChild(idCell);

                    const labelCell = document.createElement("td");

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

                    labelInput.addEventListener("input", this._emitChangeEvent.bind(this));
                    labelInput.addEventListener("change", this._emitChangeEvent.bind(this));

                    labelCell.appendChild(labelInput);

                    attributeRowElement.appendChild(labelCell);

                    const typeCell = document.createElement("td");
                    const typeSpan = document.createElement("span");
                    typeSpan.classList.add("view");
                    typeSpan.innerText = anAttribute.data_types.join(", ");
                    typeCell.appendChild(typeSpan);

                    const typeSelect = document.createElement("select");
                    typeSelect.classList.add("edit");
                    typeSelect.setAttribute("multiple", "true");

                    const availableTypes = ["xsd:string", "xsd:integer", "xsd:float", "xsd:dateTime", "xsd:boolean", "Obsel"];

                    for(let j = 0; j < availableTypes.length; j++) {
                        const aTypeOption = document.createElement("option");
                        aTypeOption.setAttribute("value", availableTypes[j]);
                        aTypeOption.innerText = availableTypes[j];

                        if(anAttribute.data_types.includes(availableTypes[j]))
                            aTypeOption.setAttribute("selected", "true");

                        typeSelect.appendChild(aTypeOption);
                    }

                    typeSelect.addEventListener("change", this._emitChangeEvent.bind(this));
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
            }
        }
        else
            throw new TypeError("new value for property obsel_type must be an instance of ObselType");
    }

    /**
     * 
     */
    _onClickRemoveAttributeButton(event) {
        const attributeRow = event.target.closest("tr");
        
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

        // @TODO remove attribute from obseltype

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
    _onClickAddAttributeButton() {
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
            if(!currentObselTypeVerticalCell) {
                currentObselTypeVerticalCell = document.createElement("td");
                    currentObselTypeVerticalCell.className = "vertical-cell";
                    currentObselTypeVerticalCell.setAttribute("rowspan", "0");
                    currentObselTypeVerticalCell.innerText = this._obsel_type.get_preferred_label(this._lang);
                newTableRow.appendChild(currentObselTypeVerticalCell);
            }

            const idCell = document.createElement("td");
                const idInput = document.createElement("ktbs4la2-resource-id-input");
                    idInput.classList.add("create");
                    idInput.classList.add("edit");
                    idInput.setAttribute("placeholder", "<id>");
                    idInput.addEventListener("input", this._emitChangeEvent.bind(this));
                    idInput.addEventListener("change", this._emitChangeEvent.bind(this));
                idCell.appendChild(idInput);

                const idDisplaySpan = document.createElement("span");
                    idDisplaySpan.classList.add("view");
                idCell.appendChild(idDisplaySpan);
            newTableRow.appendChild(idCell);

            const labelCell = document.createElement("td");
                const labelSpan = document.createElement("span");
                    labelSpan.classList.add("view");
                labelCell.appendChild(labelSpan);

                const labelInput = document.createElement("ktbs4la2-multiple-translations-text-input");
                    labelInput.setAttribute("placeholder", this._translateString("Attribute type label"));
                    labelInput.setAttribute("lang", this._lang);
                    labelInput.classList.add("edit");
                    labelInput.addEventListener("input", this._emitChangeEvent.bind(this));
                    labelInput.addEventListener("change", this._emitChangeEvent.bind(this));
                labelCell.appendChild(labelInput);
            newTableRow.appendChild(labelCell);

            const typeCell = document.createElement("td");
                const typeSpan = document.createElement("span");
                    typeSpan.classList.add("view");
                typeCell.appendChild(typeSpan);

                const typeSelect = document.createElement("select");
                    typeSelect.classList.add("edit");
                    typeSelect.setAttribute("multiple", "true");

                    const availableTypes = ["xsd:string", "xsd:integer", "xsd:float", "xsd:dateTime", "xsd:boolean", "Obsel"];

                    for(let j = 0; j < availableTypes.length; j++) {
                        const aTypeOption = document.createElement("option");
                        aTypeOption.setAttribute("value", availableTypes[j]);
                        aTypeOption.innerText = availableTypes[j];
                        typeSelect.appendChild(aTypeOption);
                    }

                    typeSelect.addEventListener("change", this._emitChangeEvent.bind(this));
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

        idInput._componentReady.then(() => {
            idInput.focus();
        });

        this._emitChangeEvent();
    }

    /**
     * 
     */
    _emitChangeEvent() {
        this.dispatchEvent(new CustomEvent("change", {bubbles: true, cancelable: false, composed: false}));
    }
}

customElements.define('ktbs4la2-model-diagram-obseltype-details', KTBS4LA2ModelDiagramObseltypeDetails);