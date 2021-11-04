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
     * \return String
     * \public
     */
    get id() {
        if(!this._id)
            this._id = decodeURIComponent(this.uri.hash.substring(1));

        return this._id;
    }

    /**
     * Sets the relative ID of the obsel type (relative to the Model it is described in)
     * \param String id - the new relative ID for the obsel type
     * \public
     */
    set id(new_id) {
        this._JSONData["@id"] = '#' + encodeURIComponent(new_id);
        this._id = new_id;
    }

    /**
     * Gets the uri of the obsel type
     * \return URL or undefined if the parent model is new or deleted 
     * \public
     */
    get uri() {
        if((this.parent_model.lifecycleStatus == "exists") || (this.parent_model.lifecycleStatus == "modified")) {
            if(!this._uri) {
                let rawID = this._JSONData["@id"];
                this._uri = this.parent_model.resolve_link_uri(rawID);
            }

            return this._uri;
        }
        else
            return undefined;
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
     * Gets the super obsel types of the current obsel type
     * \return Array of ObselType
     * \public
     */
    get super_obsel_types() {
        if(!this._super_obsel_types) {
            this._super_obsel_types = new Array();

            if(this._JSONData["hasSuperObselType"]) {
                if(this._JSONData["hasSuperObselType"] instanceof Array) {
                    for(let i = 0; i < this._JSONData["hasSuperObselType"].length; i++) {
                        const super_obsel_type_id = this._JSONData["hasSuperObselType"][i].substring(1);
                        this._super_obsel_types.push(this.parent_model.get_obsel_type(super_obsel_type_id));
                    }
                }
                else {
                    const super_obsel_type_id = this._JSONData["hasSuperObselType"].substring(1);
                    this._super_obsel_types.push(this.parent_model.get_obsel_type(super_obsel_type_id));
                }
            }
        }
        
        return this._super_obsel_types;
    }

    /**
     * Gets the rank of the current obsel type within its model inheritance hierarchy : 0 if the obsel type does not inherit from any other obsel type, 1 if it inherits from a rank 0 obsel type, 2 if it inherits from a rank 1 obsel type etc
     * \return int
     * \public
     */
    get types_hierarchy_rank() {
        if(this.super_obsel_types.length > 0) {
            const super_types_ranks = new Array();

            for(let i = 0; i < this.super_obsel_types.length; i++)
                super_types_ranks.push(this.super_obsel_types[i].types_hierarchy_rank);

            return Math.max(...super_types_ranks) + 1;
        }
        else
            return 0;
    }

    /**
     * Sets the super obsel types of the current obsel type
     * \param Array of ObselType new_super_obsel_types the new super obsel types for the current obsel type
     * \throws TypeError if the provided argument is not an Array of ObselType
     * \throws KtbsError if at least one ObselType instances in the provided Array does not belong to the same Model as the current ObselType
     * \public
     */
    set super_obsel_types(new_super_obsel_types) {
        if(new_super_obsel_types instanceof Array) {
            for(let i = 0; i < new_super_obsel_types.length; i++) {
                if(!(new_super_obsel_types[i] instanceof ObselType))
                    throw new TypeError("New value for super_obsel_types property must be an Array of ObselType");

                if(new_super_obsel_types[i].parentModel != this.parentModel)
                    throw new KtbsError("super_obsel_types must belong to the same Model as their descendant");
            }

            this._JSONData["hasSuperObselType"] = new Array();

            for(let i = 0; i < new_super_obsel_types.length; i++)
                this._JSONData["hasSuperObselType"].push("#" + new_super_obsel_types[i].id);

            if(this._super_obsel_types)
                delete this._super_obsel_types;

            if(this._available_attribute_types)
                delete this._available_attribute_types;
        }
        else
            throw new TypeError("New value for super_obsel_types property must be an Array of ObselType");
    }

    /**
     * Gets the default color (if defined) to use for representing Obsels of the current type
     * \return String
     * \public
     */
    get suggestedColor() {
        return this._JSONData["suggestedColor"];
    }

    /**
     * Sets the default color to use for representing Obsels of the current type
     * \param String new_suggestedColor - the new default color as a valid HTML/CSS color (hexadecimal, color name etc ...)
     * \public
     */
    set suggestedColor(new_suggestedColor) {
        this._JSONData["suggestedColor"] = new_suggestedColor;
    }

    /**
     * Gets the default symbol tu use for representing Obsels of the current type
     * \return String
     * \public
     */
    get suggestedSymbol() {
        return this._JSONData["suggestedSymbol"];
    }

    /**
     * Sets the default symbol tu use for representing Obsels of the current type
     * \param String suggestedSymbol the new default symbol as a character (Unicode supported)
     * \public
     */
    set suggestedSymbol(new_suggestedSymbol) {
        this._JSONData["suggestedSymbol"] = new_suggestedSymbol;
    }

    /**
	 * Gets the labels translations array
	 * \return Array
	 * \public
	 */
	get label_translations() {
		const labelKeys = ["label", "http://www.w3.org/2000/01/rdf-schema#label", "rdfs:label"];

		for(let i = 0; i < labelKeys.length; i++)
			if(this._JSONData[labelKeys[i]] && (this._JSONData[labelKeys[i]] instanceof Object))
				return this._JSONData[labelKeys[i]];

		return undefined;
	}

    /**
	 * Returns a user-friendly label
	 * \return String
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
	 * 
	 */
	get_preferred_label(lang) {
		let preferred_label = this.get_translated_label(lang);

		if(!preferred_label)
			preferred_label = this.label;

		if(!preferred_label)
			preferred_label = this.id;

		return preferred_label;
	}

	/**
	 * Gets the label for a given language, or the default label if no translated label has been found, or undefined if no default label has been found
	 * \param String lang - a short code for the language we want the label translated into
	 * \return String
     * \public
	 */
	get_translated_label(lang) {
        const labelKeys = ["label", "http://www.w3.org/2000/01/rdf-schema#label", "rdfs:label"];

        for(let i = 0; i < labelKeys.length; i++) {
            const labelTranslations = this._JSONData[labelKeys[i]];

            if(labelTranslations instanceof Array) {
                for(let i = 0; i < labelTranslations.length; i++) {
                    let aLabelTranslation = labelTranslations[i];

                    if((aLabelTranslation instanceof Object) && (aLabelTranslation["@language"] == lang))
                        return aLabelTranslation["@value"];
                }
            }
            else if(
                    (labelTranslations instanceof Object)
                &&	labelTranslations["@language"]
                &&	labelTranslations["@value"]
                && 	(labelTranslations["@language"] == lang)
            )
                return labelTranslations["@value"];
        }

        return undefined;
	}

	/**
	 * Set a user-friendly label.
	 * \param String label - The new label for the resource
     * \public
	 */
	set label(new_label) {
        this._JSONData["label"] = new_label;
        this._label = new_label;
	}

	/**
	 * Sets a translation for the label in a given language
	 * \param String label - the translated label
	 * \param String lang - a short code for the language the label is translated in
     * \public
	 */
	set_translated_label(label, lang) {
		let currentLabel = this.label;
		let newLabel;

		if(currentLabel instanceof String) {
			newLabel = new Array();
			newLabel.push({"@language": "en", "@value": currentLabel});
		}
		else if(currentLabel instanceof Array)
			newLabel = currentLabel;
		else
            newLabel = new Array();

        newLabel.push({"@language": lang, "@value": label})
		this.label = newLabel;
	}

    /**
	 * Gets the "comment" of the resource
	 * \return String
     * \public
	 */
	get comment() {
		return this._JSONData["http://www.w3.org/2000/01/rdf-schema#comment"];
	}

	/**
	 * Sets the "comment" of the resource
	 * \param String comment - the new comment for the resource
     * \public
	 */
	set comment(comment) {
		this._JSONData["http://www.w3.org/2000/01/rdf-schema#comment"] = comment;
    }

    /**
     * Gets the attribute types directly associated with the current ObselType in its belonging Model. Note that this does not include attribute types inherited from super ObselTypes, nor builtin AttributeTypes. To get the full list of available attribute types, use "available_attribute_types" property.
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

                    if(anAttributeType.isAssignedToObselType(this))
                        this._attribute_types.push(anAttributeType);
                }
            }
        }

        return this._attribute_types;
    }

    /**
     * Sets the attribute types directly associated with the current ObselType
     * \param Array of AttributeType new_attribute_types - the new attribute types associated with the current ObselType
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

            if(this._available_attribute_types)
                delete this._available_attribute_types;
        }
        else
            throw new TypeError("New value for attribute_types property must be an array of AttributeType.");
    }

    /**
     * Gets the full list of attribute types available for the current ObselType, including builtin attribute types and attribute types inherited from super obsel types.
     * \return Array of AttributeType
     * \public
     * \readonly
     */
    get available_attribute_types() {
        if(!this._available_attribute_types) {
            let unfilteredAttributes = new Array();

            if(this.super_obsel_types.length > 0) {
                for(let i = 0; i < this.super_obsel_types.length; i++)
                    unfilteredAttributes = unfilteredAttributes.concat(this.super_obsel_types[i].available_attribute_types);
            }
            else
                unfilteredAttributes = AttributeType.builtin_attribute_types;
            
            unfilteredAttributes = unfilteredAttributes.concat(this.attribute_types);
            this._available_attribute_types = new Array(...new Set(unfilteredAttributes));
        }

        return this._available_attribute_types;
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

    /**
	 * 
	 */
	clone() {
		// we use this weird JSON.parse+JSON.stringify trick in order to easily make a deep copy of the data
		const clonedJSONData = JSON.parse(JSON.stringify(this._JSONData));
		const clone = new ObselType(this._parentModel, clonedJSONData);
        return clone;
	}
}