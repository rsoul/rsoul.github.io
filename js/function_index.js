/* -------------- */
/* UTIL FUNCTIONS */
/* -------------- */

/* GET TODAY DATE YYYY-MM-DD */
function getToday() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	if(dd<10){
	        dd='0'+dd;
	} 
	if(mm<10){
	    mm='0'+mm;
	} 

	today = yyyy+'-'+mm+'-'+dd;
	return today;
}

/* GENERATES RANDOM DATA FOR PRESENTATION INSTEAD OF MANUALLY INPUTTING IT*/
function generateRandomData(n,ex,ev){
	/*
	int n = number of data you want to generate
	bool ex = true if you want to generate exams
	bool ev = true if you want to generate calendar events*/
	if(ex){
		for(i=0;i<n;i++){
			addExam(i+1 ,"2001/01/01",Math.floor(Math.random() * (30 - 18) ) + 18,"no",Math.floor(Math.random() * (24 - 2) ) + 2);
		}
	}
	if(ev){
		for(i=0;i<n;i++){
			addCalendarEvent(i+1,getToday(),"21:00");
		}
	}
	/*lo so che la generazione della data e dell'ora fanno schifo ma è davvero lavoro sprecato*/
}

/* GET A SUM OF ALL CFU TAKEN */
function getProgress(){
	if (typeof(localStorage.exams) == "undefined") return false;
	var exams = JSON.parse(localStorage.exams);
	var len = exams.length;
	var progress = 0;
	for (i=0; i<len; i++) progress += parseInt(exams[i].cfu);
	return progress;
}

/* AVERAGE WITHOUT IDONEITY */
function calculateAverage(array){
	var avg=0.0;
	var valid=0;
	for(i=0;i<array.lenght;i++){
		if (array[i].grade!=null){
			valid++;
			avg+=array[i].grade;
		}

	}
	return avg/valid;
}

/* WEIGHTED AVERAGE WITHOUT IDONEITY */
function calculateWAverage(array){
	var avg;
	var cfu;
	for(i=0;i<array.lenght;i++){
		if (array[i].grade!=null){
			avg+=(array[i].grade*array[i].cfu);
			cfu+=array[i].cfu;
		}
	}

	return avg/cfu;
}



/* --------------- */
/* ON LOAD METHODS */
/* --------------- */

/* INITIALIZE DASHBOARD SETTING ADDEXAM, EDITEXAM, ADDCALENDAREVENT AND EDITCALENDAREVENT (date default, max, min) */
function initDashboard() {
	var today = getToday();
	loadAddCalendar(today);
	loadAddExam(today);
	loadEditCalendar(today);
	loadEditExam(today);

	checkStorageCFU();
	initStorageExams();
	initStorageCalendar();

	printExams();
	printCalendar();
	printStatistics();
	return true;
}

/* LOADING CALENDAR ADD */
function loadAddCalendar(today) {
	var add_calendar_date = $("#calendarAddDate");
	add_calendar_date.attr("min", today);
	add_calendar_date.val(today);
}

/* LOADING CALENDAR EDIT */
function loadEditCalendar(today) {
	var edit_calendar_date = $("#calendarEditDate");
	edit_calendar_date.attr("min", today);
}

/* LOADING EXAM ADD */
function loadAddExam(today) {
	var add_exam_date = $("#examAddDate");
	add_exam_date.attr("max", today);
	add_exam_date.val(today);
}

/* LOADING EXAM EDIT */
function loadEditExam(today) {
	var edit_exam_date = $("#examEditDate");
	edit_exam_date.attr("max", today);
}

/* ------------------------------- */


/* SHOW FIELDS OF THE --EDIT EXAM-- */
function initEditExam(type, code, date, grade, cfu) {
	$("#examEditType").val(type).attr('selected','selected');	//NOT WORKING
	$("#examEditType").attr("disabled", true);
	$("#examEditCode").val(code);
	$("#examEditDate").val(date);
	if($("#examEditType :selected").val() == "Idoneità") $("#examEditGradeDiv").css({"visibility": "hidden", "display": "none"});
	else {
		$("#examEditGradeDiv").css({"visibility": "visible", "display": ""});
		if (grade == 31) {
			$("#examEditGrade").val("30");
			$("#examEditPraiseYes").prop("checked", true);
			$("#examEditPraiseDiv").css("visibility", "visible");
			$("#examEditPraiseDiv").css("display", "block");
		}
		else {
			$("#examEditGrade").val(grade);
			$("#examEditPraiseNo").prop("checked", true);
			if (grade == 30) {
				$("#examEditPraiseDiv").css("visibility", "visible");
				$("#examEditPraiseDiv").css("display", "block");
			}
			else {
				$("#examEditPraiseDiv").css("visibility", "collapse");
				$("#examEditPraiseDiv").css("display", "none");
			}
		}
	}
	$("#examEditCFU").val(cfu);
	hideAlert("examEditAlert");
}

