import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

/**
 * 
 */
class KTBS4LA2ResourceIDInput extends TemplatedHTMLElement {

    /**
     * 
     */
    constructor() {
        super(import.meta.url, true);
    }

    /**
	 * 
	 */
	static get observedAttributes() {
		let _observedAttributes = super.observedAttributes;
        _observedAttributes.push("maxlength");
		_observedAttributes.push("minlength");
		_observedAttributes.push("placeholder");
		_observedAttributes.push("readonly");
        _observedAttributes.push("value");
        _observedAttributes.push("required");
        _observedAttributes.push("parent-resource-path");
		return _observedAttributes;
	}

    /**
	 * 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		super.attributeChangedCallback(name, oldValue, newValue);
        
        if(name == "parent-resource-path")
            this._componentReady.then(() => {
                this._parentResourcePathSpan.innerText = newValue;
            }).catch(() => {});
        else if(name == "value")
            this.value = newValue;
        else if(name == "placeholder") 
            this._componentReady.then(() => {
                if(!this.value)
                    this._adjustIdInputWidthForText(newValue);

                this._idInput.setAttribute("placeholder", newValue);
            }).catch(() => {});
        else
            this._componentReady.then(() => {
                this._idInput.setAttribute(name, newValue);
            }).catch(() => {});
    }

    /**
	 * 
	 */
	onComponentReady() {
        this._parentResourcePathSpan = this.shadowRoot.querySelector("#parent-resource-path");
        this._parentResourcePathSpan.addEventListener("focus", this._onChildElementFocus.bind(this));
        this._idInput = this.shadowRoot.querySelector("#id-input");
        this._idInput.addEventListener("input", this._onChangeIdInputValue.bind(this));
        this._idInput.addEventListener("focus", this._onChildElementFocus.bind(this));
        this._trailingSlash = this.shadowRoot.querySelector("#trailing-slash");
        this._trailingSlash.addEventListener("focus", this._onChildElementFocus.bind(this));
        this._hiddenSpanForIdWidth = this.shadowRoot.querySelector("#hidden-span-for-id-width");


        if(!this._idInput.value)
            this._adjustIdInputWidthForText(this.getAttribute("placeholder"));

        this.addEventListener("focus", this._onFocus.bind(this));
    }

    /**
     * 
     */
    get value() {
        if(
                this.hasAttribute("force-trailing-slash") 
            &&  (
                        (this.getAttribute("force-trailing-slash") == "")
                    ||  (this.getAttribute("force-trailing-slash") == "true")
                    ||  (this.getAttribute("force-trailing-slash") == "1")
            )
        )
            return this._idInput.value + "/";
        else
            return this._idInput.value;
    }

    /**
     * 
     */
    set value(newValue) {
        this._componentReady.then(() => {
            let inputValue;

            if(
                    this.hasAttribute("force-trailing-slash") 
                &&  (
                            (this.getAttribute("force-trailing-slash") == "")
                        ||  (this.getAttribute("force-trailing-slash") == "true")
                        ||  (this.getAttribute("force-trailing-slash") == "1")
                )
                &&  (newValue.charAt(newValue.length - 1) == '/')
            )
                inputValue = newValue.substring(0, newValue.length - 1);
            else
                inputValue = newValue;

            this._adjustIdInputWidthForText(inputValue);
            this._idInput.value = inputValue;
        }).catch(() => {});
    }

    /**
	 * 
	 * \param Event event 
	 */
	_onChangeIdInputValue(event) {
        if(this._idInput.value)
            this._adjustIdInputWidthForText(this._idInput.value);
        else
            this._adjustIdInputWidthForText(this.getAttribute("placeholder"));
	}

    /**
     * 
     */
    _adjustIdInputWidthForText(text) {
        this._hiddenSpanForIdWidth.innerText = text;
		const textWidth = this._hiddenSpanForIdWidth.offsetWidth;
		let newInputWidth = (textWidth >= 0)?(textWidth + 3):3;
		this._idInput.style.width = newInputWidth + "px";
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
        this._componentReady.then(() => {
            this._idInput.focus();
        }).catch(() => {});
    }

    /**
     * 
     */
    checkValidity() {
        return ( 
                this._idInput.checkValidity()
            &&  (
                        !this.getAttribute("reserved-ids")
                    ||  !(this.getAttribute("reserved-ids").split(" ").filter(Boolean).includes(this.value))
            )
        );
	}
}

customElements.define('ktbs4la2-resource-id-input', KTBS4LA2ResourceIDInput);
