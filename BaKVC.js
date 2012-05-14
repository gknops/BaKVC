//*****************************************************************************
//	Copyright 2012 BITart Gerd Knops, all rights reserved.
//
//	Project: ---
//	File   : BaKVC.js
//	Author : Gerd Knops gerti@BITart.com
//
//*****************************************************************************
//
//	Description:
//	Key/Value Coding related functions
//
//*****************************************************************************
//
//	DISCLAIMER
//
//	BITart and Gerd Knops make no warranties, representations or commitments
//	with regard to the contents of this software. BITart and Gerd Knops
//	specifically disclaim any and all warranties, whether express, implied or
//	statutory, including, but not limited to, any warranty of merchantability
//	or fitness for a particular purpose, and non-infringement. Under no
//	circumstances will BITart or Gerd Knops be liable for loss of data,
//	special, incidental or consequential damages out of the use of this
//	software, even if those damages were foreseeable, or BITart or Gerd Knops
//	was informed of their potential.
//
//*****************************************************************************
// Global variables
//*****************************************************************************

	// Store for KVC instances of a given path.
	var KVC_ObservedPaths=[];

//*****************************************************************************
// Global functions
//*****************************************************************************
kvcSetParameterDescriptions=[
	
	// name			type		required	default
	'object',		'object',	false,		window,
	'keyPath',		'string',	true,		undefined,
	'value',		undefined,	true,		undefined
];
function kvcSet() {
	
	// Parse arguments, copy to local vars for better readability
	var parameters=KVC.checkArguments(arguments,kvcSetParameterDescriptions);
	var object=parameters.object;
	var keyPath=parameters.keyPath;
	var val=parameters.value;
	
	var	kvc,kvc2,oldVal,k,p;
	
	// Multi-level key path?
	var	idx=keyPath.indexOf('.');
	
	if(idx<0)
	{
		// No, set property directly
		oldVal=object[keyPath];
		object[keyPath]=val;
	}
	else
	{
		// Yes. Lop of top level of key path, and recursively call
		// kvcSet again. Check for observers of the top-level path
		// component, so we can invoke them later.
		k=keyPath.substr(0,idx);
		p=keyPath.substr(idx+1);
		
		oldVal=kvcSet(object[k],p,val);
		
		kvc2=KVC_ObservedPaths[k];
	}
	
	kvc=KVC_ObservedPaths[keyPath];
	
	if(kvc)
	{
		// If there are observers for the entire keypath,
		// invoke them now.
		kvc.pushNotifications(object,keyPath,val,oldVal);
	}
	
	if(kvc2)
	{
		// Finally invoke observers for the top-level
		// path component if any.
		kvc2.pushNotifications(object,k,object[k],oldVal);
	}
	
	return oldVal;
}
kvcRegisterObserverParameterDescriptions=[
	
	// name				type		required	default
	'object',			'object',	false,		window,
	'keyPath',			'string',	true,		undefined,
	'fireNow',			'boolean',	false,		false,
	'funcOrFuncName',	undefined,	true,		undefined,
	'target',			'object',	false,		undefined
];
function kvcRegisterObserver() {
	
	// Parse arguments, copy to local vars for better readability
	var parameters=KVC.checkArguments(arguments,kvcRegisterObserverParameterDescriptions);
	var obj=parameters.object;
	var path=parameters.keyPath;
	var funcOrFuncName=parameters.funcOrFuncName;
	var target=parameters.target;
	var fireNow=parameters.fireNow;
	
	// Determine KVC instance for path, create if needed.
	var	kvc=KVC_ObservedPaths[path];
	
	if(!kvc)
	{
		kvc=new KVC();
		KVC_ObservedPaths[path]=kvc;
	}
	
	// Register observer with KVC instance
	var retVal=kvc.registerObserver(obj,funcOrFuncName,target);
	
	// Fire new observer now?
	if(fireNow)
	{
		var val=obj[path];
		
		if(target)
		{
			// Yes, it is a method on an object
			target[funcOrFuncName](val,val,path,obj);
		}
		else
		{
			// Yes, it is a global function
			funcOrFuncName(val,val,path,obj);
		}
	}
	
	return retVal;
}
kvcUnregisterObserverParameterDescriptions=[
	
	// name				type		required	default
	'object',			'object',	false,		window,
	'keyPath',			'string',	true,		undefined,
	'funcOrFuncName',	undefined,	true,		undefined,
	'target',			'object',	false,		undefined
];
function kvcUnregisterObserver() {
	
	// Parse arguments, copy to local vars for better readability
	var parameters=KVC.checkArguments(arguments,kvcUnregisterObserverParameterDescriptions);
	var obj=parameters.object;
	var path=parameters.keyPath;
	var funcOrFuncName=parameters.funcOrFuncName;
	var target=parameters.target;
	
	// Determine KVC instance for path.
	var	kvc=KVC_ObservedPaths[path];
	
	if(!kvc)
	{
		return undefined;
	}
	
	// Unregister observer with KVC instance
	var retVal=kvc.unregisterObserver(obj,funcOrFuncName,target);
	
	// If the KVC instance for path has no observers
	// left, remove it as it is no longer needed.
	if(kvc.objects.lenght===0)
	{
		delete KVC_ObservedPaths[path];
	}
	
	return retVal;
}

