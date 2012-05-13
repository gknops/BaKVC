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

	var testObject={};
	
//*****************************************************************************
// Startup
//*****************************************************************************
$(function() {
	
	//*****************************************************************************
	// Text Inputs
	//*****************************************************************************
	
	kvcBindAuto('.varTextInputExample',testObject,'varTextInputExample','The quick brown fox','keyup change');
	
	
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
	kvcBindAuto('.varSlider',testObject,'varSlider',42);
	
	
	//*****************************************************************************
	// Flip toggle switch
	//*****************************************************************************
	kvcBindAuto('.varToggleSwitch',testObject,'varToggleSwitch',false);
	
	kvcRegisterObserver(testObject,'varToggleSwitch',function(val,oldVal,path,obj) {
		
		console.log("varToggleSwitch set to '%s'",String(val));
	});
	
	
	//*****************************************************************************
	// Radio Buttons
	//*****************************************************************************
	kvcBindAuto('.varRadioExample',testObject,'varRadioExample','choice-3');
	
	//*****************************************************************************
	// Checkboxes
	//*****************************************************************************
	kvcRegisterObserver(testObject,'varColorCheckboxes',function(val,oldVal,path,obj) {
		
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
	
	kvcBindAuto('.varColorCheckboxes',testObject,'varColorCheckboxes',{colorGreen: true});
	
	
	//*****************************************************************************
	// Select Menu
	//*****************************************************************************
	kvcBindAuto('.varSelectMenu',testObject,'varSelectMenu','standard');
});

function switchToJQM() {
	
	$('#jqmSwitch').remove();
	
	$('head').append('<link rel="stylesheet" href="http://code.jquery.com/mobile/1.1.0/jquery.mobile-1.1.0.min.css" />');
	$.getScript('http://code.jquery.com/mobile/1.1.0/jquery.mobile-1.1.0.min.js');
	
	$('body').trigger("create");
}