import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

import {Method} from '../../ktbs-api/Method.js';

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
                        "Accept": "application/json"/*,
                        "X-Requested-With": "XMLHttpRequest"*/
                    }),
                    cache: "default",
                    signal: this._abortTestQueryController.signal
                };

                fetch(inputURL, fetchParameters)
                    .then((response) => {
                        // if the HTTP request responded successfully
                        if(response.ok) {
                            // when the response content from the HTTP request has been successfully read
                            response.json()
                                .then((parsedJson) => {
                                    if(parsedJson["@type"]) {
                                        if(this._allowed_resource_types && !this._allowed_resource_types.includes(parsedJson["@type"]))
                                            this._showMessage(this._translateString("Resource doesn't match expected type(s)") + " (" + parsedJson["@type"] + ")", "error");
                                        else
                                            this._showMessage(this._translateString("Valid resource URL") + " (" + parsedJson["@type"] + ")", "success");
                                    }
                                    else {
                                        if(parsedJson["@graph"] && parsedJson["@graph"][0] && (parsedJson["@graph"][0]["@type"] == "TraceModel"))
                                            this._showMessage(this._translateString("Valid resource URL") + " (" + parsedJson["@graph"][0]["@type"] + ")", "success");
                                        else
                                            this._showMessage(this._translateString("Not a Ktbs resource"), "error");
                                    }
                                })
                                .catch((error) => {
                                    this._showMessage(this._translateString("Not a Ktbs resource"), "error");
                                })
                                .finally(() => {
                                    this.dispatchEvent(dispatchAfterResultEvent);
                                });
                        }
                        else {
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
                        this._showMessage(this._translateString("HTTP query failed"), "error");
                        this.dispatchEvent(dispatchAfterResultEvent);
                    });

                this._showMessage(this._translateString("Pending..."), "pending");
            }
            catch(error) {
                if(Method.builtin_methods_ids.includes(this._uriInput.value)) {
                    if(!this._allowed_resource_types || this._allowed_resource_types.includes("Method"))
                        this._showMessage(this._translateString("Known builtin method"), "success");
                    else
                        this._showMessage(this._translateString("Resource doesn't match expected type(s)") + " (Builtin Method)", "error");
                }
                else 
                    this._showMessage(this._translateString("Not a valid URL"), "error");

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
        let valid = (
                            (this._container)
                        &&  (
                                    (this._container.className == "success")
                                ||  (this._container.className == "warning")
                                ||  (
                                            (this._uriInput)
                                        &&  (this._uriInput.value == "") 
                                        &&  (
                                                    !this.hasAttribute("required")
                                                ||  (
                                                            (this.getAttribute("required") != "") 
                                                        &&  (this.getAttribute("required") != "required")
                                                )
                                        )
                                )
                        )
                );

        if(!valid)
            this.dispatchEvent(new Event("invalid"));
    
        return valid;
    }
}

customElements.define('ktbs4la2-resource-uri-input', KTBS4LA2ResourceUriInput);