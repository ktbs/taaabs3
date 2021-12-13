import {Resource} from "./Resource.js";
import {Base} from "./Base.js";
import {ObselType} from "./ObselType.js";
import {AttributeType} from "./AttributeType.js";
import {ResourceMultiton} from "./ResourceMultiton.js";
import {Stylesheet} from "./Stylesheet.js";
import {KtbsError} from "./Errors.js";

/**
 * Class for the "Model" resource type
 */
export class Model extends Resource {

	/**
	 * Constructor
	 * \param URL or string uri - the resource's URI
	 * \public
	 */
	constructor(uri) {
		super(uri);
		this._JSONData["@graph"] = [{"@type": "TraceModel"}];

		/**
		 * Obsel type instances of the the Model
		 * \var Array
		 * \protected
		 */
		this._obsel_types = null;

		/**
		 * Attribute type instances of the the Model
		 * \var Array
		 * \protected
		 */
		this._attribute_types = null;

		/**
		 * The rank of the portion of the resource's JSON data that describes the model itself
		 * \var int
		 * \protected
		 */
		this._model_own_graph_rank = null;

		/**
		 * The portion of the resource's JSON data that describes the model itself
		 * \var Object
		 * \protected
		 */
		this._model_own_graph = null;
	}

	/**
	 * Gets the rank of the data graph in which are described general information for the Model itself (as the resource may contain other data graphes describing ObselTypes and AttributeTypes)
	 * \return int
	 * \protected
	 */
	_get_model_own_graph_rank() {
		if(this._model_own_graph_rank == null) {
			let graphs = this._JSONData["@graph"];

			if(graphs instanceof Object) {
				for(let i = 0; (i < graphs.length); i++) {
					let aGraph = graphs[i];

					if(aGraph["@type"] == "TraceModel") {
						this._model_own_graph_rank = i;
						break;
					}
				}
			}
		}

		return this._model_own_graph_rank;
	}

	/**
	 * Gets the data graph in which are described general information for the Model itself (as the resource may contain other data graphes describing ObselTypes and AttributeTypes)
	 * \return Object
	 * \protected
	 */
	_get_model_own_graph() {
		let modelOwnGraphRank = this._get_model_own_graph_rank();

		if(modelOwnGraphRank != null)
			return this._JSONData["@graph"][modelOwnGraphRank];
		else
			return undefined;
	}

	/**
	 * Gets the data to be sent in PUT or POST queries
	 * \return Object
	 * \protected
	 */
	_getJSONData() {
		let postData = {"@graph" : [this._get_model_own_graph()]};

		for(let i = 0; i <  this.obsel_types.length; i++)
			postData["@graph"].push(this.obsel_types[i]._getPostData());
	
		for(let i = 0; i < this.attribute_types.length; i++)
			postData["@graph"].push(this.attribute_types[i]._getPostData());

		return postData;
	}

	/**
	 * Gets the data to be send in a PUT query
	 * \return Object
	 * \protected
	 */
	_getPutData() {
		return this._getJSONData();
	}

	/**
	 * Gets the data to be sent in POST queries
	 * \return Object
	 * \protected
	 */
	_getPostData() {
		return this._getJSONData();
	}

	/**
	 * Gets the ID of this resource, relative to its parent resource URI.
	 * \return string
	 * \public
	 */
	get id() {
		let ownGraph = this._get_model_own_graph();

		if(ownGraph["@id"])
			return Resource.extract_relative_id(ownGraph["@id"]);
		else if(this._uri)
			return Resource.extract_relative_id(this._uri.toString());
		else
			return undefined;
	}

	/**
	 * Sets the ID of this resource, relative to its parent resource URI.
	 * \param string id - the new ID for the resource.
	 * \throws Error Throws an Error if we try to set the ID of a resource that already exists on a kTBS service.
	 * \public
	 */
	set id(id) {
		if(this.syncStatus == "needs_sync")
			this._JSONData["@graph"][this._get_model_own_graph_rank()]["@id"] = id;
		else
			throw new KtbsError("Resource's ID can not be changed anymore");
	}

	/**
	 * Returns a user-friendly label
	 * \return string
	 * \public
	 */
	get label() {
		let modelOwnGraph = this._get_model_own_graph();

		if(modelOwnGraph && modelOwnGraph["label"])
			return modelOwnGraph["label"];
		else
			return undefined;
	}

