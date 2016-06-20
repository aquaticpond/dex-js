var island = {};

(function(dex, island){

    // defining the constructor
    function dood(data)
    {
        this.initialize();
        this.hydrate(data);
        return this;
    }

    dood.prototype = dex.view_model.prototype.extend(dood, {

        observables: {
            first:  '',
            last:   '',
            age:    '',
            pants: '',
        },

        computeds: {
            name: {
                get: function(){ return this.first() +' '+ this.last() },
                set: function(name)
                {
                    var split = name.split(' ');
                    this.first(split[0]);
                    this.last(split[1]);
                }
            },
            canDrink: {
                get: function(){ return this.age() > 18; },
                set: function(bool){ var age = !bool ? 17 : 500; this.age(age); }
            },

            poof: function(){ return `${this.first()} ${this.last()} is a poof`; }
        },

        collections: {
            faves: {vm: (data) => new island.dood.fave(data)},
            cards: {vm: (data) => new island.dood.fave(data)},
        },

        validators: {
            pants: () => false,
        }
        
    });

    island.dood = dood;

})(dex, island);