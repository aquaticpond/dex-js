(function(dex, island){

    function fave(data)
    {
        this.initialize();
        this.hydrate(data);
        //return dex.view_model.factory(fave, config);
    }

    fave.prototype = dex.view_model.prototype.extend(fave, {
        config:
        {
            observables: {
                wat: dex.config.observable('wat', ''),
            }
        },
    });

    island.dood.fave = fave;

})(dex, island);