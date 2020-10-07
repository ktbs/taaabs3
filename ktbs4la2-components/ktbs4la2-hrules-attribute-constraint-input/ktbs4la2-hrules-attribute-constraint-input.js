import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';
import "../ktbs4la2-attribute-type-select/ktbs4la2-attribute-type-select.js";

/**
 * 
 */
class KTBS4LA2HrulesAttributeConstraintInput extends TemplatedHTMLElement {

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
        if(this._attributeTypeSelect.value) {
            const returnObject = {
                "uri": this.model_uri + "#" + this._attributeTypeSelect.value,
                "operator": this._operatorSelect.value,
                "value": this._valueInput.value
            };

            return JSON.stringify(returnObject);
        }
        else
            return null;
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
    get obsel_type() {
        return this.getAttribute("obsel-type");
    }

    /**
     * 
     */
    set obsel_type(newValue) {
        if(newValue != null) {
            if(this.getAttribute("obsel-type") != newValue)
                this.setAttribute("obsel-type", newValue);
        }
        else if(this.hasAttribute("obsel-type"))
            this.removeAttribute("obsel-type");
    }

    /**
     * 
     */
    get model_uri() {
        return this.getAttribute("model-uri");
    }

    /**
     * 
     */
    set model_uri(newValue) {
        if(newValue != null) {
            if(this.getAttribute("model-uri") != newValue)
                this.setAttribute("model-uri", newValue);
        }
        else if(this.hasAttribute("model-uri"))
            this.removeAttribute("model-uri");
    }

    /**
     * 
     */
    checkValidity() {
        return (
                !(this.required && !this._valueInput.value)
            &&  !(this._valueInput.value && !this._attributeTypeSelect.value)
        );
    }

    /**
	 * 
	 */
	static get observedAttributes() {
        let _observedAttributes = super.observedAttributes;
        _observedAttributes.push("model-uri");
        _observedAttributes.push("obsel-type");
        _observedAttributes.push("value");
        _observedAttributes.push("required");
        return _observedAttributes;
    }

    /**
	 * 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);

        if(name == "model-uri")
            this._componentReady.then(() => {
                this._attributeTypeSelect.setAttribute("model-uri", newValue);
            }).catch(() => {});
        else if(name == "obsel-type")
            this._componentReady.then(() => {
                this._attributeTypeSelect.setAttribute("obsel-type", newValue);
            }).catch(() => {});
        else if(name == "value") {
            if(newValue) {
                try {
                    const valueObject = JSON.parse(newValue);

                    this._componentReady.then(() => {
                        if(valueObject.uri) {
                            if(this.model_uri && valueObject.uri.startsWith(this.model_uri + "#"))
                                this._attributeTypeSelect.setAttribute("value", valueObject.uri.substring(this.model_uri.length + 1));
                            else
                                this._attributeTypeSelect.setAttribute("value", valueObject.uri);
                        }

                        if(valueObject.operator) {
                            switch(valueObject.operator) {
                                case "==" :
                                    this._operatorSelect.selectedIndex = 0;
                                    break;
                                case "<" :
                                    this._operatorSelect.selectedIndex = 1;
                                    break;
                                case ">" :
                                    this._operatorSelect.selectedIndex = 2;
                                    break;
                                case "<=" :
                                    this._operatorSelect.selectedIndex = 3;
                                    break;
                                case ">=" :
                                    this._operatorSelect.selectedIndex = 4;
                                    break;
                                default: 
                                    this.emitErrorEvent("Unsupported operator \"" + valueObject.operator + "\"");
                            }
                        }

                        if(valueObject.value)
                            this._valueInput.setAttribute("value", valueObject.value);
                    }).catch(() => {});
                }
                catch(error) {
                    this.emitErrorEvent(error);
                }
            }
            else {
                this._componentReady.then(() => {
                    this._attributeTypeSelect.value = "";
                    this._operatorSelect.selectedIndex = 0;
                    this._valueInput.value = "";
                }).catch(() => {});
            }
        }
        else if(name == "required") {
            this._componentReady.then(() => {
                this._attributeTypeSelect.setAttribute("required", newValue);
            }).catch(() => {});
        }
    }

    /**
	 * 
	 */
	onComponentReady() {
        this._attributeTypeSelect = this.shadowRoot.querySelector("#attribute-type-select");
        this._attributeTypeSelect.setAttribute("lang", this._lang);
        this._attributeTypeSelect.addEventListener("focus", this._onChildElementFocus.bind(this));
        this._attributeTypeSelect.addEventListener("change", this._onChildEvent.bind(this));
        this._attributeTypeSelect.addEventListener("input", this._onChildEvent.bind(this));
        this._operatorSelect = this.shadowRoot.querySelector("#operator-select");
        this._operatorSelect.addEventListener("focus", this._onChildElementFocus.bind(this));
        this._operatorSelect.addEventListener("change", this._onChildEvent.bind(this));
        this._operatorSelect.addEventListener("input", this._onChildEvent.bind(this));
        this._equalsOperator = this.shadowRoot.querySelector("#operator-equals");
        this._lowerThanOperator = this.shadowRoot.querySelector("#operator-lt");
        this._greaterThanOperator = this.shadowRoot.querySelector("#operator-gt");
        this._lowerThanOrEqualsOperator = this.shadowRoot.querySelector("#operator-lte");
        this._greaterThanOrEqualsOperator = this.shadowRoot.querySelector("#operator-gte");
        this._valueInput = this.shadowRoot.querySelector("#value-input");
        this._valueInput.addEventListener("focus", this._onChildElementFocus.bind(this));
        this._valueInput.addEventListener("change", this._onChildEvent.bind(this));
        this._valueInput.addEventListener("input", this._onChildEvent.bind(this));
        this.addEventListener("focus", this._onFocus.bind(this));
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._attributeTypeSelect.setAttribute("lang", this._lang);
        this._equalsOperator.setAttribute("title", this._translateString("Strictly equals"));
        this._lowerThanOperator.setAttribute("title", this._translateString("Is strictly inferior to"));
        this._greaterThanOperator.setAttribute("title", this._translateString("Is strictly superior to"));
        this._lowerThanOrEqualsOperator.setAttribute("title", this._translateString("Is inferior to or equals"));
        this._greaterThanOrEqualsOperator.setAttribute("title", this._translateString("Is superior to or equals"));
        this._valueInput.setAttribute("placeholder", this._translateString("Value"));
    }

    /**
     * 
     */
    _onFocus(event) {
        event.preventDefault();
        event.stopPropagation();

        this._componentReady.then(() => {
            this._attributeTypeSelect.focus();
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
    _onChildEvent(event) {
        event.stopPropagation();
 
        if((event.target == this._valueInput) || (event.type == "change")) {
            const componentEvent = new Event(event.type, {
                bubbles: true,
                cancelable: false,
                composed: event.composed
            });

            this.dispatchEvent(componentEvent);
        }
    }
}

customElements.define('ktbs4la2-hrules-attribute-constraint-input', KTBS4LA2HrulesAttributeConstraintInput);