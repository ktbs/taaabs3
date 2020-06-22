# Javascript KTBS-API quick start guide

## Description
The KTBS-API library is a client-side ES6 (Javascript) implementation for the KTBS REST API.

If you are not already familiar with the concepts of KTBS, you should start by reading [KTBS's online documentation](https://ktbs.readthedocs.io/en/latest/).

The provided classes are designed to make it easier for Javascript developpers to interact with a KTBS service.

## Requirements
KTBS-API library is a set of ES6 modules. Therefore, the Javascript interpreter you are using to run your code (in most cases, that would be the one embeded in your browser) must be ES6-compatible. Reasonably recent releases of Firefox, Chrome or Opera should work fine (not tested with Edge).

If you are quering a remote KTBS service, make sure that you have network connectivity and that the remote server allows [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) by providing the adequate [HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers).

Finally, keep in mind that most browser's security policies won't allow CORS when opening a document directly from the local filesystem (origin = file://...). So your HTML documents MUST be delivered to the browser through HTTP protocol by an HTTP server. Install a local one if needed.

## Usage

### Modules import
In KTBS-API, each class is contained in it's own separate .js file, which is an ES6 module exporting that class.

Before explicitly using a class provided by the library, you have to import it from the corresponding ES6 module.

For instance, to be able to use the "Ktbs" class, you should do something like :
```Javascript
import {Ktbs} from "/<path>/ktbs4la2/ktbs-api/Ktbs.js";
// (replace "<path>" with the adequate path prefix)
```
or for the "Obsel" class :
```Javascript
import {Obsel} from "/<path>/ktbs4la2/ktbs-api/Obsel.js";
// (replace "<path>" with the adequate path prefix)
```
etc ...

When a module depends on another one, it automatically imports it. So you don't have to worry about dependencies.

### Reading an existing resource

#### Direct instanciation

If wou want to read data from a resource already present on the network, you can instance it by calling the constructor of the class associated with that resource's type, providing the resource's uri as an argument (type : String or URL):
```Javascript
const myKtbsService = new Ktbs("http://mydomain.com/ktbs/");

// or :

const myKtbs_URL = new URL("http://mydomain.com/ktbs/");
const myKtbsService = new Ktbs(myKtbs_URL);
```

or you can also call the constructor without argument and then later set the instance's uri property :
```Javascript
const myKtbsService = new Ktbs();
myKtbsService.uri = "http://mydomain.com/ktbs/";
```

**IMPORTANT** : at this point, remote data has not been fetched yet, so most of the instance's properties will still be undefined.

In order to fetch the resource's data into the instance's properties, call method "get()" and use the returned promise :

```Javascript
const myKtbsService = new Ktbs("http://mydomain.com/ktbs/");

myKtbsService.get()
    .then(() => {
        // success, do something with the fetched data
        alert("Ktbs service available, version = " + myKtbsService.version);
    })
    .catch((error) => {
        // failure (i.e. : wrong URL, network failure, remote server down etc...)
        console.error(error);
    })
```

#### Using the ResourceProxy

@TODO

### Create a new resource and store it
In order to store a new resource on a remote Ktbs service, you have to :
1. Have a parent resource instance
2. Instanciate the new resource
3. Set an identifier for the new resource (facultative for Obsels)
4. Post the new resource to it's parent
5. Use the Promise returned by the post() call

```Javascript
const myKtbsService = new Ktbs("http://mydomain.com/ktbs/"); // 1. Have a parent resource instance

const myNewBase = new Base(); // 2. Instanciate the new resource
myNewBase.id = "example_base/"; // 3. Set an identifier for the new resource (facultative for Obsels)
myNewBase.label = "Example base";

myKtbsService.post(myNewBase) // 4. Post the new resource to it's parent
    .then(() => { // 5. Use the Promise
        // The new base has been successfully posted to it's parent
        // Before using it, remember to do a get() on it (*)
        myNewBase.get()
            .then(() => {
                // do something with the new Base
            });
    })
     .catch((error) => {
        // failure (i.e. : wrong URL, network failure, remote server down etc...)
        console.error(error);
    })
```

(\*) **IMPORTANT** : just after POSTing a new resource, it is still not ready for use yet even if the POST has been successfull. 
This is because the new resource's client-side representation is no more considered to be in sync with it's remote version (some modifications might have been made by the server during the resource creation). 
So remember performing a get() on it, as shown in the example above.

### Modify an existing resource
 After modifying an existing resource, to store modifications on the remote server, just call put() on the modified instance, and use the returned Promise :

 ```Javascript
const myBase = new Base("http://mydomain.com/ktbs/example_base/");
myBase.label = "Example base (renamed)";

myBase.put()
    .then(() => {
        // The base modification has been successfully recorded
        alert("PUT successfull");
    })
     .catch((error) => {
        // failure (i.e. : wrong URL, network failure, remote server down etc...)
        console.error(error);
    })
```

## Delete an existing resource
To delete an existing resource from the server, just call delete() on the instance to delete, and use the returned Promise :

 ```Javascript
const myBase = new Base("http://mydomain.com/ktbs/example_base/");

myBase.delete()
    .then(() => {
        // The base modification has been successfully recorded
        alert("DELETE successfull");
    })
     .catch((error) => {
        // failure (i.e. : wrong URL, network failure, remote server down etc...)
        console.error(error);
    })
```

## Examples
Four sample files are provided alongside this library :
- [sample_read.html](./sample_read.html)
- [sample_create.html](./sample_create.html)
- [sample_update.html](./sample_update.html)
- [sample_delete.html](./sample_delete.html)

Open them in a browser and show the console to monitor their execution results.


## API reference
In order to generate a full HTML API reference documentation for the library, you can use doxygen with the provided Doxyfile :
```shell
~/ktbs4la2/ktbs-api$ doxygen Doxyfile
```
then open the generated [HTML API reference documentation](./api-reference/html/index.html)
