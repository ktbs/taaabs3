import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

import '../ktbs4la2-localized-text-input/ktbs4la2-localized-text-input.js';

/**
 * 
 */
class KTBS4LA2MultipleTranslationsTextInput extends TemplatedHTMLElement {

    /**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true);
		this._disabled_langs = new Array();
		this._allowed_langs = new Array();
		this._required_langs = new Array();

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
	onComponentReady() {
		this._localizedInputsDiv = this.shadowRoot.querySelector("#localized-inputs");
		this._addTranslationButton = this.shadowRoot.querySelector("#add-translation");
		this._addTranslationButton.addEventListener("click", this._onClickAddTranslationButton.bind(this));

		setTimeout(() => {
			const localizedInputs = this._getLocalizedInputs();

			if(localizedInputs.length <= 0)
				this._addLocalizedInput(null, null, false);
		});
			
		this.addEventListener("focus", this._onFocus.bind(this));
	}
	
	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push("value");
		observedAttributes.push("maxlength");
		observedAttributes.push("minlength");
		observedAttributes.push("placeholder");
        observedAttributes.push("size");
        observedAttributes.push("required");
        observedAttributes.push("spellcheck");
        observedAttributes.push("disabled-langs");
		observedAttributes.push("allowed-langs");
		observedAttributes.push("required-langs");
		return observedAttributes;
	}
	
	/**
     * 
     * @param {*} name 
     * @param {*} oldValue 
     * @param {*} newValue 
     */
    attributeChangedCallback(name, oldValue, newValue) {
		super.attributeChangedCallback(name, oldValue, newValue);
		
		if(name == "value") {
			this._componentReady.then(() => {
				this._clearAllInputs();

				if(newValue) {
					try {
						const new_values_array = JSON.parse(newValue);
		
						if(new_values_array instanceof Array) {
							for(let i = 0; i < new_values_array.length; i++) {
								const aTranslation = new_values_array[i];
								this._addLocalizedInput(aTranslation["value"], aTranslation["lang"]);
							}
						}
					}
					catch(error) {
						this._addLocalizedInput(new_value);
					}
				}
			});
		}
        else if(name == "disabled-langs") {
			if(!this.getAttribute("allowed-langs")) {
				this._disabled_langs = newValue.split(" ").filter(Boolean);

				this._componentReady.then(() => {
					const localizedInputs = this._getLocalizedInputs();

					for(let i = 0; i < localizedInputs.length; i++)
						localizedInputs[i].setAttribute("disabled-langs", newValue);
				});
			}
        }
        else if(name == "allowed-langs") {
			this._allowed_langs = newValue.split(" ").filter(Boolean);

			this._componentReady.then(() => {
				const localizedInputs = this._getLocalizedInputs();

				for(let i = 0; i < localizedInputs.length; i++)
					localizedInputs[i].setAttribute("allowed-langs", newValue);
			});
		}
		else if(name == "required-langs") {
			this._required_langs = newValue.split(" ").filter(Boolean);

			this._componentReady.then(() => {
				const localizedInputs = this._getLocalizedInputs();
				let alreadySelectedLangs = new Array();

				for(let i = 0; i < localizedInputs.length; i++) {
					const input = localizedInputs[i];
					const inputLang = input.language;

					if(!alreadySelectedLangs.includes(inputLang)) {
						alreadySelectedLangs.push(inputLang);

						if(this._required_langs.includes(inputLang)) {
							input.setAttribute("allowed-langs", inputLang);
							input.setAttribute("required", true);
						}
					} 
					else if((!input.value) && (this._required_langs.length > 0)) {
						input.parentNode.remove();
						this._reIndexTabNavigation();
					}
				}

				for(let i = 0; i < this._required_langs.length; i++) {
					const lang = this._required_langs[i];

					if(!alreadySelectedLangs.includes(lang)) {
						this._addLocalizedInput("", lang, false);
					}
				}
			});
		}
        else
			this._componentReady.then(() => {
				const localizedInputs = this._getLocalizedInputs();

				for(let i = 0; i < localizedInputs.length; i++)
					localizedInputs[i].setAttribute(name, newValue);
			});
	}

	/**
	 * 
	 */
	_getLocalizedInputs() {
		if(this._localizedInputsDiv)
			return this._localizedInputsDiv.querySelectorAll("ktbs4la2-localized-text-input");
		else
			return [];
	}

