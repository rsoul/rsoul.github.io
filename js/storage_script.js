/* ---------------------------------------- */
/* FUNZONI PER L'UTILIZZO DI STORAGE        */
/* ---------------------------------------- */

/* INIZIALIZE EXAMS STORAGE (EMPTY) IF NOT ALREADY DEFINED */
function initStorageExams(){
	if (typeof(localStorage.exams) == "undefined") {
		localStorage.exams="[]";
	}
}

/* INIZIALIZE CALENDAR STORAGE (EMPTY) IF NOT ALREADY DEFINED */
function initStorageCalendar(){
	if (typeof(localStorage.calendar) == "undefined") {
		localStorage.calendar="[]";
	}
}

/* REMOVE ALL EXEMENTS FROM EXAMS STORAGE (NOT USED) */
function resetStorageExams(){localStorage.exams="[]";}

/* REMOVE ALL EXEMENTS FROM CALENDAR STORAGE (NOT USED) */
function resetStorageCalendar(){localStorage.calendar="[]";}

/* REMOVE ALL EXEMENTS FROM EXAMS STORAGE (NOT USED) */
function resetStorageCFU(){ if(localStorage.getItem("CFU") != null) localStorage.setItem('CFU', null);}


function checkStorageCFU() {
	if(localStorage.getItem("CFU") != null) {
		$("#initCourseCFUDiv").hide();
		$("#mainAddExamButton").show();
		$("#progressBar").show();
		getPercentageCFU();
	}
	else {
		$("#initCourseCFUDiv").show();
		$("#mainAddExamButton").hide();	
		$("#progressBar").hide();
	}
}


/* ---------------------------------------- */
/* FUNZIONI PER LA STAMPA O GENERICO OUTPUT */
/* ---------------------------------------- */

/* PRINT ALL EVENTS FROM CALENDAR STORAGE (WITH DELETE/EDIT BUTTONS) */
function printCalendar(){
	if (typeof(localStorage.calendar) == "undefined") return false;
	var calendar = JSON.parse(localStorage.calendar);
	var len = calendar.length;
	var s = new String("");

	calendar.sort(function(a,b) { 
	    return new Date(a.date) - new Date(b.date); 
	});
	
	s += "<div style=\"text-align: center; padding-top:5px;\">";
	s += "<table class=\"table table-striped table-hover table-bordered  table-sm\" border=\"1px\"><tr><th>Esame</th><th>Data</th><th>Orario</th><th>Scadenza</th><th>Opzioni</th></tr>";
	for (i=0; i<len; i++) {
		var dateDiff = dateDiffInDays(new Date(getToday()), calendar[i].date);
		var name = calendar[i].name;
		var date = calendar[i].date;
		var time = calendar[i].time;

		var time_for_print = time;

		if(time == "") time_for_print = "N.D.";

		/* IF DISTANCE FROM TODAY > 10 -> NORMAL ROW, IF >5 AND <=10 WARNING, ELSE DANGER */
		if (dateDiff > 10) s += "<tr>";
		else if (dateDiff > 5) s += "<tr class=\"table table-warning\">";
		else if (dateDiff >= 0) s += "<tr class=\"table table-danger\">";
		else s += "<tr class=\"table table-success\">";

		var dateDiff_for_print = dateDiff;

		/* CHECK FOR DISTANCE FROM TODAY (TODAY, TOMORROW, ...) */
		if(dateDiff == 1) dateDiff_for_print = "Domani";
		else if(dateDiff == 0) dateDiff_for_print = "Oggi";
		else if(dateDiff == -1) dateDiff_for_print = "Ieri";
		
		s += "<td>" + name + "</td>";
		s += "<td>" + date + "</td>";
		s += "<td>" + time_for_print + "</td>";
		s += "<td>" + dateDiff_for_print + "</td>";

		s += "<td><button class=\"btn btn-danger btn-sm\" id=\"rmv_event_"+name+"\" onclick=\"removeEvent(\'"+name+"\')\"><i class=\"material-icons\">delete</i></button>";
		s += "<button class=\"btn btn-secondary btn-sm\" data-toggle=\"modal\" data-target=\"#calendarEditForm\"  id=\"edit_event_"+name+"\" onclick=\"initEditEvent(\'"+name+"\',\'"+date+"\',\'"+time+"\')\"><i class=\"material-icons\">create</i></button></td></tr>";
	}

	s += "</table></div>";
	$("#my_calendar").html(s);
	return true;
}

