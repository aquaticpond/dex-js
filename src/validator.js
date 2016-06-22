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
        
        bindValidator: function(context, property)
        {
            this.context = context;
            this.property = property;

            context[property].subscribe(this.validate.bind(this));
        },

        validate: function(value)
        {
            let callback = this.callback;
            let options = this.options;
            let context = this.context;
            let property = context[this.property];
            let isValid = callback.apply(context, [value, ...options]);
            let message = !isValid ? this.message : 'poof';

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
