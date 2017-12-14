

function page_load_actions(){
	$('#name').focus();
	$('#credit-card').hide();
	$('#paypal').hide();
	$('#bitcoin').hide();
	$('#other-title').hide();
	$('#total_cost').hide();
	$('#colors-js-puns').hide();
}

let total_cost = 0;
let activities_selected = 0;

$activity_details = $('.activities').children('label');
page_load_actions();

$('#title').change(()=> {
	$title = $('#title').val();
	if($title == 'other') {
		$('#other-title').show();
		$('#other-title').focus();
	} else {
		$('#other-title').hide();
	}

});

// Hide the t-shirts color menu when the design is not selected
// When the design is selected, display the relevant colors to the design

$('#design').change(()=>{

	switch($('#design').val()){
		case 'js puns':
			$('.heart-js').hide();
			$('.js-pun').show();
			$('.js-pun')[0].selected = 'selected';
			$('#colors-js-puns').show();
			$('#color').focus();
			break;
		case 'heart js':
			$('.js-pun').hide();
			$('.heart-js').show();
			$('.heart-js')[0].selected = 'selected';
			$('#colors-js-puns').show();
			$('#color').focus();
			break;
		default:
			$('#colors-js-puns').hide();
			break;
	}

});

$('#payment').change((e) => {
	$paymentType = $('#payment').val();
	switch($paymentType){
		case 'credit card':
				$('#credit-card').show();
				$('#cc-num').focus();
				$('#paypal').hide();
				$('#bitcoin').hide();
				break;
		case 'paypal':
				$('#credit-card').hide();
				$('#paypal').show();
				$('#bitcoin').hide();
				break;
		case 'bitcoin':
				$('#credit-card').hide();
				$('#paypal').hide();
				$('#bitcoin').show();
				break;

	}
});


// ********************************************************************************************************* //
// From a given activity text, separate name, cost, and time 
// ********************************************************************************************************* //

function process_activity(node){

		$text = node.textContent;
		[$details, $cost] = $text.split('$');
		$details = $details.replace(',', '');
		[$name, $time] = $details.split(':');
		$activity = {
			'name': $name.trim(),
			'time': $time.trim(),
			'cost': $cost.trim()
		};

	return $activity;
}


// ********************************************************************************************************* //
// Calculate and display the total cost of the activities selected                                           //
// Add the cost if the activity is checked, and subtract the cost if activity is unchecked                   //
// ********************************************************************************************************* //


function display_total_cost($target){

	$current_activity = process_activity($target.parentNode);
	if($target.checked){
		total_cost += parseInt($current_activity['cost']);
	} else {
		total_cost -= parseInt($current_activity['cost']);
	} 
	$('#total_cost').text('Total Cost: ' + total_cost);
	$('#total_cost').show();

}

// ********************************************************************************************************* //
// Once an activity is checked, find out if there is another activity at the same time                       //
// If a conflicting activity exists then disable it from being selected                                      //
// If a given activity is unchecked, then enable other conflicting activities                                //
// ********************************************************************************************************* //


function toggle_conflicting_activities($checked, $checked_activity){

	$activity_details.each(($index)=>{

		// if current activity time and activities index time conflict 
		$activity = $activity_details[$index].textContent;
		if($checked_activity['time'] && $activity.includes($checked_activity['time']) && !$activity.includes($checked_activity['name'])){
			if($checked) {
				$activity_details[$index].children[0].disabled = true;
			} else {
				$activity_details[$index].children[0].disabled = false;
			}
		}
	});
}


// ********************************************************************************************************* //
// Handler for activities checked.
// In addition to calling functions to calculate total cost and toggling a conflicting activity,
// calculate the total number of activities selected for validation
// ********************************************************************************************************* //

$('.activities').change((e)=>{
	$target = e.target;

	// Display the total cost of the activities
	display_total_cost($target);
	if($target.checked) {
		activities_selected ++;
	} else {
		activities_selected --;
	}

	// Disable/enable the activities that conflict with the time
	toggle_conflicting_activities($target.checked, $current_activity);

});


// ********************************************************************************************************* //
// Function to test if the numberic fields such as credit card number, cvv number and zipcode are valid      //
// Check if the input is not empty                                                                           //
// check if the length is not out of bounds                                                                  //
// check if it only has numbers and not alphabets                                                            //
// return the error number based on validation error                                                         //
// ********************************************************************************************************* //

function validate_numeric_fields($num_field, $length_limits){
	$len = $num_field.val().length;
	$errorNo = 0;

	if($length_limits.length == 1){
		$length_criteria = $len != $length_limits[0];
	} else {
		$length_criteria = $len < $length_limits[0] || $len > $length_limits[1];
	}

	if(!$len){
		$errorNo = 1;
	} else if(!$num_field.val().match(/^[0-9]+$/)){
		$errorNo = 2;
	} else if($length_criteria){
		$errorNo = 3;
	}

	return $errorNo;
}

