import {Model} from "./Model.js";
import {ObselType} from "./ObselType.js";
import {KtbsError} from "./Errors.js";

/**
 * Class for attribute types. Please note that this class is NOT a descendant from "Resource". Therefore, AttributeType instances don't support get/put/post/delete as attribute types data management is the responsibility of their respective parent Model instance.
 */
export class AttributeType {

	/**
	 * Prefix for the builtin attributes URIs
	 * \var String
	 * \static
	 * \public
	 */
	static builtin_attribute_types_prefix = "http://liris.cnrs.fr/silex/2009/ktbs#";

	/**
	 * An array listing the attribute types IDs that are "system" attribute types
	 * \var Array
	 * \static
	 * \public
	 */
	static system_types_ids = ["@id", "@context", "@type", "hasSourceObsel", "hasTrace"];

    /**
     * Constructor for class AttributeType
     * \param Model parentModel - the model the AttributeType is described in
     * \param Object JSONData - the JSON data describing the AttributeType
	 * \public
     */
    constructor(parentModel = null, JSONData = {"@type": "AttributeType"}) {

        /**
         * The model the AttributeType is described in
         * \var Model
		 * \protected
         */
        this._parentModel = parentModel;

        /**
         * The JSON data object containing the AttributeType's description
         * \var Object
		 * \protected
         */
        this._JSONData = JSONData;
    }

    /**
     * Gets the relative id of the attribute type (relative to parent Model)
	 * \return string
	 * \public
     */
    get id() {
		if(!this._id) {
			if(this._JSONData["@id"].startsWith("#"))
				this._id = this._JSONData["@id"].substring(1);
			else
				this._id = this._JSONData["@id"];
		}

		return this._id;
    }

    /**
     * Sets the relative id of the attribute type in it's parent Model
     * \param string id - the new id for the attribute type
	 * \public
     */
    set id(new_id) {
		this._JSONData["@id"] = '#' + encodeURIComponent(new_id);
		this._id = new_id;
    }

    /**
     * Gets the uri of the attribute type
     * \return URL
	 * \public
     */
    get uri() {
		if(!this._uri) {
			if(this.is_builtin)
				this._uri = new URL(AttributeType.builtin_attribute_types_prefix + this._JSONData["real_id"]);
			else
				this._uri = this.parent_model.resolve_link_uri(this._JSONData["@id"]);
		}

		return this._uri;
	}
	
	/**
	 * 
	 * \return Boolean
	 * \public
	 */
	get is_builtin() {
		return (
				this._JSONData["@id"]
			&&	AttributeType.builtin_attribute_types_ids.includes(this._JSONData["@id"])
		);
	}

    /**
     * Gets the model the AttributeType is described in
     * \return Model
	 * \public
     */
    get parent_model() {
        return this._parentModel;
	}
	
