(function(dex, ko){
    // Decorator for ko.observableArray which attaches a hydrator method for automagic hydration of view models
    function collection(name, decorator, data = [], use_pager = true, manager = false, dependant = false)
    {
        let observable = ko.observableArray().extend({rateLimit: 1});
        observable.dexname = name;
        observable.filters    = ko.observableArray();
        observable.required   = ko.observableArray().extend({rateLimit: 1});
        observable.sorter     = ko.observable(() => 1);
        observable.pager      = use_pager ? new dex.collection.pager() : undefined;
        observable.sorter.direction = ko.observable(1);
        observable.dependant = dependant;

        dex.attach(observable, collection.prototype);

        observable.filtered   = ko.pureComputed(observable.filter, observable);

        if(manager) {
            observable.needs = ko.pureComputed(observable._needs, observable).extend({rateLimit: 1});
            observable.needs.subscribe(value => observable.updateNeeds(value), observable);
        }
        //observable.updateNeeds = ko.comput(observable._updateNeeds, observable);
        //dex.attach(observable, {filters, sorter, pager, required});


        if(decorator)
            observable.decorator = decorator;

        return observable.decorate(data);
    }


    collection.prototype = {
        serialize: function(){
            return this().map((item) => item.serialize ? item.serialize() : item);
        },

        decorate: function(data = [], _decorator)
        {
            if(!_decorator)
                _decorator = this.decorator;

            if(this.dependant)
                decorator = (value) => _decorator(value, this);
            else
                decorator = _decorator;

            return this.hydrate(data.map(decorator));
        },

        hydrate: function(data = [], decorator)
        {
            if(decorator)
                return this.decorate(data)

            data = data.filter(item => typeof item !== 'undefined');

            if(data.length)
            {
                this.removeAll();
                this(data);
            }

            return this;
        },

        updateNeeds: function(needs)
        {
            if(!needs || !needs.length)
                return;

            let xhr = this._xhr(needs);

            xhr.always((json) => {
                let has = this();
                let response = JSON.parse(json);
                let needs = this.needs();
                let filtered = response.filter(item => needs.indexOf(item.id) !== -1);
                let mapped = filtered.map(this.decorator);
                let merged = has.concat(mapped);
                this.hydrate(merged);
            });

            this.xhr = xhr;
        },

        _needs: function()
        {
            let required = this.required();
            let has = this().map(item => item.get('id'));
            let needs = required.filter(id => has.indexOf(id) === -1).filter((id, i, self) => self.indexOf(id) === i);

            return needs.length ? needs : undefined;
        },

        require: function(id, dependant)
        {
            if(typeof id === 'undefined' || !id)
                return;

            if(this.required().indexOf(id) === -1)
                this.required.push(id);

            let filter = item => item.get('id') === id;
            let required = this().filter(filter)[0];

            if(dependant) {

                let is_collection = ko.isObservable(dependant) && !(dependant.destroyAll === undefined);

                if(is_collection)
                {
                    //if(dependant.getSubscriptionsCount() < 1) return;

                    var subscription = this.subscribe(function(items){
                        subscription.dispose();

                        if(items.length && items.length != dependant().length)
                            dependant.hydrate(items);
                    });

                }
                else
                {
                    let model = dependant[0];
                    let property = dependant[1];

                    this.subscribe(function (items) {
                        let required = items.filter(filter)[0];
                        if (!model[property] && required)
                            model[property] = required;
                    });

                }
            }

            return required;
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

            this.pager.items(filtered.length);
            let slice = this.pager.slice();

            return filtered.sort(sort).slice(slice[0], slice[1]);
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
