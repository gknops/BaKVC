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
	
	var parameters=KVC.checkArguments(arguments,kvcSetParameterDescriptions);
	var object=parameters.object;
	var keyPath=parameters.keyPath;
	var val=parameters.value;
	
	var	kvc,kvc2,oldVal,k,p;
	var	idx=keyPath.indexOf('.');
	
	if(idx<0)
	{
		oldVal=object[keyPath];
		object[keyPath]=val;
	}
	else
	{
		k=keyPath.substr(0,idx);
		p=keyPath.substr(idx+1);
		
		oldVal=kvcSet(object[k],p,val);
		
		kvc2=KVC_ObservedPaths[k];
	}
	
	kvc=KVC_ObservedPaths[keyPath];
	
	if(kvc)
	{
		kvc.pushNotifications(object,keyPath,val,oldVal);
	}
	
	if(kvc2)
	{
		kvc2.pushNotifications(object,k,object[k],oldVal);
	}
	
	return oldVal;
}
kvcRegisterObserverParameterDescriptions=[
	
	// name				type		required	default
	'object',			'object',	false,		window,
	'keyPath',			'string',	true,		undefined,
	'funcOrFuncName',	undefined,	true,		undefined,
	'target',			'object',	false,		undefined,
	'fireNow',			'boolean',	false,		false
];
function kvcRegisterObserver() {
	
	var parameters=KVC.checkArguments(arguments,kvcRegisterObserverParameterDescriptions);
	
	var obj=parameters.object;
	var path=parameters.keyPath;
	var funcOrFuncName=parameters.funcOrFuncName;
	var target=parameters.target;
	var fireNow=parameters.fireNow;
	
	var	kvc=KVC_ObservedPaths[path];
	
	if(!kvc)
	{
		kvc=new KVC();
		KVC_ObservedPaths[path]=kvc;
	}
	
	var retVal=kvc.registerObserver(obj,funcOrFuncName,target);
	
	if(fireNow)
	{
		var val=obj[path];
		
		if(target)
		{
			target[funcOrFuncName](val,val,path,obj);
		}
		else
		{
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
	
	var parameters=KVC.checkArguments(arguments,kvcUnregisterObserverParameterDescriptions);
	
	var obj=parameters.object;
	var path=parameters.keyPath;
	var funcOrFuncName=parameters.funcOrFuncName;
	var target=parameters.target;
	
	var	kvc=KVC_ObservedPaths[path];
	
	if(!kvc)
	{
		return undefined;
	}
	
	var retVal=kvc.unregisterObserver(obj,funcOrFuncName,target);
	
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
	
	var parameters=KVC.checkArguments(arguments,kvcBindUIParameterDescriptions);
	
	// console.log("%s - %s - %s",parameters.selector,keyPath,parameters.events);
	
	$(parameters.selector).on(parameters.events,function(event) {
		
		var val=$(this).val();
		
		switch($(this)[0].type)
		{
			case 'checkbox':
				kvcSet(parameters.object,parameters.keyPath+'.'+String(val),$(this)[0].checked);
				break;
			case 'select-one':
				if($(this).attr('data-role')==='slider')
				{
					kvcSet(parameters.object,parameters.keyPath,(val===parameters.on));
				}
				else
				{
					kvcSet(parameters.object,parameters.keyPath,val);
				}
				break;
			default:
				kvcSet(parameters.object,parameters.keyPath,val);
				break;
		}
	});
	
	kvcRegisterObserver(parameters.object,parameters.keyPath,function(val,oldVal,path,obj) {
		
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
								$(element).slider('refresh');
							}
							break;
						case 'radio':
							element.checked=(element.value===val);
							if(typeof $(element).checkboxradio==='function')
							{
								$(element).checkboxradio('refresh');
							}
							break;
						case 'checkbox':
							element.checked=val[element.value];
							if(typeof $(element).checkboxradio==='function')
							{
								$(element).checkboxradio('refresh');
							}
							break;
						default:
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
					$(element).html(String(val));
					break;
			}
			
		});
	});
	
	
	if(parameters.value!==undefined)
	{
		kvcSet(parameters.object,parameters.keyPath,parameters.value);
	}
	else if(parameters.object[parameters.keyPath]!==undefined)
	{
		kvcSet(parameters.object,parameters.keyPath,parameters.object[parameters.keyPath]);
	}
}

