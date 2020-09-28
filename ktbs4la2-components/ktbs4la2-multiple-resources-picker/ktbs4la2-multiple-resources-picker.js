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
	static get observedAttributes() {
		let _observedAttributes = super.observedAttributes;
		_observedAttributes.push("root-uri");
        _observedAttributes.push("root-label");
        _observedAttributes.push("browse-start-uri");
        _observedAttributes.push("allowed-resource-types");
        _observedAttributes.push("required");
        _observedAttributes.push("value");
		return _observedAttributes;
    }
    
    /**
     * 
     */
    get value() {
        let pickers_values = new Array();
        const pickers = this._getResourcePickers();

        for(let i = 0; i < pickers.length; i++)
            pickers_values.push(pickers[i].value);

        return pickers_values.join(" ");
    }

    /**
     * 
     */
    set value(newValue) {
        const new_values = newValue.split(" ").filter(Boolean);

        this._componentReady.then(() => {    
            const pickers = this._getResourcePickers();
            const maxI = Math.max(new_values.length, pickers.length);

            for(let i = 0; i < maxI; i++) {
                if((i < new_values.length) && (i < pickers.length))
                    pickers[i].value = new_values[i];
                else if((i < pickers.length) && (i >= new_values.length))
                    pickers[i].value = "";
                else if((i < new_values.length) && (i >= pickers.length))
                    this._addResourcePicker(new_values[i], (i > 0));
            }
        }).catch(() => {});
    }


    /**
	 * 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		super.attributeChangedCallback(name, oldValue, newValue);
        
        if(name == "required") {
            const currentPickers = this._getResourcePickers();
            
            if(currentPickers.length > 0)
                currentPickers[0].setAttribute("required", ((this.getAttribute("required") == "") || (this.getAttribute("required") == "true") || (this.getAttribute("required") == "1")));
        }
        if(name == "allowed-resource-count") {
            if(newValue == "*") {
                this._allowMultipleResources = true;
            }
            if(newValue == "1") {
                this._allowMultipleResources = false;
                // @TODO : supprimer les resource pickers en trop (= après le 1er)
            }
            else
                this.emitErrorEvent(new RangeError("Only values \"1\" or \"*\" are allowed for attribute \"allowed-resource-count\""));
        }
        else if(name == "value")
            this.value = newValue;
        else {
            this._componentReady.then(() => {
                const currentPickers = this._getResourcePickers();

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
			const resourcePickers = this._getResourcePickers();

			if(resourcePickers.length <= 0)
				this._addResourcePicker(null, false);
		});
			
		this.addEventListener("focus", this._onFocus.bind(this));
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        // ...
    }

    /**
	 * 
	 */
	_getResourcePickers() {
		return this._resourcePickedsDiv.querySelectorAll("ktbs4la2-resource-picker");
    }
    
    /**
	 * 
	 */
	_addResourcePicker(value = null, allow_remove = true) {
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

		const pickerTabIndex = 2 * this._getResourcePickers().length + 1;
		newResourcePicker.setAttribute("tabIndex", pickerTabIndex);

		pickerContainer.appendChild(newResourcePicker);
		newResourcePicker.addEventListener("focus", this._onResourcePickerFocus.bind(this));
		const currentPickers = this._getResourcePickers();

		if(allow_remove && (currentPickers.length > 0)) {
			const removeResourceButton = document.createElement("button");
			removeResourceButton.classList.add("remove-resource-button");
			removeResourceButton.setAttribute("title", this._translateString("Remove this resource"));
			removeResourceButton.addEventListener("click", this._onClickRemoveResourceButton.bind(this));
			removeResourceButton.innerText = "❌";
			removeResourceButton.setAttribute("tabIndex", pickerTabIndex + 1);
			pickerContainer.appendChild(removeResourceButton);
        }
        
        if(
                (currentPickers.length == 0)
            &&  (
                    (this.getAttribute("required") == "")
                ||  (this.getAttribute("required") == "true")
                ||  (this.getAttribute("required") == "1")
            )
        )
            pickerContainer.setAttribute("required", true);

		this._resourcePickedsDiv.appendChild(pickerContainer);
		return pickerContainer;
    }
    
    /**
	 * 
	 */
	_onClickAddResourceButton(event) {
		this._addResourcePicker();
		const resourcePickers = this._getResourcePickers();

		if(resourcePickers.length > 0)
			resourcePickers[resourcePickers.length - 1]._componentReady.then(() => {
				resourcePickers[resourcePickers.length - 1].focus();
			});
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
	_onClickRemoveResourceButton(event) {
		const clickedButton = event.target;

		if(clickedButton.classList.contains("remove-resource-button")) {
			const parentContainer = clickedButton.parentNode;

			if(parentContainer.classList.contains("resource-picker-container"))
				parentContainer.remove();
		}
	}

    /**
     * 
     */
    checkValidity() {
        const valid = true;
        const pickers = this._getResourcePickers();

        for(let i = 0; valid && (i < pickers.length); i++)
            valid = pickers[i].checkValidity();

        return valid;
    }
}

customElements.define('ktbs4la2-multiple-resources-picker', KTBS4LA2MultipleResourcesPicker);
