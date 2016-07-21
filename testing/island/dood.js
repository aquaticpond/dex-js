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

        config:
        {
            observables: [
                'first',
                'last',
                'age',
                'pants'
            ],

            computeds: {
                name: {
                    get: function () {
                        return this.first() + ' ' + this.last()
                    },
                    set: function (name) {
                        var split = name.split(' ');
                        this.first(split[0]);
                        this.last(split[1]);
                    }
                },
                canDrink: {
                    get: function () {
                        return this.age() > 18;
                    },
                    set: function (bool) {
                        var age = !bool ? 17 : 500;
                        this.age(age);
                    }
                },

                poof: function () {
                    return `${this.first()} ${this.last()} is a poof`;
                }
            },

            collections: {
                faves: {decorator: (data) => new island.dood.fave(data)},
                cards: {decorator: (data) => new island.dood.fave(data)},
            },

            validators: {
                pants: [
                    ['test_cakes',       (...args) => 'aaaargs' + args.join(', ')],
                    ['required',         property => `${property} is a required field.`],
                    ['min',         10,  property => `${property} must be at least 10 characters.`],
                    ['max',         2,   property => `${property} must be less than 2 characters.`],
                ],
            }
        }
        
    });

    island.dood = dood;

})(dex, island);