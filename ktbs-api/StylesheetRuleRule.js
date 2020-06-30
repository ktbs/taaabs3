import {StylesheetRuleRuleAttributeConstraint} from "./StylesheetRuleRuleAttributeConstraint.js";

/**
 * Class for style sheet rule rule
 */
export class StylesheetRuleRule {

    /**
     * Constructor for class StylesheetRuleRule
     * \param Model parentModel - the Model the style sheet rule rule is described in
     * \param Object JSONData - the data describing the style sheet rule
     * \public
     */
    constructor(parentModel, JSONData = {}) {

        /**
         * The Model the style sheet rule rule is described in
         * \var Model
         * \protected
         */
        this._parentModel = parentModel;

        /**
         * The data describing the style sheet rule rule
         * \var Object
         * \protected
         */
        this._JSONData = JSONData;
    }

    /**
     * Gets the ObselType pattern that an Obsel must match to match the style sheet rule rule
     * \return string
     * \public
     */
    get type() {
        return this._JSONData.type;
    }

    /**
     * Sets the ObselType pattern that an Obsel must match to match the style sheet rule rule
     * \param string new_type - the new ObselType pattern that an Obsel must match to match the style sheet rule rule
     * \public
     */
    set type(new_type) {
        this._JSONData.type = new_type;
    }

    /**
     * Gets the attribute constraints of this rule
     * \return StylesheetRuleRuleAttributeConstraint
     * \public
     */
    get attributes() {
        if(!this._attributes) {
            this._attributes = new Array();

            if(this._JSONData.attributes instanceof Array) {
                for(let i = 0; i < this._JSONData.attributes.length; i++) {
                    let anAttributeData = this._JSONData.attributes[i];
                    let anAttribute = new StylesheetRuleRuleAttributeConstraint(this._parentModel, anAttributeData);
                    this._attributes.push(anAttribute);
                }
            }
        }

        return this._attributes;
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