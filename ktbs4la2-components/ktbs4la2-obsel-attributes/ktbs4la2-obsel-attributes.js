import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {Obsel} from "../../ktbs-api/Obsel.js";

/**
 * 
 */
function getFormattedDate(timestamp) {
    let date = new Date(timestamp);

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
class KTBS4LA2ObselAttributes extends KtbsResourceElement {

    /**
	 * 
	 */
	constructor() {
        super(import.meta.url, true, true);
        this._resolveTypeSet();
    }
    
    /**
     * 
     */
    _getKtbsResourceClass() {
        return Obsel;
    }

    /**
	 * 
	 */
	onComponentReady() {
        this._tableBody = this.shadowRoot.querySelector("#table-body");
    }

    /**
	 * 
	 */
	_updateStringsTranslation() {
        this._componentReady.then(() => {
            this._rebuildContent();
        });
    }

    /**
	 * 
	 */
	onktbsResourceLoaded() {
        this._componentReady.then(() => {
            this._rebuildContent();
        });
    }

    /**
     * 
     */
    _rebuildContent() {
        // remove current content
        while(this._tableBody.firstChild)
            this._tableBody.removeChild(this._tableBody.firstChild);

        // re-build content
        let showSystemAttributes = !((this.getAttribute("show-system-attributes") == "false") || (this.getAttribute("show-system-attributes") == "0"));
        
        if(showSystemAttributes) {
            let typeLine = document.createElement("tr");
            typeLine.classList.add("native-attribute");
            let typeLabelCell = document.createElement("td");
            typeLabelCell.innerText = this._translateString("Type");
            typeLine.appendChild(typeLabelCell);

            let obselTypeLabel;
            let obselType = this._ktbsResource.type;

            if(obselType) {
                let obselTypeTranslatedLabel = obselType.get_translated_label(this._lang);

                if(obselTypeTranslatedLabel)
                    obselTypeLabel = obselTypeTranslatedLabel;
                else
                    obselTypeLabel = obselType.label?obselType.label:obselType.id;
            }
            else
                obselTypeLabel = this._ktbsResource.type_id;

            let typeValueCell = document.createElement("td");
            typeValueCell.innerText = obselTypeLabel;
            typeLine.appendChild(typeValueCell);
            this._tableBody.appendChild(typeLine);

            let beginLine = document.createElement("tr");
            beginLine.classList.add("native-attribute");
            let beginLabelCell = document.createElement("td");
            beginLabelCell.innerText = this._translateString("Begin");
            beginLine.appendChild(beginLabelCell);

            let beginValueCell = document.createElement("td");
            beginValueCell.innerText = getFormattedDate(this._ktbsResource.begin);
            beginLine.appendChild(beginValueCell);
            this._tableBody.appendChild(beginLine);

            if(this._ktbsResource.end) {
                let endLine = document.createElement("tr");
                endLine.classList.add("native-attribute");
                let endLabelCell = document.createElement("td");
                endLabelCell.innerText = this._translateString("End");
                endLine.appendChild(endLabelCell);

                let endValueCell = document.createElement("td");
                endValueCell.innerText = getFormattedDate(this._ktbsResource.end);
                endLine.appendChild(endValueCell);
                this._tableBody.appendChild(endLine);
            }

            if(this._ktbsResource.subject) {
                let subjectLine = document.createElement("tr");
                subjectLine.classList.add("native-attribute");
                let subjectLabelCell = document.createElement("td");
                subjectLabelCell.innerText = this._translateString("Subject");
                subjectLine.appendChild(subjectLabelCell);

                let subjectValueCell = document.createElement("td");
                subjectValueCell.innerText = this._ktbsResource.subject;
                subjectLine.appendChild(subjectValueCell);
                this._tableBody.appendChild(subjectLine);
            }
        }

        // display other attributes (custom attributes)
        let obsel_attributes = this._ktbsResource.attributes;

        for(let i = 0; i < obsel_attributes.length; i++) {
            let obsel_attribute = obsel_attributes[i];
            let attributeTypeLabel;
            let attributeType = obsel_attribute.type;

            if(attributeType) {
                let attributeTypeTranslatedLabel = attributeType.get_translated_label(this._lang);

                if(attributeTypeTranslatedLabel)
                    attributeTypeLabel = attributeTypeTranslatedLabel;
                else {
                    let attributeTypeDefaultLabel = attributeType.label;

                    if(attributeTypeDefaultLabel)
                        attributeTypeLabel = attributeTypeDefaultLabel;
                    else
                        attributeTypeLabel = obsel_attribute.type_id;
                }
            }
            else
                attributeTypeLabel = obsel_attribute.type_id;

            let attributeLine = document.createElement("tr");
            let attributeTypeCell = document.createElement("td");
            attributeTypeCell.innerText = attributeTypeLabel;
            attributeLine.appendChild(attributeTypeCell);
            let attributeValueCell = document.createElement("td");
            attributeValueCell.innerText = obsel_attribute.value;
            attributeLine.appendChild(attributeValueCell);
            this._tableBody.appendChild(attributeLine);
        }
    }
}

customElements.define('ktbs4la2-obsel-attributes', KTBS4LA2ObselAttributes);