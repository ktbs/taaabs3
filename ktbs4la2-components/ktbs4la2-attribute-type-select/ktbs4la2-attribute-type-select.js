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

            for(let i = 0; i < selectedOptions.length; i++) {
                const attibuteType_Id = selectedOptions[i].getAttribute("value");
                let attributeType;

                if(AttributeType.builtin_attribute_types_ids.includes(attibuteType_Id))
                    attributeType = AttributeType.get_builtin_attribute_type(attibuteType_Id);
                else
                    attributeType = this._model.get_attribute_type(attibuteType_Id);

                if(attributeType)
                    selectedValues.push(attributeType.uri);
            }
                

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

        if(!this.model_uri && !this.obsel_type)
            this.emitErrorEvent(new Error("Missing value : at least either attribute of \"model-uri\" or\"obsel-type\" is required"));
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
            this._componentReady.then(() => {
                let new_model_uri;

                if(newValue)
                    new_model_uri = newValue;
                else {
                    if(this.obsel_type) {
                        const obsel_type_uri = new URL(this.obsel_type);

                        if(obsel_type_uri.hash)
                            new_model_uri = obsel_type_uri.toString().replace(obsel_type_uri.hash, "");
                    }
                    else
                        this.emitErrorEvent(new Error("Missing value : at least either attribute of \"model-uri\" or\"obsel-type\" is required"));
                }
                
                if(new_model_uri) {
                    if(!this._model || (new_model_uri != this._model.uri.toString())) {
                        this._model = ResourceMultiton.get_resource(Model, new_model_uri);

                        try {
                            this._model.get(this._abortController.signal)
                                .then(() => {
                                    if(this.obsel_type) {
                                        if(this.obsel_type.startsWith(this._model.uri.toString() + "#")) {
                                            const obsel_type_uri = new URL(this.obsel_type);

                                            if(obsel_type_uri.hash) {
                                                const obsel_type_id = decodeURI(obsel_type_uri.hash.substring(1));
                                                this._obselType = this._model.get_obsel_type(obsel_type_id);
                            
                                                if(this._obselType) {
                                                    const current_value = this._valueChanged?this.value:this.getAttribute("value");
                                                    this._purgeOptions();
                                                    this._buildOptions(current_value);
                                                }
                                                else {
                                                    this._purgeOptions();
                                                    this.emitErrorEvent(new Error("Provided value for \"obsel-type\" attribute seems to not be an ObselType described in the Model at \"" + newValue + "\""));
                                                }
                                            }
                                            else {
                                                this._purgeOptions();
                                                this.emitErrorEvent(new Error("Provided value for \"obsel-type\" attribute seems to not be a valid ObselType URI. It must be of form : <model_uri>#<obsel_type_id>"));
                                            }
                                        }
                                        else {
                                            this._purgeOptions();
                                            this.emitErrorEvent(new Error("Provided value for \"obsel-type\" attribute does not match with the one provided for \"model-uri\". If both are provided, the obsel type must belong to the model so that both uris start the same."));
                                        }
                                    }
                                    else {
                                        const current_value = this._valueChanged?this.value:this.getAttribute("value");
                                        this._purgeOptions();
                                        this._buildOptions(current_value);
                                    }
                                })
                                .catch((error) => {
                                    this._purgeOptions();
                                    this.emitErrorEvent(error);
                                });
                        }
                        catch(error) {
                            this._purgeOptions();
                            this.emitErrorEvent(error);
                        }
                    }
                }
                else {
                    if(this._model)
                        delete this._model;
                    
                    this._purgeOptions();
                }
            }).catch(() => {});
        }
        else if(name == "obsel-type") {
            this._componentReady.then(() => {
                if(newValue) {
                    try {
                        const obsel_type_uri = new URL(newValue);

                        if(obsel_type_uri.hash) {
                            if(!this.model_uri) {
                                const model_uri_string = newValue.replace(obsel_type_uri.hash, "");
                                this.model_uri = model_uri_string;
                            }
                            else {
                                if(newValue.startsWith(this.model_uri + "#")) {
                                    this._model.get(this._abortController.signal)
                                        .then(() => {
                                            const obsel_type_id = decodeURI(obsel_type_uri.hash.substring(1));

                                            if(!this._obselType || (obsel_type_id != this._obselType.id)) {
                                                this._obselType = this._model.get_obsel_type(obsel_type_id);

                                                if(this._obselType) {  
                                                    const current_value = this._valueChanged?this.value:this.getAttribute("value");
                                                    this._purgeOptions();
                                                    this._buildOptions(current_value);
                                                }
                                                else {
                                                    this._purgeOptions();
                                                    this.emitErrorEvent(new Error("Provided value for \"obsel-type\" attribute seems to not be an ObselType described in the Model at \"" + this.model_uri + "\""));
                                                }
                                            }
                                        })
                                        .catch((error) => {
                                            this._purgeOptions();
                                            this.emitErrorEvent(error);
                                        });
                                }
                                else {
                                    this._purgeOptions();
                                    this.emitErrorEvent(new Error("Provided value for \"obsel-type\" attribute does not match with the one provided for \"model-uri\". If both are provided, the obsel type must belong to the model so that both uris start the same."));
                                }
                            }
                        }
                        else {
                            this._purgeOptions();
                            this.emitErrorEvent(new Error("Provided value for \"obsel-type\" attribute seems to not be a valid ObselType URI. It must be of form : <model_uri>#<obsel_type_id>"));
                        }
                    }
                    catch(error) {
                        this._purgeOptions();
                        this.emitErrorEvent(error);
                    }
                }
                else {
                    if(this._obselType)
                        delete this._obselType;

                    if(this.model_uri) {
                        const current_value = this._valueChanged?this.value:this.getAttribute("value");                            
                        this._purgeOptions();
                        this._buildOptions(current_value);
                    }
                    else {
                        this._purgeOptions();
                        this.emitErrorEvent(new Error("Missing value : at least either attribute of \"model-uri\" or\"obsel-type\" is required"));
                    }
                }
            }).catch(() => {});
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
            let attributeType;
            
            if(AttributeType.builtin_attribute_types_ids.includes(attributeTypeId)) 
                attributeType = AttributeType.get_builtin_attribute_type(attributeTypeId);
            else
                attributeType = this._model.get_attribute_type(attributeTypeId);

            if(attributeType) {
                let attributeTypeLabel = attributeType.get_translated_label(this._lang);

                if(!attributeTypeLabel)
                    attributeTypeLabel = attributeType.label;

                if(!attributeTypeLabel)
                    attributeTypeLabel = attributeType.id;

                newAttributeTypeOption.innerText = attributeTypeLabel;

                anOption.innerText = attributeTypeLabel;
            }
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
        let selected_attribute_types_ids = new Array();
        
        if(previous_value) {
            if(this.multiple) {
                const valuesArray = previous_value.split(" ").filter(Boolean);
    
                for(let i = 0; i < valuesArray.length; i++) {
                    const attribute_type_uri_string = valuesArray[i];
                    const attribute_type_uri = new URL(attribute_type_uri_string);
                    const attribute_type_id = decodeURI(attribute_type_uri.hash.substring(1));
                    let attribute_type;
        
                    if(attribute_type_uri_string.startsWith(AttributeType.builtin_attribute_types_prefix))
                        attribute_type = AttributeType.get_builtin_attribute_type_by_real_id(attribute_type_id);
                    else
                        attribute_type = this._model.get_attribute_type(attribute_type_id);
        
                    if(attribute_type)
                        selected_attribute_types_ids.push(attribute_type.id);
                }
            }
            else {
                const attribute_type_uri_string = previous_value;
                const attribute_type_uri = new URL(attribute_type_uri_string);
                const attribute_type_id = decodeURI(attribute_type_uri.hash.substring(1));
                let attribute_type;
    
                if(attribute_type_uri_string.startsWith(AttributeType.builtin_attribute_types_prefix))
                    attribute_type = AttributeType.get_builtin_attribute_type_by_real_id(attribute_type_id);
                else
                    attribute_type = this._model.get_attribute_type(attribute_type_id);
    
                if(attribute_type)
                    selected_attribute_types_ids.push(attribute_type.id);
            }
        }

        // add builtin attribute types
        for(let i = 0; i < AttributeType.builtin_attribute_types.length; i++) {
            const attributeType = AttributeType.builtin_attribute_types[i];
            const newAttributeTypeOption = document.createElement("option");
            newAttributeTypeOption.setAttribute("value", attributeType.id); 

            let attributeTypeLabel = attributeType.get_translated_label(this._lang);

            if(!attributeTypeLabel)
                attributeTypeLabel = attributeType.label;

            if(!attributeTypeLabel)
                attributeTypeLabel = attributeType.id;

            newAttributeTypeOption.innerText = attributeTypeLabel;

            if(selected_attribute_types_ids.includes(attributeType.id))
                newAttributeTypeOption.setAttribute("selected", "");

            this._select.appendChild(newAttributeTypeOption);
        }
        
        // add model-defined attribute types
        for(let i = 0; i < this._model.attribute_types.length; i++) {
            const attributeType = this._model.attribute_types[i];
            
            if(!this.obsel_type || (this._obselType && attributeType.appliesToObselType(this._obselType))) {
                const newAttributeTypeOption = document.createElement("option");
                newAttributeTypeOption.setAttribute("value", attributeType.id); 

                let attributeTypeLabel = attributeType.get_translated_label(this._lang);

                if(!attributeTypeLabel)
                    attributeTypeLabel = attributeType.label;

                if(!attributeTypeLabel)
                    attributeTypeLabel = attributeType.id;

                newAttributeTypeOption.innerText = attributeTypeLabel;

                if(selected_attribute_types_ids.includes(attributeType.id))
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
        let selected_attribute_types_ids = new Array();

        if(this.multiple) {
            const valuesArray = value.split(" ").filter(Boolean);

            for(let i = 0; i < valuesArray.length; i++) {
                const attribute_type_uri_string = valuesArray[i];
                const attribute_type_uri = new URL(attribute_type_uri_string);
                const attribute_type_id = decodeURI(attribute_type_uri.hash.substring(1));
                let attribute_type;
    
                if(attribute_type_uri_string.startsWith(AttributeType.builtin_attribute_types_prefix))
                    attribute_type = AttributeType.get_builtin_attribute_type_by_real_id(attribute_type_id);
                else
                    attribute_type = this._model.get_attribute_type(attribute_type_id);
    
                if(attribute_type)
                    selected_attribute_types_ids.push(attribute_type.id);
            }
        }
        else {
            const attribute_type_uri_string = value;
            const attribute_type_uri = new URL(attribute_type_uri_string);
            const attribute_type_id = decodeURI(attribute_type_uri.hash.substring(1));
            let attribute_type;

            if(attribute_type_uri_string.startsWith(AttributeType.builtin_attribute_types_prefix))
                attribute_type = AttributeType.get_builtin_attribute_type_by_real_id(attribute_type_id);
            else
                attribute_type = this._model.get_attribute_type(attribute_type_id);

            if(attribute_type)
                selected_attribute_types_ids.push(attribute_type.id);
        }

        for(let i = 0; i < this._select.options.length; i++) {
            const anOption = this._select.options[i];

            if(selected_attribute_types_ids.includes(anOption.getAttribute("value")) && !anOption.hasAttribute("selected"))
                anOption.setAttribute("selected", true);
            else if(!selected_attribute_types_ids.includes(anOption.getAttribute("value")) && anOption.hasAttribute("selected"))
                anOption.removeAttribute("selected");
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
