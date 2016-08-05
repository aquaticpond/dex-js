(function(dex, ko){

    function filter(_field, _operator, _match)
    {
        let field = ko.observable(_field);
        let operator = ko.observable(_operator);
        let match = ko.observable(_match);

        dex.attach(this, {field, operator, match});

        return this;
    }

    filter.prototype = {
        callback: function(vm)
        {
            let field = this.field();
            let operator = this.getOperator();
            let match_value = this.match().toLowerCase();

            // if values aren't always return true
            if(!field || !operator || !match_value)
                return true;

            let check_value = vm.get(field).toLowerCase();

            return operator(check_value, match_value);
        },

        getOperator: function()
        {
            let operator = this.operator();

            if(typeof operator === 'function')
                return operator;

            return this.fn[operator] || this.fn['='];
        },

        fn: {
            '=': (a, b) => a === b,
            '>': (a, b) => a > b,
            '<': (a, b) => a < b,
            '>=': (a, b) => a >= b,
            '<=': (a, b) => a <= b,
            'contains': (a = '', b = '') => a.indexOf(b) > -1
        }
    };

    dex.collection.filter = filter;

})(dex, ko);