	/**
	 * Sets the parent model where the AttributeType is described
	 * \param Model new_parent_model - the new parent model for the AttributeType
	 * \public
	 */
	set parent_model(new_parent_model) {
		if(new_parent_model instanceof Model)
			this._parentModel = new_parent_model;
		else
			throw new TypeError("New value for parent_model property must be of type Model.");
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
	 * Gets the label for a given language
	 * \param string lang - a short code for the language we want the label translated into
	 * \return string the translated label, or the default label if no translated label has been found, or undefined if no default label has been found
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
	 * \param string new_label - the new label for the resource
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
	 * Checks if the current AttributeType applies to an obsel type provided as an argument
	 * \param ObselType - obsel_type the obsel type we want to check if the current AttributeType applies to
	 * \return boolean
	 * \public
	 */
	appliesToObselType(obsel_type) {
		let applies = false;

		if(this.is_builtin)
			applies = true;
		else if(this.parent_model && (this.parent_model == obsel_type.parent_model))
			for(let i = 0; !applies && (i < obsel_type.available_attribute_types.length); i++)
				applies = (this.id == obsel_type.available_attribute_types[i].id);

		return applies;
	}

	/**
	 * Checks if the current AttributeType is directly assigned (ignoring inheritance and builtin attribute types) to an obsel type provided as an argument
	 * \param ObselType - obsel_type the obsel type we want to check if the current AttributeType is assigned to
	 * \return boolean
	 * \public
	 */
	isAssignedToObselType(obsel_type) {
		let assigned = false;

		if(!this.is_builtin && this.parent_model && (this.parent_model == obsel_type.parent_model))
			for(let i = 0; !assigned && (i < this.obsel_types.length); i++)
				assigned = (this.obsel_types[i].id == obsel_type.id);

		return assigned;
	}

	/**
	 * Get the obsel types the AttributeType is assigned to
	 * \return Array of ObselType
	 * \public
	 */
	get obsel_types() {
		if(!this._obsel_types) {
			if(this._parentModel) {
				this._obsel_types = new Array();
				
				if(this._JSONData["hasAttributeObselType"] instanceof Array) {
					for(let i = 0; i < this._JSONData["hasAttributeObselType"].length; i++) {
						let obselType_link = this._JSONData["hasAttributeObselType"][i];
						let obselType_uri = this._parentModel.resolve_link_uri(obselType_link);
						let obselType_id = decodeURIComponent(obselType_uri.hash.substring(1));
						let obselType = this._parentModel.get_obsel_type(obselType_id);

						if(obselType)
							this._obsel_types.push(obselType);
					}
				}
			}
			else if(this._JSONData["hasAttributeObselType"] instanceof Array)
				throw new KtbsError("Obsel types linked to the AttributeType cannot be retrieved before the AttributeType's parent Model has been set.");
			else
				this._obsel_types = new Array();
		}

		return this._obsel_types;
	}

	/**
	 * Sets the obsel types the AttributeType is assigned to
	 * \param Array of ObselType new_obsel_types - the new obsel types the AttributeType is assigned to
	 * \throws TypeError throws a TypeError if the provided argument is not an Array of ObselType
	 * \public
	 */
	set obsel_types(new_obsel_types) {
		if(new_obsel_types instanceof Array) {
			for(let i = 0; i < new_obsel_types.length; i++)
				if(!(new_obsel_types[i] instanceof ObselType))
					throw new TypeError("New value for obsel_types property must be an array of ObselType");

			this._JSONData["hasAttributeObselType"] = new Array();

			for(let i = 0; i < new_obsel_types.length; i++)
				this._JSONData["hasAttributeObselType"].push(new_obsel_types[i].id);

			this._obsel_types = new_obsel_types;
		}
		else
			throw new TypeError("New value for obsel_types property must be an array of ObselType");
	}

	/**
	 * Gets the data types allowed for this AttributeType
	 * \return Array of string
	 * \public
	 */
	get data_types() {
		if(!this._data_types) {
			if(this._JSONData["hasAttributeDatatype"] instanceof Array)
				this._data_types = this._JSONData["hasAttributeDatatype"];
			else
				this._data_types = new Array();
		}

		return this._data_types;
	}

	/**
	 * Sets the data types allowed for this AttributeType
	 * \param Array new_data_types - the new data types allowed for this AttributeType
	 * \throws TypeError throws a TypeError if the provided argument is not an Array
	 * \public
	 */
	set data_types(new_data_types) {
		if(new_data_types instanceof Array) {
			this._JSONData["hasAttributeDatatype"] = new_data_types;
			this._data_types = new_data_types;
		}
		else
			throw new TypeError("New value for data_types property must be an array");
	}

	/**
     * Gets the data to be sent for this resource to be POSTed to a parent one
	 * \return Object
	 * \protected
     */
    _getPostData() {
		if(this._parentModel) {
			let postData = this._JSONData;
			postData["@id"] = this._parentModel.id + postData["@id"];

			if(this.data_types && (this.data_types.length > 0))
				postData["hasAttributeDatatype"] = this.data_types;

			if(this.obsel_types && (this.obsel_types.length > 0)) {
				postData["hasAttributeObselType"] = new Array();

				for(let i = 0; i < this.obsel_types.length; i++)
					postData["hasAttributeObselType"].push(this._parentModel.id + "#" + this.obsel_types[i].id);
			}

			return postData;
		}
		else
			throw new KtbsError("AttributeType POST data cannot be built before the AttributeType's parent model has been set");
	}
	
	/**
	 * Gets the list of the builtin attribute types
	 * \return Array of AttributeType
	 * \static
	 * \public
	 */
	static get builtin_attribute_types() {
		if(!AttributeType._builtin_attribute_types) {
			AttributeType._builtin_attribute_types = [
				new AttributeType(null, {
					"@id": "begin",
					"real_id": "hasBegin",
					"@type": "AttributeType",
					"http://www.w3.org/2000/01/rdf-schema#label": [
						{
							"@language": "en",
							"@value": "Begin timestamp"
						},
						{
							"@language": "fr",
							"@value": "Timestamp de début"
						}
					],
					"hasAttributeDatatype": ["xsd:integer"]
				}),
				new AttributeType(null, {
					"@id": "beginDT",
					"real_id": "hasBeginDT",
					"@type": "AttributeType",
					"http://www.w3.org/2000/01/rdf-schema#label": [
						{
							"@language": "en",
							"@value": "Begin date time"
						},
						{
							"@language": "fr",
							"@value": "Date et heure de début"
						}
					],
					"hasAttributeDatatype": ["xsd:dateTime"]
				}),
				new AttributeType(null, {
					"@id": "end",
					"real_id": "hasEnd",
					"@type": "AttributeType",
					"http://www.w3.org/2000/01/rdf-schema#label": [
						{
							"@language": "en",
							"@value": "End timestamp"
						},
						{
							"@language": "fr",
							"@value": "Timestamp de fin"
						}
					],
					"hasAttributeDatatype": ["xsd:integer"]
				}),
				new AttributeType(null, {
					"@id": "endDT",
					"real_id": "hasEndDT",
					"@type": "AttributeType",
					"http://www.w3.org/2000/01/rdf-schema#label": [
						{
							"@language": "en",
							"@value": "End date time"
						},
						{
							"@language": "fr",
							"@value": "Date et heure de fin"
						}
					],
					"hasAttributeDatatype": ["xsd:dateTime"]
				}),
				new AttributeType(null, {
					"@id": "subject",
					"real_id": "hasSubject",
					"@type": "AttributeType",
					"http://www.w3.org/2000/01/rdf-schema#label": [
						{
							"@language": "en",
							"@value": "Subject"
						},
						{
							"@language": "fr",
							"@value": "Sujet"
						}
					]
				})
			];
		}

		return AttributeType._builtin_attribute_types;
	}

	/**
	 * Gets a builtin attribute type by its ID
	 * \param String builtin_attribute_type_id the ID of the builtin attribute type we want
	 * \return AttributeType
	 * \static
	 * \public
	 */
	static get_builtin_attribute_type(builtin_attribute_type_id) {
		let attribute_type = undefined;

		for(let i = 0; !attribute_type && (i < AttributeType.builtin_attribute_types.length); i++)
			if(AttributeType.builtin_attribute_types[i].id == builtin_attribute_type_id)
				attribute_type = AttributeType.builtin_attribute_types[i];

		return attribute_type;
	}

	/**
	 * Gets a builtin attribute type by its ID
	 * \param String builtin_attribute_type_real_id the real ID of the builtin attribute type we want
	 * \return AttributeType
	 * \static
	 * \public
	 */
	static get_builtin_attribute_type_by_real_id(builtin_attribute_type_real_id) {
		let attribute_type = undefined;

		for(let i = 0; !attribute_type && (i < AttributeType.builtin_attribute_types.length); i++)
			if(AttributeType.builtin_attribute_types[i]._JSONData["real_id"] == builtin_attribute_type_real_id)
				attribute_type = AttributeType.builtin_attribute_types[i];

		return attribute_type;
	}

	/**
	 * Gets the lists of the builtin attribute types IDs 
	 * \var Array of String
	 * \static
	 * \public
	 */
	static get builtin_attribute_types_ids() {
		if(!AttributeType._builtin_attribute_types_ids) {
			AttributeType._builtin_attribute_types_ids = new Array();

			for(let i = 0; i < AttributeType.builtin_attribute_types.length; i++)
				AttributeType._builtin_attribute_types_ids.push(AttributeType.builtin_attribute_types[i].id);
		}

		return AttributeType._builtin_attribute_types_ids;
	}
}