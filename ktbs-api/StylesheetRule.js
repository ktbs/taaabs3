import {StylesheetRuleRule} from "./StylesheetRuleRule.js";

/**
 * Class for style sheets rules. Please note that this class is NOT a descendant from "Resource". Therefore, StylesheetRule instances don't support get/put/post/delete as style sheets rules data management is the responsibility of their respective parent Model instance.
 */
export class StylesheetRule {

    /**
     * Constructor for class StylesheetRule
     * \param Model parentModel - the Model the style sheet rule is described in
     * \param Object JSONData - the data describing the style sheet rule
     * \public
     */
    constructor(parentModel, JSONData = {}) {

        /**
         * The Model the style sheet rule is described in
         * \var Model
         * \protected
         */
        this._parentModel = parentModel;

        /**
         * The data describing the style sheet rule
         * \var Object
         * \protected
         */
        this._JSONData = JSONData;
    }

    /**
     * Gets the ID of the style sheet rule
     * \return string
     * \public
     */
    get id() {
        return this._JSONData["id"];
    }

    /**
     * Sets the ID of the style sheet rule
     * \param string new_id - the new ID for the style sheet rule
     * \public
     */
    set id(new_id) {
        this._JSONData["id"] = new_id;
    }

    /**
     * Gets the symbol associated with the rule
     * \return char
     * \public
     */
    get symbol() {
        if(this._JSONData["symbol"])
            return this._JSONData["symbol"];
        else
            return {};
    }

    /**
     * Sets the symbol associated with the rule
     * \param char new_symbol - the new symbol associated with the rule
     * \public
     */
    set symbol(new_symbol) {
        this._JSONData["symbol"] = new_symbol;
    }

    /**
     * Gets whether or not the Obsels matching the style sheet rule should be visibles
     * \return boolean
     * \public
     */
    get visible() {
        return (this._JSONData["visible"] != false);
    }

    /**
     * Sets whether or not an Obsel matching the style sheet rule should be visible
     * \param boolean new_visible - the new visibility for Obsels matching the style sheet rule
     * \public
     */
    set visible(new_visible) {
        if(typeof new_visible === "boolean")
            this._JSONData["visible"] = new_visible;
        else
            throw new TypeError("Value for \"visible\" property must be a boolean");
    }

    /**
     * Gets the style sheet rule rules as an Array of StylesheetRuleRule
     * \return Arrayof StylesheetRuleRule
     * \public
     */
    get rules() {
        if(!this._rules) {
            this._rules = new Array();

            if(this._JSONData["rules"] instanceof Array) {
                for(let i = 0; i < this._JSONData["rules"].length; i++) {
                    let aRuleRuleData = this._JSONData["rules"][i];
                    let aRuleRule = new StylesheetRuleRule(this._parentModel, aRuleRuleData);
                    this._rules.push(aRuleRule);
                }
            }
        }

        return this._rules;
    }

    /**
     * Sets the rules of the style sheet rule
     * \param Array of StylesheetRuleRule - new_rules the new rules for the style sheet rule
     * \public
     */
    set rules(new_rules) {
        this._rules = new_rules;
    }

    /**
     * Checks if the obsel provided as an argument matches the current rule
     * \param Obsel obsel - the obsel to check if it matches the current rule
     * \return boolean
     * \public
     */
    matchedByObsel(obsel) {
		let matches = false;

		for(let i = 0; (!matches) && (i < this.rules.length); i++) {
			let subrule = this.rules[i];
			matches = subrule.matchedByObsel(obsel);
		}

		return matches;
    }
    
    /**
     * Gets a default "catch-all" rule that matches any obsel
     * \return StylesheetRuleRule
     * \static
     * \public
     */
    static get catchAllRule() {
        if(!StylesheetRule._catchAllRule) {
            StylesheetRule._catchAllRule = new StylesheetRule();
            let aRuleRule = new StylesheetRuleRule();
            aRuleRule.type = "*";
            StylesheetRule._catchAllRule.rules.push(aRuleRule);
        }

		return StylesheetRule._catchAllRule;
	}
}