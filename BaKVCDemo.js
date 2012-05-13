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
	kvcBindUI('.varTextInputExample','varTextInputExample','The quick brown fox','keyup change');
	
	
	//*****************************************************************************
	// Search Inputs
	//*****************************************************************************
	kvcBindUI({
		selector:	'.varSearchInputExample',
		keyPath:	'varSearchInputExample',
		events:		'keyup change'
	});
	
	
	var demoString='The quick brown fox jumps over the lazy dog.';
	
	kvcRegisterObserver('varSearchInputExample',function(val,oldVal,path,obj) {
		
		var myHtml=(demoString.split(val)).join('<span class="red">'+val+'</span>');
		
		$('#searchInputExampleDemoSpan').html(myHtml);
	});
	
	kvcSet('varSearchInputExample','he');
	
	
	//*****************************************************************************
	// Slider
	//*****************************************************************************
	kvcBindUI('.varSlider','varSlider',42);
	
	
	//*****************************************************************************
	// Flip toggle switch
	//*****************************************************************************
	var testObject={};
	
	kvcBindUI('.varToggleSwitch',testObject,'varToggleSwitch',false);
	
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
	kvcRegisterObserver('varColorCheckboxes',function(val,oldVal,path,obj) {
		
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
	
	kvcBindUI('.varColorCheckboxes','varColorCheckboxes',{colorGreen: true});
	
	
	//*****************************************************************************
	// Select Menu
	//*****************************************************************************
	kvcBindUI('.varSelectMenu','varSelectMenu','standard');
});

var isJQM=false;

function switchToJQM() {
	
	if(isJQM)
	{
		location.reload();
	}
	else
	{
		$('head').append('<link rel="stylesheet" href="http://code.jquery.com/mobile/1.1.0/jquery.mobile-1.1.0.min.css" />');
		$.getScript('http://code.jquery.com/mobile/1.1.0/jquery.mobile-1.1.0.min.js');
		
		$('#jqmSwitch').val('Switch to standard HTML');
		$('body').trigger("create");
		isJQM=true;
	}
}