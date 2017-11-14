/* Inizialize the exam storage */
function initStorageExams(){
	if (typeof(localStorage.exams) == "undefined") {
		localStorage.exams="[]";
	}
}



/* Reset all exams on the storage */
function resetStorageExams(){ 
	localStorage.exams="[]";
}



/* Print all the exam of the user on a div called my_exams */
function printExams(){
	var exams = JSON.parse(localStorage.exams);
	var len = exams.length;
	var s = new String("<div style=\"text-align: center;\"<h3>I tuoi esami:</h3>");
	s += "<table border=\"1px\"><tr><th>Codice</th><th>Data</th><th>Voto</th><th>CFU</th></tr>";
	for (i=0; i<len; i++) {
		s += "<tr><td>" + exams[i].code + "</td>";
		s += "<td>" + exams[i].date + "</td>";
		
		s += "<td>";
		if (exams[i].grade == "31") s += "30 e Lode";
		else s += exams[i].grade;
		s += "</td>";

		s += "<td>" + exams[i].cfu + "</td></tr>";
	}
	s += "</table></div>";
	document.getElementById("my_exams").innerHTML = s;
	return true;
}



/* Script insert exam on the local storage, after checking the validity of every field */
function insertExam(){
	var exam_code = document.getElementById("exam_code").value;
	var exam_grade = document.getElementById("exam_grade").value;
	var exam_date = new Date(document.getElementById("exam_date").value);
	var exam_praise = document.getElementById("exam_praise").value;
	var exam_cfu = document.getElementById("exam_cfu").value;

	if (!checkCode(exam_code)) {
		alert("Codice esame non valido!");
		return false;
	}

	if (!checkDate(exam_date)) {
		alert("Data non valida!");
		return false;
	}
	if (!checkGrade(exam_grade, exam_praise)) {
		alert("Voto non valido!");
		return false;
	}
	if (!checkCFU(exam_cfu)) {
		alert("CFU non validi!");
		return false;
	}

	var exams = JSON.parse(localStorage.exams);
	var where = exams.length;	
	var obj = { code: exam_code,
				date: getExamDate(exam_date),
				grade: getGrade(exam_grade, exam_praise),
				cfu: exam_cfu
			};
	
	for (i=0; i<where; i++)
		if(sameExam(exams[i], obj)) {
			alert("Esame già inserito!");
			return false;
		}

	exams[where] = obj;
	localStorage.exams = JSON.stringify(exams);
	alert("Esame inserito correttamente!");
	return true;
}

function sameExam(a,b){
	if ((a.code==b.code))
		return true;
	return false;
}


function checkCode(code) {
	if (code != "") return true;
	else return false;
}

function checkDate(date) {
	var day = date.getDay();
    var month = date.getMonth();
    var year = date.getFullYear();

	if (isNaN(day) || isNaN(month) || isNaN(year)) {
		return false;
	}
	if (day < 1 || year < 1)
		return false;
	if(month>12||month<1)
   		return false;
	if ((month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) && day > 31)
    	return false;
	if ((month == 4 || month == 6 || month == 9 || month == 11 ) && day > 30)
    	return false;
	if (month == 2) {
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

function checkGrade(grade, praise) {
	if (isNaN(grade) || grade < 18 || grade > 30) {return false;}
	else if ((grade == 30 && praise != "praise_yes" && praise == "praise_no")) {
		return false;
	}
	return true;
}

function checkCFU(cfu) {
	if (!isNaN(cfu)) {
		if (cfu >= 1 && cfu <= 24) {
			return true;
		}
	}
	return false;
}

function getGrade(grade, praise) {
	if (grade == 30 && praise == "praise_yes") return 31;
	else return grade;
}

function getExamDate(date) {
	return date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear();
}

function printChart() {
	var exams = JSON.parse(localStorage.exams);
	var len = exams.length;
	var voti = [];
	var codici = [];

	for (i=0; i<len; i++) {
		voti[i] = exams[i].grade;
		codici[i] = exams[i].code;
	}

	var ctx = document.getElementById("user_chart").getContext('2d');
	new Chart(ctx,{
		type: "line",
		data: {
			labels: codici,
			datasets: [{
				label: "Voti",
				data: voti,
				fill: false,
				borderColor: "rgb(191, 0, 0)",
				lineTension:0.1}
			]},
		options: {}
	});
}