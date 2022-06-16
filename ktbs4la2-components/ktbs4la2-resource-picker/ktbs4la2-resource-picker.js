import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';
import {Method} from '../../ktbs-api/Method.js';

import '../ktbs4la2-resource-uri-input/ktbs4la2-resource-uri-input.js';
import '../ktbs4la2-nav-resource/ktbs4la2-nav-resource.js';

/**
 * 
 */
class KTBS4LA2ResourcePicker extends TemplatedHTMLElement {

    /**
	 * 
	 */
	constructor() {
        super(import.meta.url, true, true);

        if(this.attachInternals)
            this._internals = this.attachInternals();

        this._resourceExplorerElementsMutationObserver = new MutationObserver(this._onResourceExplorerElementsMutation.bind(this));
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
        if(newValue != null)
            this.setAttribute("required", newValue);
        else if(this.hasAttribute("required"))
            this.removeAttribute("required");
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
        this._browseButton = this.shadowRoot.querySelector("#browse-button");
        this._browseButtonLabel = this.shadowRoot.querySelector("#browse-button-label");
        this._browseButtonArrow = this.shadowRoot.querySelector("#browse-button-arrow");
        this._resourcesExplorer = this.shadowRoot.querySelector("#resources-explorer");
        this._resourcesExplorer.addEventListener("focus", this._onResourceExplorerFocus.bind(this));
        this._resourcesExplorer.addEventListener("keydown", this._onResourceExplorerKeyDown.bind(this));
        this._resourcesExplorer.addEventListener("selectelement", this._onSelectExplorerElement.bind(this));
        this._uriInput = this.shadowRoot.querySelector("#uri-input");
        this._uriInput.setAttribute("lang", this._lang);
        this._uriInput.addEventListener("input", this._onURIInputEvent.bind(this));
        this._uriInput.addEventListener("change", this._onURIInputEvent.bind(this));
        this._uriInput.addEventListener("focus", this._onChildElementFocus.bind(this));

        if(!this.getAttribute("browse-scope-uris"))
            this.emitErrorEvent("Required attribute \"browse-scope-uris\" is missing");

        this._browseButton.addEventListener("click", this._onClickBrowseButton.bind(this));
        this._browseButton.addEventListener("focus", this._onChildElementFocus.bind(this));
        this.addEventListener("focus", this._onFocus.bind(this));
    }

    /**
     * 
     * \static
     */
    static get observedAttributes() {
        let _observedAttributes = super.observedAttributes;
        _observedAttributes.push("root-uri");
        _observedAttributes.push("root-label");
        _observedAttributes.push("browse-start-uri");
        _observedAttributes.push("allowed-resource-types");
        _observedAttributes.push("allow-builtin-methods");
        _observedAttributes.push("required");
        _observedAttributes.push("value");
        return _observedAttributes;
    }

    /**
     * 
     * \param {*} name 
     * \param {*} oldValue 
     * \param {*} newValue 
     * \public
     */
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        
        if(name == "allowed-resource-types")
            this._componentReady.then(() => {
                this._uriInput.setAttribute("allowed-resource-types", newValue);
                const navElement = this.shadowRoot.querySelector("ktbs4la2-nav-resource");

                if(navElement) {
                    if(this.allow_builtin_methods)
                        navElement.setAttribute("show-builtin-methods", "true");
                    else if(navElement.hasAttribute("show-builtin-methods"))
                        navElement.removeAttribute("show-builtin-methods");
                }
            }).catch(() => {});

        if(name == "allow-builtin-methods")
            this._componentReady.then(() => {
                if(newValue != null)
                    this._uriInput.setAttribute("allow-builtin-methods", newValue);
                else if(this._uriInput.hasAttribute("allow-builtin-methods"))
                    this._uriInput.removeAttribute("allow-builtin-methods");

                const navElement = this.shadowRoot.querySelector("ktbs4la2-nav-resource");

                if(navElement) {
                    if(this.allow_builtin_methods)
                        navElement.setAttribute("show-builtin-methods", "true");
                    else if(navElement.hasAttribute("show-builtin-methods"))
                        navElement.removeAttribute("show-builtin-methods");
                }
            }).catch(() => {});
            
        if((name == "root-uri") || (name == "root-label") || (name == "browse-start-uri") || (name == "allowed-resource-types"))
            this._initResourceExplorer();

        if(name == "required")
            this._componentReady.then(() => {
                this._uriInput.setAttribute("required", newValue);
            }).catch(() => {});

