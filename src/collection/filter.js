(function(dex, ko){

    function filter(field, operator, match)
    {
        let field = ko.observable(field);
        let operator = ko.observable(operator);
        let match = ko.observable(match);

        dex.attach(this, {field, operator, match});

        return this;
    }

    filter.prototype = {
        callback: function(vm)
        {
            let field = this.field();
            let operator = this.getOperator();
            let match_value = this.match();

            // if values aren't always return true
            if(!field || !operator || !match_value)
                return true;

            let check_value = vm.get(field);

            return operator.call(undefined, check_value, match_value);
        },

        getOperator: function()
        {
            return this.operator() || ((wan, too) => wan === too);
        }
    };

    dex.collection.filter = filter;

})(dex, ko);
