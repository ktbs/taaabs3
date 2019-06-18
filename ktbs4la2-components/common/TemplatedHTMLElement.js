/**
 * Base class for Ktbs Components
 */
class TemplatedHTMLElement extends HTMLElement {

	/**
	 * Constructor. Clones the template node provided as an argument and adds it to the component's shadow DOM
	 * @param string componentJSPath
	 * @param bool fetchStylesheet
	 */
	constructor(componentJSPath, fetchStylesheet = true, fetchTranslation = true) {
		super();
		this._componentJSPath = componentJSPath;
		this._fetchTranslation = fetchTranslation;
		this._translatableStrings = new Array();
		this._bindedAncestorLangChangefunction = this._onAncestorLangChange.bind(this);
		this._langInheritedFromAncestor = null;
		this._lang = 'en';
		this._templateFetched = TemplatedHTMLElement.getComponentTemplate(this._componentJSPath, fetchStylesheet);

		// pre-create a promise that will be resolved when the template has been succesfully fetched
		this._resolveComponentReady;
		this._rejectComponentReady;

		this._componentReady = new Promise(function(resolve, reject) {
			this._resolveComponentReady = resolve;
			this._rejectComponentReady = reject;
		}.bind(this));

		this._componentReady.then(function() {
			if(this.onComponentReady)
				this.onComponentReady();
		}.bind(this));
		// --- done


		this._resolveTranslationFetched, this._rejectTranslationFetched, this._translationFetched;
		this._initTranslationPromise();
	}

	/**
	 * 
	 */
	_initTranslationPromise() {
		this._translationFetched = new Promise(function(resolve, reject) {
			this._resolveTranslationFetched = resolve;
			this._rejectTranslationFetched = reject;
		}.bind(this));

		this._translationFetched
			.then(function(translationStrings) {
				this._translatableStrings[this._lang] = translationStrings;
			}.bind(this))

			.catch(function(error) {
				// the component doesn't own the requested translation file, engish will be used as default language
				this._lang = 'en';
			}.bind(this))

			.finally(function() {
				this._templateFetched
					.then(function(rawTemplateContent) {
						let translatedTemplate = this._translateTemplate(rawTemplateContent);
						let templateNode = document.createElement("template");
			
						// @TODO process string substitutions and affect processed template instead of raw
						templateNode.innerHTML = translatedTemplate;

						let clone = templateNode.content.cloneNode(true);
						this.attachShadow({mode: "open"}).appendChild(clone);
						this._resolveComponentReady();
					}.bind(this))
					.catch(function(error) {
						this._rejectComponentReady(error);
					}.bind(this));
			}.bind(this));
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		return ['lang'];
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		if(attributeName == "lang") {
			this._initTranslationPromise();

			if(this._updateStringsTranslation)
				Promise.all([this._componentReady, this._translationFetched]).then(function() {
					this._updateStringsTranslation();
				}.bind(this));

			this._initLang();
			this.dispatchEvent(new CustomEvent("langchange"));
		}
	}

	/**
	 * 
	 */
	connectedCallback() {
		if(!this.getAttribute("lang"))
			this._initLang();
	}

	/**
	 * 
	 */
	_onAncestorLangChange(event) {
		this._initTranslationPromise();
		
		if(this._updateStringsTranslation)
			this._translationFetched.then(function() {
				this._updateStringsTranslation();
			}.bind(this));

		this._initLang();
	}

	/**
	 * 
	 */
	_determineLang() {
		if(this.getAttribute("lang")) {
			this._lang = this.getAttribute("lang");
		}
		else {
			let closestTranslatableAncestor = this.closest("[lang]");

			if(closestTranslatableAncestor) {
				this._langInheritedFromAncestor = closestTranslatableAncestor;
				this._lang = this._langInheritedFromAncestor.getAttribute("lang");
				this._langInheritedFromAncestor.addEventListener("langchange", this._bindedAncestorLangChangefunction);
			}
			else
				this._lang = 'en';
		}
	}