/* SHOW FIELDS OF THE --EDIT EVENT-- */
function initEditEvent(name, date, time) {
	$("#calendarEditName").val(name);
	$("#calendarEditDate").val(date);
	$("#calendarEditTime").val(time);
	hideAlert("calendarEditAlert");
}

/* RESET --ADD EXAM-- FIELDS (NOT EDIT EXAM FIELDS) */
function resetAddExamFields() {
	$("#examAddType").val("");
	$("#examAddCode").val("");
	$("#examAddDate").val(getToday());
	$("#examAddGrade").val("");
	$("#examAddGrade").css("visibility", "visible");
	loadAddExam(getToday());
	$("#examAddPraiseDiv").css("visibility", "collapse");
	$("#examAddPraiseDiv").css("display", "none");
	$("#examAddPraiseNo").attr("checked", true);
	$("#examAddCFU").val("");
	hideAlert("examAddAlert");
	$("#examAddCode").select();
}

/* RESET --ADD EVENT-- FIELDS (NOT EDIT EVENT FIELDS) */
function resetAddEventFields() {
	$("#calendarAddName").val("");
	$("#calendarAddDate").val(getToday());
	$("#calendarAddTime").val("");
	hideAlert("calendarAddAlert");
	$("#calendarAddName").select();
}

/* SET THE PROGRESS BAR WITH THE PERCENT */
function getPercentageCFU(){
	var takenCFU = getProgress();
	var totalCFU = parseInt(localStorage.getItem("CFU"));
	var percentageCFU = Math.floor((takenCFU * 100)/totalCFU);
	var progressBar = $("#progressBar");
	if(percentageCFU > 100) percentageCFU = 100;
	progressBar.css("width", percentageCFU + "%");
	if (percentageCFU>3) progressBar.html(percentageCFU + "%");
	progressBar.attr("aria-valuenow", percentageCFU);
	return true;
}


/* CREATE AND SHOW A SAMPLCE CHART ON THE INDEX HTML */
function showSampleChart() {
	var ctx = $("#user_chart");
		new Chart(ctx,
			{"type":"doughnut",
			"data":{
				"labels": ["Esami Passati","Esami Mancanti","Idoneità"],
				"datasets":[{
					"label":"Dataset",
					"data":[18,3,2],
					"backgroundColor":[
						"rgb(255, 99, 132)",
						"rgb(54, 162, 235)",
						"rgb(255, 205, 86)"
					]
				
				}]
			}
		});
	return true;
}

/* CHECK IF IS AN EXAM OR IDONEITY FOR SHOWING GRADE */
function showAddExamGrade() {
	if ($("#examAddType :selected").val() == "Idoneità") {
		$("#examAddGradeDiv").css({"visibility": "hidden", "display": "none"});
		$("#examAddGrade").removeAttr("required");
	}
	else {
		$("#examAddGradeDiv").css({"visibility": "visible", "display": ""});
		$("#examAddGrade").attr("required", "required");
	}
}

/* PERSONALIZED BOOTSTRAP ALERT WITH ELEMENT WHERE ALERT, WHERE THE TEXT IS IN AND THE TEXT TO BE WRITTEN */
function showAlert(elem_alert, elem_alert_text, s){
	$("#" + elem_alert).css("visibility", "visible");
	$("#" + elem_alert_text).text(s);
}

/* HIDE ALERT ON CLOSE CLICK */
function hideAlert(elem_alert) {
	$("#" + elem_alert).css("visibility", "hidden");
}

/* CHECK IF HAVE TO SHOW PRAISE RADIO BUTTON (GRADE == 30) ON --ADD EXAM-- */
function showAddExamPraise() {
	var add_exam_grade = $("#examAddGrade").val();
	var add_exam_praise_div = $("#examAddPraiseDiv");
	if(add_exam_grade == "30") {
		add_exam_praise_div.css("visibility", "visible");
		add_exam_praise_div.css("display", "block");
	}
	else {
		add_exam_praise_div.css("visibility", "collapse");
		add_exam_praise_div.css("display", "none");
	}
	return true;
}

