import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

import '../ktbs4la2-hrules-attribute-constraint-input/ktbs4la2-hrules-attribute-constraint-input.js';

/**
 * 
 */
class KTBS4LA2MultipleHrulesAttributeConstraintsInput extends TemplatedHTMLElement {

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
        let attributeConstraintInputsValues = new Array();
        const attributeConstraintInputs = this._getAttributeConstraintInputs();

        for(let i = 0; i < attributeConstraintInputs.length; i++)
            if(attributeConstraintInputs[i].checkValidity())
                attributeConstraintInputsValues.push(JSON.parse(attributeConstraintInputs[i].value));

        return JSON.stringify(attributeConstraintInputsValues);
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
        let valid = true;
        const attributeConstraintInputs = this._getAttributeConstraintInputs();

        for(let i = 0; valid && (i < attributeConstraintInputs.length); i++)
            valid = attributeConstraintInputs[i].checkValidity();
        
        return valid;
    }

    /**
	 * 
	 */
	onComponentReady() {
        this._container = this.shadowRoot.querySelector("#container");
        this._emptyMessage = this.shadowRoot.querySelector("#empty-message");
        this._attributeConstraintInputsDiv = this.shadowRoot.querySelector("#attribute-contraint-inputs");
		this._addAttributeContraintButton = this.shadowRoot.querySelector("#add-attribute-contraint");
		this._addAttributeContraintButton.addEventListener("click", this._onClickAddAttributeContraintButton.bind(this));

		if(this.required)
			this._addAttributeConstraintInput(null, false);
			
		this.addEventListener("focus", this._onFocus.bind(this));
    }

    /**
	 * 
	 */
	static get observedAttributes() {
        let _observedAttributes = super.observedAttributes;
        _observedAttributes.push("value");
        _observedAttributes.push("required");
        _observedAttributes.push("model-uri");
        _observedAttributes.push("obsel-type");
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

                    if(valueObject instanceof Array) {
                        this._componentReady.then(() => {
                            this._clearAllInputs();

                            if(valueObject.length > 0) {
                                for(let i = 0; i < valueObject.length; i++)
                                    this._addAttributeConstraintInput(JSON.stringify(valueObject[i]), !((i == 0) && this.required));
                            }
                            else if(this.required)
                                this._addAttributeConstraintInput(null, false);
                        }).catch(() => {});
                    }
                    else
                        this.emitErrorEvent(new Error("Invalid value : must be a JSON Array"));
                }
                catch(error) {
                    this.emitErrorEvent(error);
                }
            }
            else {
                this._componentReady.then(() => {
                    this._clearAllInputs();

                    if(this.required)
                        this._addAttributeConstraintInput(null, false);
                }).catch(() => {});
            }
        }
        else if(name == "required") {
            this._componentReady.then(() => {
                const attributeConstraintInputs = this._getAttributeConstraintInputs();

                if(attributeConstraintInputs.length > 0) {
                    if(this.required) {
                        attributeConstraintInputs[0].setAttribute("required", newValue);
                        const existingRemoveButton = attributeConstraintInputs[0].parentNode.querySelector("button.remove-attribute-constraint-button");

                        if(existingRemoveButton) {
                            existingRemoveButton.remove();
                            this._reIndexTabNavigation();
                        }
                    }
                    else {
                        if(attributeConstraintInputs[0].hasAttribute("required"))
                            attributeConstraintInputs[0].removeAttribute("required");

                        const existingRemoveButton = attributeConstraintInputs[0].parentNode.querySelector("button.remove-attribute-constraint-button");

                        if(!existingRemoveButton) {
                            const newRemoveButton = document.createElement("button");
                            newRemoveButton.classList.add("remove-attribute-constraint-button");
                            newRemoveButton.setAttribute("title", this._translateString("Remove this attribute constraint"));
                            newRemoveButton.addEventListener("click", this._onClickRemoveAttributeConstraintButton.bind(this));
                            newRemoveButton.innerText = "❌";
                            attributeConstraintInputs[0].parentNode.appendChild(newRemoveButton);
                            this._reIndexTabNavigation();
                        }
                    }
                }
                else if(this.required)
                    this._addAttributeConstraintInput(null, false);
            }).catch(() => {});
        }
        else if(name == "model-uri") {
            this._componentReady.then(() => {
                const attributeConstraintInputs = this._getAttributeConstraintInputs();

                for(let i = 0; i < attributeConstraintInputs.length; i++)
                    attributeConstraintInputs[i].setAttribute("model-uri", newValue);
            }).catch(() => {});
        }
        else if(name == "obsel-type") {
            this._componentReady.then(() => {
                const attributeConstraintInputs = this._getAttributeConstraintInputs();

                for(let i = 0; i < attributeConstraintInputs.length; i++)
                    attributeConstraintInputs[i].setAttribute("obsel-type", newValue);
            }).catch(() => {});
        }
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._emptyMessage.innerText = this._translateString("No attribute constraint is defined yet");
        const attributeConstraintInputs = this._getAttributeConstraintInputs();

		for(let i = 0; i < attributeConstraintInputs.length; i++)
			attributeConstraintInputs[i].setAttribute("lang", this._lang);

		const removeAttributeConstraintButtons = this.shadowRoot.querySelectorAll("#attribute-contraint-inputs button.remove-attribute-constraint-button");
			
		for(let i = 0; i < removeAttributeConstraintButtons.length; i++)
            removeAttributeConstraintButtons[i].setAttribute("title", this._translateString("Remove this attribute constraint"));
            
        this._addAttributeContraintButton.setAttribute("title", this._translateString("Add an attribute constraint"));
    }

    /**
     * 
     */
    _onFocus(event) {
        event.preventDefault();
        event.stopPropagation();
		const attributeConstraintInputs = this._getAttributeConstraintInputs();

        if(attributeConstraintInputs.length > 0)
            attributeConstraintInputs[0]._componentReady.then(() => {
                setTimeout(() => {
                    attributeConstraintInputs[0].focus();
                });
            }).catch(() => {});
    }
    
    /**
	 * 
	 */
	_onAttributeConstraintInputFocus(event) {
		event.stopPropagation();
	}

    /**
	 * 
	 */
	_onClickAddAttributeContraintButton(event) {
        event.preventDefault();
        event.stopPropagation();
        const attributeConstraintInputs = this._getAttributeConstraintInputs();
        const newAttributeContainer = this._addAttributeConstraintInput(null, !((attributeConstraintInputs.length == 0) && this.required));
        const newAttributeConstraint = newAttributeContainer.querySelector("ktbs4la2-hrules-attribute-constraint-input");

		newAttributeConstraint._componentReady.then(() => {
            setTimeout(() => {
                newAttributeConstraint.focus();
            });
		});
    }
    
    /**
	 * 
	 */
	_getAttributeConstraintInputs() {
		return this._attributeConstraintInputsDiv.querySelectorAll("ktbs4la2-hrules-attribute-constraint-input");
    }
    
    /**
	 * 
	 */
	_addAttributeConstraintInput(value = null, allow_remove = true) {
		const inputContainer = document.createElement("div");
		inputContainer.classList.add("attribute-constraint-input-container");
        const newAttributeConstraintInput = document.createElement("ktbs4la2-hrules-attribute-constraint-input");
        newAttributeConstraintInput.setAttribute("lang", this._lang);

		if(value)
            newAttributeConstraintInput.setAttribute("value", value);
            
        if(this.hasAttribute("model-uri"))
            newAttributeConstraintInput.setAttribute("model-uri", this.getAttribute("model-uri"));

        if(this.hasAttribute("obsel-type"))
            newAttributeConstraintInput.setAttribute("obsel-type", this.getAttribute("obsel-type"));

        const currentAttributeConstraintInputsCount = this._getAttributeConstraintInputs().length;
        
        if(this.required && (currentAttributeConstraintInputsCount == 0))
            newAttributeConstraintInput.setAttribute("required", this.getAttribute("required"));

		const newAttributeConstraintInputTabIndex = (currentAttributeConstraintInputsCount > 0)?(2 * currentAttributeConstraintInputsCount):1;
        newAttributeConstraintInput.setAttribute("tabIndex", newAttributeConstraintInputTabIndex);
        newAttributeConstraintInput.addEventListener("input", this._onChildEvent.bind(this));
        newAttributeConstraintInput.addEventListener("change", this._onChildEvent.bind(this));

		inputContainer.appendChild(newAttributeConstraintInput);
		newAttributeConstraintInput.addEventListener("focus", this._onAttributeConstraintInputFocus.bind(this));
		const currentInputs = this._getAttributeConstraintInputs();

		if(allow_remove) {
			const removeAttributeConstraintButton = document.createElement("button");
			removeAttributeConstraintButton.classList.add("remove-attribute-constraint-button");
			removeAttributeConstraintButton.setAttribute("title", this._translateString("Remove this attribute constraint"));
			removeAttributeConstraintButton.addEventListener("click", this._onClickRemoveAttributeConstraintButton.bind(this));
			removeAttributeConstraintButton.innerText = "❌";
			removeAttributeConstraintButton.setAttribute("tabIndex", newAttributeConstraintInputTabIndex + 1);
			inputContainer.appendChild(removeAttributeConstraintButton);
		}

        this._attributeConstraintInputsDiv.appendChild(inputContainer);
        
        if(this._container.classList.contains("empty"))
            this._container.classList.remove("empty");

		return inputContainer;
    }
    
    /**
	 * 
	 */
	_onClickRemoveAttributeConstraintButton(event) {
		const clickedButton = event.target;

		if(clickedButton.classList.contains("remove-attribute-constraint-button")) {
			const parentContainer = clickedButton.parentNode;

			if(parentContainer.classList.contains("attribute-constraint-input-container")) {
				parentContainer.remove();
				this._reIndexTabNavigation();
            }
            
            const currentAttributeConstraintInputsCount = this._getAttributeConstraintInputs().length;

            if((currentAttributeConstraintInputsCount == 0) && !this._container.classList.contains("empty"))
                this._container.classList.add("empty");
		}
    }
    
    /**
     * 
     */
    _reIndexTabNavigation() {
        const attributeConstraintInputsAndRemoveButtons = this.shadowRoot.querySelectorAll("ktbs4la2-hrules-attribute-constraint-input, button.remove-attribute-constraint-button");

        for(let i = 0; i < attributeConstraintInputsAndRemoveButtons.length; i++)
            attributeConstraintInputsAndRemoveButtons[i].setAttribute("tabIndex", (i + 1));
    }

    /**
	 * 
	 */
	_clearAllInputs() {
		const inputContainers = this._attributeConstraintInputsDiv.querySelectorAll(".attribute-constraint-input-container");

		for(let i = 0; i < inputContainers.length; i++)
            inputContainers[i].remove();
            
        if(!this._container.classList.contains("empty"))
            this._container.classList.add("empty");
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

customElements.define('ktbs4la2-multiple-hrules-attribute-constraints-input', KTBS4LA2MultipleHrulesAttributeConstraintsInput);