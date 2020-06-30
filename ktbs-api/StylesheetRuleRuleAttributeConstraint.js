/**
 * Class for style sheet rule rule attribute constraint
 */
export class StylesheetRuleRuleAttributeConstraint {

    /**
     * Constructor for class StylesheetRuleRuleAttributeConstraint
     * \param Model parentModel - the Model the style sheet rule rule attribute constraint is described in
     * \param Object JSONData - the data describing the style sheet rule rule attribute constraint 
     * \public
     */
    constructor(parentModel, JSONData) {

        /**
         * The Model the style sheet rule rule attribute constraint is described in
         * \var Model
         * \protected
         */
        this._parentModel = parentModel;

        /**
         * The data describing the style sheet rule rule attribute constraint 
         * \var Object
         * \protected
         */
        this._JSONData = JSONData;
    }

    /**
     * Gets the uri of the AttributeType that is targeted by this constraint
     * \return URL
     * \public
     */
    get uri() {
        if(!this._uri)
            this._uri = new URL(this._JSONData["uri"]);

        return this._uri;
    }

    /**
     * Sets the the AttributeType that is targeted by this constraint, by it's uri
     * \param URL new_uri - the uri of the new AttributeType that is targeted by this constraint
     * \throws TypeError throws a TypeError if the provided argument is not an URL
     * \public
     */
    set uri(new_uri) {
        if(new_uri instanceof URL) {
            this._JSONData["uri"] = new_uri.toString();
            this._uri = new_uri;
        }
        else
            throw new TypeError("Value for \"uri\" property must be an instance of URL");
    }

    /**
     * Gets the ID of the AttributeType that is targeted by this constraint
     * \return string
     * \public
     */
    get type_id() {
        if(!this._type_id && this.uri && this.uri.hash)
            this._type_id = decodeURIComponent(this.uri.hash.substring(1));

        return this._type_id;
    }

    /**
     * Gets the AttributeType that is targeted by this constraint
     * \return AttributeType
     * \public
     */
    get type() {
        if(!this._type && this.type_id)
            this._type = this._parentModel.get_attribute_type(this.type_id);

        return this._type;
    }

    /**
     * Sets the AttributeType that is targeted by this constraint
     * \param AttributeType new_type - the new AttributeType that is targeted by this constraint
     * \throws TypeError throws a TypeError if provided value for parameter new_type is not an instance of AttributeType
     * \public
     */
    set type(new_type) {
        if(new_type instanceof AttributeType) {
            this._uri = new_type.uri;
            this._type = new_type;
        }
        else
            throw new TypeError("Value for \"type\" property must be an instance of AttributeType");
    }

    /**
     * Gets the operator used to check the if an Obsel Attribute matches this constraint
     * \return string
     * \public
     */
    get operator() {
        return this._JSONData["operator"];
    }

    /**
     * Sets the operator used to check the if an Obsel Attribute matches this constraint
     * \param string new_operator - the new operator used to check the if an Obsel Attribute matches this constraint
     * \public
     */
    set operator(new_operator) {
        this._JSONData["operator"] = new_operator;
    }

    /**
     * Gets the value used to check the if an Obsel Attribute matches this constraint
     * \return string
     * \public
     */
    get value() {
        return this._JSONData["value"];
    }

    /**
     * Sets the value used to check the if an Obsel Attribute matches this constraint
     * \param string new_value - the new value used to check the if an Obsel Attribute matches this constraint
     * \public
     */
    set value(new_value) {
        this._JSONData["value"] = new_value;
    }

    /**
     * Checks if an obsel attribute matches this constraint
     * \param Attribute obselAttribute - obsel attribute to check if it matches this constraint
     * \return boolean
     * \public
     */
    matchedByObselAttribute(obselAttribute) {
        try {
            let testString = '"' + obselAttribute.value + '"' + this.operator + '"' + this.value + '"';
            return (eval(testString) === true);
        }
        catch(error) {
            return false;
        }
    }

    /**
	 * Checks if an Obsel matches this constraint, which is when at least one of the Obsel's Attributes matches this constraint
	 * \param Obsel obsel - the obsel to check if it matches this constraint
	 * \return boolean
     * \public
	 */
	matchedByObsel(obsel) {
		let matched = false;
		let obsel_attributes = obsel.attributes;

		for(let i = 0; i < obsel_attributes.length; i++) {
			let obselAttribute = obsel_attributes[i];

			if(obselAttribute.type && this.type && (obselAttribute.type.uri.toString() == this.type.uri.toString())) {
				matched = this.matchedByObselAttribute(obselAttribute);

				if(matched)
					break;
			}
		}

		return matched;
	}
}