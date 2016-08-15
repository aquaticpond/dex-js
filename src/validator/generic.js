(function(dex, ko){

    let min = (val, min) => val && val.length > min;
    let max = (val, max) => val && val.length < max;
    let required = (val, property) => !property.touched() || (val != '' && typeof val !== 'undefined');
    let compose = () => false;
    let test_cakes = function(...cakes){ console.log('testing the cakes', this, ...cakes); return false; };
    let password_match = function(value, password_field){ return value === this.get(password_field); };

    dex.attach(dex.validator, {min, max, required, compose, test_cakes, password_match});

})(dex, ko);
