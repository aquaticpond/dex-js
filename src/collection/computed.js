(function(dex, ko){

    function computed_collection(name, vm, source, _ids)
    {

        let get = function(){
            let ids = this[_ids]();
            return source()().filter(item => ids.indexOf(item.get('id')) >= 0);
        }

        let observable = ko.pureComputed(get, vm).extend({rateLimit: 1});

        observable.filters    = ko.observableArray();
        observable.required   = ko.observableArray().extend({rateLimit: 1});
        observable.sorter     = ko.observable(() => 1);
        observable.pager      = new dex.collection.pager();
        observable.sorter.direction = ko.observable(1);

        dex.attach(observable, computed_collection.prototype);

        observable.hydrate = function(values){
            this(values);
        };

        observable.filtered   = ko.pureComputed(observable.filter, observable);

        return observable;
    }

    computed_collection.prototype = Object.create(dex.collection.prototype);

    dex.collection.computed = computed_collection;

})(dex, ko);