/* PRINT A TABLE WITH ALL EXAMS FROM EXAMS STORAGE (WITH DELETE/EDIT BUTTONS) */
function printExams(){
	if (typeof(localStorage.exams) == "undefined") return false;
	var exams = JSON.parse(localStorage.exams);
	var len = exams.length;
	var s = new String("");

	exams.sort(function(a,b) { 
	    return new Date(a.date) - new Date(b.date); 
	});
	
	s += "<div style=\"text-align: center; padding-top:5px;\">";
	s += "<table class=\"table table-striped table-hover table-bordered table-sm\" border=\"1px\"><tr><th>Codice</th><th>Data</th><th>Voto</th><th>CFU</th><th>Opzioni</th></tr>";
	for (i=0; i<len; i++) {
		var code = exams[i].code;
		var date = exams[i].date;
		var grade = exams[i].grade;
		var cfu = exams[i].cfu;
		var grade_for_print = grade;

		/* IF 30 WITH PRAISE -> SHOW GREEN BACKGROUND ROW */
		if (grade == 31) {
			grade_for_print = "30 e Lode";
			s += "<tr class=\"table table-success\">";
		}
		/* ELSE A NORMAL ROW */
		else s += "<tr>";
		s += "<td id=\"tableExamCode"+code+"\">" + code + "</td>";
		s += "<td id=\"tableExamDate"+code+"\">" + date + "</td>";
		s += "<td id=\"tableExamGrade"+code+"\">" + grade_for_print + "</td>";
		s += "<td id=\"tableExamCFU"+code+"\">" + cfu + "</td>";
		s += "<td><button class=\"btn btn-danger btn-sm\" id=\"rmv_exam_"+code+"\" onclick=\"removeExam(\'"+code+"\')\"><i class=\"material-icons\">delete</i></button>";
		s += "<button class=\"btn btn-secondary btn-sm\" data-toggle=\"modal\" data-target=\"#examEditForm\"  id=\"edit_exam_"+code+"\")\" onclick=\"initEditExam(\'"+code+"\',\'"+date+"\',\'"+grade+"\',\'"+cfu+"\')\"><i class=\"material-icons\">create</i></button></td></tr>";		
	}
	s += "</table></div>";

	$("#my_exams").html(s);
	return true;
}

/* PRINT STATISTICS FOR EXAMS */
function printStatistics() {
	if (typeof(localStorage.calendar) == "undefined") return false;
	var exams = JSON.parse(localStorage.exams);
	var len = exams.length;
	var s = new String("");
	var voti = new Array();
	var date = new Array();
	var media_time = new Array();
	var media_const_array = new Array();
	var media_ponderata_const_array = new Array();
	var media = 0.0;
	var media_ponderata = 0.0;
	var cfu_totali = 0.0;
	var cfu_corso = localStorage.getItem("CFU");

	exams.sort(function(a,b) { 
	    return new Date(a.date) - new Date(b.date); 
	});

	/* GENERATE GRADES, DATES AND AVERAGE VARIATION ARRAYS */
	for (i=0; i<len; i++) {
		var grade_for = exams[i].grade;
		var date_for = exams[i].date;
		var cfu_for = exams[i].cfu;
		
		media += parseFloat(grade_for);
		media_ponderata += parseFloat(grade_for)*parseFloat(cfu_for);
		cfu_totali += parseFloat(cfu_for);

		voti[i] = grade_for;
		date[i] = date_for;
		var avg = 0.0;
		for (j=0; j<voti.length; j++) {
			avg += parseFloat(voti[j]);
		}
		media_time[i] = (avg/voti.length).toFixed(2);
	}

	media = (media/len).toFixed(2);
	media_ponderata = (media_ponderata/cfu_totali).toFixed(2);

	for (i=0; i<len; i++) {
		media_const_array[i] = media;
		media_ponderata_const_array[i] = media_ponderata;
	}

	/* GENERATE THE TABLE */
	s += "<div id=\"mediaDiv\">";
	s += "<table class=\"table table-striped table-bordered table-sm\" border=\"1px\"><tr><th>Media</th><th>Media Ponderata</th><th>Esami Dati</th><th>CFU Ottenuti</th><th>CFU Richiesti</th></tr>";
	s += "<tr><td>" + media + "</td><td>" + media_ponderata + "</td><td>" + len + "</td><td>" + cfu_totali + "</td><td>" + cfu_corso + "</td></tr></table></div>";

	/* DRAW THE GRAPHIC */
	var ctx = $("#user_chart").get(0).getContext('2d');
	new Chart(ctx,{
		type: "line",
		
		data: {
			labels: date,
			datasets: [{
				label: "Voti",
				data: voti,
				pointBackgroundColor: "#3cba9f",
				borderColor: "#3cba9f",
				lineTension: 0.1,
				fill: false
			},
			{
				label: "Variazione della media",
				data: media_time,
				pointBackgroundColor: "#995f03",
				borderColor: "#995f03",
				lineTension: 0.1,
				fill: false
			},
			{
				label: "Media",
				pointRadius: 0,
				pointBackgroundColor: "#fc7171",
				data: media_const_array,
				borderColor: "#fc7171",
				fill: false
			},
			{
				label: "Media ponderata",
				pointRadius: 0,
				pointBackgroundColor: "#6bcc66",
				data: media_ponderata_const_array,
				borderColor: "#6bcc66",
				fill: false
			}]
		},

		options: {
			maintainAspectRatio: false,
			scales: {
            	yAxes: [{
            		ticks: {
						min: 18,
						max: 31
					}
				}]
            }
            /* UNUSED, DRAW AVERAGE LINE
            annotation: {
		      annotations: [{
		        type: 'line',
		        mode: 'horizontal',
		        scaleID: 'y-axis-0',
		        value: media,
		        borderColor: 'rgb(255, 0, 0)',
		        borderWidth: 1,
		        label: {
		          enabled: false,
		          content: 'Media'
		        }
		      }]
		    }
		    */
        }
	});

	$("#my_statistics").html(s);
	return true;
}


