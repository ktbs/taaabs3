import {Model} from '../../ktbs-api/Model.js';
import {Trace} from '../../ktbs-api/Trace.js';
import {ResourceMultiton} from '../../ktbs-api/ResourceMultiton.js';
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
    setAttribute(name, value) {
        if(name == "value") {
            if(this._lastSetValuePromise)
                this._rejectLastSetValuePromise("A newer value has been set");

            this._lastSetValuePromise = new Promise((resolve, reject) => {
                this._resolveLastSetValuePromise = resolve;
                this._rejectLastSetValuePromise = reject;
            });

            super.setAttribute(name, value);
            return this._lastSetValuePromise;
        }
        else {
            super.setAttribute(name, value);
            return Promise.resolve();
        }
    }

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
        let returnObject;

        if(this._attributeTypeSelect && this._operatorSelect && this._valueInput)
            returnObject = {
                "uri": this._attributeTypeSelect.value,
                "operator": this._operatorSelect.value,
                "value": this._valueInput.value
            };
        else
            returnObject = {
                "uri": null,
                "operator": "==",
                "value": ""
            };

        return JSON.stringify(returnObject);
    }
 
    /**
     * 
     */
    set value(newValue) {
        if(newValue != null)
            this.setAttribute("value", newValue);
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
    get suggestions_source_trace_uri() {
        return this.getAttribute("suggestions-source-trace-uri");
    }

    /**
     * 
     */
    checkValidity() {
        return ((this._operatorSelect.value == "==") || this._valueInput.value);
    }

    /**
	 * 
	 */
	static get observedAttributes() {
        let _observedAttributes = super.observedAttributes;
        _observedAttributes.push("model-uri");
        _observedAttributes.push("obsel-type");
        _observedAttributes.push("value");
        _observedAttributes.push("suggestions-source-trace-uri");
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
                if(newValue)
                    this._attributeTypeSelect.setAttribute("obsel-type", newValue);
                else if(this._attributeTypeSelect.hasAttribute("obsel-type"))
                    this._attributeTypeSelect.removeAttribute("obsel-type");
            }).catch(() => {});
        else if(name == "value") {
            if(newValue) {
                try {
                    const valueObject = JSON.parse(newValue);

                    this._componentReady
                        .then(() => {
                            let attributeTypeSelectSetValuePromise = null;

                            if(valueObject.uri)
                                attributeTypeSelectSetValuePromise = this._attributeTypeSelect.setAttribute("value", valueObject.uri);

                            let operator_error = false;

                            if(valueObject.operator) {
                                switch(valueObject.operator) {
                                    case "==" :
                                        this._operatorSelect.selectedIndex = 0;
                                        break;
                                    case "!=" :
                                        this._operatorSelect.selectedIndex = 1;
                                        break;
                                    case "<" :
                                        this._operatorSelect.selectedIndex = 2;
                                        break;
                                    case ">" :
                                        this._operatorSelect.selectedIndex = 3;
                                        break;
                                    case "<=" :
                                        this._operatorSelect.selectedIndex = 4;
                                        break;
                                    case ">=" :
                                        this._operatorSelect.selectedIndex = 5;
                                        break;
                                    default: 
                                        this.emitErrorEvent("Unsupported operator \"" + valueObject.operator + "\"");
                                        operator_error = true;
                                }
                            }

                            if(valueObject.value)
                                this._valueInput.setAttribute("value", valueObject.value);

                            if(!operator_error) {
                                if(attributeTypeSelectSetValuePromise != null) {
                                    attributeTypeSelectSetValuePromise
                                        .then(() => {
                                            this._resolveLastSetValuePromise();
                                            this._lastSetValuePromise = null;

                                            if(this.hasAttributes("suggestions-source-trace-uri"))
                                                this._updateValueSuggestions();
                                        })
                                        .catch((error) => {
                                            this._rejectLastSetValuePromise(error);
                                            this._lastSetValuePromise = null;
                                        });
                                }
                                else {
                                    this._resolveLastSetValuePromise();
                                    this._lastSetValuePromise = null;
                                }
                            }
                            else {
                                this._rejectLastSetValuePromise("Operator error");
                                this._lastSetValuePromise = null;
                            }
                        })
                        .catch((error) => {
                            this._rejectLastSetValuePromise(error);
                            this._lastSetValuePromise = null;
                        });
                }
                catch(error) {
                    this.emitErrorEvent(error);
                    this._rejectLastSetValuePromise(error);
                    this._lastSetValuePromise = null;
                }
            }
            else {
                this._componentReady.then(() => {
                    this._attributeTypeSelect.value = "";
                    this._operatorSelect.selectedIndex = 0;
                    this._valueInput.value = "";
                }).catch(() => {});

                this._resolveLastSetValuePromise();
                this._lastSetValuePromise = null;
            }
        }
        else if(name == "suggestions-source-trace-uri") {
            this._componentReady.then(() => {
                this._updateValueSuggestions();
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
        this._attributeTypeSelect.addEventListener("change", this._onChangeAttributeTypeSelect.bind(this));
        this._attributeTypeSelect.addEventListener("input", this._onChangeAttributeTypeSelect.bind(this));
        this._operatorSelect = this.shadowRoot.querySelector("#operator-select");
        this._operatorSelect.addEventListener("focus", this._onChildElementFocus.bind(this));
        this._operatorSelect.addEventListener("change", this._onChildEvent.bind(this));
        this._operatorSelect.addEventListener("input", this._onChildEvent.bind(this));
        this._equalOperator = this.shadowRoot.querySelector("#operator-eq");
        this._notEqualOperator = this.shadowRoot.querySelector("#operator-neq");
        this._lowerThanOperator = this.shadowRoot.querySelector("#operator-lt");
        this._greaterThanOperator = this.shadowRoot.querySelector("#operator-gt");
        this._lowerThanOrEqualOperator = this.shadowRoot.querySelector("#operator-lte");
        this._greaterThanOrEqualOperator = this.shadowRoot.querySelector("#operator-gte");
        this._valueInput = this.shadowRoot.querySelector("#value-input");
        this._valueInput.addEventListener("focus", this._onChildElementFocus.bind(this));
        this._valueInput.addEventListener("change", this._onChildEvent.bind(this));
        this._valueInput.addEventListener("input", this._onChildEvent.bind(this));
        this._valueSuggestionsList = this.shadowRoot.querySelector("#value-suggestions");
        this.addEventListener("focus", this._onFocus.bind(this));
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._attributeTypeSelect.setAttribute("lang", this._lang);
        this._equalOperator.setAttribute("title", this._translateString("Is equal to"));
        this._notEqualOperator.setAttribute("title", this._translateString("Is not equal to"));
        this._lowerThanOperator.setAttribute("title", this._translateString("Is strictly inferior to"));
        this._greaterThanOperator.setAttribute("title", this._translateString("Is strictly superior to"));
        this._lowerThanOrEqualOperator.setAttribute("title", this._translateString("Is inferior or equal to"));
        this._greaterThanOrEqualOperator.setAttribute("title", this._translateString("Is superior or equal to"));
        this._valueInput.setAttribute("placeholder", this._translateString("Value"));
    }

    /**
     * 
     */
    _onFocus(event) {
        event.preventDefault();
        event.stopPropagation();

        this._componentReady.then(() => {
            setTimeout(() => {
                this._attributeTypeSelect.focus();
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

    /**
     * 
     */
    _updateValueSuggestions() {
        while(this._valueSuggestionsList.hasChildNodes())
            this._valueSuggestionsList.firstChild.remove();

        if(this.model_uri && this.suggestions_source_trace_uri) {
            const attribute_type_uri = this._attributeTypeSelect.value;

            if(attribute_type_uri.startsWith(this.model_uri + "#")) {
                const attribute_type_id = attribute_type_uri.substring(this.model_uri.length + 1);
                const model = ResourceMultiton.get_resource(Model, this.model_uri);

                model.get(this._abortController.signal)
                    .then(() => {
                        const attributeType = model.get_attribute_type(attribute_type_id);
                        
                        if(!attributeType.is_builtin) {
                            const sourceTrace = ResourceMultiton.get_resource(Trace, this.suggestions_source_trace_uri);
                            const sourceTraceObselList = sourceTrace.obsel_list;

                            sourceTraceObselList.list_attribute_type_distinct_values(attributeType, this._abortController.signal, sourceTrace.credentials)
                                .then((distinct_values) => {
                                    while(this._valueSuggestionsList.hasChildNodes())
                                        this._valueSuggestionsList.firstChild.remove();

                                    for(let i = 0; i < distinct_values.length; i++) {
                                        const aSuggestion = document.createElement("option");
                                        aSuggestion.setAttribute("value", distinct_values[i]);
                                        this._valueSuggestionsList.appendChild(aSuggestion);
                                    }
                                })
                                .catch(this.emitErrorEvent.bind(this));
                        }
                    })
                    .catch(this.emitErrorEvent.bind(this));
            }
        }
    }

    /**
     * 
     */
    _onChangeAttributeTypeSelect(event) {
        this._updateValueSuggestions();
    }
}

customElements.define('ktbs4la2-hrules-attribute-constraint-input', KTBS4LA2HrulesAttributeConstraintInput);