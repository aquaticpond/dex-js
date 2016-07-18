(function(dex, ko){

    function validator(callback, ...options)
    {
        this.callback = callback;

        // last option is message
        this.message = options.pop();
        this.options = options;

        return this;
    }

    validator.prototype = {
        isValidator: true,

        bindCallback: function(callback)
        {
            if(typeof callback != 'function' &&
               typeof dex.validator[callback] == 'function')
                callback = dex.validator[callback];

            if(typeof callback != 'function')
            {
                dex.debug(`Could not bind validator ${callback} to ${this.property} because the provided validator callback is not callable.`);
                callback = () => false;
            }

            this.callback = callback.bind(this.context);

        },
        
        bindValidator: function(context, property)
        {
            this.context = context;
            this.property = property;

            this.bindCallback(this.callback);

            if(!context[property].validators)
                context[property].validators = [];

            context[property].validators.push(this);

            let owner = context[property];
            let read = function()
            {
                let new_value = this();
                let validation = this.validators.map(validator => validator.run(new_value));
                let messages = validation.map(result => result.message).filter(result => typeof result !== 'undefined');
                let is_valid = validation.reduce(((previous, current) => previous * current.is_valid), 1);

                this.validation_messages.removeAll();
                this.validation_messages(messages);

                return is_valid;
            }

            context[property].is_valid = ko.observable();
            context[property].validate = ko.pureComputed({read, owner});
            context[property].validate.subscribe(value => context[property].is_valid(value));
        },

        run: function(value)
        {
            let callback = this.callback;
            let options = this.options;
            let context = this.context;
            let property = context[this.property];
            let is_valid = callback.apply(context, [value, ...options]);
            let message = !is_valid ? this.message : undefined;

            if(typeof message == 'function')
                message = message.apply(undefined, [this.property, ...options]);

            return {is_valid, message};
        },

        extend: function(constructor, config)
        {
            var extended = dex.extend(this, config);
            extended.constructor = constructor;
            return extended;
        },
    };

    dex.validator = validator;

})(dex, ko);
