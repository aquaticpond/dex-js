(function(dex, ko){
    // Decorator for ko.observableArray which attaches a hydrator method for automagic hydration of view models
    function collection(name, decorator, data = [])
    {
        var observable =  ko.observableArray();

        dex.attach(observable, collection.prototype);

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

    };

    dex.collection = collection;

})(dex, ko);
