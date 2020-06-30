import {Model} from "./Model.js";
import {AttributeType} from "./AttributeType.js";
import {KtbsError} from "./Errors.js";

/**
 * Class for Obsel types. Please note that this class is NOT a descendant from "Resource". Therefore, ObselType instances don't support get/put/post/delete as Obsel types data management is the responsibility of their respective parent Model instance.
 */
export class ObselType {

    /**
     * Constructor for class ObselType
     * \param Model parentModel
     * \param Object JSONData 
     */
    constructor(parentModel = null, JSONData = {"@type": "ObselType"}) {

        /**
         * The parent model in which this obsel type is described in
         * \var Model
         * \protected
         */
        this._parentModel = parentModel;

        /**
		 * The obvsel type's data
		 * \var Object
		 * \protected
		 */
        this._JSONData = JSONData;
    }

    /**
     * Gets the relative ID of the obsel type (relative to the Model it is described in)
     * \return string
     * \public
     */
    get id() {
        if(!this._id)
            this._id = decodeURIComponent(this.uri.hash.substring(1));

        return this._id;
    }

    /**
     * Sets the relative ID of the obsel type (relative to the Model it is described in)
     * \param string id - the new relative ID for the obsel type
     * \public
     */
    set id(new_id) {
        this._JSONData["@id"] = '#' + encodeURIComponent(new_id);
        this._id = new_id;
    }

    /**
     * Gets the uri of the obsel type
     * \return URL
     * \public
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
     * \return Model
     * \public
     */
    get parent_model() {
        return this._parentModel;
    }

    /**
	 * Sets the Model the obsel type is described in
     * \param Model new_parent_model - the new Model the obsel type is described in
     * \throws TypeError throws a TypeError if the provided argument is not a Model
     * \public
	 */
	set parent_model(new_parent_model) {
		if(new_parent_model instanceof Model)
			this._parentModel = new_parent_model;
		else
			throw new TypeError("New value for parent_model property must be of type Model.");
	}

    /**
     * Gets the default color (if defined) to use for representing Obsels of the current type
     * \return string
     * \public
     */
    get suggestedColor() {
        return this._JSONData["suggestedColor"];
    }

    /**
     * Sets the default color to use for representing Obsels of the current type
     * \param string new_suggestedColor - the new default color as a valid HTML/CSS color (hexadecimal, color name etc ...)
     * \public
     */
    set suggestedColor(new_suggestedColor) {
        this._JSONData["suggestedColor"] = new_suggestedColor;
    }

    /**
     * Gets the default symbol tu use for representing Obsels of the current type
     * \return string
     * \public
     */
    get suggestedSymbol() {
        return this._JSONData["suggestedSymbol"];
    }

    /**
     * Sets the default symbol tu use for representing Obsels of the current type
     * \param string suggestedSymbol the new default symbol as a character (Unicode supported)
     * \public
     */
    set suggestedSymbol(new_suggestedSymbol) {
        this._JSONData["suggestedSymbol"] = new_suggestedSymbol;
    }

    /**
	 * Returns a user-friendly label
	 * \return string
     * \public
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
	 * Gets the label for a given language, or the default label if no translated label has been found, or undefined if no default label has been found
	 * \param string lang - a short code for the language we want the label translated into
	 * \return string
     * \public
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
	 * \param string label - The new label for the resource
     * \public
	 */
	set label(new_label) {
        this._JSONData["label"] = new_label;
        this._label = new_label;
	}

	/**
	 * Sets a translation for the label in a given language
	 * \param string label - the translated label
	 * \param string lang - a short code for the language the label is translated in
     * \public
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
	 * \return string
     * \public
	 */
	get comment() {
		return this._JSONData["http://www.w3.org/2000/01/rdf-schema#comment"];
	}

	/**
	 * Sets the "comment" of the resource
	 * \param string comment - the new comment for the resource
     * \public
	 */
	set comment(comment) {
		this._JSONData["http://www.w3.org/2000/01/rdf-schema#comment"] = comment;
    }

    /**
     * Gets the attribute types associated with the current model
     * \return Array of AttributeType
     * \public
     */
    get attribute_types() {
        if(!this._attribute_types) {
            this._attribute_types = new Array();

            if(this._parentModel) {
                let model_attribute_types = this._parentModel.attribute_types;

                for(let i = 0; i < model_attribute_types.length; i++) {
                    let anAttributeType = model_attribute_types[i];

                    if(anAttributeType.appliesToObselType(this))
                        this._attribute_types.push(anAttributeType);
                }
            }
        }

        return this._attribute_types;
    }

    /**
     * Sets the attribute types associated with the current model
     * \param Array of AttributeType new_attribute_types - the new attribute types associated with the current model
     * \throws TypeError throws a TypeError if the provided argument is not an Array of AttributeType
     * \throws KtbsError throws a KtbsError if one of the AttributeType provided as an argument has a different parent model than the current obsel type
     * \public
     */
    set attribute_types(new_attribute_types) {
        if(new_attribute_types instanceof Array) {
            for(let i = 0; i < new_attribute_types.length; i++)
                if(!(new_attribute_types[i] instanceof AttributeType))
                    throw new TypeError("New value for attribute_types property must be an array of AttributeType.");

            for(let i = 0; i < new_attribute_types.length; i++)
                if(this.parent_model && new_attribute_types[i].parent_model && (new_attribute_types[i].parent_model != this.parent_model))
                    throw new KtbsError("Cannot associate an ObselType and an AttributeType from two different models");

            for(let i = 0; i < new_attribute_types.length; i++)
                if(!new_attribute_types[i].obsel_types.includes(this))
                    new_attribute_types[i].obsel_types.push(this);

            this._attribute_types = new_attribute_types;
        }
        else
            throw new TypeError("New value for attribute_types property must be an array of AttributeType.");
    }
    
    /**
	 * Gets the data to be send in a POST query
	 * \return Object
	 * \protected
	 */
    _getPostData() {
        if(this._parentModel) {
            let postData = this._JSONData;
            postData["@id"] = this._parentModel.id + postData["@id"];
            return postData;
        }
		else
			throw new KtbsError("ObselType POST data cannot be built before the ObselType's parent model has been set");
    }
}