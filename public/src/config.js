/* Config object
    
    This is a non-global object that is accessable only by the config handler class
    to allow local loading of required portions of config into areas of code where they're
    requried. Use an instance of configHandler to utilise the config. See the class declaration
    below for more info.
*/
var __globalnl_internal_config__  = {
    "GLOBAL" : {
        "firebase" : {
            "tosUrl" : "<your-tos-url>" 
        }
    },
    "admin" : {
        "console" : {},
        "login" : {}
    },
    "404" : {},
    "index" : {
        "firebase" : {
            "signInSuccessUrl" : "members.html",
        }
    },
    "members" : {},
    "profile" : {},
    "registeration" : {},
    "signup" : {
        "firebase" : {
            "signInSuccessUrl" : "registration.html"
        }
    }
}


/* Class configHandler
    handles loading of the config.json file into local js code on each page.
*/
class configHandler {
    /* constructor. Must either set async false or pass a callback.
    
        @param callback (*function) - Function pointer to the callback that will recieve the config variable.
        @param filename (string) -  Optional argument, use this to request a specific section
            of the config file. Note that when requesting a specific section, global elements
            are added into the returned object, where any values in the local match override
            those in the global config.
    */
    constructor( callback=null, filename="default")
    {
        // Ensure a callback of some sort was provided, no validity check here though.
        if ( callback == null ) {
            console.log("Provide a callback bud.")
            return false
        }
        // This is modified by loadConfig
        this.config = {};
        // flag used to determine weather or not config is still loading
        this.loading = null;
        // Store param's
        this.callback = callback;
        // trigger loading
        this.loadConfig(filename);

    }
    /* method loadConfig
    
        First handles loading of config from variable defined at top of file, the
        runs requestConfig, which will trigger loading of any external configuration
        before sending the final result to the callback given at construction.
    
        @param filename (string) - See constructor declaration for more information
    */
    loadConfig(filename)
    {
        // set flag
        if ( this.loading == null) {
            this.loading = true;
        } else if ( this.loading == true ) {
            console.log("Already loading ya fool, fix that fail loop.");
        }
        // First copy global config
        this.config = __globalnl_internal_config__["GLOBAL"];
        // If a local config is requested, copy local request
        if ( this.filename !== "default" ) {
            this.initialConfig = __globalnl_internal_config__[filename];
            this.configDrill(this.initialConfig);
        }
        //Finish by executing callback with resolved config
        this.callback(this.config);
        
    }
    /* configDrill

        Iterates into a nested object and copies all its key-value pairs into
        this.config. This will run recursively.

        @param object - object to iterate through
        @param keyVector (dont pass)- Used in recursion, position in original object that the current object
            was stored at. Don't pass this variable, it isnt used during the first iteration.
    */
    configDrill(object, keyVector=null) {
        // create local copy of keyvector to handle updates to it
        var vector = [];
        if ( keyVector !== null ) {
            vector = keyVector;
        }
        //Iterate over the object's keys, each time an object is encountered,
        //this function is called again until the full object has been traversed
        //and its data copied to the output
        for (var key in object) { 
            // If nested, recurse
            if (object[key] !== null && typeof object[key] === "object") {
                // Store key vector before recursing
                vector.push(key);
                this.configDrill( object[key], vector);
            } else {
                //Create a temp copy by value
                var tempVector = vector.slice();
                tempVector.push(key)
                //Assign new value into config object
                this.resolveKeyVector(this.config, tempVector, object[key]); 
            }
        }
    }


    // UTIL //
    
    /* method resolveKeyVector
        Accepts an array or string that represents keys in an object, and assigns the value
        into the same place of the given object. If the higher level properties don't exist
        they are created.

        @param obj ({}) - Object to modifiy//assign value into
        @param keyVector (string or array) - String like (x.y.z) or array like ['x','y','z']
            that is resolved into an object accessor
        @param value - Value to assign into the object

        @returns value resolved from keyvector
    */
    resolveKeyVector(obj,keyVector, value) {
        // Handle a string key vector
        if (typeof keyVector == 'string')
            return this.resolveKeyVector(obj,keyVector.split('.'), value);
        // Handle array vector
        else if (keyVector.length==1 && value!==undefined)
            return obj[keyVector[0]] = value;
        else if (keyVector.length==0)
            return obj;
        else {
            // If the object doesnt already have the key, create an empty object to work with
            if ( ! obj.hasOwnProperty(keyVector[0]) ){
                console.log("The following object does not have ...");
                console.log(obj);
                console.log(keyVector[0]);
                obj[keyVector[0]] = {};
            }
            return this.resolveKeyVector(obj[keyVector[0]],keyVector.slice(1), value);
        }
    }
}