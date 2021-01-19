import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

import "../ktbs4la2-resource-id-input/ktbs4la2-resource-id-input.js";
import "../ktbs4la2-multiple-hrules-subrules-input/ktbs4la2-multiple-hrules-subrules-input.js";

/**
 * 
 */
class KTBS4LA2HrulesRuleInput extends TemplatedHTMLElement {

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
            if(this._lastSetValuePromise != null) {
                this._rejectLastSetValuePromise("A newer value has been set");
            }

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

        if(this._idInput && this._visibleCheckBox && this._subrulesInput && this._colorInput && this._shapeSelect) {
            returnObject = {
                "id": this._idInput.value,
                "visible": this._visibleCheckBox.checked,
                "rules": JSON.parse(this._subrulesInput.value)
            };

            if(this.stylesheet)
                returnObject["symbol"] = {
                    "color": this._colorInput.value,
                    "shape": this._shapeSelect.value
                };
        }
        else {
            returnObject = {
                "id": "",
                "visible": true,
                "rules": []
            };

            if(this.stylesheet)
                returnObject["symbol"] = {
                    "color": "#000000",
                    "shape": "duration-bar"
                };
        }

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
     * Gets the value of property reserved_ids
     * \return Array
     * \public
     */
    get reserved_ids() {
        if(this.hasAttribute("reserved-ids"))
            return this.getAttribute("reserved-ids").split(" ").filter(Boolean);
        else
            return [];
    }