//*****************************************************************************
// Convenience methods, requires jQuery
//*****************************************************************************
kvcBindUIParameterDescriptions=[
	
	// name			type		required	default
	'selector',		'string',	true,		undefined,
	'object',		'object',	false,		window,
	'keyPath',		'string',	true,		undefined,
	'value',		undefined,	false,		undefined,
	'events',		'string',	false,		'change',
	'on',			'string',	false,		'on',
	'off',			'string',	false,		'off'
];
function kvcBindUI() {
	
	// Parse arguments
	var parameters=KVC.checkArguments(arguments,kvcBindUIParameterDescriptions);
	
	// console.log("%s - %s - %s",parameters.selector,keyPath,parameters.events);
	
	// Register event handler on elements matching selector.
	$(parameters.selector).on(parameters.events,function(event) {
		
		// Get the element's new value
		var val=$(this).val();
		
		switch($(this)[0].type)
		{
			case 'checkbox':
				// Special-case checkboxes: append the value as final level of the
				// key path, use the elements checked property as the actual value,
				// and invoke kvcSet.
				kvcSet(parameters.object,parameters.keyPath+'.'+String(val),$(this)[0].checked);
				break;
			case 'select-one':
				if($(this).attr('data-role')==='slider')
				{
					// special-case toggle-switches: set boolean representing on/off.
					kvcSet(parameters.object,parameters.keyPath,(val===parameters.on));
				}
				else
				{
					// Other select-one elements invoke kvcSet with the new value.
					kvcSet(parameters.object,parameters.keyPath,val);
				}
				break;
			default:
				// All other elements invoke kvcSet with the new value.
				kvcSet(parameters.object,parameters.keyPath,val);
				break;
		}
	});
	
	// Register observer on the object and key path.
	var newObserverFunc=kvcRegisterObserver(parameters.object,parameters.keyPath,function(val,oldVal,path,obj) {
		
		// Iterate over all UI elements currently matching selector
		$(parameters.selector).each(function(index,element){
			
			// console.log("%s element tag: %s  type: %s",path,element.tagName,element.type);
			// console.dir(element);
			// console.dir($(element));
			
			switch(element.tagName)
			{
				case 'INPUT':
					switch(element.type)
					{
						case 'number':
							$(element).val(val);
							if(typeof $(element).slider==='function')
							{
								// Make sure jQuery Mobile sliders are refreshed.
								$(element).slider('refresh');
							}
							break;
						case 'radio':
							// Special-case radio buttons, set checked if
							// the elements value matches val, unchecked otherwise.
							element.checked=(element.value===val);
							if(typeof $(element).checkboxradio==='function')
							{
								// Make sure jQuery Mobile radio buttons are refreshed.
								$(element).checkboxradio('refresh');
							}
							break;
						case 'checkbox':
							// Special-case checkboxes, set checked if
							// the elements value when used as property in val yields a
							// true value, unchecked otherwise.
							element.checked=val[element.value];
							if(typeof $(element).checkboxradio==='function')
							{
								// Make sure jQuery Mobile checkboxes are refreshed.
								$(element).checkboxradio('refresh');
							}
							break;
						default:
							// For other input elements just set val.
							$(element).val(val);
							break;
					}
					break;
				case 'SELECT':
					switch(element.type)
					{
						case 'select-one':
							if($(element).attr('data-role')==='slider')
							{
								$(element).val((val)?parameters.on:parameters.off);
								if(typeof $(element).slider==='function')
								{
									$(element).slider('refresh');
								}
							}
							else if(typeof $(element).selectmenu==='function')
							{
								$(element).val(val);
								$(element).selectmenu('refresh');
							}
							else
							{
								$(element).val(val);
							}
							break;
					}
					break;
				default:
					// For any remaining elements set val as html.
					$(element).html(String(val));
					break;
			}
			
		});
	});
	
	if(parameters.value!==undefined)
	{
		// If a default value is given, set it now.
		kvcSet(parameters.object,parameters.keyPath,parameters.value);
	}
	else if(parameters.object[parameters.keyPath]!==undefined)
	{
		// Otherwise if the observed property has a defined value,
		// invoke the newly created observer function with that value
		// to update the UI.
		var v=parameters.object[parameters.keyPath];
		
		newObserverFunc(v,v,parameters.keyPath,parameters.object);
	}
}

