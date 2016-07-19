(function(dex, ko){

    // Define constructor
    function view_model(config)
    {
        this.configure(config);
        this.initialize();
        this.hydrate(config.observables);

        return this;
    }

    view_model.prototype = {

        // factory/utility api
        factory: function(vm, config = {})
        {
            return dex.clone(vm).configure(config);
        },

        extend: function(constructor, config)
        {
            var extended = dex.extend(this, config);
            extended.constructor = constructor;

            // handle an array of observables and turn it into
            // and object with observable_name => initial_value
            if(Array.isArray(config.observables))
            {
                let observables = config.observables;
                config.observables = {};
                config.observables.forEach(key => config.observables[key] = '');
            }

            var init = {
                observables:    config.observables || {},
                computeds:      config.computeds || {},
                collections:    config.collections || {},
                children:       config.children || {},
                subscribers:    config.subscribers || {},
                validators:     config.validators || {},
            };

            // Maintain constructor names while deep extending
            extended.observables = init.observables;
            extended.computeds = init.computeds;
            extended.collections = init.collections;
            extended.children = init.children;
            extended.subscribers = init.subscribers;
            extended.validators = init.validators;

            return extended.configure(init);
        },

        configure: function(config) {

            // if no properties set in config assume its a the property list
            // without any computed/etc configuration
            // @todo: this is actually a bad assumption
            if (!config.observables)
                config = {observables: config};

            if(config.observables)
            {
                if(Array.isArray(config.observables))
                    Object.keys(config.observables).forEach(key => this.addObservable(config.observables[key]));
                else
                    Object.keys(config.observables).forEach(key => this.addObservable(key, config.observables[key]));
            }


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

            Object.keys(this.observables).forEach(key => this.initObservable(key));
            Object.keys(this.collections).forEach(key => this.initCollection(key));
            Object.keys(this.computeds).forEach(key => this.initComputed(key));
            Object.keys(this.children).forEach(key => this.initChild(key));
            Object.keys(this.subscribers).forEach((key) => this.initSubscriber(key));
            Object.keys(this.validators).forEach(key => this.initValidators(key));

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
            return typeof this.observables[name] != 'undefined';
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

            if(!value && this.observables[name].initial)
                value = this.observables[name].initial;

            if(!value && typeof this.observables[name] == 'string')
                value = this.observables[name];

            var initializer;

            if(this.observables[name])
                initializer = this.observables[name].init;

            if(!initializer)
                initializer = dex.view_model.prototype.observable.init;

            initializer.call(this, name, value);

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

            var updater = this.observables[name].set;

            if(!updater)
                updater = dex.view_model.prototype.observable.set;

            updater.call(this, name, value);

            return this;
        },

        addObservable: function(name, config = {})
        {
            if(this.isCollection(name, config))
                return this.addCollection(name, config);

            var append = {};

            // if it doesnt have a 'get' method it needs to be configured
            if(!((config instanceof Object) && (!config.set && !config.get && !config.init)))
                append[name] = {initial: config};
            else
                append[name] = config;

            //dex.debug(['adding observable', name, append, 'to', this.constructor.name]);

            dex.attach(this.observables, append);

            return this;
        },








        // collection api
        hasCollection: function(name)
        {
            return typeof this.collections[name] != 'undefined'
        },

        hasCollectionInitialized: function(name)
        {
            return this.hasCollection(name) && typeof this[name] == 'function';
        },

        getCollection: function(name)
        {
            if(this.hasCollectionInitialized(name))
                return this[name]();
            else
                [];
        },

        setCollection: function(name, value)
        {
            if(!this.hasCollection(name))
                dex.debug('trying to set colleection '+ name +' but it doesnt exist in the config. `view_model`.`set_collection`');

            if(!this.collections[name].vm)
                dex.debug('collection '+ name +' needs a vm configured');

            this[name].decorate(value);

            return this;
        },

        initCollection: function(name, value)
        {
            if(!this.hasCollection(name))
                dex.debug('trying to init collection '+ name +' but it doesnt exist in the config. `view_model`.`init_collection`');

            if(!this.collections[name].vm)
                dex.debug('collection '+ name +' needs a vm configured');

            if(!value && this.collections[name].initial)
                value = this.collections[name].initial;

            if(!value)
                value = [];

            var initializer = this.collections[name].init;
            var vm = this.collections[name].vm;

            if(!initializer)
                initializer = dex.view_model.prototype.collection.init;

            initializer.call(this, name, vm, value);

            return this;
        },

        addCollection: function(name, config)
        {
            var attach = {};
            attach[name] = config;
            dex.attach(this.collections, attach);

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
            return typeof this.computeds[name] != 'undefined';
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
            var initializer = this.computeds[name].init;

            if(!initializer)
                initializer = dex.view_model.prototype.computed.init;

            initializer.call(this, name);

            return this;
        },

        // @todo: updateComputed()
        updateComputed: function(name, value)
        {

            return this;
        },

        addComputed: function(name, config)
        {
            var attach = {};

            // if it doesnt have getter and its a function use the function as the getter
            if((!(config instanceof Object) || (!config.get)) && (config instanceof Function))
                attach[name] = {get: config};
            else
                attach[name] = config;

            dex.attach(this.computeds, attach);

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
            return typeof this.children[name] != 'undefined';
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

            if(!this.children[name].vm)
                dex.debug('child '+ name +' needs a vm configured');

            if(!value)
                value = {};

            var initializer = this.children[name].init;
            var vm = this.children[name].vm;

            if(!initializer)
                initializer = dex.view_model.prototype.childs.init;

            initializer.call(this, name, vm, value);

            return this;
        },

        // @todo: does this need to be a thing?
        setChild: function(name, value)
        {
            if(this[name].hydrate)
                this[name].hydrate(value);
            else
                this[name] = value;

            return this;
        },

        // @todo: does this need to be a thing?
        updateChild: function(name, value)
        {
            if(this[name].hydrate)
                this[name].hydrate(value);
            else
                this[name] = value;

            return this;
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

            var callback = this.subscribers[name];

            if(!(typeof callback == 'function'))
                callback = dex.view_model.prototype.subscriber;

            this[name].subscribe((value) => callback.call(this, value));

            return this;
        },

        /*
        addValidators: function(property, validators)
        {
            // if its just one validator, put it inside an array
            if(!Array.isArray(validators[0]))
                validators = [validators];

            // initialize array to hold validators
            if(!this.validators[property])
                this.validators[property] = [];

            validators.forEach((validator) => this.validators[property].push(validator));

        },
        */

        // validator api
        /*
        addValidator: function(property, validator)
        {

            if(validator.isValidator)
            {
                let _validator = validator;
                validator = new dex.validator(_validator.callback, _validator.message);
                validator.options = _validator.options;
            }


            // if its not a validator, decorate it with the API
            if(!validator.isValidator)
                validator = new dex.validator(validator);

            // @todo: figure out how to add validators and maintain their bindings to teach instance. Right now they all bind to the same view model instance.
            // because new dex.validator gets called in the prototype definition
            // it needs to bind a new validator at the time it gets added

            this.validators[property].push(validator);

            return this;
        },
        */

        getValidators: function(property)
        {
            if(this.validators[property])
                return this.validators[property];

            return [];
        },

        initValidators: function(property)
        {

            if(!this.hasObservable(property))
                return dex.debug(`Trying to attach validators to ${property} but the property doesn't exist`);

            if(!this.hasObservableInitialized(property))
                return dex.debug(`Trying to attach validators to ${property} but the property has not been initialized yet.`);

            let validators = this.getValidators(property);
            //let initializer = validator => validator.bindValidator(this, property);

            validators.forEach((validator) => this.initValidator(property, validator));
        },

        initValidator: function(property, _validator)
        {
            let callback = _validator.callback;
            let message = _validator.message;
            let options = _validator.options;
            let validator = new dex.validator(callback, ...options, message);
            validator.bindValidator(this, property);

            //this.validators[property].push(validator);
        },


        // hydrator
        fromJson: function(data)
        {
            if(typeof data === 'undefined')
                return this;

            if(data.constructor.name === this.constructor.name && typeof data.serialize == 'function')
                data = data.serialize();

            Object.keys(data).forEach((key) => this.set(key, data[key]));

            return this;
        },

        hydrate: function(data)
        {
            return this.fromJson(data)
        },

        fetch: function()
        {
            console.log('vm.fetch needs to be implemented');
        },






        // serializer
        toJson: function()
        {
            var json = {};

            Object.keys(this.observables).forEach(key => json[key] = this.getObservable(key));
            Object.keys(this.collections).forEach(key => json[key] = this.getCollection(key).map(item => item.serialize ? item.serialize() : item));
            //Object.keys(this.computeds).forEach(key => json[key] = this[key]());
            Object.keys(this.children).forEach(key => json[key] = this[key].serialize ? this[key].serialize() : this[key]);

            return json;
        },

        serialize: function()
        {
            return this.toJson();
        },




        // default accessors
        observable:
        {
            init: function(name, value){ this[name] = dex.observable(value); },
            set: function(name, value){ return this[name](value); },
            get: function(name){ return this[name](); }
        },

        collection:
        {
            init: function(name, vm, initial){ this[name] = dex.collection(name, vm, initial); },
            set: function(name, value)
            {
                this[name].removeAll();
                this[name](value);
                return this;
            },
            get: function(name){ return this[name]; }
        },

        computed:
        {
            init: function(name, value)
            {
                var read = this.computeds[name].get || this.computed.get;
                var write = this.computeds[name].set || this.computed.set;

                var config = {owner: this, read: read};

                if(write)
                    config.write = write;

                this[name] = ko.pureComputed(config);

                return this;
            },

            get: function(){ dex.debug('getting wat'); },
            set: function(value){ dex.debug('setting wat '+ value); },

        },

        childs:
        {
            init: function(name, vm_factory, initial){ this[name] = vm_factory(initial) }
        },

        subscriber: function(value)
        {
            dex.debug(value);
        },


        // configurations
        observables: {}, // @todo: propertie: new dex.propertyCollection();
        collections: {},
        children: {},
        computeds: {}, // @todo: computeds: new dex.computedCollection();
        subscribers: {}, // @todo: subscribers = new dex.subscriberCollection();
        validators: {},

    };

    // Attach to Dex
    dex.view_model = view_model;

})(dex, ko);