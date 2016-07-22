(function(dex, ko){
    // Decorator for ko.observableArray which attaches a hydrator method for automagic hydration of view models
    function collection(name, decorator, data = [])
    {
        let observable = ko.observableArray();
        let filters    = ko.observableArray();
        let sorter     = ko.observable(() => 1);
        sorter.direction = ko.observable(1);

        dex.attach(observable, collection.prototype);

        let filtered   = ko.pureComputed(observable.filter, observable);
        dex.attach(observable, {filters, filtered, sorter});

        if(decorator)
            observable.decorator = decorator;

        return observable.decorate(data);

    }


    collection.prototype = {
        serialize: function(){
            return this().map((item) => item.serialize ? item.serialize() : item);
        },

        decorate: function(data = [], decorator)
        {
            if(!decorator)
                decorator = this.decorator;

            return this.hydrate(data.map(decorator));
        },

        hydrate: function(data = [], decorator)
        {
            if(decorator)
                return this.decorate(data)

            this.removeAll();
            this(data);

            return this;
        },

        filter: function()
        {
            let filters = this.filters();
            let sort_fn = this.sorter();
            let sort_dir = this.sorter.direction();
            let filtered = this();

            let sort = (a, b) => sort_fn(a, b) * sort_dir;
            let filter = filter => filtered = filtered.filter(filter.callback.bind(filter));

            filters.forEach(filter);

            return filtered.sort(sort);
        },

        addFilter: function(_filter)
        {
            let filter = _filter || new dex.collection.filter();
            this.filters.push(filter);
        },

        getVmProperties: function()
        {
            let decorator = this.decorator();
            return Object.keys((decorator.config ? dex.mix(decorator.config.observables, decorator.config.computeds) : decorator) || {});
        },


    };

    dex.collection = collection;

})(dex, ko);
