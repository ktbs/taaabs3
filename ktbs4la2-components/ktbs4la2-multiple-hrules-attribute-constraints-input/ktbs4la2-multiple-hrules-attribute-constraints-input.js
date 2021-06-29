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
        this._translateAndRule = this.shadowRoot.querySelector("#translate-and-rule");
        this._container = this.shadowRoot.querySelector("#container");
        this._emptyMessage = this.shadowRoot.querySelector("#empty-message");
        this._attributeConstraintInputsDiv = this.shadowRoot.querySelector("#attribute-contraint-inputs");
		this._addAttributeContraintButton = this.shadowRoot.querySelector("#add-attribute-contraint");
		this._addAttributeContraintButton.addEventListener("click", this._onClickAddAttributeContraintButton.bind(this));

		if(this.required)
			this._addAttributeConstraintInput(false);
			
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
        _observedAttributes.push("suggestions-source-trace-uri");
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
                        this._componentReady
                            .then(() => {
                                this._clearAllInputs();
                                

                                if(valueObject.length > 0) {
                                    let attributeConstraintInputsSetValuePromises = new Array();
                                    
                                    for(let i = 0; i < valueObject.length; i++) {
                                        const anAttributeConstraintInput = this._addAttributeConstraintInput(!((i == 0) && this.required));
                                        const anAttributeConstraintInputSetValuePromise = anAttributeConstraintInput.setAttribute("value", JSON.stringify(valueObject[i]));
                                        attributeConstraintInputsSetValuePromises.push(anAttributeConstraintInputSetValuePromise);
                                    }

                                    Promise.all(attributeConstraintInputsSetValuePromises)
                                        .then(() => {
                                            this._resolveLastSetValuePromise();
                                            this._lastSetValuePromise = null;
                                        })
                                        .catch((error) => {
                                            this._rejectLastSetValuePromise(error);
                                            this._lastSetValuePromise = null;
                                        });
                                   
                                }
                                else {
                                    if(this.required)
                                        this._addAttributeConstraintInput(false);

                                    this._resolveLastSetValuePromise();
                                    this._lastSetValuePromise = null;
                                }
                            })
                            .catch((error) => {
                                this._rejectLastSetValuePromise(error);
                                this._lastSetValuePromise = null;
                            });
                    }
                    else {
                        this.emitErrorEvent(new Error("Invalid value : must be a JSON Array"));
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
                        this._clearAllInputs();

                        if(this.required)
                            this._addAttributeConstraintInput(false);

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
                    this._addAttributeConstraintInput(false);
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
                    if(newValue)
                        attributeConstraintInputs[i].setAttribute("obsel-type", newValue);
                    else if(attributeConstraintInputs[i].hasAttribute("obsel-type"))
                        attributeConstraintInputs[i].removeAttribute("obsel-type");
            }).catch(() => {});
        }
        else if(name == "suggestions-source-trace-uri") {
            this._componentReady.then(() => {
                const attributeConstraintInputs = this._getAttributeConstraintInputs();

                for(let i = 0; i < attributeConstraintInputs.length; i++)
                    attributeConstraintInputs[i].setAttribute("suggestions-source-trace-uri", newValue);
            })
        }
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._translateAndRule.innerHTML = ".attribute-constraint-input-container:not(:first-child)::before {content: \"" + this._translateString("And") + "\";}";
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
        else {
            setTimeout(() => {
                this._addAttributeContraintButton.focus();
            });
        }
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
        const newAttributeConstraint = this._addAttributeConstraintInput(!((attributeConstraintInputs.length == 0) && this.required));
        
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
        if(this._attributeConstraintInputsDiv)
            return this._attributeConstraintInputsDiv.querySelectorAll("ktbs4la2-hrules-attribute-constraint-input");
        else
            return [];
    }
    
    /**
	 * 
	 */
	_addAttributeConstraintInput(allow_remove = true) {
		const inputContainer = document.createElement("div");
		inputContainer.classList.add("attribute-constraint-input-container");
        const newAttributeConstraintInput = document.createElement("ktbs4la2-hrules-attribute-constraint-input");
        newAttributeConstraintInput.setAttribute("lang", this._lang);
            
        if(this.hasAttribute("model-uri"))
            newAttributeConstraintInput.setAttribute("model-uri", this.getAttribute("model-uri"));

        if(this.hasAttribute("obsel-type"))
            newAttributeConstraintInput.setAttribute("obsel-type", this.getAttribute("obsel-type"));

        if(this.hasAttribute("suggestions-source-trace-uri"))
            newAttributeConstraintInput.setAttribute("suggestions-source-trace-uri", this.getAttribute("suggestions-source-trace-uri"));

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
			removeAttributeConstraintButton.innerText = "❌";
            removeAttributeConstraintButton.setAttribute("tabIndex", newAttributeConstraintInputTabIndex + 1);
            removeAttributeConstraintButton.addEventListener("click", this._onClickRemoveAttributeConstraintButton.bind(this));
			removeAttributeConstraintButton.addEventListener("focus", this._onAboutToRemoveAttributeConstraint.bind(this));
            removeAttributeConstraintButton.addEventListener("mouseover", this._onAboutToRemoveAttributeConstraint.bind(this));
            removeAttributeConstraintButton.addEventListener("mouseout", this._onNoMoreAboutToRemoveAttributeConstraint.bind(this));
            removeAttributeConstraintButton.addEventListener("blur", this._onNoMoreAboutToRemoveAttributeConstraint.bind(this));
			inputContainer.appendChild(removeAttributeConstraintButton);
		}

        this._attributeConstraintInputsDiv.appendChild(inputContainer);
        
        if(this._container.classList.contains("empty"))
            this._container.classList.remove("empty");

		return newAttributeConstraintInput;
    }
    
    /**
	 * 
	 */
	_onClickRemoveAttributeConstraintButton(event) {
		const clickedButton = event.target;

		if(clickedButton.classList.contains("remove-attribute-constraint-button")) {
			const parentContainer = clickedButton.parentNode;

			if(parentContainer.classList.contains("attribute-constraint-input-container")) {
                const attributeConstraint = parentContainer.querySelector("ktbs4la2-hrules-attribute-constraint-input");
                const attributeConstraintWasValid = attributeConstraint.checkValidity();

				parentContainer.remove();
                this._reIndexTabNavigation();
                
                const currentAttributeConstraintInputsCount = this._getAttributeConstraintInputs().length;

                if((currentAttributeConstraintInputsCount == 0) && !this._container.classList.contains("empty"))
                    this._container.classList.add("empty");

                if(attributeConstraintWasValid)
                    this.dispatchEvent(new Event("change", {
                        bubbles: true,
                        cancelable: false,
                        composed: false
                    }));
            }
		}
    }

    /**
     * 
     */
    _onAboutToRemoveAttributeConstraint(event) {
        event.stopPropagation();
        const hoveredOrFocusedButton = event.target;

		if(hoveredOrFocusedButton.classList.contains("remove-attribute-constraint-button")) {
            const parentContainer = hoveredOrFocusedButton.parentNode;
            
            if(!parentContainer.classList.contains("about-to-remove"))
                parentContainer.classList.add("about-to-remove");
        }
    }

    /**
     * 
     */
    _onNoMoreAboutToRemoveAttributeConstraint(event) {
        event.stopPropagation();
        const hoveredOrFocusedButton = event.target;

		if(hoveredOrFocusedButton.classList.contains("remove-attribute-constraint-button")) {
            const parentContainer = hoveredOrFocusedButton.parentNode;
            
            if(parentContainer.classList.contains("about-to-remove"))
                parentContainer.classList.remove("about-to-remove");
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