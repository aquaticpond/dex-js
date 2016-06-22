(function(dex, ko){

    let min = (val, min) => val.length > min;
    let max = (val, max) => val.length < max;
    let required = (val, isTouched) => !isTouched || (val != '' && typeof val !== 'undefined');
    let computed = () => false;
    let compose = () => false;

    dex.validator = {min, max, required, computed, compose};

})(dex, ko);
