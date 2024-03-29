import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

import {Method} from '../../ktbs-api/Method.js';
import { ResourceMultiton } from '../../ktbs-api/ResourceMultiton.js';

/**
 * 
 */
class KTBS4LA2ResourceUriInput extends TemplatedHTMLElement {

    /**
	 * 
	 */
	constructor() {
        super(import.meta.url, true, true);

        if(this.attachInternals)
            this._internals = this.attachInternals();

        this._pickedResource = null;

        this._customValidity = "";
    }

    /**
     * 
     */
    get picked_resource() {
        return this._pickedResource;
    }

    /**
     * 
     */
    set picked_resource(new_picked_resource) {
        if(new_picked_resource instanceof Resource)
            this.setAttribute("value", new_picked_resource.uri);
        else
            throw new TypeError("New value for property \"picked_resource\" must be an instance of Resource");
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
    get allow_builtin_methods() {
        return (
            (
                    !this.hasAttribute("allowed-resource-types")
                ||  this.getAttribute("allowed-resource-types").split(" ").filter(Boolean).includes("Method")
            )
            &&  (
                    !this.hasAttribute("allow-builtin-methods")
                ||  (
                        (this.getAttribute("allow-builtin-methods") != "0")
                    &&  (this.getAttribute("allow-builtin-methods") != "false")
                )
            )
        );
    }

    /**
     * 
     */
    set allow_builtin_methods(newValue) {
        if(newValue != null)
            this.setAttribute("allow-builtin-methods", newValue);
        else if(this.hasAttribute("allow-builtin-methods"))
            this.removeAttribute("allow-builtin-methods");
    }

    /**
	 * 
	 */
	onComponentReady() {
        this._container = this.shadowRoot.querySelector("#container");
        this._inputContainer = this.shadowRoot.querySelector("#input-container");
        this._uriInput = this.shadowRoot.querySelector("#uri-input");
        this._uriInput.addEventListener("input", this._onURIInputEvent.bind(this));
        this._uriInput.addEventListener("change", this._onURIInputEvent.bind(this));
        this._uriInput.addEventListener("focus", this._onUriInputFocus.bind(this));
        this._uriInput.addEventListener("blur", this._onUriInputBlur.bind(this));
        this._messageArea = this.shadowRoot.querySelector("#message-area");

        if(!this.getAttribute("tabIndex"))
            this.tabIndex = -1;
            
        this.addEventListener("focus", this._onFocus.bind(this));
    }

    /**
	 * 
	 */
	static get observedAttributes() {
		let _observedAttributes = super.observedAttributes;
        _observedAttributes.push("allowed-resource-types");
        _observedAttributes.push("value");
        _observedAttributes.push("placeholder");
        _observedAttributes.push("required");
        _observedAttributes.push("size");
		return _observedAttributes;
    }
    
    /**
     * 
     * @param {*} name 
     * @param {*} oldValue 
     * @param {*} newValue 
     */
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);

