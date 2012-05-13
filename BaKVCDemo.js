//*****************************************************************************
//	Copyright 2012 BITart Gerd Knops, all rights reserved.
//
//	Project: Sprinkler
//	File   : BaKVCDemo.js
//	Author : Gerd Knops gerti@BITart.com
//
//*****************************************************************************
//
//	Description:
//	Test KVC code
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
//	Class variables
//*****************************************************************************

	var testObject={};
	testObject.inner={};
	
//*****************************************************************************
// Startup
//*****************************************************************************
$(function() {
	
	//*****************************************************************************
	// Text Inputs
	//*****************************************************************************
	
	kvcBindAuto({
		selector:	'.varTextInputExample',
		object:		testObject,
		keyPath:	'varTextInputExample',
		events:		'keyup change',
		value:		'The quick brown fox'
	});
	
	
	//*****************************************************************************
	// Search Inputs
	//*****************************************************************************
	
	kvcBindAuto({
		selector:	'.varSearchInputExample',
		object:		testObject,
		keyPath:	'varSearchInputExample',
		events:		'keyup change'
	});
	
	
	var demoString='The quick brown fox jumps over the lazy dog.';
	
	kvcRegisterObserver(testObject,'varSearchInputExample',function(val,oldVal,path,obj) {
		
		var myHtml=(demoString.split(val)).join('<span class="red">'+val+'</span>');
		
		$('#searchInputExampleDemoSpan').html(myHtml);
	});
	
	kvcSet(testObject,'varSearchInputExample','he');
	
	
	//*****************************************************************************
	// Slider
	//*****************************************************************************
	
	kvcBindAuto({
		selector:	'.varSlider',
		object:		testObject,
		keyPath:	'varSlider',
		value:		42
	});
	
	
	//*****************************************************************************
	// Flip toggle switch
	//*****************************************************************************
	kvcBindAuto({
		selector:	'.varToggleSwitch',
		object:		testObject,
		keyPath:	'varToggleSwitch',
		value:		false
	});
	
	kvcRegisterObserver(testObject,'varToggleSwitch',function(val,oldVal,path,obj) {
		
		console.log("varToggleSwitch set to '%s'",String(val));
	});
	
	
	//*****************************************************************************
	// Radio Buttons
	//*****************************************************************************
	
	kvcBindAuto({
		selector:	'.varRadioExample',
		object:		testObject,
		keyPath:	'varRadioExample',
		value:		'choice-3'
	});
	
	
	//*****************************************************************************
	// Checkboxes
	//*****************************************************************************
	
	kvcRegisterObserver(testObject,'varColorCheckboxes',function(val,oldVal,path,obj) {
		
		var html='{<br />';
		for(property in val)
		{
			html+='\t'+property+': '+val[property]+',<br />';
		}
		html+='}';
		$('#varColorCheckboxesDesc').html(html);
	});
	
	kvcBindAuto({
		selector:	'.varColorCheckboxes',
		object:		testObject,
		keyPath:	'varColorCheckboxes',
		value:		{colorGreen: true}
	});
	
	
	//*****************************************************************************
	// Select Menu
	//*****************************************************************************
	
	kvcBindAuto({
		selector:	'.varSelectMenu',
		object:		testObject,
		keyPath:	'varSelectMenu',
		value:		'standard'
	});
	
});
