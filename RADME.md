# BaKVC

*BaKVC* requires [*jQuery*](http://jquery.com/) version 1.7 or later!

*BaKVC* adds *Key Value Coding* support to JavaScript/jQuery, along with a powerful method to bind form elements to your data model. This enables you to better separate your data model from the UI code.

To use *BaKVC* simply include it into your HTML page by adding a header line similar to this one (replacing the path with what is appropriate for your site):

	<script type="text/javascript" src="BaKVC.js"></script>


## Key-Value coding

*BaKVC* does not use potentially hazardous overwriting of setter methods etc. That makes it necessary that in order for observers to function properly that you do not modify any observed properties directly, but rather user the `kvcSet` function. Example: instead of

	myObject.myProperty=newValue;

use this:

	kvcSet(myObject,'myProperty',newValue);

While this may be inconvenient, the benefits far outweigh this inconvenience.

If you modify observed properties directly, changes will not be reflected in the bound UI elements!

## Custom handling of toggle switches

*BaKVC* contains custom handling for toggle switches. Instead of using `on` and `off` string values, the value is internally converted so that the bound property is a boolean value. If you use values other than `on` and `off` you must set them with the `kvcBindUI` function. See also the example code.

## Custom handling of Checkboxes

The variable bound to checkbox elements is an anonymous object, who's property names are the values of the checkbox elements. A `true` value reflects a checked checkbox, while a `false` value (or undefined property) reflects an unchecked checkbox. See also the example code.


## BaKVC functions

All *BaKVC* functions can be invoked using regular arguments or using a single anonymous object containing the argument properties. As an example, the two following invocations of the `kvcSet([object,]keyPath,value)` are equivalent:

	kvcSet('.varClass','A value');
	
	kvcSet({
		keyPath:	'.varClass',
		value:		'A value'
	});

---

### kvcBindUI(selector[,object],keyPath[,value[,events[,on[,off]]]])

This function ties together any UI elements matching `selector` with the variable `object.keyPath`. Any KVC-compliant modification of `object.keyPath` is reflected by the UI elements, and any change to the UI elements is reflected by `object.keyPath`.

Example: having this HTML

	<input class="varTextInputExample" type="text" />
	<span class="varTextInputExample"></span>

and this JavaScript:

	myText='An example';
	kvcBindUI('.varTextInputExample','myText');

both the input and the span will automatically reflect any change to the variable `myText`, and any change to the input element will result in `myText` being updated.

**NOTE:*** if *object* is not given, the variable indicated by *keyPath* **must** be a global variable. Do not use `var` to define it!

#### selector (required, string)

This selector should match one or more UI elements on the page. These elements will be bound.

#### object (optional, object, default: window)

If given this is the object containing the property defined by *keyPath*. Otherwise this defaults to *window* (eg global variable).

#### keyPath (required, string)

The *keyPath* of the property bound to the UI elements.

#### value (optional)

If given, this value is set to the bound variable and all bound UI elements.

#### events (optional, string, default: 'change')

The events upon which the UI elements should trigger a variable update. For text fields that should update as the user types, `'keyup change'` could be used.

#### on (optional, string, default 'on')

For toggle switches this is the string value that should represent `true`.

#### off (optional, string, default 'off')

For toggle switches this is the string value that should represent `false`.

---

### kvcSet([object,]keyPath,value)

Use this method to set any property in a KeyValue Coding compliant manor.

#### object (optional, object, default: window)

The object who's property is to be changed.

#### keyPath (required, string)

The *keyPath* of the property in *object* to be changed.

#### value (required)

The value to set.

---

### kvcRegisterObserver([object,]keyPath,funcOrFuncName[,target][,fireNow])

This function is used to register an observer.

Notes:

- Observing of a given object and key path is disabled while the associated observers fire. This prevents dead loops.

- When working with nested objects, the way `kvcSet` is invoked has some impact on which observers fire:

		kvcSet(outerObject,'innerObject.property',newValue);
		kvcSet(outerObject.innerObject,'property',newValue);
	
	In the former case, the following observers will fire if registered:
	
	- key path `innerObject.property` of `outerObject`
	- key path `innerObject` of `outerObject` 
	- key path `property` of `outerObject.innerObject` 
	
	while in the latter case only this observer fires:
	
	- key path `property` of `outerObject.innerObject` 


#### object (optional, object, default: window)

The object who's property is to be observed.

#### keyPath (required, string)

The *keyPath* of the property in *object* to be observed.

#### funcOrFuncName (required, string or function)

If a function is given, that function is invoked when the observed value changes.

In many cases you may instead want to call a method inside an object. In that case give the name of the method here as a string, and set the *target* argument to that object.

#### target (optional, object)

If a method should be invoked when the observed object changes, set this argument to the object who's method should be called. See also the description of the *funcOrFuncName* argument.

#### fireNow (optional, boolean, default false)

If true, the observer is fired immediately in order to synchronize it with the observed value.

---

### kvcUnregisterObserver([object,]keyPath,funcOrFuncName[,target])

Call this function with identical arguments a `kvcRegisterObserver` function was called to remove an observer. See the `kvcRegisterObserver` function for the parameter descriptions.
