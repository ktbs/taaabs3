import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

/**
 * 
 */
class KTBS4LA2LocalizedTextInput extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
        super(import.meta.url, true, true);

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
        this._textInput = this.shadowRoot.querySelector("#text-input");
        this._textInput.addEventListener("input", this._onChildEvent.bind(this));
        this._textInput.addEventListener("change", this._onChildEvent.bind(this));
        this._languageSelect = this.shadowRoot.querySelector("#language-select");
        this._languageSelect.addEventListener("change", this._onChildEvent.bind(this));
        this.addEventListener("focus", this._onFocus.bind(this));
        this._textInput.addEventListener("focus", this._onChildFormElementFocus.bind(this));
        this._languageSelect.addEventListener("focus", this._onChildFormElementFocus.bind(this));
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
    get value() {
        if(this._textInput)
            return this._textInput.value;
        else
            return undefined;
    }

    /**
     * 
     */
    set value(new_value) {
        this._componentReady.then(() => {
            this._textInput.value = new_value;
        });
    }

    /**
     * 
     */
    get language() {
        if(this._languageSelect)
            return this._languageSelect.value;
        else
            return undefined;
    }

    /**
     * 
     */
    set language(new_language) {
        this._componentReady.then(() => {
            const newSelectedOption = this.shadowRoot.querySelector("option[value = " + CSS.escape(new_language) + "]");

            if(newSelectedOption) {
                const previouslySelectedOptions = this.shadowRoot.querySelectorAll("option[selected = true]:not([value = " + CSS.escape(new_language) + "]), option[selected]:not([selected = false]):not([value = " + CSS.escape(new_language) + "])");

                for(let i = 0; i < previouslySelectedOptions.length; i++)
                    previouslySelectedOptions[i].selected = false;

                newSelectedOption.selected = true;
            }
        });
    }

    /**
	 * 
	 */
	static get observedAttributes() {
        let observedAttributes = super.observedAttributes;
		observedAttributes.push("maxlength");
		observedAttributes.push("minlength");
		observedAttributes.push("pattern");
		observedAttributes.push("placeholder");
		observedAttributes.push("readonly");
        observedAttributes.push("size");
        observedAttributes.push("value");
        observedAttributes.push("required");
        observedAttributes.push("spellcheck");
        observedAttributes.push("default-lang");
        observedAttributes.push("disabled-langs");
        observedAttributes.push("allowed-langs");
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
        
        if(name == "default-lang")
            this.language = newValue;
        else if(name == "disabled-langs") {
            if(!this.getAttribute("allowed-langs")) {
                let newDisabledLangCodes = newValue.split(" ").filter(Boolean);

                this._componentReady.then(() => {
                    const allOptions = this.shadowRoot.querySelectorAll("option");

                    for(let i = 0; i < allOptions.length; i++) {
                        const anOption = allOptions[i];

                        if(newDisabledLangCodes.includes(anOption.value)) {
                            anOption.disabled = true;
                            anOption.selected = false;
                        }
                        else 
                            anOption.disabled = false;
                    }
                }).catch(() => {});
            }
        }
        else if(name == "allowed-langs") {
            let newAllowedLangCodes = newValue.split(" ").filter(Boolean);

            this._componentReady.then(() => {
                const allOptions = this.shadowRoot.querySelectorAll("option");

                for(let i = 0; i < allOptions.length; i++) {
                    const anOption = allOptions[i];

                    if(newAllowedLangCodes.includes(anOption.value)) 
                        anOption.disabled = false;
                    else {
                        anOption.disabled = true;
                        anOption.selected = false;
                    }
                }
            }).catch(() => {});
        }
        else
            this._componentReady.then(() => {
                this._textInput.setAttribute(name, newValue);
            }).catch(() => {});
    }

    /**
     * 
     */
    _onFocus(event) {
        if(this.getAttribute("lang-select-side") == "left")
            this._languageSelect.focus();
        else
            this._textInput.focus();
    }

    /**
     * 
     */
    _onChildFormElementFocus(event) {
        event.stopPropagation();
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._languageSelect.setAttribute("title", this._translateString("Select language"));
        this.shadowRoot.querySelector("#language-select option[value = \"*\"]").setAttribute("title", this._translateString("Any (default)"));
        this.shadowRoot.querySelector("#language-select option[value = \"en\"]").setAttribute("title", this._translateString("English"));
        this.shadowRoot.querySelector("#language-select option[value = \"fr\"]").setAttribute("title", this._translateString("French"));
    }

    /**
     * 
     */
    checkValidity() {
        if(this._textInput)
            return this._textInput.checkValidity();
        else
            return false;
    }
}

customElements.define('ktbs4la2-localized-text-input', KTBS4LA2LocalizedTextInput);
