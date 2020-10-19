import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';
import {ResourceMultiton} from '../../ktbs-api/ResourceMultiton.js';
import {Method} from '../../ktbs-api/Method.js';
import {Base} from '../../ktbs-api/Base.js';

import "../ktbs4la2-resource-picker/ktbs4la2-resource-picker.js";
import "../ktbs4la2-obsel-type-select/ktbs4la2-obsel-type-select.js";
import "../ktbs4la2-multiple-hrules-rules-input/ktbs4la2-multiple-hrules-rules-input.js";
import "../ktbs4la2-multiple-resources-picker/ktbs4la2-multiple-resources-picker.js";

/**
 * 
 */
class KTBS4LA2MethodParametersInput extends TemplatedHTMLElement {

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
    get method_uri() {
        return this.getAttribute("method-uri");
    }

    /**
     * 
     */
    set method_uri(newValue) {
        if(newValue != null) {
            if(this.getAttribute("method-uri") != newValue)
                this.setAttribute("method-uri", newValue);
        }
        else if(this.hasAttribute("method-uri"))
            this.removeAttribute("method-uri");
    }

    /**
     * 
     */
    get default_model_uri() {
        return this.getAttribute("default-model-uri");
    }

    /**
     * 
     */
    set default_model_uri(newValue) {
        if(newValue != null) {
            if(this.getAttribute("default-model-uri") != newValue)
                this.setAttribute("default-model-uri", newValue);
        }
        else if(this.hasAttribute("default-model-uri"))
            this.removeAttribute("default-model-uri");
    }

    /**
     * 
     */
    get parent_base_uri() {
        return this.getAttribute("parent-base-uri");
    }

    /**
     * 
     */
    set parent_base_uri(newValue) {
        if(newValue != null) {
            if(this.getAttribute("parent-base-uri") != newValue)
                this.setAttribute("parent-base-uri", newValue);
        }
        else if(this.hasAttribute("parent-base-uri"))
            this.removeAttribute("parent-base-uri");
    }

    /**
     * 
     */
    get value() {
        let returnArray = [];

        if((this._container.className == "pipe") || (this._container.className == "parallel")) {
            if(this._methodsPicker.checkValidity() && this._methodsPicker.value)
                returnArray.push("methods=" + this._methodsPicker.value);
        }

        if(["filter", "fusion", "fsa", "hrules", "sparql", "isparql", "parallel", "external"].includes(this._container.className)) {
            if(this._modelPicker.checkValidity() && this._modelPicker.value)
                returnArray.push("model=" + this._modelPicker.value);

            if(this._originInput.checkValidity() && this._originInput.value)
                returnArray.push("origin=" + this._originInput.value);
        }

        if(this._container.className == "filter") {
            if(this._afterInput.checkValidity() && (this._afterInput.value != ""))
                returnArray.push("after=" + this._afterInput.value);

            if(this._beforeInput.checkValidity() && (this._beforeInput.value != ""))
                returnArray.push("before=" + this._beforeInput.value);

            if(this._afterDTInput.checkValidity() && this._afterDTInput.value)
                returnArray.push("afterDT=" + this._afterDTInput.value);

            if(this._beforeDTInput.checkValidity() && this._beforeDTInput.value)
                returnArray.push("beforeDT=" + this._beforeDTInput.value);

            if(this._otypesSelect.checkValidity() && this._otypesSelect.value)
                returnArray.push("otypes=" + this._otypesSelect.value);

            if(this._bgpTextarea.checkValidity() && (this._bgpTextarea.value != ""))
                returnArray.push("bgp=" + this._bgpTextarea.value);
        }
            
        if(this._container.className == "fsa") {
            if(this._fsaTextarea.checkValidity() && this._fsaTextarea.value)
                returnArray.push("fsa=" + this._fsaTextarea.value);
        }
            
        if(this._container.className == "hrules") {
            if(this._rulesInput.checkValidity() && (this._rulesInput.value != "[]"))
                returnArray.push("rules=" + this._rulesInput.value);
        }
            
        if(this._container.className == "sparql") {
            if(this._sparqlSparqlTextarea.checkValidity() && (this._sparqlSparqlTextarea.value != ""))
                returnArray.push("sparql=" + this._sparqlSparqlTextarea.value);

            returnArray.push("scope=" + this._scopeSelect.value);
            returnArray.push("inherit=" + this._inheritCheckbox.value);
        }
            
        if(this._container.className == "isparql") {
            if(this._isparqlSparqlTextarea.checkValidity() && (this._isparqlSparqlTextarea.value != ""))
                returnArray.push("sparql=" + this._isparqlSparqlTextarea.value);
        }

        if(this._container.className == "external") {
            if(this._commandLineInput.checkValidity() && this._commandLineInput.value)
                returnArray.push("command-line=" + this._commandLineInput.value);
            
            if(this._formatInput.checkValidity() && this._formatInput.value)
                returnArray.push("format=" + this._formatInput.value);

            if(this._minSourcesInput.checkValidity() && (this._minSourcesInput.value != ""))
                returnArray.push("min-sources=" + this._minSourcesInput.value);

            if(this._maxSourcesInput.checkValidity() && (this._maxSourcesInput.value != ""))
                returnArray.push("max-sources=" + this._maxSourcesInput.value);

            returnArray.push("feed-to-stdin=" + this._feedToStdinCheckbox.value);
        }

        return JSON.stringify(returnArray);
    }

