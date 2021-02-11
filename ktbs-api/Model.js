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
		if(this._model_own_graph == null) {
			let modelOwnGraphRank = this._get_model_own_graph_rank();

			if(modelOwnGraphRank != null)
				this._model_own_graph = this._JSONData["@graph"][modelOwnGraphRank];
		}

		return this._model_own_graph;
	}

	/**
	 * Gets the data to be sent in POST queries
	 * \return Object
	 * \protected
	 */
	_getPostData() {
		let postData = {"@graph" : [this._get_model_own_graph()]};

		for(let i = 0; i <  this.obsel_types.length; i++) {
			if(!(this.obsel_types[i].parent_model))
				this.obsel_types[i].parent_model = this;

			for(let j = 0; j < this.obsel_types[i].attribute_types.length; j++) {
				if(!(this.obsel_types[i].attribute_types[j].parent_model))
					this.obsel_types[i].attribute_types[j].parent_model = this;

				if(!(this.obsel_types[i].attribute_types[j].obsel_types.includes(this.obsel_types[i])))
					this.obsel_types[i].attribute_types[j].obsel_types.push(this.obsel_types[i]);

				if(!(this.attribute_types.includes(this.obsel_types[i].attribute_types[j])))
					this.attribute_types.push(this.obsel_types[i].attribute_types[j]);
			}

			postData["@graph"].push(this.obsel_types[i]._getPostData());
		}
	
		for(let i = 0; i < this.attribute_types.length; i++) {
			if(!(this.attribute_types[i].parent_model))
				this.attribute_types[i].parent_model = this;

			postData["@graph"].push(this.attribute_types[i]._getPostData());
		}

		return postData;
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
		if(!this._label) {
			let modelOwnGraph = this._get_model_own_graph();

			if(modelOwnGraph && modelOwnGraph["label"])
				this._label = modelOwnGraph["label"];
		}
		
		return this._label;
	}

	/**
	 * Set a user-friendly label.
	 * \param string new_label - the new label for the Model
	 * \public
	 */
	set label(new_label) {
		let modelOwnGraphRank = this._get_model_own_graph_rank();
		this._JSONData["@graph"][modelOwnGraphRank]["label"] = new_label;
		this._label = new_label;
	}

	/**
	 * Gets the labels translations array
	 * \return Array
	 * \public
	 */
	get label_translations() {
		let modelOwnGraph = this._get_model_own_graph();
		return modelOwnGraph["http://www.w3.org/2000/01/rdf-schema#label"];
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
		this._label = new_comment;
	}

	/**
	 * Gets the label for a given language
	 * \param string lang a short code for the language we want the label translated into
	 * \return string the translated label, or the default label if no translated label has been found (which can be "undefined" if it hasn't been set)
	 * \public
	 */
	get_translated_label(lang) {
		let modelOwnGraph = this._get_model_own_graph();
		let labelTranslations = modelOwnGraph["http://www.w3.org/2000/01/rdf-schema#label"];

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
		let label_translations;

		if(this._JSONData["@graph"][modelOwnGraphRank]["http://www.w3.org/2000/01/rdf-schema#label"])
			label_translations = this._JSONData["@graph"][modelOwnGraphRank]["http://www.w3.org/2000/01/rdf-schema#label"];
		else
			label_translations = new Array();

		let existing_translation_replaced = false;

		for(let i = 0; !existing_translation_replaced && (i < label_translations.length); i++)
			if(label_translations[i]["@language"] == lang) {
				label_translations[i]["@value"] = label;
				existing_translation_replaced = true;
			}
	
		if(!existing_translation_replaced)
			label_translations.push({"@value": label, "@language": lang})
		
		this._JSONData["@graph"][modelOwnGraphRank]["http://www.w3.org/2000/01/rdf-schema#label"] = label_translations;
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
	 * \throws KtbsError throws a KtbsError if one of the ObselType provided as an argument belongs to an other Model
	 * \public
	 */
	set obsel_types(new_obsel_types) {
		if(new_obsel_types instanceof Array) {
			for(let i = 0; i < new_obsel_types.length; i++)
				if(!(new_obsel_types[i] instanceof ObselType))
					throw new TypeError("New value for obsel_types property must be an array of ObselType");

			for(let i = 0; i < new_obsel_types.length; i++)
				if(new_obsel_types[i].parent_model && (new_obsel_types[i].parent_model != this))
					throw new KtbsError("Cannot associate an ObselType to a different Model once it has been set");

			for(let i = 0; i < new_obsel_types.length; i++)
				if(!new_obsel_types[i].parent_model)
					new_obsel_types[i].parent_model = this;

			this._obsel_types = new_obsel_types;
		}
		else
			throw new TypeError("New value for obsel_types property must be an array of ObselType");
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
	 * \throws KtbsError throws a KtbsError if one of the AttributeType provided as an argument belongs to an other Model
	 * \public
	 */
	set attribute_types(new_attribute_types) {
		if(new_attribute_types instanceof Array){
			for(let i = 0; i < new_attribute_types.length; i++)
				if(!(new_attribute_types[i] instanceof AttributeType))
					throw new TypeError("New value for attribute_types property must be an array of AttributeType");

			for(let i = 0; i < new_attribute_types.length; i++)
				if(new_attribute_types[i].parent_model && (new_attribute_types[i].parent_model != this))
					throw new KtbsError("Cannot associate an AttributeType to a different Model once it has been set");

			for(let i = 0; i < new_attribute_types.length; i++)
				if(!new_attribute_types[i].parent_model)
					new_attribute_types[i].parent_model = this;

			this._attribute_types = new_attribute_types;
		}
		else
			throw new TypeError("New value for attribute_types property must be an array of AttributeType");
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
	 * Resets all the resource cached data
	 * \public
	 */
	_resetCachedData() {
		super._resetCachedData();

		if(this._model_own_graph_rank)
			this._model_own_graph_rank = null;

		if(this._model_own_graph)
			this._model_own_graph = null;

		if(this._label)
			delete this._label;

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
	}
}