	/**
	 * 
	 */
	_initLang() {
		// first, determine which is the language
		if(this._langInheritedFromAncestor != null) {
			this._langInheritedFromAncestor.removeEventListener("langchange", this._bindedAncestorLangChangefunction);
			this._langInheritedFromAncestor = null;
		}
		
		this._determineLang();
		// --- done
	
		// then, fetch the translation if needed
		if(!this._fetchTranslation || this._lang == 'en') {
			this._resolveTranslationFetched(null);
		}
		else {
			TemplatedHTMLElement._getComponentTranslation(this._componentJSPath, this._lang)
				.then(function(translationArray) {
					this._resolveTranslationFetched(translationArray);
				}.bind(this))
				.catch(function(error) {
					this._rejectTranslationFetched(error);
				}.bind(this));
		}
	}

	/**
	 * 
	 */
	static _getComponentTranslation(componentJSPath, lang) {
		if(this.translationPromises[componentJSPath] && this.translationPromises[componentJSPath][lang])
			return this.translationPromises[componentJSPath][lang];
		else {
			let translationPromise = this._fetchComponentTranslation(componentJSPath, lang);

			if(!this.translationPromises[componentJSPath])
				this.translationPromises[componentJSPath] = new Array();

			this.translationPromises[componentJSPath][lang] = translationPromise;
			return translationPromise;
		}
	}

	/**
	 * 
	 */
	static _fetchComponentTranslation(componentJSPath, lang) {
		return new Promise(function(resolve, reject) {

			// we try to find the last slash ("/") character in the component JS file path to extract it's parent folder path
			let lastSlashposition = componentJSPath.lastIndexOf("/");

			// if a slash has been found
			if(lastSlashposition != -1) {

				// we extract the component's parent folder path
				let componentFolderPath = componentJSPath.substring(0, lastSlashposition);

				// we build the translation file path
				let translationPath = componentFolderPath + "/i18n/" + lang + ".json";

				// we try to fetch the translation from http://myserver.com/my/path/to/my-component/i18n/{lang}.po
				fetch(translationPath)
					.then(fetchTranslationResponse => {
						// if the HTTP request to fetch the translation responded successfully
						if(fetchTranslationResponse.ok) {

							// when the response content from the HTTP request has been successfully read
							fetchTranslationResponse.json()
								.then(translationArray => {
									resolve(translationArray);
								})
								.catch(error => {
									reject(error);
								});
						}
						else
							reject("Fetch request for translation file \"" + translationPath + "\"has failed");
					})
					.catch(error => {
						reject(error);
					});
			}
			else
				reject("could not parse the component URL to find it's translation path");
		});
	}

	/**
	 * 
	 */
	_translateString(englishString) {
		if(this._lang == "en")
			return englishString;
		else {
			if(this._translatableStrings[this._lang] && this._translatableStrings[this._lang][englishString])
				return this._translatableStrings[this._lang][englishString];
			else
				return englishString;
		}
	}

	/**
	 * 
	 */
	_translateRegexMatch(match, p1, offset, string) {
		return this._translateString(p1);
	}