//*****************************************************************************
// The KVC class.
// 
// A KVC instance holds all registered observers for a given key path.
// 
//*****************************************************************************
function KVC()
	{
		this.objects=[];
		this.funcs=[];
		this.targets=[];

//*****************************************************************************
//	Instance methods
//*****************************************************************************
this.registerObserver=function(obj,funcOrFuncName,target) {
	
	// Find the index for obj
	var idx=this.objects.indexOf(obj);
	
	if(idx<0)
	{
		// obj is unknown. So append it to the obejcts array,
		// append empty arrays to the funcs and targets arrays,
		// and set idx accordingly.
		idx=this.objects.length;
		this.objects.push(obj);
		this.funcs.push([]);
		this.targets.push([]);
	}
	else
	{
		// Do not allow to register observer while it is firing!
		if(this.funcs[idx].length===0)
		{
			console.trace();
			console.error("Can't add observer while observer firing!");
		}
	}
	
	// Add funcOrFuncName and target to the funcs and targets arrays.
	this.funcs[idx].push(funcOrFuncName);
	this.targets[idx].push(target);
	
	return funcOrFuncName;
};
this.unregisterObserver=function(obj,funcOrFuncName,target) {
	
	var idx=this.objects.indexOf(obj);
	
	// Find the index for obj
	if(idx<0)
	{
		// Error: not registered!
		return undefined;
	}
	
	// Within the functions and targets for obj find a match.
	var objectFuncs=this.funcs[idx];
	var objectTargets=this.targets[idx];
	var	numObjectFuncs=objectFuncs.length;
	var fidx=-1;
	var i;
	
	if(numObjectFuncs===0)
	{
		console.trace();
		console.error("Can't add observer while observer firing!");
	}
	
	for(i=0;i<numObjectFuncs;i++)
	{
		if(objectFuncs[i]===funcOrFuncName && objectTargets[i]===target)
		{
			fidx=i;
			break;
		}
	}
	
	if(fidx<0)
	{
		// Error: function not found
		return undefined;
	}
	
	// Found a match, remove the function and target from their arrays.
	objectFuncs.splice(fidx,1);
	objectTargets.splice(fidx,1);
	
	// If there are no more functions left for obj, remove it!
	if(objectFuncs.length===0)
	{
		// No more functions for this object, remove!
		this.funcs.splice(idx,1);
		this.targets.splice(idx,1);
		this.objects.splice(idx,1);
	}
	
	return funcOrFuncName;
};
this.pushNotifications=function(obj,path,val,oldVal) {
	
	// Find the index for obj
	var idx=this.objects.indexOf(obj);
	
	if(idx<0)
	{
		// Error: not found
		return;
	}
	
	// Get the functions and targets for obj.
	var objectFuncs=this.funcs[idx];
	var objectTargets=this.targets[idx];
	var	numObjectFuncs=objectFuncs.length;
	var i;
	
	// Temporary remove all functions for obj to
	// prevent recursion (like for jQuery Mobile sliders).
	this.funcs[idx]=[];
	
	// Iterate over all functions
	for(i=0;i<numObjectFuncs;i++)
	{
		var funcOrFuncName=objectFuncs[i];
		
		if(typeof funcOrFuncName==="string")
		{
			// Actually it is a method call, execute it.
			objectTargets[i][funcOrFuncName](val,oldVal,path,obj);
		}
		else
		{
			// Regular function.
			funcOrFuncName(val,oldVal,path,obj);
		}
	}
	
	this.funcs[idx]=objectFuncs;
};

//*****************************************************************************
}