	/**
	 * 
	 */
	_addLocalizedInput(value = null, lang = null, allow_remove = true) {
		const inputContainer = document.createElement("div");
		inputContainer.classList.add("localized-input-container");
		const newLocalizedInput = document.createElement("ktbs4la2-localized-text-input");
		newLocalizedInput.setAttribute("lang", this._lang);

		if(value)
			newLocalizedInput.setAttribute("value", value);

		if(lang)
			newLocalizedInput.setAttribute("allowed-langs", lang);

		if(this.getAttribute("maxlength"))
			newLocalizedInput.setAttribute("maxlength", this.getAttribute("maxlength"));

		if(this.getAttribute("minlength"))
			newLocalizedInput.setAttribute("minlength", this.getAttribute("minlength"));

		if(this.getAttribute("placeholder"))
			newLocalizedInput.setAttribute("placeholder", this.getAttribute("placeholder"));

		if(this.getAttribute("size"))
			newLocalizedInput.setAttribute("size", this.getAttribute("size"));
		
		if(this.getAttribute("spellcheck"))
			newLocalizedInput.setAttribute("spellcheck", this.getAttribute("spellcheck"));

		const currentLocalizedInputsCount = this._getLocalizedInputs().length;
		const newLocalizedInputTabIndex = (currentLocalizedInputsCount > 0)?(2 * currentLocalizedInputsCount):1;
		newLocalizedInput.setAttribute("tabIndex", newLocalizedInputTabIndex);
		newLocalizedInput.addEventListener("input", this._onChildEvent.bind(this));
		newLocalizedInput.addEventListener("change", this._onChildEvent.bind(this));

		inputContainer.appendChild(newLocalizedInput);
		newLocalizedInput.addEventListener("focus", this._onLocalizedInputFocus.bind(this));
		const currentInputs = this._getLocalizedInputs();

		if(allow_remove && (currentInputs.length > 0)) {
			const removeTranslationButton = document.createElement("button");
			removeTranslationButton.classList.add("remove-translation-button");
			removeTranslationButton.setAttribute("title", this._translateString("Remove this translation"));
			removeTranslationButton.addEventListener("click", this._onClickRemoveTranslationButton.bind(this));
			removeTranslationButton.innerText = "❌";
			removeTranslationButton.setAttribute("tabIndex", newLocalizedInputTabIndex + 1);
			inputContainer.appendChild(removeTranslationButton);
		}

		this._localizedInputsDiv.appendChild(inputContainer);
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
	_onClickAddTranslationButton(event) {
		this._addLocalizedInput();
		const localizedInputs = this._getLocalizedInputs();

		if(localizedInputs.length > 0)
			localizedInputs[localizedInputs.length - 1]._componentReady.then(() => {
				localizedInputs[localizedInputs.length - 1].focus();
			});
	
		this.dispatchEvent(new Event("change", {
			bubbles: true,
			cancelable: false,
			composed: true
		}));
	}

	/**
	 * 
	 */
	_onClickRemoveTranslationButton(event) {
		const clickedButton = event.target;

		if(clickedButton.classList.contains("remove-translation-button")) {
			const parentContainer = clickedButton.parentNode;

			if(parentContainer.classList.contains("localized-input-container")) {
				parentContainer.remove();
				this._reIndexTabNavigation();

				this.dispatchEvent(new Event("change", {
					bubbles: true,
					cancelable: false,
					composed: true
				}));
			}
		}
	}

	/**
	 * 
	 */
	get value() {
		let translations = new Array();
		const inputs = this._getLocalizedInputs();

		for(let i = 0; i < inputs.length; i++) {
			const anInput = inputs[i];

			if(anInput.value) {
				translations.push({
					lang: anInput.language,
					value: anInput.value
				});
			}
		}

		return JSON.stringify(translations);
	}

	/**
	 * 
	 */
	_clearAllInputs() {
		const inputContainers = this._localizedInputsDiv.querySelectorAll(".localized-input-container");

		for(let i = 0; i < inputContainers.length; i++)
			inputContainers[i].remove();
	}

	/**
	 * 
	 */
	set value(new_value) {
		this.setAttribute("value", new_value);
	}
	
	/**
     * 
     */
    _onFocus(event) {
		const localizedInputs = this._getLocalizedInputs();

		if(localizedInputs.length > 0)
			localizedInputs[0].focus();
	}

	/**
	 * 
	 */
	_onLocalizedInputFocus(event) {
		event.stopPropagation();
	}

	/**
     * 
     */
    _updateStringsTranslation() {
		this._addTranslationButton.setAttribute("title", this._translateString("Add a translation"));
		const localizedInputs = this.shadowRoot.querySelectorAll("#localized-inputs ktbs4la2-localized-text-input");

		for(let i = 0; i < localizedInputs.length; i++)
			localizedInputs[i].setAttribute("lang", this._lang);

		const removeTranslationButtons = this.shadowRoot.querySelectorAll("#localized-inputs button.remove-translation-button");
			
		for(let i = 0; i < removeTranslationButtons.length; i++)
			removeTranslationButtons[i].setAttribute("title", this._translateString("Remove this translation"));
	}

	/**
     * 
     */
    _reIndexTabNavigation() {
        const localizedInputsAndRemoveButtons = this.shadowRoot.querySelectorAll("ktbs4la2-localized-text-input, button.remove-translation-button");

        for(let i = 0; i < localizedInputsAndRemoveButtons.length; i++)
            localizedInputsAndRemoveButtons[i].setAttribute("tabIndex", (i + 1));
	}
	
	/**
     * 
     */
    checkValidity() {
		let valid = true;
		const localizedInputs = this._getLocalizedInputs();

		for(let i = 0; valid && (i < localizedInputs.length); i++)
			valid = localizedInputs[i].checkValidity();

		return valid;
	}
}

customElements.define('ktbs4la2-multiple-translations-text-input', KTBS4LA2MultipleTranslationsTextInput);
