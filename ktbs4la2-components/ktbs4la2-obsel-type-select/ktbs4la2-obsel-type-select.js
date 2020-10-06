import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';
import "../ktbs4la2-document-header/ktbs4la2-document-header.js";

import {ResourceMultiton} from '../../ktbs-api/ResourceMultiton.js'
import {Model} from '../../ktbs-api/Model.js';

/**
 * 
 */
class KTBS4LA2ObselTypeSelect extends TemplatedHTMLElement {

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
        let return_value = null;

        if(this.multiple) {
            const selectedOptions = this._options.querySelectorAll(".option.selected[value]");

            if(selectedOptions.length > 0) {
                let values = new Array();

                for(let i = 0; i < selectedOptions.length; i++)
                    values.push(selectedOptions[i].getAttribute("value"));

                return_value = values.join(" ");
            }
        }
        else {
            const selectedOption = this._options.querySelector(".option.selected[value]");

            if(selectedOption)
                return_value = selectedOption.getAttribute("value");
        }

        return return_value;
    }
 
     /**
      * 
      */
    set value(newValue) {
        if(newValue) {
            if(this.multiple) {
                const selected_values = newValue.split(" ").filter(Boolean);

                for(let i = 0; i < selected_values.length; i++)
                    this._selectMatchingOption(selected_values[i]);
            }
            else
                this._selectMatchingOption(newValue);
        }
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
    checkValidity() {
        return (
                ((this.value) && (this.value != ""))
            ||  (!this.required)
        );
    }

    /**
     * 
     */
    _onBlur(event) {
        this._componentReady.then(() => {
            if(this._select.classList.contains("open"))
                this._select.classList.remove("open");
        }).catch(() => {});
    }

    /**
     * 
     */
    _onFocus(event) {
        event.stopPropagation();
        event.preventDefault();
        
        this._componentReady.then(() => {
            if(!this._getFocusedOption()) {
                if(this._lastClickedOption) {
                    setTimeout(() => {
                        this._lastClickedOption.focus();
                    });
                }
                else {
                    const firstOption = this._options.querySelector(".option");

                    if(firstOption)
                        setTimeout(() => {
                            firstOption.focus();
                        });
                }
            }
        }).catch(() => {});
        
        return false;
    }

    /**
     * 
     */
    _onClickSelectedItemDisplay(event) {
        this._select.classList.toggle('open');
    }

    /**
     * 
     */
    _selectOptionsRange(optionA, optionB) {
        const optionAIndex = Array.from(this._options.children).indexOf(optionA);
        const optionBIndex = Array.from(this._options.children).indexOf(optionB);

        if(optionBIndex > optionAIndex) {
            for(let i = 0; i < optionAIndex; i++)
                this._unSelectOption(this._options.children[i]);

            for(let i = optionAIndex; i <= optionBIndex; i++)
                this._selectOption(this._options.children[i], false);

            for(let i = (optionBIndex + 1); i < this._options.children.length; i++)
                this._unSelectOption(this._options.children[i]);
        }
        else {
            for(let i = 0; i < optionBIndex; i++)
                this._unSelectOption(this._options.children[i]);

            for(let i = optionBIndex; i <= optionAIndex; i++)
                this._selectOption(this._options.children[i], false);

            for(let i = (optionAIndex + 1); i < this._options.children.length; i++)
                this._unSelectOption(this._options.children[i]);
        }
    }

    /**
     *  
     */
    _onClickOption(event) {
        let clickedOption;

        if((event.target.localName == "div") && (event.target.classList.contains("option")))
            clickedOption = event.target;
        else
            clickedOption = event.target.closest("div.option");

        if(clickedOption) {
            if(this.multiple) {
                if(event.ctrlKey) {
                    if(clickedOption.classList.contains("selected"))
                        this._unSelectOption(clickedOption);
                    else
                        this._selectOption(clickedOption, false);
                    
                    this._lastClickedOption = clickedOption;
                }
                else if(event.shiftKey) {
                    if(this._lastClickedOption)
                        this._selectOptionsRange(this._lastClickedOption, clickedOption);
                    else {
                        this._selectOption(clickedOption, true);
                        this._lastClickedOption = clickedOption;
                    }
                }
                else {
                    this._selectOption(clickedOption, true);
                    this._lastClickedOption = clickedOption;
                }
            }
            else {
                this._selectOption(clickedOption, true);
                this._lastClickedOption = clickedOption;
            }

            this._dispatchSelectEvents();
        }
    }

    /**
     * 
     */
    _getFocusedOption() {
        const activeElement = this.shadowRoot.activeElement;

        if(activeElement && activeElement.classList.contains("option"))
            return activeElement;
        else
            return null;
    }

    /**
     * 
     */
    _onKeyDown(event) {
        let selectedOption;
        const focusedOption = this._getFocusedOption();

        switch(event.keyCode) {
            case 13 :   // Enter
                if(!this.multiple) {
                    event.preventDefault();
                    event.stopPropagation();
                    this._select.classList.toggle("open");
                }

                break;
            case 27 :   // Esc
                if(!this.multiple && this._select.classList.contains("open")) {
                    event.preventDefault();
                    event.stopPropagation();
                    this._select.classList.remove("open");
                }

                break;
            case 32 :   // Space
                event.preventDefault();
                event.stopPropagation();

                if(this.multiple) {
                    if(focusedOption) {
                        if(focusedOption.classList.contains("selected"))
                            this._unSelectOption(focusedOption);
                        else
                            this._selectOption(focusedOption, false);

                        this._lastClickedOption = focusedOption;
                        this._dispatchSelectEvents();
                    }
                }
                else if(!this._select.classList.contains("open"))
                    this._select.classList.add("open");

                break;
            case 38 :   // ArrowUp
                event.preventDefault();
                event.stopPropagation();

                if(this.multiple) {
                    if(event.ctrlKey) {
                        if(focusedOption && focusedOption.previousSibling) {
                            this._lastClickedOption = focusedOption.previousSibling;

                            setTimeout(() => {
                                focusedOption.previousSibling.focus();
                            });
                        }
                    }
                    else if(event.shiftKey) {
                        if(this._lastClickedOption && focusedOption && focusedOption.previousSibling) {
                            this._selectOptionsRange(this._lastClickedOption, focusedOption.previousSibling);
                            
                            setTimeout(() => {
                                focusedOption.previousSibling.focus();
                            });

                            this._dispatchSelectEvents();
                        }
                    }
                    else if(focusedOption && focusedOption.previousSibling) {
                        this._selectOption(focusedOption.previousSibling, true);
                        this._lastClickedOption = focusedOption.previousSibling;

                        setTimeout(() => {
                            focusedOption.previousSibling.focus();
                        });

                        this._dispatchSelectEvents();
                    }
                }
                else {
                    selectedOption = this._options.querySelector(".option.selected");

                    if(selectedOption && selectedOption.previousSibling && ((!this.required && !this.multiple) || (selectedOption.previousSibling != this._defaultOption))) {
                        this._selectOption(selectedOption.previousSibling, true);
                        this._lastClickedOption = selectedOption.previousSibling;
                        this._dispatchSelectEvents();
                    }
                }

                break;
            case 40 :   // ArrowDown
                event.preventDefault();
                event.stopPropagation();

                if(this.multiple) {
                    if(event.ctrlKey) {
                        if(focusedOption && focusedOption.nextSibling) {
                            this._lastClickedOption = focusedOption.nextSibling;

                            setTimeout(() => {
                                focusedOption.nextSibling.focus();
                            });
                        }
                    }
                    else if(event.shiftKey) {
                        if(this._lastClickedOption && focusedOption && focusedOption.nextSibling) {
                            this._selectOptionsRange(this._lastClickedOption, focusedOption.nextSibling);
                            
                            setTimeout(() => {
                                focusedOption.nextSibling.focus();
                            });

                            this._dispatchSelectEvents();
                        }
                        else {
                            const firstOption = this._options.querySelector(".option");

                            if(firstOption) {
                                this._selectOption(firstOption, true);
                                this._lastClickedOption = firstOption;
                                this._dispatchSelectEvents();
                            }
                        }
                    }
                    else if(focusedOption && focusedOption.nextSibling) {
                        this._selectOption(focusedOption.nextSibling, true);
                        this._lastClickedOption = focusedOption.nextSibling;

                        setTimeout(() => {
                            focusedOption.nextSibling.focus();
                        });

                        this._dispatchSelectEvents();
                    }
                }
                else {
                    selectedOption = this._options.querySelector(".option.selected");

                    if(selectedOption && selectedOption.nextSibling) {
                        this._selectOption(selectedOption.nextSibling, true);
                        this._lastClickedOption = selectedOption.nextSibling;
                        this._dispatchSelectEvents();
                    }
                }

                break;
            case 65 : // a
                if(event.ctrlKey) {
                    event.preventDefault();
                    event.stopPropagation();

                    const allOptions = this._options.querySelectorAll(".option");

                    if(allOptions.length > 0) {
                        const firstOption = allOptions[0];
                        const lastOption = allOptions[allOptions.length - 1];
                        this._selectOptionsRange(firstOption, lastOption);
                        this._lastClickedOption = firstOption;

                        setTimeout(() => {
                            lastOption.focus();
                        });

                        this._dispatchSelectEvents();
                    }
                }

                break;
        }
    }

    /**
	 * 
	 */
	onComponentReady() {
        this._select = this.shadowRoot.querySelector("#select");
        this._selectedItemDisplay = this.shadowRoot.querySelector("#selected-item-display");
        this._selectedItemDisplay.addEventListener('click', this._onClickSelectedItemDisplay.bind(this));
        this._options = this.shadowRoot.querySelector("#options");

        if(!this.required && !this.multiple)
            this._instanciateDefaultOption();

        this.addEventListener("focus", this._onFocus.bind(this));
        this.addEventListener("blur", this._onBlur.bind(this));
        this.addEventListener("keydown", this._onKeyDown.bind(this));
        this._adjustWidth();
	}

    /**
	 * 
	 */
	static get observedAttributes() {
		let _observedAttributes = super.observedAttributes;
        _observedAttributes.push("model-uri");
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
            this._model = ResourceMultiton.get_resource(Model, newValue);

            this._model.get(this._abortController.signal)
                .then(() => {
                    this._componentReady.then(() => {
                        // remove previous option children
                        const currentObselOptions = this._select.querySelectorAll("[value]");

                        for(let i = (currentObselOptions.length - 1); i >= 0; i--)
                            currentObselOptions[i].remove();
                        
                        // rebuild list
                        for(let i = 0; i < this._model.obsel_types.length; i++) {
                            const obselType = this._model.obsel_types[i];
                            const newObselTypeOption = document.createElement("div");
                            newObselTypeOption.classList.add("option");
                            newObselTypeOption.setAttribute("value", obselType.id);
                            newObselTypeOption.setAttribute("tabindex", 0);

                            if(obselType.suggestedSymbol) {
                                const symbolSpan = document.createElement("span");
                                symbolSpan.className = "obsel-type-symbol";
                                symbolSpan.innerText = obselType.suggestedSymbol;

                                if(obselType.suggestedColor)
                                    symbolSpan.style.color = obselType.suggestedColor;

                                newObselTypeOption.appendChild(symbolSpan);
                            }
                            
                            const labelSpan = document.createElement("span");
                            labelSpan.className = "obsel-type-label";
                            labelSpan.innerText = obselType.get_translated_label(this._lang);

                            if(obselType.suggestedColor)
                                labelSpan.style.color = obselType.suggestedColor;

                            newObselTypeOption.appendChild(labelSpan);
                            newObselTypeOption.addEventListener("click", this._onClickOption.bind(this));
                            this._options.appendChild(newObselTypeOption);
                        }

                        this._adjustWidth();

                        if(!this.multiple && !this.value)
                            this._selectFirstAvailableOption();
                    }).catch(() => {});
                })
                .catch((error) => {
                    this.emitErrorEvent(error);
                })
        }
        else if(name == "required") {
            this._componentReady.then(() => {
                if(!this.required && !this.multiple && !this._defaultOption)
                    this._instanciateDefaultOption();

                if(this._defaultOption && (this.required || this.multiple))
                    this._removeDefaultOption();

                if(this.required && !this.multiple && !this.value)
                    this._selectFirstAvailableOption();
            }).catch(() => {});
        }
        else if(name == "multiple") {
            this._componentReady.then(() => {
                if(!this.required && !this.multiple && !this._defaultOption)
                    this._instanciateDefaultOption();

                if(this._defaultOption && (this.required || this.multiple))
                    this._removeDefaultOption();

                if(this.required && !this.multiple && !this.value)
                    this._selectFirstAvailableOption();
            }).catch(() => {});
        }
        else if(name == "value")
            this.value = newValue;
    }

	/**
     * 
     */
    _updateStringsTranslation() {
        const defaultOptionLabels = this.shadowRoot.querySelectorAll(".default-label");

        for(let i = 0; i < defaultOptionLabels.length; i++)
            defaultOptionLabels[i].innerText = this._translateString("None");

        const obselTypesOptions = this._select.querySelectorAll(".option:not([id = \"default\"])");

		for(let i = 0; i < obselTypesOptions.length; i++) {
            const anOption = obselTypesOptions[i];
            const obselTypeId = anOption.getAttribute("value");
            const obselType = this._model.get_obsel_type(obselTypeId);

            if(obselType) {
                const obselLabel = anOption.querySelector("span.obsel-type-label");

                if(obselLabel)
                    obselLabel.innerText = obselType.get_translated_label(this._lang);
            }
        }

        this._adjustWidth();
    }

    /**
     * 
     */
    _instanciateDefaultOption() {
        if(!this._defaultOption) {
            this._defaultOption = document.createElement("div");
            this._defaultOption.id = "default";
            this._defaultOption.className = "option";
            this._defaultOption.setAttribute("tabindex", 0);
            const defaultOptionLabel = document.createElement("span");
            defaultOptionLabel.className = "default-label";
            defaultOptionLabel.innerText = this._translateString("None");
            this._defaultOption.appendChild(defaultOptionLabel);
            this._defaultOption.addEventListener("click", this._onClickOption.bind(this));
            this._options.prepend(this._defaultOption);
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
    _adjustWidth() {
        this._selectedItemDisplay.style.width = (this._options.clientWidth - 23) + "px";
    }

    /**
     * 
     */
    _selectFirstAvailableOption() {
        this._selectOption(this._options.querySelector(".option"), true);
    }

    /**
     * 
     */
    _selectMatchingOption(value, unselect_previously_selected = true) {
        this._componentReady.then(() => {
            let matchingOption;

            if(value)
                matchingOption = this._options.querySelector(".option[value = \"" + CSS.escape(value) + "\"]");
            else
                matchingOption = this._defaultOption;

            if(matchingOption)
                this._selectOption(matchingOption, unselect_previously_selected);
        }).catch(() => {});
    }

    /**
     * 
     * \param HTMLElement option 
     */
    _selectOption(newly_selected_option, unselect_previously_selected) {
        if((unselect_previously_selected == true) || !this.multiple) {
            const previouslySelectedOptions = this._options.querySelectorAll(".option.selected");

            for(let i = 0; i < previouslySelectedOptions.length; i++)
                if(previouslySelectedOptions[i] != newly_selected_option)
                    previouslySelectedOptions[i].classList.remove("selected");    
        }

        if(!this.multiple) {
            this._selectedItemDisplay.innerHTML = newly_selected_option.innerHTML;
            
            if(this._select.classList.contains("open"))
                this._select.classList.remove("open");
        }

        if(!newly_selected_option.classList.contains("selected"))
            newly_selected_option.classList.add("selected");
    }

    /**
     * 
     * \param HTMLElement option 
     */
    _unSelectOption(formerly_selected_option) {
        if(formerly_selected_option.classList.contains("selected"))
            formerly_selected_option.classList.remove("selected");
    }

    /**
     * 
     */
    _dispatchSelectEvents(event) {
        const inputEvent = new Event("input", {
            bubbles: true,
            cancelable: false,
            composed: true
        });

        this.dispatchEvent(inputEvent);

        const changeEvent = new Event("change", {
            bubbles: true,
            cancelable: false,
            composed: false
        });

        this.dispatchEvent(changeEvent);
    }
}

customElements.define('ktbs4la2-obsel-type-select', KTBS4LA2ObselTypeSelect);
