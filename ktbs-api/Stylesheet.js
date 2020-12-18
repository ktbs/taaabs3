import {HubbleRule} from "./HubbleRule.js";
import {HubbleSubRule} from "./HubbleSubRule.js";
import {KtbsError} from "./Errors.js";

/**
 * Class for style sheets. Please note that this class is NOT a descendant from "Resource". Therefore, Stylesheet instances don't support get/put/post/delete as style sheets data management is the responsibility of their respective parent Model instance.
 */
export class Stylesheet {
    
    /**
     * Constructor for class Stylesheet
     * \param Object JSONData - the data describing the style sheet
     * \public
     */
    constructor(JSONData = {}) {

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
                    let aRule = new HubbleRule(aRuleJSONData, this);
                    this._rules.push(aRule);
                }
            }
        }

        return this._rules;
    }

    /**
     * Sets the rules of the style sheet
     * \param Array of HubbleRule new_rules - the new rules for the style sheet
     * \throws TypeError throws a TypeError if the provided argument is not an Array of HubbleRule
     * \public
     */
    set rules(new_rules) {
        if(new_rules instanceof Array) {
            for(let i = 0; i < new_rules.length; i++)
                if(!(new_rules[i] instanceof HubbleRule))
                    throw new TypeError("Argument must be an array of HubbleRule");

            this._JSONData["rules"] = new Array();

            for(let i = 0; i < new_rules.length; i++)
                this._JSONData["rules"].push(JSON.parse(JSON.stringify(new_rules[i]._JSONData)));

            if(this._rules)
                delete this._rules;
        }
        else
            throw new TypeError("Argument must be an array of HubbleRule");
    }

    /**
     * Gets the rules of the Stylesheet, ordered by priority according to the subrule precedence ordering (see : https://ktbs.readthedocs.io/en/latest/methods/hrules.html#precedence-of-subrules)
     * \return Array of HubbleRule
     * \public
     */
    get priority_ordered_subrules() {
        if(!this._priority_ordered_subrules) {
            let allRulesSubrules = new Array();

            for(let i = 0; i < this.rules.length; i++) {
                const aRule = this.rules[i];
                allRulesSubrules = allRulesSubrules.concat(aRule.rules);
            }

            this._priority_ordered_subrules = allRulesSubrules.sort(Stylesheet.compare_subrules_priority);
        }

        return this._priority_ordered_subrules;
    }

    /**
     * Gets a rule from the stylesheet by it's rule ID
     * \param string rule_id the ID of the rule we want
     * \return HubbleRule, or null if no rule with the provided rule_id has been found in the stylesheet
     * \public
     */
    getRuleByID(rule_id) {
       let rule = null;

        if(this._JSONData["rules"] instanceof Array) {
            for(let i = 0; i < this._JSONData["rules"].length; i++) {
                let aRuleJSONData = this._JSONData["rules"][i];

                if(aRuleJSONData["id"] == rule_id) {
                    rule = new HubbleRule(aRuleJSONData, this);
                    break;
                }
            }
        }

        return rule;
    }

    /**
     * Gets the rank of a rule within the current stylesheet's rules
     * \param HubbleRule rule
     * \throws TypeError throws a TypeError if the provided argument is not an instance of HubbleRule
     * \throws KtbsError throws a KtbsError if the rule provided as argument does not belong to the current stylesheet
     * \return int the rank of the rule within the current stylesheet's rules, or null if it can't be determined
     * \public
     */
    get_rule_rank(rule) {
        if(rule instanceof HubbleRule) {
            if(rule.parent == this) {
                for(let i = 0; i < this.rules.length; i++)
                    if(rule == this.rules[i])
                        return i;

                return null;
            }
            else
                throw new KtbsError("The provided rule does not belong to the current stylesheet");
        }
        else
            throw new TypeError("Argument must be an instance of HubbleRule");
    }

    /**
     * Compares two subrules that may or may not belong to different rules of the same structure, in order to prioritize them. It is usable as a comparison function with Array.prototype.sort()
     * \param HubbleSubRule subruleA the first subrule to compare
     * \param HubbleSubRule subruleB the second subrule to compare
     * \throws TypeError throws a TypeError if one or more of the provided arguments are not instances of HubbleSubRule
     * \throws KtbsError throws a KtbsError if the two provided subrules don't belong to the same stylesheet
     * \return -1 if subruleA has a higher priority than subruleB (meaning it should have a lower rank in the priority order), or 1 if subruleA has a lower priority than subruleB. Since the subrule precedence ordering is deterministic, two subrules belonging to the same structure can never has the same priority (see : https://ktbs.readthedocs.io/en/latest/methods/hrules.html#precedence-of-subrules)
     * \static
     * \public
     */
    static compare_subrules_priority(subruleA, subruleB) {
        if((subruleA instanceof HubbleSubRule) && (subruleB instanceof HubbleSubRule)) {
            const parentruleA = subruleA.parent;
            const parentruleB = subruleB.parent;
            
            if(parentruleA.parent == parentruleB.parent) {
                if(subruleA.type && !subruleB.type)
                    return -1;

                if(subruleB.type && !subruleA.type)
                    return 1;

                if(subruleA.attributes.length > subruleB.attributes.length)
                    return -1;

                if(subruleB.attributes.length > subruleA.attributes.length)
                    return 1;

                if(parentruleA == parentruleB) {
                    const subruleA_rank = parentruleA.get_subrule_rank(subruleA);
                    const subruleB_rank = parentruleB.get_subrule_rank(subruleB);
    
                    if(subruleA_rank < subruleB_rank)
                        return -1;
    
                    if(subruleB_rank < subruleA_rank)
                        return 1;

                    throw new Error("Inconsistent data: two different subrules of the same rule should never have the same rank");
                }
                else {
                    const parentStylesheet = parentruleA.parent;
                    const parentruleA_rank = parentStylesheet.get_rule_rank(parentruleA);
                    const parentruleB_rank = parentStylesheet.get_rule_rank(parentruleB);

                    if(parentruleA_rank < parentruleB_rank)
                        return -1;

                    if(parentruleB_rank < parentruleA_rank)
                        return 1;

                    throw new Error("Inconsistent data: two different rules of the same stylesheet should never have the same rank");
                }
            }
            else
                throw new KtbsError("Compared subrules don't belong to the same stylesheet");
        }
        else
            throw new TypeError("Both arguments must be instances of HubbleSubRule");
    }

    /**
     * Gets the first (according to the subrule precedence ordering) rule of the current stylesheet that matches an obsel provided as an argument, or null if none of them matches it
     * \param Obsel obsel - the obsel we want the first matching rule for
     * \return HubbleRule
     * \public
     */
    getFirstRuleMatchedByObsel(obsel) {
        for(let i = 0; i < this.priority_ordered_subrules.length; i++) {
            let testedSubRule = this.priority_ordered_subrules[i];

            if(testedSubRule.matchedByObsel(obsel))
                return testedSubRule.parent;
        }

		return null;
    }
    
    /**
     * Creates a duplicate of the current stylesheet and returns it
     * \param String clone_name the name for the new clone
     * \return Stylesheet
     * \public
     */
    clone(clone_name) {
        let clone = new Stylesheet();
        // we use this weird JSON.parse+JSON.stringify trick in order to easily make a deep copy of the data
        clone._JSONData = JSON.parse(JSON.stringify(this._JSONData));
        clone.name = clone_name;
        return clone;
    }
}