/* CHECK IF HAVE TO SHOW PRAISE RADIO BUTTON (GRADE == 30) ON --EDIT EXAM-- */
function showEditExamPraise() {
	var edit_exam_grade = $("#examEditGrade");
	var edit_exam_praise_div = $("#examEditPraiseDiv");
	if(edit_exam_grade.val() == "30") {
		edit_exam_praise_div.css("visibility", "visible");
		edit_exam_praise_div.css("display", "block");
	}
	else {
		edit_exam_praise_div.css("visibility", "collapse");
		edit_exam_praise_div.css("display", "none");
	}
	return true;
}

/* SHOW PREVIOUS EXAMS TABLE PAGE (BUTTON PREVIOUS) */
function examShowBodyPrevious(clicked_button, page_max) {
	if(clicked_button.id == "exam_page_previous") {
		var toHide = $("#examTable tbody:visible");
		var toShow = $("#examTable tbody:visible").prev();
		var toDeactive = $("#my_exams_paging .active");
		var toActive = $("#my_exams_paging .active").prev();
		toHide.css({"visibility": "collapse", "display": "none"});
		toShow.css({"visibility": "visible", "display": ""});
		toDeactive.removeClass("active");
		toActive.addClass("active");

		if(page_max == 1) {
			$("#my_exams_paging #exam_page_next").addClass("disabled"); 
			$("#my_exams_paging #exam_page_previous").addClass("disabled"); 
			return true; 
		}

		if($("#my_exams_paging .active").attr("id") == "exam_page_button_1") {
			$("#my_exams_paging #exam_page_previous").addClass("disabled");
			$("#my_exams_paging #exam_page_next").removeClass("disabled");
			return true;
		}
		else {
			$("#my_exams_paging #exam_page_previous").removeClass("disabled");
			$("#my_exams_paging #exam_page_next").removeClass("disabled");
		}
		
		return true;
	}
}

/* SHOW NEXT EXAMS TABLE PAGE (BUTTON NEXT) */
function examShowBodyNext(clicked_button, page_max) {
	if(clicked_button.id == "exam_page_next") {
		var toHide = $("#examTable tbody:visible");
		var toShow = $("#examTable tbody:visible").next();
		var toDeactive = $("#my_exams_paging .active");
		var toActive = $("#my_exams_paging .active").next();
		toHide.css({"visibility": "collapse", "display": "none"});
		toShow.css({"visibility": "visible", "display": ""});
		toDeactive.removeClass("active");
		toActive.addClass("active");

		if(page_max == 1) { 
			$("#my_exams_paging #exam_page_previous").addClass("disabled"); 
			$("#my_exams_paging #exam_page_next").addClass("disabled");
			return true;
		}
		if($("#my_exams_paging .active").attr("id") == "exam_page_button_"+page_max) {
			$("#my_exams_paging #exam_page_next").addClass("disabled");
			$("#my_exams_paging #exam_page_previous").removeClass("disabled");
			return true;
		}
		else {
			$("#my_exams_paging #exam_page_next").removeClass("disabled");
			$("#my_exams_paging #exam_page_previous").removeClass("disabled");
		}

		return true;
	}
}

/* SHOW THE CLICKED EXAMS TABLE PAGE (NUMBER BUTTON) */
function examShowBody(clicked_body, clicked_button, page_max) {
	$("#examTable tbody").css({"visibility": "collapse", "display": "none"});
	$(clicked_body).css({"visibility": "visible", "display": ""});
	$("#examPages li").removeClass("active");
	$(clicked_button).addClass("active");

	if(page_max == 1) { 
		$("#my_exams_paging #exam_page_previous").addClass("disabled"); 
		$("#my_exams_paging #exam_page_next").addClass("disabled");
		return true;
	}
	if($("#my_exams_paging .active").attr("id") == "exam_page_button_"+page_max) {
		$("#my_exams_paging #exam_page_next").addClass("disabled");
		$("#my_exams_paging #exam_page_previous").removeClass("disabled");
		return true;
	}
	else if($("#my_exams_paging .active").attr("id") == "exam_page_button_1") {
		$("#my_exams_paging #exam_page_previous").addClass("disabled");
		$("#my_exams_paging #exam_page_next").removeClass("disabled");
		return true;
	}
	else {
		$("#my_exams_paging #exam_page_previous").removeClass("disabled");
		$("#my_exams_paging #exam_page_next").removeClass("disabled");
	}
	
	return true;
}


