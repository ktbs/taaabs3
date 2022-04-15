import {HubbleAttributeConstraint} from "./HubbleAttributeConstraint.js";

/**
 * Class for Hubble sub-rules
 */
export class HubbleSubRule {

    /**
     * Constructor for class HubbleSubRule
     * \param Object JSONData - the data describing the Hubble sub-rule
     * \public
     */
    constructor(JSONData = {}, parent) {

        /**
         * The data describing the Hubble sub-rule
         * \var Object
         * \protected
         */
        this._JSONData = JSONData;

        /**
         * The parent Hubble rule for the Hubble sub-rule
         * \var HubbleRule
         * \protected
         */
        this._parent = parent;
    }

    /**
     * Gets the sub-rule's parent rule
     * \return HubbleRule
     * \public
     */
    get parent() {
        return this._parent;
    }

    /**
     * Gets the ObselType pattern that an Obsel must match to match the Hubble sub-rule
     * \return string
     * \public
     */
    get type() {
        return this._JSONData.type;
    }

    /**
     * Sets the ObselType pattern that an Obsel must match to match the Hubble sub-rule
     * \param string new_type - the new ObselType pattern that an Obsel must match to match the Hubble sub-rule
     * \public
     */
    set type(new_type) {
        this._JSONData.type = new_type;
    }

    /**
     * Gets the attribute constraints of this rule
     * \return HubbleAttributeConstraint
     * \public
     */
    get attributes() {
        if(!this._attributes) {
            this._attributes = new Array();

            if(this._JSONData.attributes instanceof Array) {
                for(let i = 0; i < this._JSONData.attributes.length; i++) {
                    let anAttributeData = this._JSONData.attributes[i];
                    let anAttribute = new HubbleAttributeConstraint(anAttributeData);
                    this._attributes.push(anAttribute);
                }
            }
        }

        return this._attributes;
    }

    /**
     * 
     */
    set attributes(new_value) {
        if(new_value instanceof Array) {
            for(let i = 0; i < new_value.length; i++)
                if(!new_value[i] instanceof HubbleAttributeConstraint)
                    throw new TypeError("New value for property \"attributes\" must be an array of HubbleAttributeConstraint");

            this._JSONData.attributes = [];

            for(let i = 0; i < new_value.length; i++)
                this._JSONData.attributes.push(new_value[i]._JSONData);

            this._attributes = new_value;
        }
        else
            throw new TypeError("New value for property \"attributes\" must be an array of HubbleAttributeConstraint");
    }

    /**
	 * Checks if an obsel matches the current rule's type
	 * \param Obsel obsel - the obsel to check if it matches the current rule's type
	 * \return boolean
     * \public
	 */
	typeMatchedByObsel(obsel) {
		return(
				(this.type == "*")
			||	(
						obsel.type 
					&&	(obsel.type.uri.toString() == new URL(this.type).toString())
			)
			||	(obsel.type_id == this.type)
		);
    }
    
    /**
	 * Checks if an obsel matches the current rule
	 * \param Obsel obsel - the obsel to check if it matches the current rule
	 * \return boolean
     * \public
	 */
    matchedByObsel(obsel) {
		let matches = new Array();
		
		if((this.type) && (this.type != ""))
			matches.push(this.typeMatchedByObsel(obsel));
	
		if(!matches.includes(false)) {
            let attributesConstraints = this.attributes;

            for(let i = 0; (!matches.includes(false)) && (i < attributesConstraints.length); i++) {
                let attributeConstraint = attributesConstraints[i];
                matches.push(attributeConstraint.matchedByObsel(obsel));
            }
		}

		return !matches.includes(false);
	}
}