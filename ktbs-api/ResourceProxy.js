/**
 * This static class allows to share ktbs Resource instances in order to avoid instanciating duplicates of the same resource.
 * @static
 */
export class ResourceProxy {

    /**
     * Gets a ktbs resource instance from it's type and uri.
     * @param class type the type for the desired ktbs resource instance
     * @param URL or string uri
     * @static
     * @return Resource
     */
    static get_resource(type, uri) {
        let uri_string = (uri instanceof URL)?uri.toString():uri;
        let type_string = type.name;

        if(ResourceProxy._resources[type_string] && ResourceProxy._resources[type_string][uri_string])
            return ResourceProxy._resources[type_string][uri_string];
        else {
            let newInstance = new (type)(uri);

            if(!ResourceProxy._resources[type_string])
                ResourceProxy._resources[type_string] = new Array();

            ResourceProxy._resources[type_string][uri_string] = newInstance;
            return newInstance;
        }
    }
}

/**
 * Stores already instanciated resources for further use.
 * @static
 * @type Array
 */
ResourceProxy._resources = new Array();