(function(dex, ko){

    // Define constructor
    function view_model(config = {})
    {
        this.configure(config);
        this.initialize();
        this.hydrate(config.observables);

        return this;
    }

    view_model.prototype = {

        extend: function(constructor, proto)
        {
            let extended = dex.extend(this, proto);
            extended.constructor = constructor;

            return extended.configure();
        },

        transformObservableConfigArrayToObject: function(observables = [])
        {
            let config = {};
            observables.forEach(name => config[name] = {initial: ''});

            return config;
        },

        configure: function(config) {

            // sanitize observable list as array from argument
            if(config && Array.isArray(config.observables))
                config.observables = this.transformObservableConfigArrayToObject(config.observables);

            // sanitize observable list as array from prototype
            if(Array.isArray(this.config.observables))
                this.config.observables = this.transformObservableConfigArrayToObject(this.config.observables);


            if(!config)
                config = this.config

            // if no properties set in config assume its a the property list
            // without any computed/etc configuration
            // @todo: this is actually a bad assumption, but its a feature when using dex.view_model without extending
            if (!config.observables)
                config = {observables: config};


            if(config.observables)
                    Object.keys(config.observables).forEach(key => this.addObservable(key, config.observables[key]));

            if(config.collections)
                Object.keys(config.collections).forEach(key => this.addCollection(key, config.collections[key]))

            if(config.computeds)
                Object.keys(config.computeds).forEach(key => this.addComputed(key, config.computeds[key]));

            if(config.children)
                Object.keys(config.children).forEach(key => this.addChild(key, config.children[key]));

            if(config.subscribers)
                Object.keys(config.subscribers).forEach(key => this.addSubscriber(key, config.subscribers[key]));

            /*
            if(config.validators)
                Object.keys(config.validators).forEach(key => this.addValidators(key, config.validators[key]));
            */

            return this;
        },

        initialize: function() {

            Object.keys(this.config.observables).forEach(key => this.initObservable(key));
            Object.keys(this.config.collections).forEach(key => this.initCollection(key));
            Object.keys(this.config.computeds).forEach(key => this.initComputed(key));
            Object.keys(this.config.children).forEach(key => this.initChild(key));
            Object.keys(this.config.subscribers).forEach((key) => this.initSubscriber(key));
            Object.keys(this.config.validators).forEach(key => this.initValidators(key));

            return this;
        },



        // generic accessors which handle type switching
        has: function(name) 		{ return this.hasProperty(name); },
        hasInitialized: function(name) { return this.hasPropertyInitialized(name); },
        get: function(name)         { return this.getProperty(name); },
        set: function(name, value) 	{ return this.setProperty(name, value); },
        init: function(name, value) { return this.initProperty(name, value)},
        update: function(name, value) { return this.updateProperty(name, value); },



        // property interface
        // @todo: property interface
        whereIs: function(name)
        {
            if(this.hasObservable(name))
                return 'observables';

            if(this.hasComputed(name))
                return 'computeds';

            if(this.hasCollection(name))
                return 'collections';

            if(this.hasChild(name))
                return 'children';

            if(this.hasSubscriber(name))
                return 'subscribers';

            return undefined;
        },

        hasProperty: function(name)
        {
            return typeof this.whereIs(name) !== 'undefined';
        },

        hasPropertyInitialized: function(name)
        {
            switch(this.whereIs(name))
            {
                case 'obserables': return this.hasObservableInitialized(name); break;
                case 'computeds': return this.hasComputedInitialized(name); break;
                case 'collections': return this.hasCollectionInitialized(name); break;
                case 'children': return this.hasChildInitialized(name); break;
                //case 'subscribers': return this.hasSubscriberInitialized(name); break;
            }
            
            return false;
        },

        getProperty: function(name)
        {
            switch(this.whereIs(name))
            {
                case 'observables': return this.getObservable(name); break;
                case 'computeds': return this.getComputed(name); break;
                case 'collections': return this.getCollection(name); break;
                case 'children': return this.getChild(name); break;
                //case 'subscribers': return this.getSubscriber(name); break;
            }

            return undefined;
        },

        setProperty: function(name, value)
        {
            switch(this.whereIs(name))
            {
                case 'observables': return this.setObservable(name, value); break;
                case 'computeds': return this.setComputed(name, value); break;
                case 'collections': return this.setCollection(name, value); break;
                case 'children': return this.setChild(name, value); break;
                //case 'subscribers': return this.setSubscriber(name, value); break;

                //if its not found, assume its supposed to be an observable and configure it
                default: return this.addObservable(name).initObservable(name, value);
            }

            dex.debug("trying to set property "+ name +' on '+ this.constructor.name +' but it doesnt exist in configuration');
        },

        initProperty: function(name, value)
        {
            switch(this.whereIs(name))
            {
                case 'observables': return this.initObservable(name, value); break;
                case 'computeds': return this.initComputed(name, value); break;
                case 'collection': return this.initCollection(name, value); break;
                case 'children': return this.initChild(name, value); break;
                case 'subscribers': return this.initSubscriber(name, value); break;

                //if its not found, assume its supposed to be an observable and configure it
                default: return this.addObservable(name).initObservable(name, value);
            }

            dex.debug("trying to init property "+ name +' on '+ this.constructor.name +' but it doesnt exist in configuration');
        },

        updateProperty: function(name, value)
        {
            switch(this.whereIs(name))
            {
                case 'observables': return this.updateObservable(name, value); break;
                case 'computeds': return this.updateComputed(name, value); break;
                case 'collection': return this.updateCollection(name, value); break;
                case 'children': return this.updateChild(name, value); break;
                //case 'subscribers': return this.updateSubscriber(name, value); break;
            }

            dex.debug("trying to update property "+ name +' on '+ this.constructor.name +' but it doesnt exist in configuration');
        },








        // observable api
        // also handles passthrough to observableArray
        hasObservable: function(name)
        {
            return typeof this.config.observables[name] != 'undefined';
        },

        hasObservableInitialized: function(name)
        {
            return this.hasObservable(name) && typeof this[name] == 'function';
        },

        getObservable: function(name)
        {
            if(this.hasCollection(name))
                return this.getCollection(name);

            if(this.hasObservableInitialized(name))
                return this[name]();
            else
                return;
        },

        setObservable: function(name, value)
        {
            if(this.isCollection(name, value))
                return this.setCollection(name, value);

            if(this.hasObservableInitialized(name))
                return this.updateObservable(name, value)
            else if(this.hasObservable(name))
                return this.initObservable(name, value)

            dex.debug('trying to set observable '+ name +' to value '+ value +' but it doesnt exist in the configuration so its being ignored in `view_model`.`set_observable`');

            return this;
        },

        initObservable: function(name, value)
        {
            if(this.isCollection(name, value))
                return this.initCollection(name, value);

            if(!this.hasObservable(name))
                dex.debug('trying to init observable '+ name +' but it doesnt exist in the config. `view_model`.`init_observable`');

            if(!value && this.config.observables[name].initial)
                value = this.config.observables[name].initial;

            // @todo: deprecate
            if(!value && typeof this.config.observables[name] == 'string')
                value = this.config.observables[name].initial;

            this[name] = this.config.use.observable(value);

            return this;
        },


        updateObservable: function(name, value)
        {
            if(this.isCollection(name, value))
                return this.updateCollection(name, value);

            if(!this.hasObservable(name))
                this.addObservable(name, value); //dex.debug('trying to update observable '+ name +' but it doesnt exist in the config. `view_model`.`init_observable`');

            if(!this.hasObservableInitialized(name))
                dex.debug('trying to update observable '+ name +' but it has not been initlized yet');

            this[name](value);

            return this;
        },

        addObservable: function(name, config = {})
        {
            if(this.isCollection(name, config))
                return this.addCollection(name, config);

            let append = {};

            // if it doesnt have a 'get' method it needs to be configured
            if(!((config instanceof Object) && (!config.set && !config.get && !config.init)))
                append[name] = {initial: config};
            else
                append[name] = config;

            dex.attach(this.config.observables, append);

            return this;
        },








        // collection api
        hasCollection: function(name)
        {
            return typeof this.config.collections[name] != 'undefined'
        },

        hasCollectionInitialized: function(name)
        {
            return this.hasCollection(name) && typeof this[name] == 'function';
        },

        getCollection: function(name)
        {
            return this.hasCollectionInitialized(name) ? this[name]() : [];

        },

        setCollection: function(name, value)
        {
            if(!this.hasCollection(name))
                dex.debug('trying to set collection '+ name +' but it doesnt exist in the config. `view_model`.`set_collection`');

            if(!this.config.collections[name].decorator)
                dex.debug('collection '+ name +' needs a decorator configured');

            this[name].decorate(value);

            return this;
        },

        initCollection: function(name, value)
        {
            if(!this.hasCollection(name))
                dex.debug('trying to init collection '+ name +' but it doesnt exist in the config. `view_model`.`init_collection`');

            if(!this.config.collections[name].decorator && !this.config.collections[name].source)
                dex.debug('collection '+ name +' needs a decorator or source configured');

            if(!value && this.config.collections[name].initial)
                value = this.config.collections[name].initial;

            if(!value)
                value = [];

            let decorator = this.config.collections[name].decorator;
            let use_pager = this.config.collections[name].use_pager;
            let dependant = this.config.collections[name].dependant;
            let source    = this.config.collections[name].source;
            let ids       = this.config.collections[name].ids;
            let manager = false;

            let collection = undefined;
            if(source)
                collection = dex.collection.computed(name, this, source, ids);
            else
                collection = this.config.use.collection(name, decorator, value, use_pager, manager, dependant);

            collection.vm = this;
            this[name] = collection;

            return this;
        },

        addCollection: function(name, config)
        {
            let attach = {};
            attach[name] = config;
            dex.attach(this.config.collections, attach);

            return this;
        },

        isCollection: function(name, value)
        {
            if(this.hasCollection(name))
                return true;

            if(value && value.constructor === Array)
                return true;

            return false;
        },







        // computed api
        hasComputed: function(name)
        {
            return typeof this.config.computeds[name] != 'undefined';
        },

        hasComputedInitialized: function(name)
        {
            return this.hasComputed(name) && typeof this[name] == 'function';
        },

        // @todo: getComputed()
        getComputed: function(name)
        {
            return this.hasComputedInitialized(name) ? this[name]() : undefined;
        },

        setComputed: function(name, value)
        {
            if(!this.hasComputed(name))
                dex.debug('trying to set computed '+ name +' on '+ this.constructor.name +' but it doesnt exist in the config');

            if(this.hasComputedInitialized(name))
                this[name](value);

            return this;
        },

        initComputed: function(name)
        {
            let read = this.config.computeds[name].get || (() => dex.debug("no default getter defined for computed"));
            let write = this.config.computeds[name].set;
            let owner = this;

            this[name] = ko.pureComputed({owner, read, write});

            return this;
        },

        // @todo: updateComputed()
        updateComputed: function(name, value)
        {

            return this;
        },

        addComputed: function(name, config)
        {
            let attach = {};

            // if it doesnt have getter and its a function use the function as the getter
            if((!(config instanceof Object) || (!config.get)) && (config instanceof Function))
                attach[name] = {get: config};
            else
                attach[name] = config;

            dex.attach(this.config.computeds, attach);

            return this;
        },




        // children api
        // @todo: addChild()
        addChild: function(name, config)
        {
            return this;
        },

        hasChild: function(name)
        {
            return typeof this.config.children[name] != 'undefined';
        },

        // @todo: get constructor.name of child view_model
        hasChildInitialized: function(name)
        {
            return this.hasChild(name) && typeof this[name] !== 'undefined'
        },

        getChild: function(name)
        {
            return this[name];
        },

        initChild: function(name, value)
        {
            if(!this.hasChild(name))
                dex.debug('trying to init child '+ name +' but it doesnt exist in the config. `view_model`.`init_child`');

            if(!this.config.children[name].decorator)
                dex.debug('child '+ name +' needs a decorator configured');

            let decorate = this.config.children[name].decorator;
            let proxy = this.config.children[name].key;

            // for requires
            if(typeof proxy !== 'undefined')
                return this[proxy].subscribe(value => this[name] = decorate(value, [this, name]));

            this[name] = decorate(value);

            return this;
        },

        // @todo: does this need to be a thing?
        setChild: function(name, value)
        {
            return this.initChild(name, value);
            /*if(this[name].hydrate)
                this[name].hydrate(value);
            else
                this[name] = value;

            return this;
            */
        },

        // @todo: does this need to be a thing?
        updateChild: function(name, value)
        {
            return this.initChild(name, value);
            /*
            if(this[name].hydrate)
                this[name].hydrate(value);
            else
                this[name] = value;

            return this;
            */
        },





        // subscriber api
        // @todo: addSubscriber()
        addSubscriber: function(name)
        {

            return this;
        },

        hasSubscriber: function(name)
        {

            return this;
        },

        initSubscriber: function(name)
        {
            if(typeof this[name] != 'function')
                return;

            let callback = this.config.subscribers[name];

            if(!(typeof callback == 'function'))
                callback = dex.view_model.prototype.subscriber;

            this[name].subscribe((value) => callback.call(this, value));

            return this;
        },

        getValidators: function(property)
        {
            return this.config.validators[property] || [];
        },

        initValidators: function(property)
        {
            if(!this.hasObservable(property))
                return dex.debug(`Trying to attach validators to ${property} but the property doesn't exist`);

            if(!this.hasObservableInitialized(property))
                return dex.debug(`Trying to attach validators to ${property} but the property has not been initialized yet.`);

            this.getValidators(property)
                .forEach((validator) => this.initValidator(property, validator));
        },

        initValidator: function(property, _validator)
        {
            // make sure we dont operate on original
            _validator = _validator.slice();

            let instance = dex.validator; //_validator.unshift();
            let callback = _validator.shift();
            let message = _validator.pop();
            let options = _validator;
            let validator = new dex.validator(callback, ...options, message);
            validator.bindValidator(this, property);
        },


        // hydrator
        fromJson: function(data = {})
        {
            if(typeof data === 'undefined' || data === null)
                return this;

            if(data.constructor.name === this.constructor.name && typeof data.serialize == 'function')
                data = data.serialize();

            Object.keys(data).forEach((key) => this.set(key, data[key]));

            return this;
        },

        hydrate: function(data = {})
        {
            return this.fromJson(data)
        },

        fetch: function()
        {
            let uri = this._fetchUri+this.id();
            let namespace = this._fetchNamespace;
            jQuery.ajax(uri).always(json => this.hydrate(JSON.parse(json)[namespace]));
        },



        reset: function()
        {
            Object.keys(this.config.observables).forEach((key) => this.set(key, undefined));
            Object.keys(this.config.collections).forEach((key) => this.set(key, []));
            Object.keys(this.config.children).forEach((key) => 'reset' in this.get(key) ? this.get(key).reset() : this.set(key, {}));
        },
        
        dehydrate: function()
        {
            this.reset();
        },




        // serializer
        toJson: function()
        {
            let json = {};

            Object.keys(this.config.observables).forEach(key => json[key] = this.getObservable(key));
            Object.keys(this.config.collections).forEach(key => json[key] = this.getCollection(key).map(item => item && item.serialize ? item.serialize() : item));
            //Object.keys(this.config.computeds).forEach(key => json[key] = this[key]());
            Object.keys(this.config.children).forEach(key => json[key] = this[key] && this[key].serialize ? this[key].serialize() : this[key]);

            return json;
        },

        serialize: function()
        {
            return this.toJson();
        },

        config:
        {
            // dependencies
            use:
            {
                observable: dex.observable,
                collection: dex.collection,
                computed: ko.pureComputed,
            },

            // properties
            observables: {},
            collections: {},
            children: {},
            computeds: {},
            subscribers: {},
            validators: {},
        }

    };

    // Attach to Dex
    dex.view_model = view_model;

})(dex, ko);