//*****************************************************************************
//	Class methods
//*****************************************************************************
KVC.checkArguments=function(args,descriptions) {
	
	//
	// Utility function: convert given arguments object into
	// a parameters object vased on the parameter descriptions.
	// 
	// descriptions is an array with 4 values per parameter:
	// 
	// - parameter name
	// - parameter type (typeof string, if not undefined must match the parameter)
	// - parameter is required (boolean, if true this parameter must exist)
	// - default value (used as default value for optional parameters)
	// 
	var parameters,name,type,required,defaultValue;
	var	i;
	
	if(args.length===1)
	{
		// If there is only one argument, we assume it
		// is a parameter object.
		parameters=args[0];
	}
	else
	{
		// If there are multiple arguments we assume they are
		// positional arguments as per the parameter descriptions.
		// Convert them to a parameter object.
		parameters={};
		
		var ia=0;
		
		// Process arguments
		for(i=0;i<descriptions.length;i+=4)
		{
			// Assign vars to make code easier to read
			name=descriptions[i];
			type=descriptions[i+1];
			required=descriptions[i+2];
			
			if(required || type===undefined || typeof args[ia]===type)
			{
				// If the next argument is either required, or
				// it's type is undefined or matches the required
				// type, add it to the parameters array.
				// 
				// This also means that if the current described parameter
				// is not required, and the next argument does not match
				// the parameters type, it is assumed that this parameter
				// was skipped.
				parameters[name]=args[ia++];
				
				if(ia>=args.length)
				{
					break;
				}
			}
		}
	}
	
	// Now check all parameters
	for(i=0;i<descriptions.length;i+=4)
	{
		// Assign vars to make code easier to read
		name=descriptions[i];
		type=descriptions[i+1];
		required=descriptions[i+2];
		defaultValue=descriptions[i+3];
		
		var typeActual=typeof parameters[name];
		
		if(typeActual==='undefined')
		{
			// Parameter doesn't exist.
			if(required)
			{
				// If it was a required parameter, this is an error.
				console.trace();
				console.error("Required parameter '%s' missing",name);
			}
			else if(typeof defaultValue!=='undefined')
			{
				// Otehrwise if a default value is given, use it.
				parameters[name]=defaultValue;
			}
		}
		else
		{
			// Existing parameter, check if it's type is acceptable.
			if(type!==undefined && typeActual!==type)
			{
				console.trace();
				console.error("Parameter '%s' has type '%s', expected '%s'",name,typeActual,type);
			}
		}
	}
	
	// Finally return the checked parameter object.
	return parameters;
};

//**************************************************************************EOF