	/**
	 * Set a user-friendly label.
	 * \param string new_label - the new label for the Model
	 * \public
	 */
	set label(new_label) {
		let modelOwnGraphRank = this._get_model_own_graph_rank();
		this._JSONData["@graph"][modelOwnGraphRank]["label"] = new_label;
	}

	/**
	 * Gets the labels translations array
	 * \return Array
	 * \public
	 */
	get label_translations() {
		let modelOwnGraph = this._get_model_own_graph();
		const labelKeys = ["label", "http://www.w3.org/2000/01/rdf-schema#label", "rdfs:label"];

		for(let i = 0; i < labelKeys.length; i++)
			if(modelOwnGraph[labelKeys[i]] && (modelOwnGraph[labelKeys[i]] instanceof Object))
				return modelOwnGraph[labelKeys[i]];

		return undefined;
	}

	/**
	 * Sets the labels translations array
	 * \param Array newValue
	 * \public
	 */
	set label_translations(newValue) {
		let modelOwnGraphRank = this._get_model_own_graph_rank();
		this._JSONData["@graph"][modelOwnGraphRank]["http://www.w3.org/2000/01/rdf-schema#label"] = newValue;
	}

	/**
	 * Gets the "comment" of the resource
	 * \return string
	 * \public
	 */
	get comment() {
		if(!this._comment) {
			let modelOwnGraph = this._get_model_own_graph();

			if(modelOwnGraph)
				this._comment = modelOwnGraph["http://www.w3.org/2000/01/rdf-schema#comment"];
		}

		return this._comment;
	}

