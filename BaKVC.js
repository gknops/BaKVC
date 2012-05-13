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
function kvcSet(obj,path,val) {
	
	var	kvc,kvc2,oldVal,k,p;
	var	idx=path.indexOf('.');
	
	if(idx<0)
	{
		oldVal=obj[path];
		obj[path]=val;
	}
	else
	{
		k=path.substr(0,idx);
		p=path.substr(idx+1);
		
		oldVal=kvcSet(obj[k],p,val);
		
		kvc2=KVC_ObservedPaths[k];
	}
	
	if((kvc=KVC_ObservedPaths[path]))
	{
		kvc.pushNotifications(obj,path,val,oldVal);
	}
	
	if(kvc2)
	{
		kvc2.pushNotifications(obj,k,obj[k],oldVal);
	}
	
	return oldVal;
}
function kvcRegisterObserver(obj,path,funcOrFuncName,target,fireNow) {
	
	if(typeof target==="boolean")
	{
		fireNow=target;
		target=undefined;
	}
	
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
		
		if(typeof funcOrFuncName==="string")
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
function kvcUnregisterObserver(obj,path,funcOrFuncName,target) {
	
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
// Convenience methods, require jQuery
//*****************************************************************************
kvcBindAutoParameterDescriptions=[
	
	// name			type		required	default
	'selector',		'string',	true,		undefined,
	'selector2',	'string',	false,		undefined,
	'object',		'object',	true,		undefined,
	'keyPath',		'string',	true,		undefined,
	'events',		'string',	false,		'change',
	'value',		undefined,	false,		undefined,
	'on',			'string',	false,		'on',
	'off',			'string',	false,		'off'
];
function kvcBindAuto(parameters) {
	
	parameters=KVC.checkParameters(parameters,kvcBindAutoParameterDescriptions);
	
	// console.log("%s - %s - %s",parameters.selector,keyPath,parameters.events);
	
	$(parameters.selector).on(parameters.events,parameters.selector2,function(event) {
		
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
	
	var combinedSelector=(parameters.selector2!==undefined)?parameters.selector+' '+parameters.selector2:parameters.selector;
	
	console.log("combinedSelector: %s",combinedSelector);
	
	kvcRegisterObserver(parameters.object,parameters.keyPath,function(val,oldVal,path,obj) {
		
		$(combinedSelector).each(function(index,element){
			
			console.log("%s element tag: %s  type: %s",path,element.tagName,element.type);
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
KVC.checkParameters=function(parameters,descriptions) {
	
	var	i;
	for(i=0;i<descriptions.length;i+=4)
	{
		var	name=descriptions[i];
		var type=descriptions[i+1];
		var required=descriptions[i+2];
		var defaultValue=descriptions[i+3];
		
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
