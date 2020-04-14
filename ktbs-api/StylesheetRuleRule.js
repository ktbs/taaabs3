import {StylesheetRuleRuleAttributeConstraint} from "./StylesheetRuleRuleAttributeConstraint.js";

/**
 * 
 */
export class StylesheetRuleRule {

    /**
     * Constructor for class StylesheetRuleRule
     * @param Model parentModel the Model the style sheet rule rule is described in
     * @param Object JSONData the data describing the style sheet rule
     */
    constructor(parentModel, JSONData = {}) {

        /**
         * The Model the style sheet rule rule is described in
         * @type Model
         */
        this._parentModel = parentModel;

        /**
         * The data describing the style sheet rule rule
         * @type Object
         */
        this._JSONData = JSONData;
    }

    /**
     * Gets the ObselType pattern that an Obsel must match to match the style sheet rule rule
     * @return ObselType
     */
    get type() {
        return this._JSONData.type;
    }

    /**
     * Sets the ObselType pattern that an Obsel must match to match the style sheet rule rule
     * @param string new_type the new ObselType pattern that an Obsel must match to match the style sheet rule rule
     */
    set type(new_type) {
        this._JSONData.type = new_type;
    }

    /**
     * 
     * @return StylesheetRuleRuleAttributeConstraint
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
	 * 
	 * @param obsel 
	 * @returns boolean
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
     * 
     * @param Obsel obsel
     * @return boolean 
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