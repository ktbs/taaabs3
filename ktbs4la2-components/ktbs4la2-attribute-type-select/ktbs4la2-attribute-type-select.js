import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';
import {ResourceMultiton} from '../../ktbs-api/ResourceMultiton.js'
import {Model} from '../../ktbs-api/Model.js';
import {AttributeType} from '../../ktbs-api/AttributeType.js';

/**
 * 
 */
class KTBS4LA2AttributeTypeSelect extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
        super(import.meta.url, true);
        
        if(this.attachInternals)
            this._internals = this.attachInternals();

        this._optionsInstanciated = false;
        this._valueChanged = false;
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
        let returnValue = null;

        if(this._select) {
            const selectedOptions = this._select.selectedOptions;
            let selectedValues = new Array();

            for(let i = 0; i < selectedOptions.length; i++)
                selectedValues.push(selectedOptions[i].getAttribute("value"));

            returnValue = selectedValues.filter(Boolean).join(" ");
        }

        return returnValue;
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
    get multiple() {
        return this.hasAttribute("multiple");
    }

    /**
     * 
     */
    set multiple(newValue) {
        if(newValue != null) {
            if(this.getAttribute("multiple") != newValue)
                this.setAttribute("multiple", newValue);
        }
        else if(this.hasAttribute("multiple"))
            this.removeAttribute("multiple");
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
        return (
                (!this.required)
            ||  ((this.value) && (this.value != ""))
        );
    }

    /**
	 * 
	 */
	onComponentReady() {
        this._select = this.shadowRoot.querySelector("#select");
        this._select.addEventListener("focus", this._onFocusSelect.bind(this));
        this._select.addEventListener("change", this._onSelectEvent.bind(this));
        this._select.addEventListener("input", this._onSelectEvent.bind(this));

        if(!this.required && !this.multiple)
            this._instanciateDefaultOption();

        this.addEventListener("focus", this._onFocus.bind(this));

        if(!this.model_uri)
            this.emitErrorEvent(new Error("Missing value for required attribute \"model-uri\""));
	}

    /**
	 * 
	 */
	static get observedAttributes() {
		let _observedAttributes = super.observedAttributes;
        _observedAttributes.push("model-uri");
        _observedAttributes.push("obsel-type");
        _observedAttributes.push("required");
        _observedAttributes.push("value");
        _observedAttributes.push("multiple");
		return _observedAttributes;
    }

    /**
	 * 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		super.attributeChangedCallback(name, oldValue, newValue);
        
        if(name == "model-uri") {
            if(newValue) {
                this._model = ResourceMultiton.get_resource(Model, newValue);

                this._model.get(this._abortController.signal)
                    .then(() => {
                        this._componentReady.then(() => {
                            const current_value = this._valueChanged?this.value:this.getAttribute("value");
                            this._purgeOptions();
                            this._buildOptions(current_value);
                        }).catch(() => {});
                    })
                    .catch((error) => {
                        this.emitErrorEvent(error);
                    })
            }
            else
                this.emitErrorEvent(new Error("Missing value for required attribute \"model-uri\""));
        }
        else if(name == "obsel-type") {
            if(this._optionsInstanciated) {
                const current_value = this._valueChanged?this.value:this.getAttribute("value");
                this._purgeOptions();
                this._buildOptions(current_value);
            }
        }
        else if(name == "required") {
            this._componentReady.then(() => {
                if(!this.required && !this.multiple && !this._defaultOption)
                    this._instanciateDefaultOption();

                if(this._defaultOption && (this.required || this.multiple))
                    this._removeDefaultOption();

                this._select.setAttribute("required", newValue);
            }).catch(() => {});
        }
        else if(name == "value") {
            if(this._optionsInstanciated)
                this._applyValueToSelection(newValue);

            this._valueChanged = false;
        }
        else if(name == "multiple") {
            this._componentReady.then(() => {
                const current_value = this._valueChanged?this.value:this.getAttribute("value");

                if(!this.required && !this.multiple && !this._defaultOption)
                    this._instanciateDefaultOption();

                if(this._defaultOption && (this.required || this.multiple))
                    this._removeDefaultOption();

                if(newValue != null)
                    this._select.setAttribute("multiple", newValue);
                else if(this._select.hasAttribute("multiple"))
                    this._select.removeAttribute("multiple")

                if(this.multiple && this._optionsInstanciated)
                    this._select.setAttribute("size", this._select.options.length);
                else if (!this.multiple && this._select.hasAttribute("size"))
                    this._select.removeAttribute("size");

                this._applyValueToSelection(current_value);
            }).catch(() => {});
        }
    }

	/**
     * 
     */
    _updateStringsTranslation() {
        if(this._defaultOption)
            this._defaultOption.innerText = this._translateString("None");

        const attributeTypesOptions = this._select.querySelectorAll("option:not(#default)");

		for(let i = 0; i < attributeTypesOptions.length; i++) {
            const anOption = attributeTypesOptions[i];
            const attributeTypeId = anOption.getAttribute("value");
            const attributeType = this._model.get_attribute_type(attributeTypeId);

            if(attributeType)
                anOption.innerText = attributeType.get_translated_label(this._lang);
        }
    }

    /**
     * 
     */
    _instanciateDefaultOption() {
        if(!this._defaultOption) {
            this._defaultOption = document.createElement("option");
            this._defaultOption.id = "default";
            this._defaultOption.innerText = this._translateString("None");
            this._select.prepend(this._defaultOption);
        }
    }

    /**
     * 
     */
    _removeDefaultOption() {
        if(this._defaultOption) {
            this._defaultOption.remove();
            delete this._defaultOption;
        }
    }

    /**
     * 
     */
    _purgeOptions() {
        this._optionsInstanciated = false;

        // remove all previous option children (but default)
        const currentOptions = this._select.querySelectorAll("option:not(#default)");

        for(let i = (currentOptions.length - 1); i >= 0; i--)
            currentOptions[i].remove();
    }

    /**
     * 
     */
    _buildOptions(previous_value) {
        let obselType = null;

        if(this.obsel_type)
            obselType = this._model.get_obsel_type(this.obsel_type);
        
        let valuesArray = null;
        let valueString = null;

        if(this.multiple) {
            if(previous_value)
                valuesArray = previous_value.split(" ").filter(Boolean);
        }
        else if(previous_value)
                valueString = previous_value;

        // add builtin attribute types
        for(let i = 0; i < AttributeType.builtin_attribute_types.length; i++) {
            const attributeType = AttributeType.builtin_attribute_types[i];
            const newAttributeTypeOption = document.createElement("option");
            newAttributeTypeOption.setAttribute("value", attributeType.id); 
            newAttributeTypeOption.innerText = attributeType.get_translated_label(this._lang);

            if(
                    (this.multiple && valuesArray && valuesArray.includes(attributeType.id))
                ||  (!this.multiple && valueString && (valueString == attributeType.id))
            )
                newAttributeTypeOption.setAttribute("selected", "");

            this._select.appendChild(newAttributeTypeOption);
        }
        
        // add model-defined attribute types
        for(let i = 0; i < this._model.attribute_types.length; i++) {
            const attributeType = this._model.attribute_types[i];
            
            if(!this.obsel_type || (obselType && attributeType.appliesToObselType(obselType))) {
                const newAttributeTypeOption = document.createElement("option");
                newAttributeTypeOption.setAttribute("value", attributeType.id); 
                newAttributeTypeOption.innerText = attributeType.get_translated_label(this._lang);

                if(
                        (this.multiple && valuesArray && valuesArray.includes(attributeType.id))
                    ||  (!this.multiple && valueString && (valueString == attributeType.id))
                )
                    newAttributeTypeOption.setAttribute("selected", "");

                this._select.appendChild(newAttributeTypeOption);
            }
        }
        
        if(this.multiple)
            this._select.setAttribute("size", this._select.options.length);
        else if(this._select.hasAttribute("size"))
            this._select.removeAttribute("size");
        
        this._optionsInstanciated = true;
    }

    /**
     * 
     * \param String value 
     */
    _applyValueToSelection(value) {
        for(let i = 0; i < this._select.options.length; i++) {
            const anOption = this._select.options[i];

            if(this.multiple) {
                const valuesArray = value.split(" ").filter(Boolean);

                if(valuesArray.includes(anOption.getAttribute("value")) && !anOption.hasAttribute("selected"))
                    anOption.setAttribute("selected", true);
                else if(!valuesArray.includes(anOption.getAttribute("value")) && anOption.hasAttribute("selected"))
                    anOption.removeAttribute("selected");
            }
            else {
                if((anOption.getAttribute("value") == value) && !anOption.hasAttribute("selected"))
                    anOption.setAttribute("selected", true);
                else if((anOption.getAttribute("value") != value) && anOption.hasAttribute("selected"))
                    anOption.removeAttribute("selected");
            }
        }
    }

    /**
     * 
     */
    _onFocus(event) {
        event.stopPropagation();
        event.preventDefault();
        
        this._componentReady.then(() => {
            setTimeout(() => {
                this._select.focus();
            });
        }).catch(() => {});
        
        return false;
    }

    /**
     * 
     */
    _onFocusSelect(event) {
        event.stopPropagation();
    }

    /**
     * 
     */
    _onSelectEvent(event) {
        event.stopPropagation();

        const componentEvent = new Event(event.type, {
            bubbles: true,
            cancelable: false,
            composed: event.composed
        });

        this.dispatchEvent(componentEvent);
        this._valueChanged = true;
    }
}

customElements.define('ktbs4la2-attribute-type-select', KTBS4LA2AttributeTypeSelect);
