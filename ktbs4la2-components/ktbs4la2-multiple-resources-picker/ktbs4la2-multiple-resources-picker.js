import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';
import "../ktbs4la2-resource-picker/ktbs4la2-resource-picker.js";

/**
 * 
 */
class KTBS4LA2MultipleResourcesPicker extends TemplatedHTMLElement {

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
	static get observedAttributes() {
		let _observedAttributes = super.observedAttributes;
		_observedAttributes.push("root-uri");
        _observedAttributes.push("root-label");
        _observedAttributes.push("browse-start-uri");
        _observedAttributes.push("allowed-resource-types");
        _observedAttributes.push("required");
        _observedAttributes.push("value");
        _observedAttributes.push("allowed-resource-count");
		return _observedAttributes;
    }
    
    /**
     * 
     */
    get value() {
        let pickers_values = new Array();
        const pickers = this.resourcePickers;

        for(let i = 0; i < pickers.length; i++)
            pickers_values.push(pickers[i].value);

        return pickers_values.filter(Boolean).join(" ");
    }

    /**
     * 
     */
    set value(newValue) {
        const new_values = newValue.split(" ").filter(Boolean);

        this._componentReady.then(() => {    
            const pickers = this.resourcePickers;
            if(this.getAttribute("allowed-resource-count") != "1") {
                const maxI = Math.max(new_values.length, pickers.length);

                for(let i = 0; i < maxI; i++) {
                    if((i < new_values.length) && (i < pickers.length))
                        pickers[i].value = new_values[i];
                    else if((i < pickers.length) && (i >= new_values.length))
                        pickers[i].value = "";
                    else if((i < new_values.length) && (i >= pickers.length))
                        this._addResourcePicker(new_values[i], (i > 0));
                }
            }
            else {
                if(new_values.length >= 1)
                    pickers[1].value = new_values[1];
                else
                    pickers[1].value = "";
            }
        }).catch(() => {});
    }


    /**
	 * 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		super.attributeChangedCallback(name, oldValue, newValue);
        
        if(name == "required") {
            this._componentReady.then(() => {
                const currentPickers = this.resourcePickers;
                
                if(currentPickers.length > 0)
                    currentPickers[0].setAttribute("required", this.required);
            }).catch(() => {});
        }
        if(name == "allowed-resource-count") {
            if(newValue == "1") {
                this._componentReady.then(() => {
                    const currentPickers = this.resourcePickers;

                    for(let i = 1; i < currentPickers.length; i++) {
                        const parentContainer = currentPickers[i].parentNode;

                        if(parentContainer.classList.contains("resource-picker-container"))
                            parentContainer.remove();
                    }

                    this._reIndexTabNavigation();
                }).catch(() => {});
            }
            else
                this.emitErrorEvent(new RangeError("Only values \"1\" or \"*\" are allowed for attribute \"allowed-resource-count\""));
        }
        else if(name == "value")
            this.value = newValue;
        else {
            this._componentReady.then(() => {
                const currentPickers = this.resourcePickers;

                for(let i = 0; i < currentPickers.length; i++)
                    currentPickers[i].setAttribute(name, newValue);
            }).catch(() => {});
        }
    }

    /**
	 * 
	 */
	onComponentReady() {
        this._resourcePickedsDiv = this.shadowRoot.querySelector("#resource-pickers");
		this._addResourceButton = this.shadowRoot.querySelector("#add-resource");
		this._addResourceButton.addEventListener("click", this._onClickAddResourceButton.bind(this));

		setTimeout(() => {
			const resourcePickers = this.resourcePickers;

			if(resourcePickers.length <= 0)
				this._addResourcePicker(null, false);
		});
			
		this.addEventListener("focus", this._onFocus.bind(this));
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._addResourceButton.setAttribute("title", this._translateString("Add a resource"));
        const removeButtons = this.shadowRoot.querySelectorAll("button.remove-resource-button");

        for(let i = 0; i < removeButtons.length; i++)
            removeButtons[i].setAttribute("title", this._translateString("Remove this resource"));
    }

    /**
	 * 
	 */
	get resourcePickers() {
        if(this._resourcePickedsDiv)
		    return this._resourcePickedsDiv.querySelectorAll("ktbs4la2-resource-picker");
        else
            return undefined;
    }

    /**
     * 
     */
    get picked_resources() {
        const pickers = this.resourcePickers;

        if(pickers instanceof NodeList) {
            const picked_resources = new Array();

            for(let i = 0; i < pickers.length; i++) {
                const aPicker = pickers[i];
                const aPickedResource = aPicker.picked_resource;

                if(aPickedResource)
                    picked_resources.push(aPickedResource);
            }

            return picked_resources;
        }
        else
            return undefined;
    }
    
