import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";
import {ObselType} from "../../ktbs-api/ObselType.js";
import {lightOrDark} from "../common/colors-utils.js";

import "../ktbs4la2-document-header/ktbs4la2-document-header.js";

/**
 * 
 */
 class KTBS4LA2ModelDiagramObseltype extends TemplatedHTMLElement {

    /**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true);

        this._resolveObselTypeSet;

        this._obselTypeSet = new Promise((resolve, reject) => {
            this._resolveObselTypeSet = resolve;
        });

        this._resolveElementPopulated;

        this.elementPopulated = new Promise((resolve, reject) => {
            this._resolveElementPopulated = resolve;
        });
    }

    /**
	 * 
	 */
	/*static get observedAttributes() {
		let _observedAttributes = super.observedAttributes;
        //_observedAttributes.push("..");
		return _observedAttributes;
    }*/

    /**
	 * 
	 */
	/*attributeChangedCallback(name, oldValue, newValue) {
		super.attributeChangedCallback(name, oldValue, newValue);

        // if(name == "...")

    }*/

    /**
	 * 
	 */
	onComponentReady() {
        this._container = this.shadowRoot.querySelector("#container");
        this._header = this.shadowRoot.querySelector("#container header");
        this._symbolSpan = this.shadowRoot.querySelector("#symbol");
        this._titleH2 = this.shadowRoot.querySelector("#title");
        this._article = this.shadowRoot.querySelector("#container article");
        this._attributetypesList = this.shadowRoot.querySelector("#attributetypes-list");

        this._obselTypeSet.then(() => {
            if(this._obsel_type.suggestedSymbol)
                this._symbolSpan.innerHTML = this._obsel_type.suggestedSymbol;

            if(this._obsel_type.suggestedColor) {
                this._container.className = lightOrDark(this._obsel_type.suggestedColor);
                this._header.style.backgroundColor = this._obsel_type.suggestedColor;
                this._header.style.borderColor = this._obsel_type.suggestedColor;
                this._article.style.borderColor = this._obsel_type.suggestedColor;
            }

            let obseltype_preferred_label = this._obsel_type.get_translated_label(this._lang);

            if(!obseltype_preferred_label)
                obseltype_preferred_label = this._obsel_type.label;

            if(!obseltype_preferred_label)
                obseltype_preferred_label = this._obsel_type.id;

            this._titleH2.innerText = obseltype_preferred_label;

            if((this._obsel_type.attribute_types instanceof Array) && (this._obsel_type.attribute_types.length > 0)) {
                const attributesListContent = document.createDocumentFragment();

                for(let i = 0; i < this._obsel_type.attribute_types.length; i++) {
                    const attribute_type = this._obsel_type.attribute_types[i];
                    const anAttributeNode = document.createElement("li");

                    let attributetype_preferred_label = attribute_type.get_translated_label(this._lang);

                    if(!attributetype_preferred_label)
                        attributetype_preferred_label = attribute_type.label;

                    if(!attributetype_preferred_label)
                        attributetype_preferred_label = attribute_type.id;

                    anAttributeNode.innerText = attributetype_preferred_label;
                    attributesListContent.appendChild(anAttributeNode);
                }

                this._attributetypesList.appendChild(attributesListContent);    
            }

            this._resolveElementPopulated();
        });
    }

    /**
     * 
     */
    _updateStringsTranslation() {

    }

    /**
     * 
     */
    set obsel_type(new_obsel_type) {
        if(new_obsel_type instanceof ObselType) {
            this._obsel_type = new_obsel_type;
            this._resolveObselTypeSet();
        }
        else
            throw new TypeError("new value for property obsel_type must be an instance of ObselType");
    }

    /**
     * 
     */
    get obsel_type() {
        return this._obsel_type;
    }

}

customElements.define('ktbs4la2-model-diagram-obseltype', KTBS4LA2ModelDiagramObseltype);