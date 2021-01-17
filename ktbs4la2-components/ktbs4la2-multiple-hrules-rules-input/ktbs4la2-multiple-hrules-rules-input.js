import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

import "../ktbs4la2-hrules-rule-input/ktbs4la2-hrules-rule-input.js";

/**
 * 
 */
class KTBS4LA2MultipleHrulesRulesInput extends TemplatedHTMLElement {

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
        let returnArray = [];
        const rulesInputs = this._getRulesInputs();

        for(let i = 0; i < rulesInputs.length; i++)
            if(rulesInputs[i].checkValidity())
                returnArray.push(JSON.parse(rulesInputs[i].value));

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
        if(this._ruleInputsDiv) {
            let allRulesAreValid = true;
            const rulesInputs = this._getRulesInputs();

            for(let i = 0; allRulesAreValid && (i < rulesInputs.length); i++)
                allRulesAreValid = rulesInputs[i].checkValidity();

            return (
                    allRulesAreValid 
                &&  (
                        !this.required 
                    ||  (this.value != "[]")
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
        this._container = this.shadowRoot.querySelector("#container");
        this._emptyMessage = this.shadowRoot.querySelector("#empty-message");
        this._ruleInputsDiv = this.shadowRoot.querySelector("#rules-inputs");
		this._addRuleButton = this.shadowRoot.querySelector("#add-rule");
        this._addRuleButton.addEventListener("click", this._onClickAddRuleButton.bind(this));
        this._addRuleButton.addEventListener("focus", this._onChildElementFocus.bind(this));

		if(this.required)
			this._addRuleInput(false);
			
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
                        this._componentReady
                            .then(() => {
                                this._clearAllInputs();

                                if(valueObject.length > 0) {
                                    let ruleInputsSetValuePromises = new Array();

                                    for(let i = 0; i < valueObject.length; i++) {
                                        const aRuleInput = this._addRuleInput(!((i == 0) && this.required));
                                        const aRuleInputSetValuePromise = aRuleInput.setAttribute("value", JSON.stringify(valueObject[i]));
                                        ruleInputsSetValuePromises.push(aRuleInputSetValuePromise);
                                    }

                                    Promise.all(ruleInputsSetValuePromises)
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
                                        this._addRuleInput(false);

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
                            this._addRuleInput(false);

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
                const rulesInputs = this._getRulesInputs();

                if(rulesInputs.length > 0) {
                    if(this.required) {
                        rulesInputs[0].setAttribute("required", newValue);
                        const existingRemoveButton = rulesInputs[0].parentNode.querySelector("button.remove-rule-button");

                        if(existingRemoveButton) {
                            existingRemoveButton.remove();
                            this._reIndexTabNavigation();
                        }
                    }
                    else {
                        if(rulesInputs[0].hasAttribute("required"))
                            rulesInputs[0].removeAttribute("required");

                        const existingRemoveButton = rulesInputs[0].parentNode.querySelector("button.remove-rule-button");

                        if(!existingRemoveButton) {
                            const newRemoveButton = document.createElement("button");
                            newRemoveButton.classList.add("remove-rule-button");
                            newRemoveButton.setAttribute("title", this._translateString("Remove this rule"));
                            newRemoveButton.addEventListener("click", this._onClickRemoveRuleButton.bind(this));
                            newRemoveButton.innerText = "❌";
                            rulesInputs[0].parentNode.appendChild(newRemoveButton);
                            this._reIndexTabNavigation();
                        }
                    }
                }
                else if(this.required)
                    this._addRuleInput(false);
            }).catch(() => {});
        }
        else if(name == "model-uri") {
            this._componentReady.then(() => {
                const rulesInputs = this._getRulesInputs();

                for(let i = 0; i < rulesInputs.length; i++) {
                    if(newValue)
                        rulesInputs[i].setAttribute("model-uri", newValue);
                    else if(rulesInputs[i].hasAttribute("model-uri"))
                        rulesInputs[i].removeAttribute("model-uri");
                }
            }).catch(() => {});
        }
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._emptyMessage.innerText = this._translateString("No rule is defined yet");
        const rulesInputs = this._getRulesInputs();

		for(let i = 0; i < rulesInputs.length; i++)
			rulesInputs[i].setAttribute("lang", this._lang);

		const removeRuleButtons = this.shadowRoot.querySelectorAll("#rules-inputs button.remove-rule-button");
			
		for(let i = 0; i < removeRuleButtons.length; i++)
            removeRuleButtons[i].setAttribute("title", this._translateString("Remove this rule"));
            
        this._addRuleButton.setAttribute("title", this._translateString("Add a rule"));
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
    _onFocus(event) {
        event.stopPropagation();
		const rulesInputs = this._getRulesInputs();

        if(rulesInputs.length > 0)
            rulesInputs[0]._componentReady.then(() => {
                setTimeout(() => {
                    rulesInputs[0].focus();
                });
            }).catch(() => {});
        else {
            setTimeout(() => {
                this._addRuleButton.focus();
            });
        }
    }

    /**
     * 
     */
    _onClickAddRuleButton(event) {
        //event.preventDefault();
        event.stopPropagation();
        const rulesInputs = this._getRulesInputs();
        const newRuleInput = this._addRuleInput(!((rulesInputs.length == 0) && this.required));
        
		newRuleInput._componentReady.then(() => {
            setTimeout(() => {
                newRuleInput.focus();
            });
		});
    }

    /**
	 * 
	 */
	_getRulesInputs() {
		return this._ruleInputsDiv.querySelectorAll("ktbs4la2-hrules-rule-input");
    }

    /**
	 * 
	 */
	_addRuleInput(allow_remove = true) {
		const inputContainer = document.createElement("div");
		inputContainer.classList.add("rule-input-container");
        const newRuleInput = document.createElement("ktbs4la2-hrules-rule-input");
        newRuleInput.setAttribute("lang", this._lang);
            
        if(this.hasAttribute("model-uri"))
            newRuleInput.setAttribute("model-uri", this.getAttribute("model-uri"));

        const currentRulesInputsCount = this._getRulesInputs().length;
        
        if(this.required && (currentRulesInputsCount == 0))
            newRuleInput.setAttribute("required", this.getAttribute("required"));

		const newRuleInputTabIndex = (currentRulesInputsCount > 0)?(2 * currentRulesInputsCount):1;
        newRuleInput.setAttribute("tabIndex", newRuleInputTabIndex);
        newRuleInput.addEventListener("input", this._onChildEvent.bind(this));
        newRuleInput.addEventListener("change", this._onChildEvent.bind(this));

		inputContainer.appendChild(newRuleInput);
		newRuleInput.addEventListener("focus", this._onChildElementFocus.bind(this));
		const currentInputs = this._getRulesInputs();

		if(allow_remove) {
			const removeRuleButton = document.createElement("button");
            removeRuleButton.classList.add("remove-rule-button");
			removeRuleButton.setAttribute("title", this._translateString("Remove this rule"));
			removeRuleButton.innerText = "❌";
            removeRuleButton.setAttribute("tabIndex", newRuleInputTabIndex + 1);
            removeRuleButton.addEventListener("click", this._onClickRemoveRuleButton.bind(this));
            removeRuleButton.addEventListener("focus", this._onAboutToRemoveRule.bind(this));
            removeRuleButton.addEventListener("mouseover", this._onAboutToRemoveRule.bind(this));
            removeRuleButton.addEventListener("mouseout", this._onNoMoreAboutToRemoveRule.bind(this));
            removeRuleButton.addEventListener("blur", this._onNoMoreAboutToRemoveRule.bind(this));
			inputContainer.appendChild(removeRuleButton);
		}

        this._ruleInputsDiv.appendChild(inputContainer);
        
        if(this._container.classList.contains("empty"))
            this._container.classList.remove("empty");

		return newRuleInput;
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
	_onClickRemoveRuleButton(event) {
		const clickedButton = event.target;

		if(clickedButton.classList.contains("remove-rule-button")) {
			const parentContainer = clickedButton.parentNode;

			if(parentContainer.classList.contains("rule-input-container")) {
                const ruleInput = parentContainer.querySelector("ktbs4la2-hrules-rule-input");
                const ruleWasValid = ruleInput.checkValidity();
				parentContainer.remove();
                this._reIndexTabNavigation();
                const currentRulesInputsCount = this._getRulesInputs().length;

                if((currentRulesInputsCount == 0) && !this._container.classList.contains("empty"))
                    this._container.classList.add("empty");

                if(ruleWasValid)
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
    _onAboutToRemoveRule(event) {
        event.stopPropagation();
        const hoveredOrFocusedButton = event.target;

		if(hoveredOrFocusedButton.classList.contains("remove-rule-button")) {
            const parentContainer = hoveredOrFocusedButton.parentNode;
            
            if(!parentContainer.classList.contains("about-to-remove"))
                parentContainer.classList.add("about-to-remove");
        }
    }

    /**
     * 
     */
    _onNoMoreAboutToRemoveRule(event) {
        event.stopPropagation();
        const hoveredOrFocusedButton = event.target;

		if(hoveredOrFocusedButton.classList.contains("remove-rule-button")) {
            const parentContainer = hoveredOrFocusedButton.parentNode;
            
            if(parentContainer.classList.contains("about-to-remove"))
                parentContainer.classList.remove("about-to-remove");
        }
    }

    /**
     * 
     */
    _reIndexTabNavigation() {
        const rulesInputsAndRemoveButtons = this.shadowRoot.querySelectorAll("ktbs4la2-hrules-rule-input, button.remove-rule-button");

        for(let i = 0; i < rulesInputsAndRemoveButtons.length; i++)
            rulesInputsAndRemoveButtons[i].setAttribute("tabIndex", (i + 1));
    }

    /**
	 * 
	 */
	_clearAllInputs() {
		const inputContainers = this._ruleInputsDiv.querySelectorAll(".rule-input-container");

		for(let i = 0; i < inputContainers.length; i++)
            inputContainers[i].remove();
            
        if(!this._container.classList.contains("empty"))
            this._container.classList.add("empty");
    }
}

customElements.define('ktbs4la2-multiple-hrules-rules-input', KTBS4LA2MultipleHrulesRulesInput);