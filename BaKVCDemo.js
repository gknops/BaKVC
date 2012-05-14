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
//	Global variables
//*****************************************************************************

//*****************************************************************************
// Startup
//*****************************************************************************
$(function() {
	
	//*****************************************************************************
	// Text Inputs
	//*****************************************************************************
	// 
	// Bind all elements with a class of "varTextInputExample" to a global
	// variable named varTextInputExample, set a value of "The quick brown fox",
	// and make the elements fire on both change and keyup.
	// 
	kvcBindUI('.varTextInputExample','varTextInputExample','The quick brown fox','keyup change');
	
	
	//*****************************************************************************
	// Search Inputs
	//*****************************************************************************
	// 
	// Similar to above, but use the parameter object form to invoke kvcBindUI.
	// More verbose, but easier to read.
	// 
	// No default value set.
	// 
	kvcBindUI({
		selector:	'.varSearchInputExample',
		keyPath:	'varSearchInputExample',
		events:		'keyup change',
		value:		'he'
	});
	
	//
	// Add a rather simplistic search example
	// 
	// The string to search in
	var demoString='The quick brown fox jumps over the lazy dog.';
	
	// Register an observer on the varSearchInputExample variable, and fire it now.
	kvcRegisterObserver('varSearchInputExample',true,function(val,oldVal,path,obj) {
		
		// Highlight search results in the span (case sensitive)
		var myHtml=(demoString.split(val)).join('<span class="red">'+val+'</span>');
		
		$('#searchInputExampleDemoSpan').html(myHtml);
	});
	
	
	//*****************************************************************************
	// Slider
	//*****************************************************************************
	kvcBindUI('.varSlider','varSlider',42);
	
	
	//*****************************************************************************
	// Flip toggle switch
	//*****************************************************************************
	// Here we use a property in a local object as the value to bind. Note that
	// toggle switches are special, BaKVC takes care of conversion from/to a boolean
	// value, so in the example below testObject.varToggleSwitch is a boolean.
	var testObject={};
	
	kvcBindUI('.varToggleSwitch',testObject,'varToggleSwitch',false);
	
	// A simple observer adding log output whenever testObject.varToggleSwitch
	// is changed in a KVC compliant way.
	kvcRegisterObserver(testObject,'varToggleSwitch',function(val,oldVal,path,obj) {
		
		console.log("varToggleSwitch set to '%s'",String(val));
	});
	
	
	//*****************************************************************************
	// Radio Buttons
	//*****************************************************************************
	kvcBindUI('.varRadioExample','varRadioExample','choice-3');
	
	//*****************************************************************************
	// Checkboxes
	//*****************************************************************************
	// Checkboxes are special too: BaKVC will treat the bound object (the global
	// varColorCheckboxes) as an anonymous object. That objects properties are the
	// value attributes of the HTML elements, and the prioperty value is a boolean
	// reflecting the checkbox state.
	// 
	// Note that non-existing properties in that object are trested as if they were
	// set to false.
	kvcBindUI('.varColorCheckboxes','varColorCheckboxes',{colorGreen: true});
	
	
	// A simple observer that displays a textual description of the bound object.
	kvcRegisterObserver('varColorCheckboxes',true,function(val,oldVal,path,obj) {
		
		var property;
		var html='{<br />';
		for(property in val)
		{
			if(val.hasOwnProperty(property))
			{
				html+='\t'+property+': '+val[property]+',<br />';
			}
		}
		html+='}';
		$('#varColorCheckboxesDesc').html(html);
	});
	
	
	//*****************************************************************************
	// Select Menu
	//*****************************************************************************
	kvcBindUI('.varSelectMenu','varSelectMenu','standard');
});

//
// This little hack allows siwtching between the standard and the jQuery Mobile
// enhanced version of the page. BaKVC takes care if the required 'refresh' calls
// to keep the enhanced elements in sync.
// 
var isJQM=false;

function switchToJQM() {
	
	if(isJQM)
	{
		//
		// If we are currently using jQuery Mobile, simply reload the page. That
		// will remove jQuery Mobile again.
		// 
		location.reload();
	}
	else
	{
		//
		// To add jQuery Mobile 'on the fly' add the required style sheet and
		// the jQuery Mobile javascript.
		// 
		$('head').append('<link rel="stylesheet" href="http://code.jquery.com/mobile/1.1.0/jquery.mobile-1.1.0.min.css" />');
		$.getScript('http://code.jquery.com/mobile/1.1.0/jquery.mobile-1.1.0.min.js');
		
		$('#jqmSwitch').val('Switch to standard HTML');
		
		// Triggering the create event makes jQuery Mobile enhance the elements.
		$('body').trigger("create");
		isJQM=true;
	}
}