/* SHOW PREVIOUS CALENDAR TABLE PAGE (BUTTON PREVIOUS) */
function calendarShowBodyPrevious(clicked_button, page_max) {
	if(clicked_button.id == "calendar_page_previous") {
		var toHide = $("#calendarTable tbody:visible");
		var toShow = $("#calendarTable tbody:visible").prev();
		var toDeactive = $("#my_calendar_paging .active");
		var toActive = $("#my_calendar_paging .active").prev();
		toHide.css({"visibility": "collapse", "display": "none"});
		toShow.css({"visibility": "visible", "display": ""});
		toDeactive.removeClass("active");
		toActive.addClass("active");

		if(page_max == 1) {
			$("#my_calendar_paging #calendar_page_next").addClass("disabled"); 
			$("#my_calendar_paging #calendar_page_previous").addClass("disabled"); 
			return true; 
		}

		if($("#my_calendar_paging .active").attr("id") == "calendar_page_button_1") {
			$("#my_calendar_paging #calendar_page_previous").addClass("disabled");
			$("#my_calendar_paging #calendar_page_next").removeClass("disabled");
			return true;
		}
		else {
			$("#my_calendar_paging #calendar_page_previous").removeClass("disabled");
			$("#my_calendar_paging #calendar_page_next").removeClass("disabled");
		}
		
		return true;
	}
}

/* SHOW NEXT EXAMS TABLE PAGE (BUTTON NEXT) */
function calendarShowBodyNext(clicked_button, page_max) {
	if(clicked_button.id == "calendar_page_next") {
		var toHide = $("#calendarTable tbody:visible");
		var toShow = $("#calendarTable tbody:visible").next();
		var toDeactive = $("#my_calendar_paging .active");
		var toActive = $("#my_calendar_paging .active").next();
		toHide.css({"visibility": "collapse", "display": "none"});
		toShow.css({"visibility": "visible", "display": ""});
		toDeactive.removeClass("active");
		toActive.addClass("active");

		if(page_max == 1) { 
			$("#my_calendar_paging #calendar_page_previous").addClass("disabled"); 
			$("#my_calendar_paging #calendar_page_next").addClass("disabled");
			return true;
		}
		if($("#my_calendar_paging .active").attr("id") == "calendar_page_button_"+page_max) {
			$("#my_calendar_paging #calendar_page_next").addClass("disabled");
			$("#my_calendar_paging #calendar_page_previous").removeClass("disabled");
			return true;
		}
		else {
			$("#my_calendar_paging #calendar_page_next").removeClass("disabled");
			$("#my_calendar_paging #calendar_page_previous").removeClass("disabled");
		}

		return true;
	}
}

/* SHOW THE CLICKED EXAMS TABLE PAGE (NUMBER BUTTON) */
function calendarShowBody(clicked_body, clicked_button, page_max) {
	$("#calendarTable tbody").css({"visibility": "collapse", "display": "none"});
	$(clicked_body).css({"visibility": "visible", "display": ""});
	$("#calendarPages li").removeClass("active");
	$(clicked_button).addClass("active");

	if(page_max == 1) { 
		$("#my_calendar_paging #calendar_calendar_previous").addClass("disabled"); 
		$("#my_calendar_paging #calendar_calendar_next").addClass("disabled");
		return true;
	}
	if($("#my_calendar_paging .active").attr("id") == "calendar_page_button_"+page_max) {
		$("#my_calendar_paging #calendar_page_next").addClass("disabled");
		$("#my_calendar_paging #calendar_page_previous").removeClass("disabled");
		return true;
	}
	else if($("#my_calendar_paging .active").attr("id") == "calendar_page_button_1") {
		$("#my_calendar_paging #calendar_page_previous").addClass("disabled");
		$("#my_calendar_paging #calendar_page_next").removeClass("disabled");
		return true;
	}
	else {
		$("#my_calendar_paging #calendar_page_previous").removeClass("disabled");
		$("#my_calendar_paging #calendar_page_next").removeClass("disabled");
	}
	
	return true;
}

/* ---------------------------------------- */
/* FUNZIONI PER CONTROLLI O CHECK VARI      */
/* ---------------------------------------- */

/* CHECK FOR EXAM (KEY code) */
function sameExam(a,b){
	if (a.code==b.code)
		return true;
	return false;
}

/* CHECK FOR EVENT (KEY name) */
function sameEvent(a,b) {
	if (a.name==b.name) 
		return true;
	return false;
}

