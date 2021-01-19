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
        if(this._idInput) {
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
        else
            return "";
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
    set reserved_ids(new_ids) {
        if(new_ids == null)
            this.removeAttribute("reserved-ids");
        else if(new_ids instanceof Array)
            this.setAttribute("reserved-ids", new_ids.join(" "));
        else
            throw new TypeError("New value for property \"reserved_ids\" must be an instance of Array or null");
    }

    /**
     * Checks if a given id string equals one of the currently reserved ids
     * @param string candidate_id the id string we want to check if it is reserved
     * \return boolean
     * \public
     */
    _is_reserved_id(candidate_id) {
        return this.reserved_ids.includes(candidate_id);
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
        _observedAttributes.push("pattern");
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
        else if(name == "value") {
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
                
                this._idInput.value = inputValue;
                this._resolveLastSetValuePromise();
                this._lastSetValuePromise = null;
                this._adjustIdInputWidthForText(inputValue);
            }).catch((error) => {
                this._rejectLastSetValuePromise(error);
                this._lastSetValuePromise = null;
            });
        }
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
        this._idInput.addEventListener("input", this._onInputIdInput.bind(this));
        this._idInput.addEventListener("change", this._onIdInputEvent.bind(this));
        this._idInput.addEventListener("focus", this._onChildElementFocus.bind(this));
        this._idInputResizeObserver = new ResizeObserver(this._onIdInputResized.bind(this));
		this._idInputResizeObserver.observe(this._idInput);

        this._trailingSlash = this.shadowRoot.querySelector("#trailing-slash");
        this._trailingSlash.addEventListener("focus", this._onChildElementFocus.bind(this));
        this._hiddenSpanForIdWidth = this.shadowRoot.querySelector("#hidden-span-for-id-width");

        if(!this._idInput.value)
            this._adjustIdInputWidthForText(this.getAttribute("placeholder"));

        this.addEventListener("focus", this._onFocus.bind(this));
    }

    /**
	 * 
	 * \param Event event 
	 */
	_onInputIdInput(event) {
        this._onIdInputEvent(event);

        if(this._idInput.value)
            this._adjustIdInputWidthForText(this._idInput.value);
        else
            this._adjustIdInputWidthForText(this.getAttribute("placeholder"));
    }

    /**
     * 
     */
    _onIdInputResized() {
        if(this._idInput.value)
            this._adjustIdInputWidthForText(this._idInput.value);
        else
            this._adjustIdInputWidthForText(this.getAttribute("placeholder"));
    }
    
    /**
     * 
     */
    _onIdInputEvent(event) {
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
        event.stopPropagation();
        
        this._componentReady.then(() => {
            this._idInput.focus();
        }).catch(() => {});
    }

    /**
     * 
     */
    checkValidity() {
        if(this._idInput) {
            return ( 
                    this._idInput.checkValidity()
                &&  !this._is_reserved_id(this.value)
            );
        }
        else
            return false;
	}
}

customElements.define('ktbs4la2-resource-id-input', KTBS4LA2ResourceIDInput);
