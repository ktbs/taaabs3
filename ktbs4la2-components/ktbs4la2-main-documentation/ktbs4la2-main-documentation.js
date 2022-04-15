import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

class KTBS4LA2MainDocumentation extends TemplatedHTMLElement {
	
	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, false);
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push("doc-path");
		observedAttributes.push("page");
		return observedAttributes;
	}

	/**
	 * 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		super.attributeChangedCallback(name, oldValue, newValue);
		
		if(name == "doc-path") {
			this._componentReady.then(() => {
				this._style.innerHTML = "";

				if(newValue) {
					try {
						const stylePath = new URL(newValue + "style.css");

						if(stylePath.toString().startsWith(window.location.origin + window.location.pathname)) {
							fetch(stylePath)
								.then((response) => {
									if(response.ok) {
										response.text()
											.then((responseText) => {
												this._style.innerHTML = responseText;
											})
											.catch(this.emitErrorEvent.bind(this));
									}
									else {
										this.emitErrorEvent("Fetch failed : response not ok");
									}
								})
								.catch(this.emitErrorEvent.bind(this));
						}
						else
							this.emitErrorEvent(new Error("Requested path is outside the application"));
					}
					catch(error) {
						this.emitErrorEvent(error);
					}
				}

				this._updateContent();
			});
		}
		else if(name == "page") {
			this._componentReady.then(() => {
				this._updateContent();
			});
		}
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._style = this.shadowRoot.querySelector("#doc-style");
		this._content = this.shadowRoot.querySelector("#content");
	}

	/**
	 * 
	 */
	_updateContent() {
		if(this.hasAttribute("doc-path") && this.hasAttribute("page")) {
			try {
				const localeDocPath = this.getAttribute("doc-path") + this._lang + "/";
				const localePagePath = new URL(this.getAttribute("page"), localeDocPath);

				if(localePagePath.toString().startsWith(window.location.origin + window.location.pathname)) {
					fetch(localePagePath)
						.then((response) => {
							if(response.ok) {
								response.text()
									.then((responseText) => {
										this._content.innerHTML = "";
										const contentDocument = document.createElement("template");
										contentDocument.innerHTML = responseText;
										const contentDocumentMain = contentDocument.content.querySelector("main");

										if(contentDocumentMain) {
											const links = contentDocumentMain.querySelectorAll("a[href]:not([target = \"_blank\"])");

											for(let i = 0; i < links.length; i++) {
												try {
													let link_url;

													if(links[i].getAttribute("href").startsWith("http"))
														link_url = new URL(links[i].getAttribute("href"));
													else
														link_url = new URL(links[i].getAttribute("href"), localeDocPath);

													if(link_url.toString().startsWith(localeDocPath)) {
														const relativePath = link_url.toString().substring(localeDocPath.length);
														links[i].setAttribute("href", "#doc=" + encodeURIComponent(relativePath));
														links[i].addEventListener("click", this._onClickContentLink.bind(this));
													}
													else
														links[i].setAttribute("target", "_blank");
												}
												catch(error) {
													this.emitErrorEvent(error);
													links[i].removeAttribute("href");
												}
											}

											this._content.appendChild(contentDocumentMain);
										}
									})
									.catch(this.emitErrorEvent.bind(this));
							}
							else {
								this.emitErrorEvent("Fetch failed : response not ok");
							}
						})
						.catch(this.emitErrorEvent.bind(this));
				}
				else
					this.emitErrorEvent(new Error("Requested path is outside the application"));
			}
			catch(error) {
				this.emitErrorEvent(error);
			}
		}
	}

	/**
	 * 
	 */
	_onClickContentLink(event) {
		event.preventDefault();
		event.stopPropagation();

		if(event.target && event.target.hasAttribute("href")) {
			try {
				const link_url = new URL(event.target.getAttribute("href"));

				// parse the data in window's URL hash
				let queryString = link_url.hash.substring(1);
				let queryParameterStrings = queryString.split('&');
				let queryParameters = new Array();

				if(queryParameterStrings instanceof Array) {
					for(let i =0; i < queryParameterStrings.length; i++) {
						let parameterString = queryParameterStrings[i];
						let parameterParts = parameterString.split('=');

						if((parameterParts instanceof Array) && (parameterParts.length == 2)) {
							let key = parameterParts[0];
							let value = parameterParts[1];
							queryParameters[key] = decodeURIComponent(value);
						}
					}
				}

				if(queryParameters["doc"]) {
					this.dispatchEvent(new CustomEvent("request-documentation-page", {
						bubbles: true,
						composed: true,
						cancelable: false,
						detail: {
							page: queryParameters["doc"]
						}
					}));
				}
			}
			catch(error) {
				this.emitErrorEvent(error);
			}
		}
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {	
		this._updateContent();
	}
}

customElements.define('ktbs4la2-main-documentation', KTBS4LA2MainDocumentation);