/* ---------------------------------------- */
/* FUNZIONI PER LA RIMOZIONE                */
/* ---------------------------------------- */

/* REMOVE A SELECTED EXAM FROM THE EXAMS STORAGE BY KEY (code) */
function removeExam(code) {
	var exams = JSON.parse(localStorage.exams);
	var len = exams.length;

	for (i=0; i<len; i++) {
		if(exams[i].code == code) {
			exams.splice(i,1);
			break;
		}
	}

	localStorage.exams = JSON.stringify(exams);
	getPercentageCFU();
	printStatistics();
	printExams();
	return true;
}

/* REMOVE A SELECTED EVENT FROM THE CALENDAR STORAGE BY KEY (name) */
function removeEvent(name) {
	var calendar = JSON.parse(localStorage.calendar);
	var len = calendar.length;

	for (i=0; i<len; i++) {
		if(calendar[i].name == name) {
			calendar.splice(i,1);
			break;
		}
	}

	localStorage.calendar = JSON.stringify(calendar);	
	printCalendar();
	return true;
}



/* ---------------------------------------- */
/* FUNZIONI PER LA MODIFICA                 */
/* ---------------------------------------- */

/* EDIT A SELECTED EXAM (FROM BUTTON) FROM THE EXAMS STORAGE */
function editExam() {
	var exam_code = $('#examEditCode').val();
    var exam_date = $('#examEditDate').val();
    var exam_grade = $('#examEditGrade').val();
    var exam_praise = $("input[name=examEditPraise]:checked").val();
    var exam_cfu = $('#examEditCFU').val();

    var exam_edit_alert = "examEditAlert";
    var exam_edit_alert_text = "examEditAlertText";

	if (!checkCode(exam_code)) {
		showAlert(exam_edit_alert, exam_edit_alert_text, "Codice esame non valido!");
		$("#examEditCode").select();
		return false;
	}
	if (!checkDate(new Date(exam_date))) {
		showAlert(exam_edit_alert, exam_edit_alert_text, "Data non valida!");
		$("examEditDate").select();
		return false;
	}
	if (!checkDateMax(new Date(exam_date))) {
		showAlert(exam_edit_alert, exam_edit_alert_text, "Data futura non valida!");
		$("#examEditDate").select();
		return false;
	}
	if (!checkGrade(exam_grade)) {
		showAlert(exam_edit_alert, exam_edit_alert_text, "Voto non valido!");
		$("#examEditGrade").select();
		return false;
	}
	if (!checkCFU(exam_cfu)) {
		showAlert(exam_edit_alert, exam_edit_alert_text, "CFU non validi!");
		$("#examEditCFU").select();
		return false;
	}

	var exams = JSON.parse(localStorage.exams);
	var len = exams.length;

	for (i=0; i<len; i++) {
		if(exams[i].code == exam_code) {
			exams[i].date = exam_date;
			exams[i].grade = getGrade(exam_grade, exam_praise);
			exams[i].cfu = exam_cfu;
			break;
		}
	}

	localStorage.exams = JSON.stringify(exams);
	getPercentageCFU();	
	printStatistics();
	printExams();
	return true;
}