        if(name == "value")
            this._componentReady.then(() => {
                this._uriInput.value = newValue;
            }).catch(() => {});
    }

    /**
     * 
     */
    _onFocus(event) {
        this._componentReady.then(() => {
            this._uriInput._componentReady.then(() => {
                this._uriInput.focus();
            }).catch(() => {});
        }).catch(() => {});
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
    _onClickBrowseButton(event) {
        if(this._resourcesExplorer.style.display != "block") {
            this._resourcesExplorer.style.display = "block";
            this._browseButtonLabel.innerText = this._translateString("Hide");
            this._browseButtonArrow.innerText = "▲";
        }
        else {
            this._resourcesExplorer.style.display = "none";
            this._browseButtonLabel.innerText = this._translateString("Browse");
            this._browseButtonArrow.innerText = "▼";
        }
    }

    /**
     * 
     */
    _initResourceExplorer() {
        this._componentReady.then(() => {
            const previousNavElements = this._resourcesExplorer.querySelectorAll("ktbs4la2-nav-resource");

            for(let i = 0; i < previousNavElements.length; i++)
                previousNavElements[i].remove();
            
            const navElement = document.createElement("ktbs4la2-nav-resource");
            navElement.setAttribute("lang", this._lang);
            navElement.setAttribute("uri", this.getAttribute("root-uri"));
            navElement.setAttribute("resource-type", "Ktbs");
            navElement.setAttribute("tabindex", "-1");

            if(this.hasAttribute("root-label"))
                navElement.setAttribute("label", this.getAttribute("root-label"));

            if(this.hasAttribute("browse-start-uri"))
                navElement.setAttribute("expand-until-uri", this.getAttribute("browse-start-uri"));

            if(this.hasAttribute("allowed-resource-types"))
                navElement.setAttribute("allow-select-types", this.getAttribute("allowed-resource-types"));

            if(this.allow_builtin_methods)
                navElement.setAttribute("show-builtin-methods", "true");

            this._resourceExplorerElementsMutationObserver.observe(navElement, {childList: true, subtree: true, attributes: false});
            this._resourcesExplorer.appendChild(navElement);
        }).catch(() => {});
    }

    /**
     * 
     */
    _onResourceExplorerElementsMutation(mutationRecords, observer) {
		setTimeout(() => {
			for(let i = 0; i < mutationRecords.length; i++) {
				const currentMutationRecord = mutationRecords[i];

				if(currentMutationRecord.type == "childList") {
					for(let j = 0; j < currentMutationRecord.addedNodes.length; j++) {
						let newChildNode = currentMutationRecord.addedNodes[j];
						
						if(
                                (this._uriInput.value != "")
                            &&  (newChildNode.localName == "ktbs4la2-nav-resource")
                            &&  (
                                        (this._uriInput.value == newChildNode.getAttribute("uri"))
                                    ||  (
                                            newChildNode.getAttribute("uri").startsWith(Method.builtin_methods_prefix)
                                        &&  (this._uriInput.value == newChildNode.getAttribute("uri").substring(Method.builtin_methods_prefix.length))
                                    )
                            )
                            &&  !newChildNode.classList.contains("selected")
                         ) {
                            newChildNode.classList.add("selected");
                            break;
						}
					}
				}
			}
        });
	}

    /**
     * 
     */
    _uriIsInAllowedScope(test_uri) {
        if(this._allowedScopeURIs.length > 0) {
            let isInScope = false;

            for(let i = 0; (i < this._allowedScopeURIs.length) && !isInScope; i++)
                isInScope = this._allowedScopeURIs[i].toString().startsWith(test_uri.toString());

            return isInScope;
        }
        else
            return true;
    }

    /**
     * 
     */
    _onSelectExplorerElement(event) {
        event.preventDefault();
        event.stopPropagation();
        const selectedElement = event.target;

        if(selectedElement) {
            this._selectElement(selectedElement);

            setTimeout(() => {
                const componentEvent = new Event("change", {
                    bubbles: true,
                    cancelable: false,
                    composed: true
                });
        
                this.dispatchEvent(componentEvent);
            });
        }
    }

    /**
     * 
     */
    _onURIInputEvent(event) {
        event.stopPropagation();
        let previouslySelectedElementsQuery, newlySelectedElementQuery;

        if(Method.builtin_methods_ids.includes(this._uriInput.value)) {
            previouslySelectedElementsQuery = ".selected:not([uri = \"" + CSS.escape(Method.builtin_methods_prefix + this._uriInput.value) + "\"])";
            newlySelectedElementQuery = "[uri = \"" + CSS.escape(Method.builtin_methods_prefix + this._uriInput.value) + "\"]";
        }
        else {
            previouslySelectedElementsQuery = ".selected:not([uri = \"" + CSS.escape(this._uriInput.value) + "\"])";
            newlySelectedElementQuery = "[uri = \"" + CSS.escape(this._uriInput.value) + "\"]";
        }

        const previouslySelectedElements = this._resourcesExplorer.querySelectorAll(previouslySelectedElementsQuery);

        for(let i = 0; i < previouslySelectedElements.length; i++)
                if(previouslySelectedElements[i].classList.contains("selected"))
                    previouslySelectedElements[i].classList.remove("selected");

        if(this._uriInput.checkValidity()) {
            const newlySelectedElement = this._resourcesExplorer.querySelector(newlySelectedElementQuery);

            if(newlySelectedElement && !newlySelectedElement.classList.contains("selected"))
                newlySelectedElement.classList.add("selected");
        }
 
        const componentEvent = new Event(event.type, {
            bubbles: event.bubbles,
            cancelable: false,
            composed: event.composed
        });

        this.dispatchEvent(componentEvent);
    }

    /**
     * 
     */
    _getExplorerSelectableElements() {
        const pickable_types = this.getAttribute("allowed-resource-types").split(" ").filter(Boolean);
        let queryParts = new Array();

        for(let i = 0; i < pickable_types.length; i++)
            queryParts.push("[resource-type = \"" + CSS.escape(pickable_types[i]) + "\"]");

        return this._resourcesExplorer.querySelectorAll(queryParts.join(", "));
    }

    /**
     *  
     */
    _selectElement(element) {
        const previouslySelectedElements = this._resourcesExplorer.querySelectorAll(".selected");

        for(let i = 0; i < previouslySelectedElements.length; i++)
            if(previouslySelectedElements[i] != element)
                previouslySelectedElements[i].classList.remove("selected");

        if(element.getAttribute("uri").startsWith(Method.builtin_methods_prefix))
            this._uriInput.value = element.getAttribute("uri").substring(Method.builtin_methods_prefix.length);
        else
            this._uriInput.value = element.getAttribute("uri");

        element.classList.add("selected");
        this._resourcesExplorer.focus();
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
    _onResourceExplorerFocus(event) {
        event.stopPropagation();
        const selectedElement = this._resourcesExplorer.querySelector(".selected");

        if(!selectedElement) {
            let firstSelectableElement;

            if(this.getAttribute("allowed-resource-types")) {
                const selectableElements = this._getExplorerSelectableElements();

                if(selectableElements.length > 0)
                    firstSelectableElement = selectableElements[0];
            }
            else if(this._resourcesExplorer.hasChildNodes())
                firstSelectableElement = this._resourcesExplorer.childNodes[0];
        
            if(firstSelectableElement)
                this._selectElement(firstSelectableElement);
        }
    }

    /**
     * 
     */
    _onResourceExplorerKeyDown(event) {
        if((event.keyCode == 38) || (event.keyCode == 40)) {
            event.preventDefault();
            event.stopPropagation();
            const selectedElement = this._resourcesExplorer.querySelector(".selected");

            if(selectedElement) {
                const selectableElements = Array.from(this._getExplorerSelectableElements());
                const selectedElementRank = selectableElements.indexOf(selectedElement);

                if(selectedElementRank != -1) {
                    if((event.keyCode == 38) && (selectedElementRank > 0))
                        this._selectElement(selectableElements[selectedElementRank - 1]);
                    else if((event.keyCode == 40) && (selectedElementRank < (selectableElements.length - 1)))
                        this._selectElement(selectableElements[selectedElementRank + 1]);

                    const componentEvent = new Event("change", {
                        bubbles: true,
                        cancelable: false,
                        composed: true
                    });
            
                    this.dispatchEvent(componentEvent);
                }
            }
        }
    }

    /**
     * 
     */
    checkValidity() {
        let isValid;

        if(this._uriInput) {
            isValid = this._uriInput.checkValidity();

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
        this._componentReady.then(() => {
            this._uriInput.setCustomValidity(message);
        });
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._uriInput.setAttribute("lang", this._lang);
        this._browseButtonLabel.innerText = this._translateString("Browse");

        const resourceExplorerRoots = this._resourcesExplorer.querySelectorAll(":scope > ktbs4la2-nav-resource");

        for(let i = 0; i < resourceExplorerRoots.length; i++)
            resourceExplorerRoots[i].setAttribute("lang", this._lang);
    }

    /**
     * 
     */
    get picked_resource() {
        if(this._uriInput)
            return this._uriInput.picked_resource;
        else
            return undefined;
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
}

customElements.define('ktbs4la2-resource-picker', KTBS4LA2ResourcePicker);
