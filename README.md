# dex-js
## A frontend library built on KnockoutJS.
## See /testing/testing.html for examples.

```javascript
<script src="testing/island/dood.js"></script>
<script src="testing/island/dood/fave.js"></script>

// get some JSON
let json = {herp: 'yer a herp harry', derp: 'yer a derp harry'};

// decorate JSON with KO niftyness
let ko_view_model = new dex.view_model(json);

// Use KO API to do cool things
ko_view_model.herp.observe(newVal => console.log(newVal));


// lets pretend this collection of doods came from an ajax request.
// except the last one, hes already an instance just to make sure the decorator doesnt care
// the third one will be an empty dood view model because that property isnt in the configuration
let doods = [
    {first: 'herp', last: 'derpington', age: 9},
    {first: 'wat', last: 'man', age: 29, faves: [{wat: 'favourite'}, {wat: 'other favourite'}, {wat: 'boss'}]},
    {dont: 'doit'},
    new island.dood({first: 'inline', last: 'dood', age: 123, faves: [{wat: 'im in line'}, {wat: 'inlining fave instance'}]}),
];

// create a collection of doods that takes a name, a decorator and a array of JSON to decorate
let collection = dex.collection('doods', data => new island.dood(data), doods);

// yer a KO model harry!
console.log(collection()[0].first());
console.log(collection()[2].first());
```
