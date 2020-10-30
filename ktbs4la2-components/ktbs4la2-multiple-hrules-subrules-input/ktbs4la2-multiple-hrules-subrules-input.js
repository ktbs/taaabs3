import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

import "../ktbs4la2-hrules-subrule-input/ktbs4la2-hrules-subrule-input.js";

/**
 * 
 */
class KTBS4LA2MultipleHrulesSubrulesInput extends TemplatedHTMLElement {

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
        let returnArray = [];
        const subrulesInputs = this._getSubrulesInputs();

        for(let i = 0; i < subrulesInputs.length; i++)
            if(subrulesInputs[i].checkValidity())
                returnArray.push(JSON.parse(subrulesInputs[i].value));

        return JSON.stringify(returnArray);
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
                !this.required
            ||  (this.value != "[]")
        );
    }

    /**
	 * 
	 */
	onComponentReady() {
        this._translateOrRule = this.shadowRoot.querySelector("#translate-or-rule");
        this._container = this.shadowRoot.querySelector("#container");
        this._emptyMessage = this.shadowRoot.querySelector("#empty-message");
        this._subruleInputsDiv = this.shadowRoot.querySelector("#subrules-inputs");
		this._addSubruleButton = this.shadowRoot.querySelector("#add-subrule");
		this._addSubruleButton.addEventListener("click", this._onClickAddSubruleButton.bind(this));

		if(this.required)
			this._addSubruleInput(null, false);
			
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
                                    this._addSubruleInput(JSON.stringify(valueObject[i]), !((i == 0) && this.required));
                            }
                            else if(this.required)
                                this._addSubruleInput(null, false);
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
                        this._addSubruleInput(null, false);
                }).catch(() => {});
            }
        }
        else if(name == "required") {
            this._componentReady.then(() => {
                const subrulesInputs = this._getSubrulesInputs();

                if(subrulesInputs.length > 0) {
                    if(this.required) {
                        subrulesInputs[0].setAttribute("required", newValue);
                        const existingRemoveButton = subrulesInputs[0].parentNode.querySelector("button.remove-subrule-button");

                        if(existingRemoveButton) {
                            existingRemoveButton.remove();
                            this._reIndexTabNavigation();
                        }
                    }
                    else {
                        if(subrulesInputs[0].hasAttribute("required"))
                            subrulesInputs[0].removeAttribute("required");

                        const existingRemoveButton = subrulesInputs[0].parentNode.querySelector("button.remove-subrule-button");

                        if(!existingRemoveButton) {
                            const newRemoveButton = document.createElement("button");
                            newRemoveButton.classList.add("remove-subrule-button");
                            newRemoveButton.setAttribute("title", this._translateString("Remove this sub-rule"));
                            newRemoveButton.addEventListener("click", this._onClickRemoveSubruleButton.bind(this));
                            newRemoveButton.innerText = "❌";
                            subrulesInputs[0].parentNode.appendChild(newRemoveButton);
                            this._reIndexTabNavigation();
                        }
                    }
                }
                else if(this.required)
                    this._addSubruleInput(null, false);
            }).catch(() => {});
        }
        else if(name == "model-uri") {
            this._componentReady.then(() => {
                const subrulesInputs = this._getSubrulesInputs();

                for(let i = 0; i < subrulesInputs.length; i++)
                    subrulesInputs[i].setAttribute("model-uri", newValue);
            }).catch(() => {});
        }
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._translateOrRule.innerHTML = ".subrule-input-container:not(:first-child)::before {content: \"" + this._translateString("Or") + "\";}";
        this._emptyMessage.innerText = this._translateString("No sub-rule is defined yet");
        const subrulesInputs = this._getSubrulesInputs();

		for(let i = 0; i < subrulesInputs.length; i++)
			subrulesInputs[i].setAttribute("lang", this._lang);

		const removeSubruleButtons = this.shadowRoot.querySelectorAll("#subrules-inputs button.remove-subrule-button");
			
		for(let i = 0; i < removeSubruleButtons.length; i++)
            removeSubruleButtons[i].setAttribute("title", this._translateString("Remove this sub-rule"));
            
        this._addSubruleButton.setAttribute("title", this._translateString("Add a sub-rule"));
    }

    /**
	 * 
	 */
	_onSubruleInputFocus(event) {
		event.stopPropagation();
	}

    /**
     * 
     */
    _onFocus(event) {
        event.preventDefault();
        event.stopPropagation();
		const subrulesInputs = this._getSubrulesInputs();

        if(subrulesInputs.length > 0)
            subrulesInputs[0]._componentReady.then(() => {
                setTimeout(() => {
                    subrulesInputs[0].focus();
                });
            }).catch(() => {});
        else {
            setTimeout(() => {
                this._addSubruleButton.focus();
            });
        }
    }

    /**
     * 
     */
    _onClickAddSubruleButton(event) {
        event.preventDefault();
        event.stopPropagation();
        const subrulesInputs = this._getSubrulesInputs();
        const newSubruleInputContainer = this._addSubruleInput(null, !((subrulesInputs.length == 0) && this.required));
        const newSubruleInput = newSubruleInputContainer.querySelector("ktbs4la2-hrules-subrule-input");

		newSubruleInput._componentReady.then(() => {
            setTimeout(() => {
                newSubruleInput.focus();
            });
		});
    }

    /**
	 * 
	 */
	_getSubrulesInputs() {
        if(this._subruleInputsDiv)
            return this._subruleInputsDiv.querySelectorAll("ktbs4la2-hrules-subrule-input");
        else
            return [];
    }
    
    /**
	 * 
	 */
	_addSubruleInput(value = null, allow_remove = true) {
		const inputContainer = document.createElement("div");
		inputContainer.classList.add("subrule-input-container");
        const newSubruleInput = document.createElement("ktbs4la2-hrules-subrule-input");
        newSubruleInput.setAttribute("lang", this._lang);

		if(value)
            newSubruleInput.setAttribute("value", value);
            
        if(this.hasAttribute("model-uri"))
            newSubruleInput.setAttribute("model-uri", this.getAttribute("model-uri"));

        const currentSubrulesInputsCount = this._getSubrulesInputs().length;
        
        if(this.required && (currentSubrulesInputsCount == 0))
            newSubruleInput.setAttribute("required", this.getAttribute("required"));

		const newSubruleInputTabIndex = (currentSubrulesInputsCount > 0)?(2 * currentSubrulesInputsCount):1;
        newSubruleInput.setAttribute("tabIndex", newSubruleInputTabIndex);
        newSubruleInput.addEventListener("input", this._onChildEvent.bind(this));
        newSubruleInput.addEventListener("change", this._onChildEvent.bind(this));

		inputContainer.appendChild(newSubruleInput);
		newSubruleInput.addEventListener("focus", this._onSubruleInputFocus.bind(this));
		const currentInputs = this._getSubrulesInputs();

		if(allow_remove) {
			const removeSubruleButton = document.createElement("button");
            removeSubruleButton.classList.add("remove-subrule-button");
			removeSubruleButton.setAttribute("title", this._translateString("Remove this sub-rule"));
			removeSubruleButton.innerText = "❌";
            removeSubruleButton.setAttribute("tabIndex", newSubruleInputTabIndex + 1);
            removeSubruleButton.addEventListener("click", this._onClickRemoveSubruleButton.bind(this));
			removeSubruleButton.addEventListener("focus", this._onAboutToRemoveSubrule.bind(this));
            removeSubruleButton.addEventListener("mouseover", this._onAboutToRemoveSubrule.bind(this));
            removeSubruleButton.addEventListener("mouseout", this._onNoMoreAboutToRemoveSubrule.bind(this));
            removeSubruleButton.addEventListener("blur", this._onNoMoreAboutToRemoveSubrule.bind(this));
			inputContainer.appendChild(removeSubruleButton);
		}

        this._subruleInputsDiv.appendChild(inputContainer);
        
        if(this._container.classList.contains("empty"))
            this._container.classList.remove("empty");

		return inputContainer;
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

    /**
	 * 
	 */
	_onClickRemoveSubruleButton(event) {
		const clickedButton = event.target;

		if(clickedButton.classList.contains("remove-subrule-button")) {
			const parentContainer = clickedButton.parentNode;

			if(parentContainer.classList.contains("subrule-input-container")) {
                const subruleInput = parentContainer.querySelector("ktbs4la2-hrules-subrule-input");
                const subruleWasValid = subruleInput.checkValidity();
				parentContainer.remove();
                this._reIndexTabNavigation();
                const currentSubrulesInputsCount = this._getSubrulesInputs().length;

                if((currentSubrulesInputsCount == 0) && !this._container.classList.contains("empty"))
                    this._container.classList.add("empty");

                if(subruleWasValid)
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
    _onAboutToRemoveSubrule(event) {
        event.stopPropagation();
        const hoveredOrFocusedButton = event.target;

		if(hoveredOrFocusedButton.classList.contains("remove-subrule-button")) {
            const parentContainer = hoveredOrFocusedButton.parentNode;
            
            if(!parentContainer.classList.contains("about-to-remove"))
                parentContainer.classList.add("about-to-remove");
        }
    }

    /**
     * 
     */
    _onNoMoreAboutToRemoveSubrule(event) {
        event.stopPropagation();
        const hoveredOrFocusedButton = event.target;

		if(hoveredOrFocusedButton.classList.contains("remove-subrule-button")) {
            const parentContainer = hoveredOrFocusedButton.parentNode;
            
            if(parentContainer.classList.contains("about-to-remove"))
                parentContainer.classList.remove("about-to-remove");
        }
    }

    /**
     * 
     */
    _reIndexTabNavigation() {
        const subrulesInputsAndRemoveButtons = this.shadowRoot.querySelectorAll("ktbs4la2-hrules-subrule-input, button.remove-subrule-button");

        for(let i = 0; i < subrulesInputsAndRemoveButtons.length; i++)
            subrulesInputsAndRemoveButtons[i].setAttribute("tabIndex", (i + 1));
    }

    /**
	 * 
	 */
	_clearAllInputs() {
		const inputContainers = this._subruleInputsDiv.querySelectorAll(".subrule-input-container");

		for(let i = 0; i < inputContainers.length; i++)
            inputContainers[i].remove();
            
        if(!this._container.classList.contains("empty"))
            this._container.classList.add("empty");
    }
}

customElements.define('ktbs4la2-multiple-hrules-subrules-input', KTBS4LA2MultipleHrulesSubrulesInput);