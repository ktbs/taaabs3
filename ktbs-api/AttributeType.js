/**
 * Class for attribute types. Please note that this class is NOT a descendant from "Resource". Therefore, AttributeType instances don't support get/put/post/delete as attribute types data management is the responsibility of their respective parent Model instance.
 */
export class AttributeType {

    /**
     * Constructor for class AttributeType
     * @param Model parentModel the model the AttributeType is described in
     * @param Object JSONData
     */
    constructor(parentModel, JSONData) {

        /**
         * The model the AttributeType is described in
         * @type Model
         */
        this._parentModel = parentModel;

        /**
         * The JSON data object containing the AttributeType's description
         * @type Object
         */
        this._JSONData = JSONData;
    }

    /**
     * Gets the relative id of the attribute type (relative to parent Model)
	 * @return string
     */
    get id() {
		if(!this._id)
			this._id = decodeURIComponent(this.uri.hash.substring(1));

		return this._id;
    }

    /**
     * Sets the relative id of the attribute type in it's parent Model
     * @param string id
     */
    set id(new_id) {
		this._JSONData["@id"] = '#' + encodeURIComponent(new_id);
		this._id = '#' + new_id;
    }

    /**
     * Gets the uri of the attribute type
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
     * Gets the model the AttributeType is described in
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

/**
 * An array listing the attribute types IDs that are "system" attribute types
 * @static
 * @type Array
 */
AttributeType.system_types_ids = ["@context", "@id", "@type", "begin", "beginDT", "end", "endDT", "hasSourceObsel", "hasTrace", "subject"];