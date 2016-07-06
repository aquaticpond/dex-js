(function(dex, ko){

    function observable(value)
    {
        let observable = ko.observable(value);

        let isValid = ko.observable(-1);
        let validationMessages = ko.observableArray();
        let touched = ko.observable(0);
        let touch = () => touched(touched.peek()+1);

        dex.attach(observable, {isValid, validationMessages, touched, touch});

        return observable;
    }

    dex.observable = observable;

})(dex, ko);
