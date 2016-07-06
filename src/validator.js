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

            context[property].validate = this.validate.bind(this);
            context[property].subscribe(this.validate.bind(this));
            context[property].validators.push(this);
        },

        validate: function(value)
        {
            let callback = this.callback;
            let options = this.options;
            let context = this.context;
            let property = context[this.property];
            let isValid = callback.apply(context, [value, ...options]);
            let message = !isValid ? this.message : undefined;

            if(typeof message == 'function')
                message = message.apply(context, [this.property, ...options]);

            property.isValid(isValid);
            property.validationMessages([message]);
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
