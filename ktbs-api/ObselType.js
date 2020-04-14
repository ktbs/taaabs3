/**
 * Class for Obsel types. Please note that this class is NOT a descendant from "Resource". Therefore, ObselType instances don't support get/put/post/delete as Obsel types data management is the responsibility of their respective parent Model instance.
 */
export class ObselType {

    /**
     * Constructor for class ObselType
     * @param Model parentModel
     * @param Object JSONData 
     */
    constructor(parentModel, JSONData) {

        /**
         * 
         * @type Model
         */
        this._parentModel = parentModel;

        /**
         * 
         * @type Object
         */
        this._JSONData = JSONData;
    }

    /**
     * Gets the relative ID of the obsel type (relative to the Model it is described in)
     * @returns string
     */
    get id() {
        if(!this._id)
            this._id = decodeURIComponent(this.uri.hash.substring(1));

        return this._id;
    }

    /**
     * Sets the relative ID of the obsel type (relative to the Model it is described in)
     * @param string id the new relative ID for the obsel type
     */
    set id(new_id) {
        this._JSONData["@id"] = '#' + encodeURIComponent(new_id);
        this._id = '#' + new_id;
    }

    /**
     * Gets the uri of the obsel type
     * @returns URL
     */
    get uri() {
        if(!this._uri) {
            let rawID = this._JSONData["@id"];
            this._uri = this.parent_model.resolve_link_uri(rawID);
        }

        return this._uri;
    }

    /**
     * Gets the Model the obsel type is described in
     * @return Model
     */
    get parent_model() {
        return this._parentModel;
    }

    /**
     * Gets the default color (if defined) to use for representing Obsels of the current type
     * @return string
     */
    get suggestedColor() {
        return this._JSONData["suggestedColor"];
    }

    /**
     * Sets the default color to use for representing Obsels of the current type
     * @param string new_suggestedColor the new default color as a valid HTML/CSS color (hexadecimal, color name etc ...)
     */
    set suggestedColor(new_suggestedColor) {
        this._JSONData["suggestedColor"] = new_suggestedColor;
    }

    /**
     * Gets the default symbol tu use for representing Obsels of the current type
     * @return string
     */
    get suggestedSymbol() {
        return this._JSONData["suggestedSymbol"];
    }

    /**
     * Sets the default symbol tu use for representing Obsels of the current type
     * @param string suggestedSymbol the new default symbol as a character (Unicode supported)
     */
    set suggestedSymbol(new_suggestedSymbol) {
        this._JSONData["suggestedSymbol"] = new_suggestedSymbol;
    }

    /**
	 * Returns a user-friendly label
	 * @return string
	 */
	get label() {
		if(!this._label) {
			if(this._JSONData["label"])
				this._label = this._JSONData["label"];
			else
				this._label = this._JSONData["http://www.w3.org/2000/01/rdf-schema#label"];
		}

		return this._label;
	}

	/**
	 * Gets the label for a given language
	 * @param string lang a short code for the language we want the label translated into
	 * @return string the translated label, or the default label if no translated label has been found, or undefined if no default label has been found
	 */
	get_translated_label(lang) {
		let label = this.label;

		if(label instanceof Array) {
			for(let i = 0; i < label.length; i++) {
				let aLabel = label[i];

				if((aLabel instanceof Object) && (aLabel["@language"] == lang))
					return aLabel["@value"];
			}
		}
		else
			return label;
	}

	/**
	 * Set a user-friendly label.
	 * @param string label The new label for the resource
	 */
	set label(new_label) {
        this._JSONData["label"] = new_label;
        this._label = new_label;
	}

	/**
	 * Sets a translation for the label in a given language
	 * @param string label the translated label
	 * @param string lang a short code for the language the label is translated in
	 */
	set_translated_label(label, lang) {
		let currentLabel = this.label;
		let newLabel;

		if(currentLabel instanceof string) {
			newLabel = new Array();
			newLabel.push({"@language": "en", "@value": currentLabel});
		}
		else if(currentLabel instanceof Array) {
			newLabel = currentLabel;
		}

		currentLabel.push({"@language": lang, "@value": label})
		this.label = currentLabel;
	}

    /**
	 * Gets the "comment" of the resource
	 * @return string
	 */
	get comment() {
		return this._JSONData["http://www.w3.org/2000/01/rdf-schema#comment"];
	}

	/**
	 * Sets the "comment" of the resource
	 * @param string comment the new comment for the resource
	 */
	set comment(comment) {
		this._JSONData["http://www.w3.org/2000/01/rdf-schema#comment"] = comment;
	}
}