/* EDIT A SELECTED (FROM BUTTON) EVENT FROM THE CALENDAR STORAGE */
function editCalendarEvent() {
	var calendar_name = $('#calendarEditName').val();
	var calendar_date = $('#calendarEditDate').val();
	var calendar_time = $('#calendarEditTime').val();

    var calendar_edit_alert = "calendarEditAlert";
    var calendar_edit_alert_text = "calendarEditAlertText";

	if (!checkDate(new Date(calendar_date))) {
		showAlert(calendar_edit_alert, calendar_edit_alert_text, "Data non valida!");
		$("#calendarEditDate").select();
		return false;
	}
	if (!checkDateMin(new Date(calendar_date))) {
		showAlert(calendar_edit_alert, calendar_edit_alert_text, "Data passata non valida!");
		$("#calendarEditDate").select();
		return false;
	}

	var calendar = JSON.parse(localStorage.calendar);
	var len = calendar.length;

	for (i=0; i<len; i++) {
		if(calendar[i].name == calendar_name) {
			calendar[i].date = calendar_date;
			calendar[i].time = calendar_time;
			break; 
		}
	}

	localStorage.calendar = JSON.stringify(calendar);
	printCalendar();
	return true;
}



/* ---------------------------------------- */
/* FUNZIONI DI INSERIMENTO E INPUT VARI     */
/* ---------------------------------------- */

/* INSERT NEW EXAM ON EXAMS STORAGE (CHECK ALL FIELDS) */
function addExam(){
	var exam_code = $('#examAddCode').val();
	var exam_date = $('#examAddDate').val();
    var exam_grade = $('#examAddGrade').val();
    var exam_praise = $("input[name=examAddPraise]:checked").val();
    var exam_cfu = $('#examAddCFU').val();

    var exam_add_alert = "examAddAlert";
    var exam_add_alert_text = "examAddAlertText";
	

	if (!checkCode(exam_code)) {
		showAlert(exam_add_alert, exam_add_alert_text, "Codice non valido!");
		$("#examAddCode").select();
		return false;
	}
	if (!checkDate(new Date(exam_date))) {
		showAlert(exam_add_alert, exam_add_alert_text, "Data non valida!");
		$("#examAddDate").select();
		return false;
	}
	if (!checkDateMax(new Date(exam_date))) {
		showAlert(exam_add_alert, exam_add_alert_text, "Data futura non valida!");
		$("#examAddDate").select();
		return false;
	}
	if (!checkGrade(exam_grade)) {
		showAlert(exam_add_alert, exam_add_alert_text, "Voto non valido!");
		$("#examAddGrade").select();
		return false;
	}
	if (!checkCFU(exam_cfu)) {
		showAlert(exam_add_alert, exam_add_alert_text, "CFU non validi!");
		$("#examAddCFU").select();
		return false;
	}

	var exams = JSON.parse(localStorage.exams);
	var len = exams.length;	

	var exam = { 
		code: exam_code,
		date: exam_date,
		grade: getGrade(exam_grade, exam_praise),
		cfu: exam_cfu
	};
	
	for (i=0; i<len; i++) {
		if(sameExam(exams[i], exam)) {
			showAlert(exam_add_alert, exam_add_alert_text, "Esame già presente!");
			return false;
		}
	}

	exams[len] = exam;
	localStorage.exams = JSON.stringify(exams);
	getPercentageCFU();
	printStatistics();
	printExams();
	return true;
}

/* INSERT NEW EVENT ON CALENDAR STORAGE (CHECK ALL FIELDS) */
function addCalendarEvent(){
	var calendar_name = $('#calendarAddName').val();
	var calendar_date = $('#calendarAddDate').val();
	var calendar_time = $('#calendarAddTime').val();

	var calendar_add_alert = "calendarAddAlert";
	var calendar_add_alert_text = "calendarAddAlertText";

	if(!checkName(calendar_name)) {
		showAlert(calendar_add_alert, calendar_add_alert_text, "Nome non valido!");
		$("#calendarAddName").select();
		return false;
	}
	if (!checkDate(new Date(calendar_date))) {
		showAlert(calendar_add_alert, calendar_add_alert_text, "Data non valida!");
		$("#calendarAddDate").select();
		return false;
	}
	if (!checkDateMin(new Date(calendar_date))) {
		showAlert(calendar_add_alert, calendar_add_alert_text, "Data passata non valida!");
		$("#calendarAddDate").select();
		return false;
	}

	var calendar = JSON.parse(localStorage.calendar);
	var len = calendar.length;

	var event = {
		name: calendar_name,
		date: calendar_date,
		time: calendar_time
	};
	
	for (i=0; i<len; i++) {
		if(sameEvent(calendar[i], event)) {
			showAlert(calendar_add_alert, calendar_add_alert_text, "Evento già presente!");
			return false;
		}
	}

	calendar[len] = event;
	localStorage.calendar = JSON.stringify(calendar);
	printCalendar();
	return true;
}