	/**
	 * Set the "comment" for the resource
	 * \param string new_comment - the new comment for the Model
	 * \public
	 */
	set comment(new_comment) {
		let modelOwnGraphRank = this._get_model_own_graph_rank();
		this._JSONData["@graph"][modelOwnGraphRank]["http://www.w3.org/2000/01/rdf-schema#comment"] = new_comment;
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
	 * Gets the label for a given language
	 * \param string lang a short code for the language we want the label translated into
	 * \return string the translated label, or the default label if no translated label has been found (which can be "undefined" if it hasn't been set)
	 * \public
	 */
	get_translated_label(lang) {
		let modelOwnGraph = this._get_model_own_graph();
		const labelKeys = ["label", "http://www.w3.org/2000/01/rdf-schema#label", "rdfs:label"];

        for(let i = 0; i < labelKeys.length; i++) {
            const labelTranslations = modelOwnGraph[labelKeys[i]];

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
	 * Sets a translation for the label in a given language
	 * \param string label the translated label
	 * \param string lang a short code for the language the label is translated in
	 * \public
	 */
	set_translated_label(label, lang) {
		let modelOwnGraphRank = this._get_model_own_graph_rank();
		let label_translations, label_translations_key;

		if(this._JSONData["@graph"][modelOwnGraphRank]["http://www.w3.org/2000/01/rdf-schema#label"]) {
			label_translations = this._JSONData["@graph"][modelOwnGraphRank]["http://www.w3.org/2000/01/rdf-schema#label"];
			label_translations_key = "http://www.w3.org/2000/01/rdf-schema#label";
		}
		else if(this._JSONData["@graph"][modelOwnGraphRank]["rdfs:label"]) {
			label_translations = this._JSONData["@graph"][modelOwnGraphRank]["rdfs:label"];
			label_translations_key = "rdfs:label";
		}
		else {
			label_translations = new Array();
			label_translations_key = "http://www.w3.org/2000/01/rdf-schema#label";
		}

		let existing_translation_replaced = false;

		for(let i = 0; !existing_translation_replaced && (i < label_translations.length); i++)
			if(label_translations[i]["@language"] == lang) {
				label_translations[i]["@value"] = label;
				existing_translation_replaced = true;
			}
	
		if(!existing_translation_replaced)
			label_translations.push({"@value": label, "@language": lang})
		
		this._JSONData["@graph"][modelOwnGraphRank][label_translations_key] = label_translations;
	}

	/**
	 * 
	 */
	get type() {
		return "Model";
	}

	/**
	 * Gets the parent resource of this resource.
	 * \return Resource
	 * \public
	 */
	get parent() {
		if(!this._parent) {
			let modelOwnGraph = this._get_model_own_graph();

			if(modelOwnGraph && modelOwnGraph.inBase)
				this._parent = ResourceMultiton.get_resource(Base, this.resolve_link_uri(modelOwnGraph.inBase));
		}

		return this._parent;
	}

	/**
	 * Gets the obsel types defined in the Model
	 * \return Array of ObselType
	 * \public
	 */
	get obsel_types() {
		if(!this._obsel_types) {
			this._obsel_types = new Array();
			let graphs = this._JSONData["@graph"];

			if(graphs instanceof Array) {
				for(let i = 0; i < graphs.length; i++) {
					let aGraph = graphs[i];

					if(aGraph["@type"] == "ObselType") {
						let obsel_type = new ObselType(this, aGraph);
						this._obsel_types.push(obsel_type);
					}
				}
			}
		}

		return this._obsel_types;
	}

	/**
	 * Sets the obsel types defined in the Model
	 * \param Array of ObselType new_obsel_types - the new obsel types defined in the Model
	 * \throws TypeError throws a TypeError if the provided argument is not an Array of ObselType
	 * \throws KtbsError throws a KtbsError if one of the ObselType provided as an argument does not belong to the current Model
	 * \public
	 */
	set obsel_types(new_obsel_types) {
		if(new_obsel_types instanceof Array) {
			// check validity of provided data
			for(let i = 0; i < new_obsel_types.length; i++)
				if(!(new_obsel_types[i] instanceof ObselType))
					throw new TypeError("New value for obsel_types property must be an array of ObselType");

			for(let i = 0; i < new_obsel_types.length; i++)
				if(
						!new_obsel_types[i].parent_model 
					|| (new_obsel_types[i].parent_model.uri != this.uri)
				)
					throw new KtbsError("ObselType does not belong to the current Model");
			// done

			// update cached array this._obsel_types
			this._obsel_types = new_obsel_types;
		}
		else
			throw new TypeError("New value for obsel_types property must be an array of ObselType");
	}

	/**
	 * Adds an ObselType to the Model
	 * \param ObselType obsel_type the ObselType to add to the Model
	 * \throws TypeError if the provided parameter is not an instance of ObselType
	 * \throws KtbsError if the ObselType belongs to another Model
	 * \throws KtbsError if the Model already has an ObselType with the same ID
	 * \public
	 */
	addObselType(obsel_type) {
		if(obsel_type instanceof ObselType) {
			if(	
					!obsel_type.parent_model
				||	(obsel_type.parent_model.uri == this.uri)
			) {
				if(!this.get_obsel_type(obsel_type.id)) {
					const model_obsel_types = this.obsel_types;
					model_obsel_types.push(obsel_type);
					this.obsel_types = model_obsel_types;
				}
				else
					throw new KtbsError("The Model already has an ObselType with the same ID");
			}
			else
				throw new KtbsError("The ObselType belongs to another Model");
		}
		else
			throw new TypeError("The provided parameter must be an instance of ObselType");
	}

	/**
	 * Removes an ObselType from the Model
	 * \param ObselType obsel_type the ObselType to remove from the Model
	 * \throws TypeError if the provided parameter is not an instance of ObselType
	 * \throws KtbsError if the Model does not contains the ObselType
	 * \public
	 */
	removeObselType(obsel_type) {
		if(obsel_type instanceof ObselType) {
			if(obsel_type.parent_model.uri == this.uri)
				this.removeObselTypeById(obsel_type.id);
			else
				throw new KtbsError("The ObselType does not belong to this Model");
		}
		else
			throw new TypeError("The provided parameter must be an instance of ObselType");
	}

	/**
	 * Removes the ObselType identified by the given ID from the Model
	 * \param string obsel_type_id the id of the ObselType to remove from the Model
	 * \throws KtbsError if the Model does not contains an ObselType with the specified ID
	 * \public
	 */
	removeObselTypeById(obsel_type_id) {
		const model_obsel_types = this.obsel_types;
		let obsel_type_id_found = false;

		for(let i = 0; i < model_obsel_types.length; i++)
			if(model_obsel_types[i].id == obsel_type_id) {
				model_obsel_types.splice(i, 1);
				obsel_type_id_found = true;
				break;
			}

		if(obsel_type_id_found)
			this.obsel_types = model_obsel_types;
		else
			throw new KtbsError("The Model does not contains any ObselType with the specified id");
	}

	/**
	 * Gets the obsel type with the given id from the current Model,  or null if no obsel type with the given obsel_type_id has been found in the model
	 * \param string obsel_type_id - the id of the obsel type we are looking for
	 * \return ObselType
	 * \public
	 */
	get_obsel_type(obsel_type_id) {
		let obsel_types = this.obsel_types;

		for(let i = 0; i < obsel_types.length; i++) {
			let obsel_type = obsel_types[i];

			if(obsel_type.id == obsel_type_id)
				return obsel_type;
		}

		return undefined;
	}

	/**
	 * Gets the attribute types defined in the Model
	 * \return Array of AttributeType
	 * \public
	 */
	get attribute_types() {
		if(!this._attribute_types) {
			this._attribute_types = new Array();
			let graphs = this._JSONData["@graph"];

			if(graphs instanceof Array) {
				for(let i = 0; i < graphs.length; i++) {
					let aGraph = graphs[i];

					if(aGraph["@type"] == "AttributeType") {
						let attribute_type = new AttributeType(this, aGraph);
						this._attribute_types.push(attribute_type);
					}
				}
			}
		}

		return this._attribute_types;
	}

	/**
	 * Sets the attribute types defined in the Model
	 * \param Array of AttributeType new_attribute_types - the new attribute types defined in the Model
	 * \throws TypeError throws a TypeError if the provided argument is not an Array of AttributeType
	 * \throws KtbsError throws a KtbsError if one of the AttributeType provided as an argument does not belong to the current Model
	 * \public
	 */
	set attribute_types(new_attribute_types) {
		if(new_attribute_types instanceof Array) {
			// check validity of provided data
			for(let i = 0; i < new_attribute_types.length; i++)
				if(!(new_attribute_types[i] instanceof AttributeType))
					throw new TypeError("New value for attribute_types property must be an array of AttributeType");

			for(let i = 0; i < new_attribute_types.length; i++)
				if(
						!new_attribute_types[i].parent_model
					|| (new_attribute_types[i].parent_model.uri != this.uri)
				)
					throw new KtbsError("AttributeType does not belong to the current Model");
			// done

			// update cached array this._attribute_types
			this._attribute_types = new_attribute_types;
		}
		else
			throw new TypeError("New value for attribute_types property must be an array of AttributeType");
	}

	/**
	 * Adds an AttributeType to the Model
	 * \param AttributeType attribute_type the AttributeType to add to the Model
	 * \throws TypeError if the provided parameter is not an instance of AttributeType
	 * \throws KtbsError if the AttributeType belongs to another Model
	 * \throws KtbsError if the Model already has an AttributeType with the same ID
	 * \public
	 */
	addAttributeType(attribute_type) {
		if(attribute_type instanceof AttributeType) {
			if(	
					!attribute_type.parent_model
				||	(attribute_type.parent_model.uri == this.uri)
			) {
				if(!this.get_attribute_type(attribute_type.id)) {
					const model_attribute_types = this.attribute_types;
					attribute_type.parent_model = this;
					model_attribute_types.push(attribute_type);
					this.attribute_types = model_attribute_types;
				}
				else
					throw new KtbsError("The Model already has an AttributeType with the same ID");
			}
			else
				throw new KtbsError("The AttributeType belongs to another Model");
		}
		else
			throw new TypeError("The provided parameter must be an instance of AttributeType");
	}

	/**
	 * Removes an AttributeType from the Model
	 * \param AttributeType attribute_type the AttributeType to remove from the Model
	 * \throws TypeError if the provided parameter is not an instance of AttributeType
	 * \throws KtbsError if the Model does not contains the AttributeType
	 * \public
	 */
	removeAttributeType(attribute_type) {
		if(attribute_type instanceof AttributeType) {
			if(attribute_type.parent_model.uri == this.uri)
				this.removeAttributeTypeById(attribute_type.id);
			else
				throw new KtbsError("The AttributeType does not belong to this Model");
		}
		else
			throw new TypeError("The provided parameter must be an instance of AttributeType");
	}

	/**
	 * Removes the AttributeType identified by the given ID from the Model
	 * \param string attribute_type_id the id of the AttributeType to remove from the Model
	 * \throws KtbsError if the Model does not contains an AttributeType with the specified ID
	 * \public
	 */
	removeAttributeTypeById(attribute_type_id) {
		const model_attribute_types = this.attribute_types;
		let attribute_type_id_found = false;

		for(let i = 0; i < model_attribute_types.length; i++)
			if(model_attribute_types[i].id == attribute_type_id) {
				model_attribute_types.splice(i, 1);
				attribute_type_id_found = true;
				break;
			}

		if(attribute_type_id_found)
			this.attribute_types = model_attribute_types;
		else
			throw new KtbsError("The Model does not contains any AttributeType with the specified id");
	}

	/**
	 * Gets the attribute type with the given id from the current Model,  or null if no attribute type with the given attribute_type_id has been found in the model
	 * \param string attribute_type_id the id of the attribute type we are looking for
	 * \return AttributeType
	 * \public
	 */
	get_attribute_type(attribute_type_id) {
		let attribute_types = this.attribute_types;

		for(let i = 0; i < attribute_types.length; i++) {
			let attribute_type = attribute_types[i];

			if(attribute_type.id == attribute_type_id)
				return attribute_type;
		}

		return undefined;
	}

	/**
	 * Gets the user stylesheets defined in the Model
	 * \return Array of Stylesheet
	 * \public
	 */
	get stylesheets() {
		if(!this._styleSheets) {
			this._styleSheets = new Array();
			const graphs = this._JSONData["@graph"];

			if(graphs instanceof Object) {
				for(let i = 0; (i < graphs.length); i++) {
					const graph = graphs[i];

					if((graph["@type"]) && (graph["@type"] == "TraceModel") && (graph["http://www.example.com/TODO#ModelStylesheets"])) {
						const styleSheetsData = graph["http://www.example.com/TODO#ModelStylesheets"];
						
						if(styleSheetsData instanceof Array) {
							for(let i = 0; i < styleSheetsData.length; i++) {
								const aStyleSheetData = styleSheetsData[i];
								this._styleSheets.push(new Stylesheet(JSON.parse(aStyleSheetData)));
							}
						}
						else
							this._styleSheets.push(new Stylesheet(JSON.parse(styleSheetsData)));
					}
				}
			}
		}

		return this._styleSheets;
	}

	/**
	 * Sets the user stylesheets defined in the Model
	 * \param Array of Stylesheet new_stylesheets
	 * \throws TypeError throws a TypeError if the provided argument is not an Array of Stylesheet
	 * \public
	 */
	set stylesheets(new_stylesheets) {
		if(new_stylesheets instanceof Array) {
			for(let i = 0; i < new_stylesheets.length; i++)
				if(!(new_stylesheets[i] instanceof Stylesheet))
					throw new TypeError("Argument must be an array of Stylesheet");

			const graphs = this._JSONData["@graph"];

			if(graphs instanceof Object) {
				for(let i = 0; (i < graphs.length); i++) {
					const graph = graphs[i];

					if((graph["@type"]) && (graph["@type"] == "TraceModel")) {
						let new_stylesheets_data = new Array();

						for(let i = 0; i < new_stylesheets.length; i++)
							new_stylesheets_data.push(JSON.stringify(new_stylesheets[i]._JSONData));

						this._JSONData["@graph"][i]["http://www.example.com/TODO#ModelStylesheets"] = new_stylesheets_data;
						break;
					}
				}
			}

			this._styleSheets = new_stylesheets;
		}
		else
			throw new TypeError("Argument must be an array of Stylesheet");
	}

	/**
	 * Stores a new resource as a child of the current resource
	 * \throws KtbsError always throws a KtbsError when invoked for a Model as it is not a container resource
	 * \public
	 */
	post(new_child_resource, abortSignal = null, credentials = null) {
		throw new KtbsError("Only Ktbs roots, Bases and Traces can contain child resources");
	}

	/**
	 * Resets the calculated data temporarily stored in memory as instance variables. Descendant classes that add such variables should override this method, reset their own-level variables and then call super._resetCalculatedData()
	 * \public
	 */
	_resetCalculatedData() {
		if(this._model_own_graph_rank)
			this._model_own_graph_rank = null;

		if(this._comment)
			delete this._comment;

		if(this._parent)
			this._parent = undefined;

		if(this._obsel_types)
			delete this._obsel_types;

		if(this._attribute_types)
			delete this._attribute_types;

		if(this._styleSheets)
			delete this._styleSheets;
			
		super._resetCalculatedData();
	}
}
