import {KtbsError} from "./Errors.js";

/**
 * Class for Hubble attribute constraint
 */
export class HubbleAttributeConstraint {

    /**
     * Constructor for class HubbleAttributeConstraint
     * \param Object JSONData - the data describing the Hubble attribute constraint 
     * \public
     */
    constructor(JSONData) {

        /**
         * The data describing the Hubble attribute constraint 
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
        if(["==", "<", ">", "<=", ">="].includes(new_operator))
            this._JSONData["operator"] = new_operator;
        else
            throw new KtbsError("Invalid operator \"" + new_operator + "\". Valid operators are : \"==\", \"<\", \">\", \"<=\", or \">=\"");
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
        switch(this.operator) {
            case "==": 
                return (obselAttribute.value == this.value);
            case "<":
                return (obselAttribute.value < this.value);
            case ">":
                return (obselAttribute.value > this.value);
            case "<=":
                return (obselAttribute.value <= this.value);
            case ">=":
                return (obselAttribute.value >= this.value);
            default:
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

            if(obselAttribute.type.uri.toString() == this.uri.toString()) {
				matched = this.matchedByObselAttribute(obselAttribute);

				if(matched)
					break;
			}
		}

		return matched;
	}
}