//*****************************************************************************
// The class
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
	
	if(!obj)
	{
		obj=window;
	}
	
	var idx=this._indexOfObject(obj);
	
	if(idx<0)
	{
		idx=this.objects.length;
		this.objects.push(obj);
		this.funcs.push([]);
		this.targets.push([]);
	}
	
	this.funcs[idx].push(funcOrFuncName);
	this.targets[idx].push(target);
	
	return funcOrFuncName;
};
this.unregisterObserver=function(obj,funcOrFuncName,target) {
	
	if(!obj)
	{
		obj=window;
	}
	
	var idx=this._indexOfObject(obj);
	
	if(idx<0)
	{
		// Error: not registered!
		return undefined;
	}
	
	var objectFuncs=this.funcs[idx];
	var objectTargets=this.targets[idx];
	var	numObjectFuncs=objectFuncs.length;
	var fidx=-1;
	var i;
	
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
		// function not found
		return undefined;
	}
	
	objectFuncs.splice(fidx,1);
	objectTargets.splice(fidx,1);
	
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
	
	var idx=this._indexOfObject(obj);
	
	if(idx<0)
	{
		return;
	}
	
	var objectFuncs=this.funcs[idx];
	var objectTargets=this.targets[idx];
	var	numObjectFuncs=objectFuncs.length;
	var i;
	
	//
	// prevent recursion (like dumb jQuery Mobile sliders!)
	// 
	this.funcs[idx]=[];
	
	for(i=0;i<numObjectFuncs;i++)
	{
		var funcOrFuncName=objectFuncs[i];
		
		if(typeof funcOrFuncName==="string")
		{
			objectTargets[i][funcOrFuncName](val,oldVal,path,obj);
		}
		else
		{
			funcOrFuncName(val,oldVal,path,obj);
		}
	}
	
	this.funcs[idx]=objectFuncs;
};
this._indexOfObject=function(obj) {
	
	var	numObjects=this.objects.length;
	var i;
	var idx=-1;
	
	for(i=0;i<numObjects;i++)
	{
		if(this.objects[i]===obj)
		{
			idx=i;
			break;
		}
	}
	
	return idx;
};

//*****************************************************************************
}

//*****************************************************************************
//	Class methods
//*****************************************************************************
KVC.checkArguments=function(args,descriptions) {
	
	var parameters,name,type,required,defaultValue;
	var	i;
	
	if(args.length===1)
	{
		parameters=args[0];
	}
	else
	{
		parameters={};
		
		var ia=0;
		
		for(i=0;i<descriptions.length;i+=4)
		{
			name=descriptions[i];
			type=descriptions[i+1];
			required=descriptions[i+2];
			
			if(required || type===undefined || typeof args[ia]===type)
			{
				parameters[name]=args[ia++];
				
				if(ia>=args.length)
				{
					break;
				}
			}
		}
	}
	
	for(i=0;i<descriptions.length;i+=4)
	{
		name=descriptions[i];
		type=descriptions[i+1];
		required=descriptions[i+2];
		defaultValue=descriptions[i+3];
		
		var typeActual=typeof parameters[name];
		
		if(typeActual==='undefined')
		{
			if(required)
			{
				console.error("Required parameter '%s' missing",name);
				console.trace();
			}
			else if(typeof defaultValue!=='undefined')
			{
				parameters[name]=defaultValue;
			}
		}
		else
		{
			if(type!==undefined && typeActual!==type)
			{
				console.error("Parameter '%s' has type '%s', expected '%s'",name,typeActual,type);
				console.trace();
			}
		}
	}
	
	return parameters;
};

//**************************************************************************EOF