/* CHECK EXAM CODE */
function checkCode(code) {
	if (code != "") return true;
	else return false;
}

/* CHECK EVENT NAME */
function checkName(name) {
	if (name != "") return true;
	else return false;
}

/* CHECK EXAM TYPE */
function checkType(type) {
	if (type != "") return true;
	else return false;
}

/* CHECK IF INPUT DATE IS VALID (DON'T CHECK IF IS > OR < OF TODAY!) */
function checkDate(date) {
	var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();

	if (isNaN(day) || isNaN(month) || isNaN(year)) {
		return false;
	}

	if (day < 1 || year < 1)
		return false;
	if(month>11||month<0)
   		return false;
	if ((month == 0 || month == 2 || month == 4 || month == 6 || month == 7 || month == 9 || month == 11) && day > 31)
    	return false;
	if ((month == 3 || month == 5 || month == 8 || month == 10 ) && day > 30)
    	return false;
	if (month == 1) {
    	if (((year % 4) == 0 && (year % 100) != 0) || ((year % 400) == 0 && (year % 100) == 0)) {
			if (day > 29)
				return false;
		} else {
			if (day > 28)
				return false;
		}      
	}
	return true;
}

/* CHECK IF EXAM GRADE IS VALID */
function checkGrade(grade) {
	if (isNaN(grade) || grade < 18 || grade > 30) {return false;}
	return true;
}

/* CHECK IF EXAM CFU IS VALID */
function checkCFU(cfu) {
	if (!isNaN(cfu)) {
		if (cfu >= 1 && cfu <= 24) {
			return true;
		}
	}
	return false;
}

/* (FOR INPUT STORAGE) RETURN GRADE VALUE (IF 30 WITH PRAISE -> 31) */
function getGrade(grade, praise) {
	if (grade == 30 && praise == "praise_yes") return 31;
	else return grade;
}

/* CALCULATE DATE DISTANCE (<0 IF B COME BEFORE A) */
function dateDiffInDays(a, b) {
	var _MS_PER_DAY = 1000 * 60 * 60 * 24;
	a = new Date(a);
	b = new Date(b);
	var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
	var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
	return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

/* CHECK IF DATE EVENT IS VALID */
function checkDateMin(date) {
	if (dateDiffInDays(new Date(getToday()), date) < 0) return false;
	return true;
}

/* CHECK IF DATE EXAM IS VALID */
function checkDateMax(date) {
	if (dateDiffInDays(new Date(getToday()), date) > 0) return false;
	return true;
}

/* CHECK IF ALL FIELDS ON REGISTER FORM ARE VALID */
function checkRegister() {
	var email = $("#registerEmail");
	var password = $("#registerPassword");
	var repeat_password = $("#registerRepeatPassword");
	var university = $("#registerUniversity");
	var course = $("#registerCourse");

	var email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (!email_regex.test(email.val())) {
		alert("Email non valida!");
		return false;
	}

	var password_regex = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*/;
	if (!password_regex.test(password.val())) {
		alert("Password non valida!");
		return false;
	}

	if (password.val() != repeat_password.val()) {
		alert("Passowrd differenti");
		return false;
	}
	
	if (university.val() == "") {
		alert("Inserisci l'università!");
		return false;
	}

	if (course.val() == "") {
		alert("Inserisci il corso");
		return false;
	}

	return true;
}

/* SMALL CHECK FOR LOGIN FIELDS */
function checkLogin() {
	var email = $("#loginEmail");
	var password = $("#loginPassword");

	if (email.val() == "") {
		alert("Inserisci l'email!");
		return false;
	}

	if (password.val() == "") {
		alert("Inserisci la password!");
		return false;
	}

	return true;
}

/* SHOW INPUT CFU BUTTON IF THE CFU LOCAL STORAGE ISN'T INITIALIZED, ELSE HIDE BUTTON AND SHOW PROGRESS BAR AND ADD EXAM BUTTON */
function checkStorageCFU() {
	if(localStorage.getItem("CFU") != null) {
		$("#initCourseCFUDiv").css({"visibility": "hidden", "display": "none"});
		$("#mainAddExamButton").css({"visibility": "visible", "display": ""});
		$("#progress").css({"visibility": "visible", "display": "block"});
		getPercentageCFU();
	}
	else {
		$("#initCourseCFUDiv").css({"visibility": "visible", "display": "block"});
		$("#mainAddExamButton").css({"visibility": "hidden", "display": "none"});
		$("#progress").css({"visibility": "hidden", "display": "none"});
	}
}