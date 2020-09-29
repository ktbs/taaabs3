import {HubbleRule} from "./HubbleRule.js";

/**
 * Class for style sheets. Please note that this class is NOT a descendant from "Resource". Therefore, Stylesheet instances don't support get/put/post/delete as style sheets data management is the responsibility of their respective parent Model instance.
 */
export class Stylesheet {
    
    /**
     * Constructor for class Stylesheet
     * \param Model parentModel - the Model the style sheet is described in
     * \param Object JSONData - the data describing the style sheet
     * \public
     */
    constructor(parentModel, JSONData = {}) {

        /**
         * The Model the style sheet is described in
         * \var Model
         * \protected
         */
        this._parentModel = parentModel;

        /**
         * The data describing the style sheet
         * \var Object
         * \protected
         */
       this._JSONData = JSONData;
    }

    /**
     * Gets the name of the stylesheet
     * \return string
     * \public
     */
    get name() {
        return this._JSONData["name"];
    }

    /**
     * Sets the name of the style sheet
     * \param string new_name - the new name for the style sheet
     * \public
     */
    set name(new_name) {
        this._JSONData["name"] = new_name;
    }

    /**
     * Gets the description of the stylesheet
     * \return string
     * \public
     */
    get description() {
        return this._JSONData["description"];
    }

    /**
     * Sets the description of the style sheet
     * \param string new_description - the new description for the style sheet
     * \public
     */
    set description(new_description) {
        this._JSONData["description"] = new_description;
    }

    /**
     * Gets the rules of the stylesheet
     * \return Array of HubbleRule
     * \public
     */
    get rules() {
        if(!this._rules) {
            this._rules = new Array();

            if(this._JSONData["rules"] instanceof Array) {
                for(let i = 0; i < this._JSONData["rules"].length; i++) {
                    let aRuleJSONData = this._JSONData["rules"][i];
                    let aRule = new HubbleRule(this._parentModel, aRuleJSONData);
                    this._rules.push(aRule);
                }
            }
        }

        return this._rules;
    }

    /**
     * Sets the rules of the style sheet
     * \param Array of HubbleRule new_rules - the new rules for the style sheet
     * \public
     */
    set rules(new_rules) {
        this._rules = new_rules;
    }

    /**
     * Gets the first rule of the current stylesheet that matches an obsel provided as an argument, or null if none of them matches it
     * \param Obsel obsel - the obsel we want the first matching rule for
     * \return HubbleRule
     * \public
     */
    getFirstRuleMatchedByObsel(obsel) {
		let firstMatchedRule = null;

        for(let i = 0; (firstMatchedRule == null) && (i < this.rules.length); i++) {
            let testedRule = this.rules[i];

            if(testedRule.matchedByObsel(obsel))
                firstMatchedRule = testedRule;
        }

		return firstMatchedRule;
	}
}