        if(name == "allowed-resource-types") {
            if(newValue)
                this._allowed_resource_types = newValue.split(" ").filter(Boolean);
            else
                delete this._allowed_resource_types;
        }
        else if(name == "value") {
            this._componentReady.then(() => {
                this._uriInput.value = newValue;

                const newEvent = new InputEvent("change", {
                    bubbles: true,
                    cancelable: false,
                    composed: true
                });

                this._updateValidation(newEvent);
            });
        }
        else if(name == "placeholder") {
            this._componentReady.then(() => {
                this._uriInput.setAttribute("placeholder", newValue);
            });
        }
        else if(name == "required") {
            this._componentReady.then(() => {
                this._uriInput.setAttribute("required", newValue);
            });
        }
        else if(name == "size") {
            this._componentReady.then(() => {
                this._uriInput.setAttribute("size", newValue);
            });
        }
    }

    /**
     * 
     */
    _updateValidation(dispatchAfterResultEvent) {
        if(this._abortTestQueryController)
            this._abortTestQueryController.abort();

        if(this._uriInput.value) {
            try {
                const inputURL = new URL(this._uriInput.value);
                this._abortTestQueryController = new AbortController();

                let fetchParameters = {
                    method: "GET",
                    headers: new Headers({
                        "Accept": "application/json",
                        "X-Requested-With": "XMLHttpRequest"
                    }),
                    cache: "no-cache",
                    signal: this._abortTestQueryController.signal
                };

                fetch(inputURL, fetchParameters)
                    .then((response) => {
                        // if the HTTP request responded successfully
                        if(response.ok) {
                            // when the response content from the HTTP request has been successfully read
                            response.json()
                                .then((parsedJson) => {
                                    let resourceType;
                                    try {
                                        resourceType = parsedJson["@type"] || parsedJson["@graph"][0]["@type"];
                                        this._pickedResource = ResourceMultiton.get_resource(resourceType, inputURL);
                                    }
                                    catch {
                                        this._showMessage(this._translateString("Not a Ktbs resource"), "error");
                                    }
                                    if (this.pickedResource !== null) {
                                        if(this._allowed_resource_types && !this._allowed_resource_types.includes(resourceType))
                                            this._showMessage(this._translateString("Resource doesn't match expected type(s)") + " (" +resourceType + ")", "error");
                                        else {
                                            this._showMessage(this._translateString("Valid resource URL") + " (" + resourceType + ")", "success");
                                        }
                                    } else {
                                        this._showMessage(this._translateString("Not a Ktbs resource"), "error");
                                    }
                                })
                                .catch((error) => {
                                    this._pickedResource = null;
                                    this._showMessage(this._translateString("Not a Ktbs resource"), "error");
                                })
                                .finally(() => {
                                    this.dispatchEvent(dispatchAfterResultEvent);
                                });
                        }
                        else {
                            this._pickedResource = null;

                            if(response.status == 401)
                                this._showMessage(this._translateString("Authentication required"), "warning");
                            else if(response.status == 403)
                                this._showMessage(this._translateString("Access denied"), "warning");
                            else
                                this._showMessage(this._translateString("Error : ") + response.status + " (" + response.statusText + ")", "error");

                            this.dispatchEvent(dispatchAfterResultEvent);
                        }
                    })
                    .catch((error) => {
                        this._pickedResource = null;
                        this._showMessage(this._translateString("HTTP query failed"), "error");
                        this.dispatchEvent(dispatchAfterResultEvent);
                    });

                this._showMessage(this._translateString("Pending..."), "pending");
            }
            catch(error) {
                // the picked resource is a builtin method
                if(Method.builtin_methods_ids.includes(this._uriInput.value)) {
                    this._pickedResource = Method.getBuiltinMethod(this._uriInput.value);

                    if(!this._allowed_resource_types || this._allowed_resource_types.includes("Method")) {
                        if(this.allow_builtin_methods)
                            this._showMessage(this._translateString("Known builtin method"), "success");
                        else
                            this._showMessage(this._translateString("Builtin Methods not allowed"), "error");
                    }
                    else
                        this._showMessage(this._translateString("Resource doesn't match expected type(s)") + " (Builtin Method)", "error");
                }
                else  {
                    this._pickedResource = null;
                    this._showMessage(this._translateString("Not a valid URL"), "error");
                }

                this.dispatchEvent(dispatchAfterResultEvent);
            }
        }
        else {
            this._clearMessage();
            this.dispatchEvent(dispatchAfterResultEvent);
        }
    }

    /**
     * 
     */
    _onURIInputEvent(event) {
        event.stopPropagation();

        const newEvent = new InputEvent(event.type, {
            bubbles: event.bubbles,
            cancelable: false,
            composed: event.composed
        });

        this._updateValidation(newEvent);
    }

    /**
     * 
     */
    _showMessage(message, status) {
        this._messageArea.innerText = message;
        this._container.className = status;
    }

    /**
     * 
     */
    _clearMessage() {
        this._messageArea.innerText = "";
        this._container.className = "";
    }

    /**
     * 
     */
    _onFocus(event) {
        this._componentReady.then(() => {
            this._uriInput.focus();
        }).catch(() => {});
    }

    /**
     * 
     */
    _onUriInputFocus(event) {
        event.stopPropagation();

        if(!this._inputContainer.classList.contains("focused"))
            this._inputContainer.classList.add("focused");
    }

    /**
     * 
     */
    _onUriInputBlur(event) {
        event.stopPropagation();

        if(this._inputContainer.classList.contains("focused"))
            this._inputContainer.classList.remove("focused");
    }

    /**
	 * 
	 */
	disconnectedCallback() {
        super.disconnectedCallback();

        if(this._abortTestQueryController)
		    this._abortTestQueryController.abort();
    }
    
    /**
     * 
     */
    get value() {
        if(this._uriInput)
            return this._uriInput.value;
        else if(this.getAttribute("value"))
            return this.getAttribute("value");
        else
            return "";
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
    checkValidity() {
        let isValid;

        if(this._container && this._uriInput) {
            this._uriInput.setCustomValidity(this._customValidity);

            if(this._uriInput.checkValidity()) {
                if(this._container.className == "error") {
                    isValid = false;
                    this._uriInput.setCustomValidity(this._messageArea.innerText);
                }
                else
                    isValid = true;
            }
            else {
                this._container.className = "error";
                isValid = false;
            }

            if(!isValid)
                this._uriInput.dispatchEvent(new Event("invalid"));
        }
        else
            isValid = false;
    
        return isValid;
    }

    /**
     * 
     */
    reportValidity() {
        const isValid = this.checkValidity();
        this._uriInput.reportValidity();
        return isValid;
	}

    /**
     * 
     */
    setCustomValidity(message) {
        this._customValidity = message;
    }
}

customElements.define('ktbs4la2-resource-uri-input', KTBS4LA2ResourceUriInput);