    /**
     * Sets the value of property reserved_ids
     * \param Array of string or null new_ids
     * \throws TypeError thows a TypeError if value of parameter new_ids is not an instance of Array or null
     * \public
     */
    set reserved_ids(newValue) {
        if(newValue != null)
            this.setAttribute("reserved-ids", newValue);
        else if(this.hasAttribute("reserved-ids"))
            this.removeAttribute("reserved-ids");
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
    get stylesheet() {
        return this.hasAttribute("stylesheet");
    }

    /**
     * 
     */
    set stylesheet(newValue) {
        if(newValue != null) {
            if(this.getAttribute("stylesheet") != newValue)
                this.setAttribute("stylesheet", newValue);
        }
        else if(this.hasAttribute("stylesheet"))
            this.removeAttribute("stylesheet");
    }

    /**
     * 
     */
    checkValidity() {
        if(this._idInput && this._subrulesInput) {
            return (
                    this._idInput.checkValidity()
                &&  this._subrulesInput.checkValidity()
                &&  !(
                        (this._subrulesInput.value != "[]")
                    &&  (this._idInput.value == "")
                )
            );
        }
        else
            return false;
    }

    /**
	 * 
	 */
	onComponentReady() {
        this._idInputLabel = this.shadowRoot.querySelector("#id-input-label");
        this._idInput = this.shadowRoot.querySelector("#id-input");
        this._idInput.addEventListener("input", this._onChildEvent.bind(this));
        this._idInput.addEventListener("change", this._onChildEvent.bind(this));
        this._idInput.addEventListener("focus", this._onChildEventToStop.bind(this));
        this._visibleCheckBoxLabel = this.shadowRoot.querySelector("#visible-checkbox-label");
        this._visibleCheckBox = this.shadowRoot.querySelector("#visible-checkbox");
        this._visibleCheckBox.addEventListener("input", this._onChildEventToStop.bind(this));
        this._visibleCheckBox.addEventListener("change", this._onChildEvent.bind(this));
        this._visibleCheckBox.addEventListener("focus", this._onChildEventToStop.bind(this));
        this._colorInputLabel = this.shadowRoot.querySelector("#color-input-label");
        this._colorInput = this.shadowRoot.querySelector("#color-input");
        this._colorInput.addEventListener("change", this._onChildEvent.bind(this));
        this._colorInput.addEventListener("focus", this._onChildEventToStop.bind(this));
        this._shapeSelectLabel = this.shadowRoot.querySelector("#shape-select-label");
        this._shapeSelect = this.shadowRoot.querySelector("#shape-select");
        this._shapeSelect.addEventListener("input", this._onChildEventToStop.bind(this));
        this._shapeSelect.addEventListener("change", this._onChildEvent.bind(this));
        this._shapeSelect.addEventListener("focus", this._onChildEventToStop.bind(this));
        this._shapeOptionDurationbar = this.shadowRoot.querySelector("#shape-option-durationbar");
        this._shapeOptionSquare = this.shadowRoot.querySelector("#shape-option-square");
        this._shapeOptionCircle = this.shadowRoot.querySelector("#shape-option-circle");
        this._shapeOptionDiamond = this.shadowRoot.querySelector("#shape-option-diamond");
        this._shapeOptionStar = this.shadowRoot.querySelector("#shape-option-star");
        this._subrulesInputLabel = this.shadowRoot.querySelector("#subrules-input-label");
        this._subrulesInput = this.shadowRoot.querySelector("#subrules-input");
        this._subrulesInput.addEventListener("input", this._onChildEvent.bind(this));
        this._subrulesInput.addEventListener("change", this._onChildEvent.bind(this));
        this._subrulesInput.setAttribute("lang", this._lang);
        this._subrulesInput.addEventListener("focus", this._onChildEventToStop.bind(this));
        this.addEventListener("focus", this._onFocus.bind(this));
    }

    /**
	 * 
	 */
	static get observedAttributes() {
        let _observedAttributes = super.observedAttributes;
        _observedAttributes.push("model-uri");
        _observedAttributes.push("value");
        _observedAttributes.push("required");
        _observedAttributes.push("reserved-ids");
        return _observedAttributes;
    }

    /**
	 * 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        
        if(name == "model-uri") {
            if(newValue)
                this._componentReady.then(() => {
                    this._subrulesInput.setAttribute("model-uri", newValue);
                }).catch(() => {});
        }
        else if(name == "value") {
            if(newValue) {
                try {
                    const valueObject = JSON.parse(newValue);

                    if(valueObject instanceof Object) {
                        if(!valueObject.rules || (valueObject.rules instanceof Array)) {
                            this._componentReady.then(() => {
                                const id = (valueObject.id)?valueObject.id:"";
                                const idInputSetValuePromise = this._idInput.setAttribute("value", id);

                                if(valueObject.visible != undefined)
                                    this._visibleCheckBox.checked = valueObject.visible;
                                else
                                    this._visibleCheckBox.checked = true;

                                if(valueObject.symbol) {
                                    if(valueObject.symbol.color)
                                        this._colorInput.value = valueObject.symbol.color;
                                    else
                                        this._colorInput.value = "#000000";

                                    if(valueObject.symbol.shape)
                                        this._shapeSelect.value = valueObject.symbol.shape;
                                    else
                                        this._shapeSelect.value = "duration-bar";
                                }
                                else {
                                    this._colorInput.value = "#000000";
                                    this._shapeSelect.value = "duration-bar";
                                }

                                const rulesData = (valueObject.rules)?valueObject.rules:[];
                                const subRulesSetValuePromise = this._subrulesInput.setAttribute("value", JSON.stringify(rulesData));
                                
                                Promise.all([idInputSetValuePromise, subRulesSetValuePromise])
                                    .then(() => {
                                        this._resolveLastSetValuePromise();
                                        this._lastSetValuePromise = null;
                                    })
                                    .catch((error) => {
                                        this._rejectLastSetValuePromise(error);
                                        this._lastSetValuePromise = null;
                                    });
                            })
                            .catch((error) => {
                                this._rejectLastSetValuePromise(error);
                                this._lastSetValuePromise = null;
                            });
                        }
                        else {
                            this.emitErrorEvent(new Error("Invalid data provided as attribute \"value\""));
                            this._rejectLastSetValuePromise("Invalid JSON Data");
                            this._lastSetValuePromise = null;
                        }
                    }
                    else {
                        this.emitErrorEvent(new Error("Invalid data provided as attribute \"value\""));
                        this._rejectLastSetValuePromise("Invalid JSON Data");
                        this._lastSetValuePromise = null;
                    }
                }
                catch(error) {
                    this.emitErrorEvent(error);
                    this._rejectLastSetValuePromise(error);
                    this._lastSetValuePromise = null;
                }
            }
            else {
                this._componentReady
                    .then(() => {
                        this._idInput.value = "";
                        this._visibleCheckBox.checked = true;
                        this._colorInput.value = "#000000";
                        this._shapeSelect.value = "duration-bar";
                        this._subrulesInput.value = "[]";
                        this._resolveLastSetValuePromise();
                        this._lastSetValuePromise = null;
                    })
                    .catch((error) => {
                        this._rejectLastSetValuePromise(error);
                        this._lastSetValuePromise = null;
                    });
            }
        }
        else if(name == "required") {
            this._componentReady.then(() => {
                if(newValue != null)
                    this._idInput.setAttribute("required", newValue);
                else
                    if(this._idInput.hasAttribute("required"))
                        this._idInput.removeAttribute("required");
            }).catch(() => {});
        }
        else if(name == "reserved-ids") {
            this._componentReady.then(() => {
                if(newValue != null)
                    this._idInput.setAttribute("reserved-ids", newValue);
                else
                    if(this._idInput.hasAttribute("reserved-ids"))
                        this._idInput.removeAttribute("reserved-ids");
            }).catch(() => {});
        }
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._idInputLabel.innerText = this._translateString("Rule identifier") + " :";
        this._idInput.setAttribute("placeholder", this._translateString("<id>"));
        this._visibleCheckBoxLabel.innerText = this._translateString("Visible") + " :";
        this._colorInputLabel.innerText = this._translateString("Color");
        this._shapeSelectLabel.innerText = this._translateString("Shape");
        this._shapeOptionDurationbar.innerText = this._translateString("Duration bar (default)");
        this._shapeOptionSquare.innerText = this._translateString("Square");
        this._shapeOptionCircle.innerText = this._translateString("Circle");
        this._shapeOptionDiamond.innerText = this._translateString("Diamond");
        this._shapeOptionStar.innerText = this._translateString("Star");
        this._subrulesInputLabel.innerText = this._translateString("Sub-rules") + " :";
        this._subrulesInput.setAttribute("lang", this._lang);
    }

    /**
     * 
     */
    _onFocus(event) {
        event.preventDefault();
        event.stopPropagation();

        this._idInput._componentReady.then(() => {
            setTimeout(() => {
                this._idInput.focus();
            });
        });
    }

    /**
	 * 
	 */
	_onChildEventToStop(event) {
        event.preventDefault();
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

customElements.define('ktbs4la2-hrules-rule-input', KTBS4LA2HrulesRuleInput);