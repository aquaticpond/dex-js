(function(dex, ko){

    function observable(value)
    {
        let observable = ko.observable(value);

        let is_valid = ko.observable(-1);
        let validation_messages = ko.observableArray();
        let validators = []
        let touched = ko.observable(0);
        let touch = () => touched(touched.peek()+1);

        dex.attach(observable, {is_valid, validation_messages, validators, touched, touch});

        return observable;
    }

    dex.observable = observable;

})(dex, ko);