    /**
	 * 
	 */
	_addResourcePicker(value = null, allow_remove = true) {
        const currentPickers = this.resourcePickers;
		const pickerContainer = document.createElement("div");
		pickerContainer.classList.add("resource-picker-container");
		const newResourcePicker = document.createElement("ktbs4la2-resource-picker");
		newResourcePicker.setAttribute("lang", this._lang);

		if(value)
			newResourcePicker.setAttribute("value", value);

		if(this.getAttribute("root-uri"))
			newResourcePicker.setAttribute("root-uri", this.getAttribute("root-uri"));

		if(this.getAttribute("root-label"))
            newResourcePicker.setAttribute("root-label", this.getAttribute("root-label"));
            
        if(this.getAttribute("browse-start-uri"))
			newResourcePicker.setAttribute("browse-start-uri", this.getAttribute("browse-start-uri"));
		
		if(this.getAttribute("allowed-resource-types"))
			newResourcePicker.setAttribute("allowed-resource-types", this.getAttribute("allowed-resource-types"));

		if(this.getAttribute("placeholder"))
			newResourcePicker.setAttribute("placeholder", this.getAttribute("placeholder"));

        const currentPickersCount = this.resourcePickers.length;
		const newPickerTabIndex = (currentPickersCount > 0)?(2 * currentPickersCount):1;
        newResourcePicker.setAttribute("tabIndex", newPickerTabIndex);
        
        if(
                (currentPickers.length == 0)
            &&  this.required
        )
            newResourcePicker.setAttribute("required", true);

		pickerContainer.appendChild(newResourcePicker);
		newResourcePicker.addEventListener("focus", this._onResourcePickerFocus.bind(this));
		
		if(allow_remove && (currentPickers.length > 0)) {
			const removeResourceButton = document.createElement("button");
			removeResourceButton.classList.add("remove-resource-button");
			removeResourceButton.setAttribute("title", this._translateString("Remove this resource"));
			removeResourceButton.addEventListener("click", this._onClickRemoveResourceButton.bind(this));
			removeResourceButton.innerText = "❌";
            removeResourceButton.setAttribute("tabIndex", newPickerTabIndex + 1);
            newResourcePicker.addEventListener("input", this._onChildResourcePickerEvent.bind(this));
            newResourcePicker.addEventListener("change", this._onChildResourcePickerEvent.bind(this));
			pickerContainer.appendChild(removeResourceButton);
        }
        
		this._resourcePickedsDiv.appendChild(pickerContainer);
		return pickerContainer;
    }
    
    /**
	 * 
	 */
	_onClickAddResourceButton(event) {
        if(this.getAttribute("allowed-resource-count") != "1") {
            this._addResourcePicker();
            const resourcePickers = this.resourcePickers;

            if(resourcePickers.length > 0)
                resourcePickers[resourcePickers.length - 1]._componentReady.then(() => {
                    resourcePickers[resourcePickers.length - 1].focus();
                });
        }
	}

    /**
	 * 
	 */
	_onResourcePickerFocus(event) {
		event.stopPropagation();
    }

    /**
     * 
     */
    _onFocus(event) {
        this._componentReady.then(() => {
            const pickers = this.resourcePickers;

            if(pickers.length > 0)
                pickers[0].focus();
        }).catch(() => {});
    }
    
    /**
	 * 
	 */
	_onClickRemoveResourceButton(event) {
		const clickedButton = event.target;

		if(clickedButton.classList.contains("remove-resource-button")) {
			const parentContainer = clickedButton.parentNode;

			if(parentContainer.classList.contains("resource-picker-container")) {
                parentContainer.remove();
                this._reIndexTabNavigation();

                const newEvent = new Event("change", {
                    bubbles: true,
                    cancelable: false,
                    composed: false
                });

                this.dispatchEvent(newEvent);
            }
		}
    }

    /**
     * 
     */
    _reIndexTabNavigation() {
        const pickersAndRemoveButtons = this.shadowRoot.querySelectorAll("ktbs4la2-resource-picker, button.remove-resource-button");

        for(let i = 0; i < pickersAndRemoveButtons.length; i++)
            pickersAndRemoveButtons[i].setAttribute("tabIndex", (i + 1));
    }

    /**
     * 
     */
    checkValidity() {
        let valid = true;
        const pickers = this.resourcePickers;

        for(let i = 0; valid && (i < pickers.length); i++)
            valid = pickers[i].checkValidity();

        return valid;
    }

    /**
     * 
     */
    _onChildResourcePickerEvent(event) {
        event.stopPropagation();

        const newEvent = new Event(event.type, {
            bubbles: event.bubbles,
            cancelable: false,
            composed: event.composed
        });

        this.dispatchEvent(newEvent);
    }
}

customElements.define('ktbs4la2-multiple-resources-picker', KTBS4LA2MultipleResourcesPicker);
