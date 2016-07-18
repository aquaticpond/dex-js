(function(dex, ko){

    let min = (val, min) => val && val.length > min;
    let max = (val, max) => val && val.length < max;
    let required = (val, isTouched) => /* !isTouched || */ (val != '' && typeof val !== 'undefined');
    let compose = () => false;
    let test_cakes = function(...args){ /*console.log('testing cakes', this, ...args); */ return false; };

    dex.attach(dex.validator, {min, max, required, compose, test_cakes});

})(dex, ko);