    /**
     * 
     */
    set value(new_value) {
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
    checkValidity() {
        // @TODO
    }

    /**
	 * 
	 */
	static get observedAttributes() {
		let _observedAttributes = super.observedAttributes;
        _observedAttributes.push("method-uri");
        _observedAttributes.push("default-model-uri");
        _observedAttributes.push("parent-base-uri");
        _observedAttributes.push("value");
		return _observedAttributes;
	}


    /**
	 * 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		super.attributeChangedCallback(name, oldValue, newValue);
        
        if(name == "method-uri") {
            if(newValue) {
                if(Method.builtin_methods_ids.includes(newValue))
                    this._method = Method.getBuiltinMethod(newValue);
                else
                    this._method = ResourceMultiton.get_resource(Method, newValue);

                if(this._method.is_builtin) {
                    this._method_builtin_ancestor = this._method;

                    this._componentReady.then(() => {
                        if(this._container.className != this._method.id) {
                            const containerClassBefore = this._container.className;
                            this._container.className = this._method.id;

                            if(containerClassBefore)
                                this.dispatchEvent(new Event("change", {
                                    buubles: true,
                                    cancelable: false,
                                    composed: false
                                }));
                        }
                    });
                }
                else {
                    this._method.get_methods_hierarchy(this._abortController.signal)
                        .then((builtin_ancestor) => {
                            this._method_builtin_ancestor = builtin_ancestor;

                            this._componentReady.then(() => {
                                if(this._container.className != builtin_ancestor.id) {
                                    this._container.className = builtin_ancestor.id;

                                    this.dispatchEvent(new Event("change", {
                                        buubles: true,
                                        cancelable: false,
                                        composed: false
                                    }));
                                }
                            });
                        })
                        .catch((error) => {
                            if(this._method)
                                delete this._method;

                            if(this._method_builtin_ancestor)
                                delete this._method_builtin_ancestor;

                            this._componentReady.then(() => {
                                if(this._container.className != "error") {
                                    this._container.className = "error";

                                    this.dispatchEvent(new Event("change", {
                                        buubles: true,
                                        cancelable: false,
                                        composed: false
                                    }));
                                }

                                this.emitErrorEvent(error);
                            });
                        });
                }
            }
            else {
                if(this._method)
                    delete this._method;

                if(this._method_builtin_ancestor)
                    delete this._method_builtin_ancestor;

                this._componentReady.then(() => {
                    if(this._container.className) {
                        this._container.className = null;

                        this.dispatchEvent(new Event("change", {
                            buubles: true,
                            cancelable: false,
                            composed: false
                        }));
                    }

                    this.emitErrorEvent("Missing value for required attribute \"method-uri\"");
                });
            }
        }
        else if(name == "default-model-uri") {
            this._componentReady.then(() => {
                this._updateSelectedModel();
            });
        }
        else if(name == "parent-base-uri") {
            if(newValue) {
                this._componentReady.then(() => {
                    this._modelPicker.setAttribute("browse-start-uri", newValue);
                    this._methodsPicker.setAttribute("browse-start-uri", newValue);
                });
                
                const parentBase = ResourceMultiton.get_resource(Base, newValue);

                parentBase.get_root(this._abortController.signal)
                    .then((root) => {
                        this._componentReady.then(() => {
                            this._modelPicker.setAttribute("root-uri", root.uri);
                            this._methodsPicker.setAttribute("root-uri", root.uri);
                        });
                    })
                    .catch((error) => {
                        this.emitErrorEvent(error);

                        this._componentReady.then(() => {
                            if(this._modelPicker.hasAttribute("root-uri"))
                                this._modelPicker.removeAttribute("root-uri");

                            if(this._methodsPicker.hasAttribute("root-uri"))
                                this._methodsPicker.removeAttribute("root-uri");
                        });
                    });
            }
            else {
                this._componentReady.then(() => {
                    if(this._modelPicker.hasAttribute("browse-start-uri"))
                        this._modelPicker.removeAttribute("browse-start-uri");

                    if(this._modelPicker.hasAttribute("root-uri"))
                            this._modelPicker.removeAttribute("root-uri");

                    if(this._methodsPicker.hasAttribute("browse-start-uri"))
                        this._methodsPicker.removeAttribute("browse-start-uri");

                    if(this._methodsPicker.hasAttribute("root-uri"))
                        this._methodsPicker.removeAttribute("root-uri");
                });
            } 
        }
        else if(name == "value") {
            let keyValueObject = {};

            if(newValue) {
                try {
                    let rawParametersStrings = JSON.parse(newValue);

                    if(rawParametersStrings instanceof Array) {
                        for(let i = 0; i < rawParametersStrings.length; i++) {
                            const equalPos = rawParametersStrings[i].indexOf("=");

                            if(equalPos > 0) {
                                let key = rawParametersStrings[i].substring(0, equalPos);
                                let value = rawParametersStrings[i].substring(equalPos + 1);
                                keyValueObject[key] = value;
                            }
                            else {
                                this.emitErrorEvent(new Error("Invalid parameter string : " + rawParametersStrings[i]));
                            }
                        }
                    }
                    else
                        this.emitErrorEvent(new TypeError("attribute \"value\" expects a JSON-encoded Array"));

                    this._componentReady.then(() => {
                        if(keyValueObject["methods"])
                            this._methodsPicker.setAttribute("value", keyValueObject["methods"]);
                        else if(this._methodsPicker.hasAttribute("value"))
                            this._methodsPicker.removeAttribute("value");

                        if(keyValueObject["model"])
                            this._modelPicker.setAttribute("value", keyValueObject["model"]);
                        else if(this._modelPicker.hasAttribute("value"))
                            this._modelPicker.removeAttribute("value");

                        if(keyValueObject["origin"])
                            this._originInput.setAttribute("value", keyValueObject["origin"]);
                        else if(this._originInput.hasAttribute("value"))
                            this._originInput.removeAttribute("value");

                        if(keyValueObject["after"])
                            this._afterInput.setAttribute("value", keyValueObject["after"]);
                        else if(this._afterInput.hasAttribute("value"))
                            this._afterInput.removeAttribute("value");

                        if(keyValueObject["before"])
                            this._beforeInput.setAttribute("value", keyValueObject["before"]);
                        else if(this._beforeInput.hasAttribute("value"))
                            this._beforeInput.removeAttribute("value");

                        if(keyValueObject["afterDT"])
                            this._afterDTInput.setAttribute("value", keyValueObject["afterDT"]);
                        else if(this._afterDTInput.hasAttribute("value"))
                            this._afterDTInput.removeAttribute("value");

                        if(keyValueObject["beforeDT"])
                            this._beforeDTInput.setAttribute("value", keyValueObject["beforeDT"]);
                        else if(this._beforeDTInput.hasAttribute("value"))
                            this._beforeDTInput.removeAttribute("value");

                        if(keyValueObject["otypes"])
                            this._otypesSelect.setAttribute("value", keyValueObject["otypes"]);
                        else if(this._otypesSelect.hasAttribute("value"))
                            this._otypesSelect.removeAttribute("value");

                        if(keyValueObject["bgp"])
                            this._bgpTextarea.value = keyValueObject["bgp"];
                        else if(this._bgpTextarea.value != "")
                            this._bgpTextareavalue = "";

                        if(keyValueObject["fsa"])
                            this._fsaTextarea.value = keyValueObject["fsa"];
                        else if(this._fsaTextarea.value != "")
                            this._fsaTextarea.value = "";
                        
                        if(keyValueObject["rules"])
                            this._rulesInput.setAttribute("value", keyValueObject["rules"]);
                        else if(this._rulesInput.hasAttribute("value"))
                            this._rulesInput.removeAttribute("value");

                        if(keyValueObject["sparql"]) {
                            this._sparqlSparqlTextarea.value = keyValueObject["sparql"];
                            this._isparqlSparqlTextarea.value = keyValueObject["sparql"];
                        }
                        else {
                            if(this._sparqlSparqlTextarea.value != "")
                                this._sparqlSparqlTextarea.value = "";

                            if(this._isparqlSparqlTextarea.value != "")
                                this._isparqlSparqlTextarea.value = "";
                        }

                        if(keyValueObject["scope"])
                            this._scopeSelect.setAttribute("value", keyValueObject["scope"]);
                        else if(this._scopeSelect.hasAttribute("value"))
                            this._scopeSelect.removeAttribute("value");

                        if(keyValueObject["inherit"])
                            this._inheritCheckbox.setAttribute("value", keyValueObject["inherit"]);
                        else if(this._inheritCheckbox.hasAttribute("value"))
                            this._inheritCheckbox.removeAttribute("value");

                        if(keyValueObject["command-line"])
                            this._commandLineInput.setAttribute("value", keyValueObject["command-line"]);
                        else if(this._commandLineInput.hasAttribute("value"))
                            this._commandLineInput.removeAttribute("value");

                        if(keyValueObject["format"])
                            this._formatInput.setAttribute("value", keyValueObject["format"]);
                        else if(this._formatInput.hasAttribute("value"))
                            this._formatInput.removeAttribute("value");

                        if(keyValueObject["min-sources"])
                            this._minSourcesInput.setAttribute("value", keyValueObject["min-sources"]);
                        else if(this._minSourcesInput.hasAttribute("value"))
                            this._minSourcesInput.removeAttribute("value");

                        if(keyValueObject["max-sources"])
                            this._maxSourcesInput.setAttribute("value", keyValueObject["max-sources"]);
                        else if(this._maxSourcesInput.hasAttribute("value"))
                            this._maxSourcesInput.removeAttribute("value");

                        if(keyValueObject["feed-to-stdin"])
                            this._feedToStdinCheckbox.setAttribute("value", keyValueObject["feed-to-stdin"]);
                        else if(this._feedToStdinCheckbox.hasAttribute("value"))
                            this._feedToStdinCheckbox.removeAttribute("value");
                    });
                }
                catch(error) {
                    this.emitErrorEvent(error);
                }
            }
        }
    }

    /**
	 * 
	 */
	onComponentReady() {
        this._container = this.shadowRoot.querySelector("#container");
        this._methodUriNotSetMessageDiv = this.shadowRoot.querySelector("#method-uri-not-set-message");
        this._modelLabel = this.shadowRoot.querySelector("#model-label");
        this._modelPicker = this.shadowRoot.querySelector("#model");
        this._modelPicker.setAttribute("lang", this._lang);
        this._modelPicker.addEventListener("input", this._onModelInputEvent.bind(this));
        this._modelPicker.addEventListener("change", this._onModelInputEvent.bind(this));
        this._originLabel = this.shadowRoot.querySelector("#origin-label");
        this._originInput = this.shadowRoot.querySelector("#origin");
        this._originInput.addEventListener("input", this._onFormElementEvent.bind(this));
        this._originInput.addEventListener("change", this._onFormElementEvent.bind(this));
        this._afterLabel = this.shadowRoot.querySelector("#after-label");
        this._afterInput = this.shadowRoot.querySelector("#after");
        this._afterInput.addEventListener("input", this._onFormElementEvent.bind(this));
        this._afterInput.addEventListener("change", this._onFormElementEvent.bind(this));
        this._beforeLabel = this.shadowRoot.querySelector("#before-label");
        this._beforeInput = this.shadowRoot.querySelector("#before");
        this._beforeInput.addEventListener("input", this._onFormElementEvent.bind(this));
        this._beforeInput.addEventListener("change", this._onFormElementEvent.bind(this));
        this._afterDTLabel = this.shadowRoot.querySelector("#afterDT-label");
        this._afterDTInput = this.shadowRoot.querySelector("#afterDT");
        this._afterInput.addEventListener("input", this._onFormElementEvent.bind(this));
        this._afterInput.addEventListener("change", this._onFormElementEvent.bind(this));
        this._beforeDTLabel = this.shadowRoot.querySelector("#beforeDT-label");
        this._beforeDTInput = this.shadowRoot.querySelector("#beforeDT");
        this._beforeDTInput.addEventListener("input", this._onFormElementEvent.bind(this));
        this._beforeDTInput.addEventListener("change", this._onFormElementEvent.bind(this));
        this._otypesP = this.shadowRoot.querySelector("#otypes-p");
        this._otypesLabel = this.shadowRoot.querySelector("#otypes-label");
        this._otypesSelect = this.shadowRoot.querySelector("#otypes");
        this._otypesSelect.setAttribute("lang", this._lang);
        this._otypesSelect.addEventListener("change", this._onFormElementEvent.bind(this));
        this._bgpLabel = this.shadowRoot.querySelector("#bgp-label");
        this._bgpTextarea = this.shadowRoot.querySelector("#bgp");
        this._bgpTextarea.addEventListener("input", this._onFormElementEvent.bind(this));
        this._bgpTextarea.addEventListener("change", this._onFormElementEvent.bind(this));
        this._fsaLabel = this.shadowRoot.querySelector("#fsa-label");
        this._fsaTextarea = this.shadowRoot.querySelector("#fsa");
        this._fsaTextarea.addEventListener("input", this._onFormElementEvent.bind(this));
        this._fsaTextarea.addEventListener("change", this._onFormElementEvent.bind(this));
        this._rulesP = this.shadowRoot.querySelector("#rules-p");
        this._rulesLabel = this.shadowRoot.querySelector("#rules-label");
        this._rulesInput = this.shadowRoot.querySelector("#rules");
        this._rulesInput.setAttribute("lang", this._lang);
        this._rulesInput.addEventListener("input", this._onFormElementEvent.bind(this));
        this._rulesInput.addEventListener("change", this._onFormElementEvent.bind(this));
        this._sparqlSparqlLabel = this.shadowRoot.querySelector("#sparql-sparql-label");
        this._sparqlSparqlTextarea = this.shadowRoot.querySelector("#sparql-sparql");
        this._sparqlSparqlTextarea.addEventListener("input", this._onFormElementEvent.bind(this));
        this._sparqlSparqlTextarea.addEventListener("change", this._onFormElementEvent.bind(this));
        this._scopeLabel = this.shadowRoot.querySelector("#scope-label");
        this._scopeSelect = this.shadowRoot.querySelector("#scope");
        this._scopeSelect.addEventListener("change", this._onFormElementEvent.bind(this));
        this._scopeTraceOption = this.shadowRoot.querySelector("#scope-trace");
        this._scopeBaseOption = this.shadowRoot.querySelector("#scope-base");
        this._scopeStoreOption = this.shadowRoot.querySelector("#scope-store");
        this._inheritLabel = this.shadowRoot.querySelector("#inherit-label");
        this._inheritCheckbox = this.shadowRoot.querySelector("#inherit");
        this._inheritCheckbox.addEventListener("change", this._onFormElementEvent.bind(this));
        this._isparqlSparqlLabel = this.shadowRoot.querySelector("#isparql-sparql-label");
        this._isparqlSparqlTextarea = this.shadowRoot.querySelector("#isparql-sparql");
        this._isparqlSparqlTextarea.addEventListener("input", this._onFormElementEvent.bind(this));
        this._isparqlSparqlTextarea.addEventListener("change", this._onFormElementEvent.bind(this));
        this._methodsLabel = this.shadowRoot.querySelector("#methods-label");
        this._methodsPicker = this.shadowRoot.querySelector("#methods");
        this._methodsPicker.setAttribute("lang", this._lang);
        this._methodsPicker.addEventListener("input", this._onFormElementEvent.bind(this));
        this._methodsPicker.addEventListener("change", this._onFormElementEvent.bind(this));
        this._commandLineLabel = this.shadowRoot.querySelector("#command-line-label");
        this._commandLineInput = this.shadowRoot.querySelector("#command-line");
        this._commandLineInput.addEventListener("input", this._onFormElementEvent.bind(this));
        this._commandLineInput.addEventListener("change", this._onFormElementEvent.bind(this));
        this._formatLabel = this.shadowRoot.querySelector("#format-label");
        this._formatInput = this.shadowRoot.querySelector("#format");
        this._formatInput.addEventListener("input", this._onFormElementEvent.bind(this));
        this._formatInput.addEventListener("change", this._onFormElementEvent.bind(this));
        this._minSourcesLabel = this.shadowRoot.querySelector("#min-sources-label");
        this._minSourcesInput = this.shadowRoot.querySelector("#min-sources");
        this._minSourcesInput.addEventListener("input", this._onFormElementEvent.bind(this));
        this._minSourcesInput.addEventListener("change", this._onFormElementEvent.bind(this));
        this._maxSourcesLabel = this.shadowRoot.querySelector("#max-sources-label");
        this._maxSourcesInput = this.shadowRoot.querySelector("#max-sources");
        this._maxSourcesInput.addEventListener("input", this._onFormElementEvent.bind(this));
        this._maxSourcesInput.addEventListener("change", this._onFormElementEvent.bind(this));
        this._feedToStdinLabel = this.shadowRoot.querySelector("#feed-to-stdin-label");
        this._feedToStdinCheckbox = this.shadowRoot.querySelector("#feed-to-stdin");
        this._feedToStdinCheckbox.addEventListener("change", this._onFormElementEvent.bind(this));
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._methodUriNotSetMessageDiv.innerText = this._translateString("Waiting for method choice...");
        this._modelLabel.innerText = this._translateString("Model") + " :";
        this._modelPicker.setAttribute("lang", this._lang);
        this._originLabel.innerText = this._translateString("Origin") + " :";
        this._originInput.setAttribute("placeholder", this._translateString("Origin"));
        this._afterLabel.innerText = this._translateString("After timestamp") + " :";
        this._afterInput.setAttribute("placeholder", this._translateString("Timestamp"));
        this._beforeLabel.innerText = this._translateString("Before timestamp") + " :";
        this._beforeInput.setAttribute("placeholder", this._translateString("Timestamp"));
        this._afterDTLabel.innerText = this._translateString("After date/time") + " :";
        this._beforeDTLabel.innerText = this._translateString("Before date/time") + " :";
        this._otypesLabel.innerText = this._translateString("Obsel types") + " :";
        this._otypesSelect.setAttribute("lang", this._lang);

        const modelNotSetMessageSpans = this.shadowRoot.querySelectorAll("span.model-not-set-message");

        for(let i = 0; i < modelNotSetMessageSpans.length; i++)
            modelNotSetMessageSpans[i].innerText = this._translateString("Please choose a model");

        this._bgpLabel.innerText = this._translateString("SPARQL Basic Graph Pattern") + " :";
        this._fsaLabel.innerText = this._translateString("Finite state automata JSON description") + " :";
        this._rulesLabel.innerText = this._translateString("HRules rules") + " :";
        this._rulesInput.setAttribute("lang", this._lang);
        this._sparqlSparqlLabel.innerText = this._translateString("SPARQL CONSTRUCT query");
        this._scopeLabel.innerText = this._translateString("Scope");
        this._scopeTraceOption.innerText = this._translateString("Trace");
        this._scopeBaseOption.innerText = this._translateString("Base");
        this._scopeStoreOption.innerText = this._translateString("Store");
        this._inheritLabel.innerText = this._translateString("Inherit");
        this._isparqlSparqlLabel.innerText = this._translateString("SPARQL SELECT query");
        this._methodsLabel.innerText = this._translateString("Methods");
        this._methodsPicker.setAttribute("lang", this._lang);
        this._commandLineLabel.innerText = this._translateString("Command line");
        this._commandLineInput.setAttribute("placeholder", this._translateString("Command line"));
        this._formatLabel.innerText = this._translateString("Format");
        this._formatInput.setAttribute("placeholder", this._translateString("Format"));
        this._minSourcesLabel.innerText = this._translateString("Min. number of sources");
        this._maxSourcesLabel.innerText = this._translateString("Max. number of sources");
        this._feedToStdinLabel.innerText = this._translateString("Feed to standard input");
    }

    /**
     * 
     */
    _onModelInputEvent(event) {
        this._onFormElementEvent(event);
        this._updateSelectedModel();
    }

    /**
     * 
     */
    _updateSelectedModel() {
        const selected_model_uri = (this._modelPicker.value && this._modelPicker.checkValidity())?this._modelPicker.value:this.default_model_uri;

        if(selected_model_uri) {
            this._otypesSelect.setAttribute("model-uri", selected_model_uri);

            if(this._otypesP.classList.contains("model-not-set"))
                this._otypesP.classList.remove("model-not-set");

            this._rulesInput.setAttribute("model-uri", selected_model_uri);

            if(this._rulesP.classList.contains("model-not-set"))
                this._rulesP.classList.remove("model-not-set");
        }
        else if(this._otypesSelect.hasAttribute("model-uri")) {
            this._otypesSelect.removeAttribute("model-uri");

            if(!this._otypesP.classList.contains("model-not-set"))
                this._otypesP.classList.add("model-not-set");

            this._rulesInput.removeAttribute("model-uri");

            if(!this._rulesP.classList.contains("model-not-set"))
                this._rulesP.classList.add("model-not-set");
        }
    }

    /**
     * 
     */
    _onFormElementEvent(event) {
        event.stopPropagation();
 
        const componentEvent = new Event(event.type, {
            bubbles: true,
            cancelable: false,
            composed: event.composed
        });

        this.dispatchEvent(componentEvent);
    }
}

customElements.define('ktbs4la2-method-parameters-input', KTBS4LA2MethodParametersInput);