// ********************************************************************************************************* //
// Function to test email format                                                                             //
// Return 0 if wrong format                                                                                  //
// Return 1 if correct format                                                                                //
// ********************************************************************************************************* //


function checkEmail(email) {

    var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    if (!filter.test(email)) {
    	// email.focus;
    return false;
 	}

 	return true;

}

// ********************************************************************************************************* //
// Function to validate a field based on passing condition                                                   //
// if condition fails then display error inside the given span and assign error class to the label           //
// if condition passes then remove the error and remove the class                                            //
// ********************************************************************************************************* //


function validate_field_and_display_error ($input_field_id, $pass_condition, $error_id, error_message){

	$error_span = $($error_id);
	$error = true;

	if(!$pass_condition){
		$error_span.text(error_message);
		$error_span.closest('label').addClass('error');

		if($($input_field_id)[0].type == 'text' || $($input_field_id)[0].type == 'email'){
			$($input_field_id).addClass('error');
		}

		$error = true;
	} else {
		$error_span.empty();
		$error_span.closest('label').removeClass('error');

		if($($input_field_id)[0].type == 'text' || $($input_field_id)[0].type == 'email'){
			$($input_field_id).removeClass('error');
		}

		$error = false;
	}

	return $error;
}


// Validate the credit card number as it is being typed.

$('#cc-num').on('keyup', ($e)=>{

	$err_message = ['(enter a cc number)', '(only numbers please)', '(13 to 16 digits)'];
	$error_no = validate_numeric_fields($('#cc-num'), [13, 16]);
	validate_field_and_display_error('#cc-num', !$error_no, '#cc-num-error-message', $err_message[$error_no -1]);
});


// ********************************************************************************************************* //
// Handler for submit button                                                                                 //
// Validate the input fields and display appropriate error                                                   //
// ********************************************************************************************************* //

$("button[type='submit']").click((event)=>{
	event.preventDefault();

	$errors = 0;
	// An object to hold the error messages, validation conditions and the span to display the error messages
	let validation_errors = {

			'name':	{
					'err_message': ['(please provide your name)'],
					'input_field_id': '#name',
					'pass_condition': $('#name').val(),
					'err_span': '#name-error-message'
					},

			'email': {
					'err_message': ['(please provide a valid email address)'],
					'input_field_id': '#mail',
					'pass_condition': checkEmail($('#mail').val()),
					'err_span': '#email-error-message'
					},

			'tshirt': {
					'err_message': ["Don't forget to pick a T-shirt"],
					'input_field_id': '#design',
					'pass_condition': !($('#design').val() === 'Select Theme'),
					'err_span': '#tshirt-error-message'
					},

			'activities': {
					'err_message': ["Please select an Activity"],
					'input_field_id': '.activities',
					'pass_condition': activities_selected,
					'err_span': '#activities-error-message'
					},

			'payment_method': {
					'err_message': ["Please select a payment method"],
					'input_field_id': '#payment',
					'pass_condition': !($('#payment').val() === 'select_method'),
					'err_span': '#payment-method-error-message'
					}

			};

	// A separate object to hold info regarding the 
	let cc_errors = {

			'cc_num':	{
					'input': $('#cc-num'),
					'input_field_id': '#cc-num',
					'err_message': ['(enter a cc number)', '(invalid)', '(13 to 16 digits)'],
					'err_span': '#cc-num-error-message',
					'range': [13, 16]
					},

			'cc_zipcode':	{
					'input': $('#zip'),
					'input_field_id': '#zip',
					'err_message': ['(enter code)', '(invalid)', '(5 digits)'],
					'err_span': '#zipcode-error-message',
					'range': [5]
					},

			'cc_cvv':	{
					'input': $('#cvv'),
					'input_field_id': '#cvv',
					'err_message': ['(enter cvv)', '(invalid)', '(3 digits)'],
					'err_span': '#cvv-error-message',
					'range': [3]
					}

			};



	for(var key in validation_errors){
		$err = validate_field_and_display_error(validation_errors[key]['input_field_id'],validation_errors[key]['pass_condition'], validation_errors[key]['err_span'], validation_errors[key]['err_message'][0]);
		if ($err) $errors++;
	}

	if($('#payment').val() === 'credit card'){
		for(var cckey in cc_errors){
				$error_no = validate_numeric_fields(cc_errors[cckey]['input'], cc_errors[cckey]['range']);
				validate_field_and_display_error(cc_errors[cckey]['input_field_id'], !$error_no, cc_errors[cckey]['err_span'], cc_errors[cckey]['err_message'][$error_no -1]);
				if ($error_no) $errors++;
		}
	}

	//Submit the form if there are no errors
	if(!$errors) {
		$('form').submit();
	}

});