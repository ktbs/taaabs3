/**
 * Class for attribute types. Please note that this class is NOT a descendant from "Resource". Therefore, AttributeType instances don't support get/put/post/delete as attribute types data management is the responsibility of their respective parent Model instance.
 */
export class AttributeType {

    /**
     * Constructor for class AttributeType
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
     * 
     * @return string
     */
    get id() {
        let rawID = this._JSONData["@id"];

        if((rawID) && (rawID.charAt(0) == '#'))
            return rawID.substring(1);
        else
            return this._JSONData["@id"];
    }

    /**
     * 
     * @param string id
     */
    set id(id) {
        this._JSONData["@id"] = '#' + id;
    }

    /**
     * 
     * @return Model
     */
    get parent_model() {
        return this._parentModel;
    }

    /**
	 * Returns a user-friendly label
	 * @return string
	 */
	get label() {
		if(this._JSONData["label"])
			return this._JSONData["label"];
		else
			return this._JSONData["http://www.w3.org/2000/01/rdf-schema#label"];
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
	set label(label) {
		this._JSONData["label"] = label;
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