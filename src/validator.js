(function(dex, ko){

    function validator(callback, ...options)
    {
        this.callback = callback;

        // last option is message
        this.message = options.pop();
        this.options = options;

        return this.validate.bind(this);
    }

    validator.prototype = {
        validate: function(vm, property, value)
        {
            console.log(this.callback);
            console.log(this.options);
            console.log(this.message);
            return true;
        }
    };

    dex.validator = validator;

})(dex, ko);
