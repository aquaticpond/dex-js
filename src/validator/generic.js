(function(dex, ko){

    let min = (val, min) => val && val.length > min;
    let max = (val, max) => val && val.length < max;
    let required = (val, property) => !property.touched() || (val != '' && typeof val !== 'undefined');
    let compose = () => false;
    let test_cakes = function(...cakes){ console.log('testing the cakes', this, ...cakes); return false; };
    let password_match = function(value, password_field){ return value === this.get(password_field); };
    
    let has_upper_case = value => /[A-Z]/.test(value);
    let has_number = value => /[\d]/.test(value);
    let has_symbol = value => /\W/.test(value);
    let secure_password = value => has_upper_case(value) && has_number(value) && has_symbol(value);

    dex.attach(dex.validator, {min, max, required, compose, test_cakes, password_match, has_upper_case, has_number, has_symbol, secure_password});
})(dex, ko);