	/**
	 * 
	 */
	_translateTemplate(rawTemplateContent) {
		let regex = /{translate: *[\"|\']([^}]*)[\"|\'] *}/g;
		return rawTemplateContent.replace(regex, this._translateRegexMatch.bind(this));
	}

	/**
	 * 
	 */
	onTemplateFailed(error) {
		this.emitErrorEvent(error);
	}

	/**
	 * 
	 */
	emitErrorEvent(error) {
		this.dispatchEvent(
			new ErrorEvent("error", {
				bubbles: true,
				error : error
			})
		);
	}

	/**
	 * 
	 */
	static getComponentTemplate(componentJSPath, fetchStylesheet = true) {
		if(this.templatePromises[componentJSPath])
			return this.templatePromises[componentJSPath];
		else {
			let templatePromise = this.fetchComponentTemplate(componentJSPath, fetchStylesheet);
			this.templatePromises[componentJSPath] = templatePromise;
			return templatePromise;
		}
	}

	/**
	 * Fetches the HTML template of a component, optionally fetches a CSS stylesheet too and add it to the template.
	 * @param componentJSPath the full URL of the JS file (must end with ".js") that holds the component. Caller components should refer to their own JS file using "import.meta.url".
	 * @param fetchStylesheet whether or not we sould also fetch a CSS stylesheet and add it to the template content (default : true)
	 * @return Promise
	 */
	static fetchComponentTemplate(componentJSPath, fetchStylesheet = true) {
		return new Promise(function(resolve, reject) {
			// we check if the given URL of the JS file ends with ".js". If it doesn't, we won't know how to build the template and stylesheet URLs
			if(componentJSPath.substring(componentJSPath.length - 3) == ".js") {

				// componentBasePath is the URL in componentJSPath without the trailing ".js" (IE : componentJSPath=http://myserver.com/my/path/to/my-component.js => componentBasePath=http://myserver.com/my/path/to/my-component)
				let componentBasePath = componentJSPath.substring(0, componentJSPath.length - 3);

				// we try to fetch the HTML template from http://myserver.com/my/path/to/my-component.html
				fetch(componentBasePath + ".html").then(fetchTemplateResponse => {

					// if the HTTP request to fetch the HTML template responded successfully
					if(fetchTemplateResponse.ok) {

						// when the response content from the HTTP request has been successfully read
						fetchTemplateResponse.text().then(fetchTemplateResponseText => {

							// we analyse the URL of the component to find it's parent folder's absolute URL
							let componentBasePathURLObject = new URL(componentBasePath);
							let pathParts = componentBasePathURLObject.pathname.split("/");
							let folderParts = pathParts.splice(0, pathParts.length - 1);
							let componentFolder = componentBasePathURLObject.origin + folderParts.join("/");

							// in the HTML template content, we replace occurences of "{my-component-folder}" with the component's parent folder's absolute URL
							let tokenRegex = new RegExp('\\{my-component-folder\\}','g');
							let processedTemplateContent = fetchTemplateResponseText.trim().replace(tokenRegex, componentFolder);

							// if we also want to fetch a CSS stylesheet
							if(fetchStylesheet == true) {
			
								// we try to fetch the content of the component stylesheet
								fetch(componentBasePath + ".css").then(fetchStyleResponse => {

									// if the HTTP request to fetch the CSS stylesheet responded successfully
									if(fetchStyleResponse.ok) {

										// when the response content from the HTTP request has been successfully read
										fetchStyleResponse.text().then(fetchStyleResponseText => {
									
											// in the CSS stylesheet content, we replace occurences of "{my-component-folder}" with the component's parent folder's absolute URL
											let processedStylesheetContent = fetchStyleResponseText.trim().replace(tokenRegex, componentFolder);

											// finally, we resolve the returned promise, providing the extracted template and stylesheet
											let rawTemplate = "<style>" + processedStylesheetContent + "</style>" + processedTemplateContent;
											resolve(rawTemplate);
										})
										// if the fetched content of the CSS stylesheet could not be read
										.catch(function (error) {
											// we reject the returned promise
											reject(error);
										});
									}
									else
										reject(new Error("Could not fetch CSS stylesheet for component " + componentBasePath));
								}).
								// if the fetching of the CSS stylesheet failed
								catch(function(error) {
									// we reject the returned promise
									reject(error);
								});
							}
							// we don't want to fetch a CSS stylesheet
							else {
								// finally, we resolve the returned promise, providing the extracted template
								resolve(processedTemplateContent);
							}
						})
						// if the fetched content of the HTML template could not be read
						.catch(function (error) {
							// we reject the returned promise
							reject(error);
						});
					}
					else
						// response for HTTP request to fetch the HTML template is not OK
						reject(new Error("Could not fetch HTML template for component " + componentBasePath));
				})
				// if the fetching of the HTML template failed
				.catch(function (error) {
					// we log and display the error
					reject(error);
				});
			}
			else
				// componentJSPath doesn't end with ".js"
				reject(new Error("Could not recognise file name pattern for component " + componentJSPath + " (must end with .js)"));
		});
	}
}

/**
 * 
 */
TemplatedHTMLElement.templatePromises = new Array();

/**
 * 
 */
TemplatedHTMLElement.translationPromises = new Array();

export {TemplatedHTMLElement};
