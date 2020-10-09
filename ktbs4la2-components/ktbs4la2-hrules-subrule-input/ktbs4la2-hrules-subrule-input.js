import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

import "../ktbs4la2-obsel-type-select/ktbs4la2-obsel-type-select.js";
import "../ktbs4la2-multiple-hrules-attribute-constraints-input/ktbs4la2-multiple-hrules-attribute-constraints-input.js";

/**
 * 
 */
class KTBS4LA2HrulesSubruleInput extends TemplatedHTMLElement {

    /**
	 * 
	 */
	constructor() {
        super(import.meta.url, true);
        
        if(this.attachInternals)
            this._internals = this.attachInternals();
    }
    
    /**
     * 
     */
    static formAssociated = true;

    /**
     * 
     */
    get form() {
        if(this._internals)
            return this._internals.form;
        else
            return undefined;
    }
    
    /**
     * 
     */
    get name() {
        return this.getAttribute('name');
    }
    
    /**
     * 
     */
    get type() {
        return this.localName;
    }

    /**
     * 
     */
    get value() {
        const returnObject = {
            "type": this._obselTypeSelect.value?this._obselTypeSelect.value:"",
            "attributes": JSON.parse(this._attributeConstraints.value)
        };

        return JSON.stringify(returnObject);
    }
 
    /**
     * 
     */
    set value(newValue) {
        if(newValue != null) {
            if(this.getAttribute("value") != newValue)
                this.setAttribute("value", newValue);
        }
        else if(this.hasAttribute("value"))
            this.removeAttribute("value");
    }
    
    /**
     * 
     */
    get required() {
        return this.hasAttribute("required");
    }

    /**
     * 
     */
    set required(newValue) {
        if(newValue != null) {
            if(this.getAttribute("required") != newValue)
                this.setAttribute("required", newValue);
        }
        else if(this.hasAttribute("required"))
            this.removeAttribute("required");
    }

    /**
     * 
     */
    checkValidity() {
        return (
                !this.required
            ||  this._obselTypeSelect.value
            ||  (this._attributeConstraints.value != "[]")
        );
    }

    /**
	 * 
	 */
	onComponentReady() {
        this._obselTypeSelectLabel = this.shadowRoot.querySelector("#obsel-type-select-label");
        this._obselTypeSelect = this.shadowRoot.querySelector("#obsel-type-select");
        this._obselTypeSelect.setAttribute("lang", this._lang);
        this._obselTypeSelect.addEventListener("focus", this._onChildElementFocus.bind(this));
        this._obselTypeSelect.addEventListener("change", this._onChangeObselTypeSelect.bind(this));
        this._obselTypeSelect.addEventListener("input", this._onInputObselTypeSelect.bind(this));
        this._obselTypeSelectLabel.addEventListener("click", this._onClickObselTypeSelectLabel.bind(this));
        this._obselTypeSelectLabel.addEventListener("focus", this._onChildElementFocus.bind(this));
        this._attributeConstraintsLabel = this.shadowRoot.querySelector("#attribute-constraints-label");
        this._attributeConstraints = this.shadowRoot.querySelector("#attribute-constraints");
        this._attributeConstraints.setAttribute("lang", this._lang);
        this._attributeConstraints.addEventListener("focus", this._onChildElementFocus.bind(this));
        this._attributeConstraints.addEventListener("input", this._onChildEvent.bind(this));
        this._attributeConstraints.addEventListener("change", this._onChildEvent.bind(this));
        this._attributeConstraintsLabel.addEventListener("click", this._onClickAttributeConstraintsLabel.bind(this));
        this._attributeConstraintsLabel.addEventListener("focus", this._onChildElementFocus.bind(this));
    }

    /**
	 * 
	 */
	static get observedAttributes() {
        let _observedAttributes = super.observedAttributes;
        _observedAttributes.push("model-uri");
        _observedAttributes.push("value");
        return _observedAttributes;
    }

    /**
	 * 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        
        if(name == "value") {
            if(newValue) {
                try {
                    const valueObject = JSON.parse(newValue);

                    if(valueObject instanceof Object) {
                        this._componentReady.then(() => {
                            if(valueObject.type)
                                this._obselTypeSelect.setAttribute("value", valueObject.type);

                            if(valueObject.attributes)
                                this._attributeConstraints.setAttribute("value", JSON.stringify(valueObject.attributes));
                        }).catch(() => {});
                    }
                    else
                        this.emitErrorEvent(new Error("Invalid value : must be a JSON Object"));
                }
                catch(error) {
                    this.emitErrorEvent(error);
                }
            }
            else {
                this._componentReady.then(() => {
                    if(this._obselTypeSelect.hasAttribute("value"))
                        this._obselTypeSelect.removeAttribute("value");

                    if(this._attributeConstraints.hasAttribute("value"))
                        this._attributeConstraints.removeAttribute("value");
                }).catch(() => {});
            }
        }
        else if(name == "model-uri") {
            this._componentReady.then(() => {
                this._obselTypeSelect.setAttribute("model-uri", newValue);
                this._attributeConstraints.setAttribute("model-uri", newValue);
            }).catch(() => {});
        }
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._obselTypeSelectLabel.innerText = this._translateString("Obsel type") + " : ";
        this._obselTypeSelect.setAttribute("lang", this._lang);
        this._attributeConstraintsLabel.innerText = this._translateString("Attribute constraints") + " : ";
        this._attributeConstraints.setAttribute("lang", this._lang);
    }

    /**
     * 
     */
    _onFocus(event) {
        event.preventDefault();
        event.stopPropagation();

        this._obselTypeSelect._componentReady.then(() => {
            setTimeout(() => {
                this._obselTypeSelect.focus();
            });
        }).catch(() => {});
    }

    /**
	 * 
	 */
	_onChildElementFocus(event) {
		event.stopPropagation();
	}

    /**
     * 
     */
    _onClickObselTypeSelectLabel(event) {
        event.stopPropagation();
        this._obselTypeSelect.focus();
    }

    /**
     * 
     */
    _onClickAttributeConstraintsLabel(event) {
        event.stopPropagation();
        this._attributeConstraints.focus();
    }

    /**
     * 
     */
    _onChangeObselTypeSelect(event) {
        if(this._obselTypeSelect.value)
            this._attributeConstraints.setAttribute("obsel-type", this._obselTypeSelect.value);
        else if(this._attributeConstraints.hasAttribute("obsel-type"))
            this._attributeConstraints.removeAttribute("obsel-type");

        this._onChildEvent(event);
    }

    /**
     * 
     */
    _onInputObselTypeSelect(event) {
        event.stopPropagation();
    }

    /**
     * 
     */
    _onChildEvent(event) {
        event.stopPropagation();
 
        const componentEvent = new Event(event.type, {
            bubbles: true,
            cancelable: false,
            composed: event.composed
        });

        this.dispatchEvent(componentEvent);
    }
}

customElements.define('ktbs4la2-hrules-subrule-input', KTBS4LA2HrulesSubruleInput);