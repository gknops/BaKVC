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
	
	kvcRegisterObserver(testObject,'varSearchInputExample',function(obj,path,val) {
		
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
		keyPath:	'varToggleSwitch'
	});
	
	kvcRegisterObserver(testObject,'var5',function(obj,path,val) {
		
		console.log("var5 set to '%s'",String(val));
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
	
	kvcRegisterObserver(testObject,'varColorCheckboxes',function(obj,path,val) {
		
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
	
	//*****************************************************************************
	// Example 1: Two inputs and a span bound to the same variable
	//*****************************************************************************
	
	// Make changes to `input1_1` modify `testObject.var1`
	$("#input1_1").on('keyup change',function(){
		
		//
		// To modify a property so that observers are notified, instead of
		// 
		// 	testObject.var1=newVal;
		// 
		// use
		// 
		// 	kvcSet(testObject,'var1',newVal);
		// 
		kvcSet(testObject,'var1',$(this).val());
	});
	
	// Make changes to `testObject.var1` modify `input1_1`
	kvcRegisterObserver(testObject,'var1',function(obj,path,val) {
		
		$('#input1_1').val(val);
	});
		
	
	// Using convenience method
	
	// For `input1_2` we use the convenience method, which does the same as
	// all of the the above
	kvcBindVal(testObject,'var1','#input1_2','','keyup change');
	
	
	
	// We also use the convenience method to bind `span1`.
	kvcBindHTML(testObject,'var1','#span1');
	
	
	// Now set an intial value (again, remember to use kvcSet instead of directly assiging)
	
	kvcSet(testObject,'var1','Bound to testObject.var1, Try me!');
	
	
	
	//*****************************************************************************
	// Example 2: Two inputs and a span bound to the same variable with less code
	//*****************************************************************************
	
	// Both inputs have a "var2" class, so we can handle them in a single line:
	kvcBindVal(testObject,'var2','.var2','','keyup change');
	
	// And the span:
	kvcBindHTML(testObject,'var2','#span2');
	
	// Initial value
	kvcSet(testObject,'var2','Bound to testObject.var2, Try me!');
	
	
	//*****************************************************************************
	// Example 3: Two inputs and a span bound to the same variable with even less code
	//*****************************************************************************
	// Bind all elements with 'var3' class to the variable, set intial value
	kvcBindAuto({
		selector:	'.var3',
		object:		testObject,
		keyPath:	'var3',
		events:		'keyup change',
		value:		'Bound to testObject.var3, Try me!'
	});
	
	
	//*****************************************************************************
	// Example 4: Two inputs and a span bound to the same variable with even less code
	//*****************************************************************************
	// Bind all elements with 'var3' class to the variable, set intial value
	kvcBindAuto({
		selector:	'.var4',
		object:		testObject,
		keyPath:	'var4',
		value:		2
	});
	
	
	
	
	
	
	// kvcRegisterObserver(testObject,'timeVal',function(obj,path,val) {
	// 	
	// 	$('#startTime').val(val);
	// 	$('#startTime2').val(val);
	// });
	
	// kvcRegisterObserver(testObject,'timeVal',function(obj,path,val) {
	// 	
	// 	$('#startTime').val(val);
	// });
	// 
	// kvcRegisterObserver(testObject,'timeVal',function(obj,path,val) {
	// 	
	// 	$('#startTime2').val(val);
	// });
	// 
	// // $("#startTime").change(startTimeChanged);
	// // $("#startTime").keyup(startTimeChanged);
	// 
	// $("#startTime").on('keyup change',function(event) { kvcSet(testObject,'timeVal',$(this).val()); });
	// 
	// $("#startTime2").change(startTimeChanged);
	// $("#startTime2").keyup(startTimeChanged);
	
	
	// kvcBindVal(testObject,'timeVal','#startTime','','keyup change');
	// kvcBindVal(testObject,'timeVal','#startTime2','','keyup change');
	// kvcBindVal(testObject,'timeVal','.startTime','','keyup change');
	kvcBindVal(testObject,'timeVal','#homeContent','.startTime','keyup change');
	
	
	kvcSet(testObject,'timeVal','Here and now!');
	
	
	kvcRegisterObserver(testObject,'inner.testVal',function(obj,path,val) {
		
		$('#inner').val(val);
		$('#innerSpan').html(val);
		
	});
	
	$("#inner").change(function() {
		kvcSet(testObject,'inner.testVal',$(this).val());
	});
	
	kvcSet(testObject,'inner.testVal','This is inner!');
	
	
	
	var innerObserver=kvcRegisterObserver(testObject.inner,'testVal',function(obj,path,val) {
		
		$('#innerSpan2').html(val);
		
	});
	
	$("#unbindInnerSpan2").click(function() {
		kvcUnregisterObserver(testObject.inner,'testVal',innerObserver);
	});
	
	
	kvcBindSlider(testObject,'sliderVal','#testSlider1');
	kvcBindHTML(testObject,'sliderVal','#testSlider1Span');
	
	kvcBindVal(testObject,'sliderVal','#testSlider1Input');
});

function startTimeChanged() {
	
	kvcSet(testObject,'timeVal',$(this).val());
}
