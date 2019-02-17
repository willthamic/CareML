var config = {
    apiKey: "AIzaSyAzkuVWvV79TILB1ZlrK7foRKlrHksPsNE",
    authDomain: "careml.firebaseapp.com",
    databaseURL: "https://careml.firebaseio.com",
    projectId: "careml",
    storageBucket: "careml.appspot.com",
    messagingSenderId: "893046241267"
};
firebase.initializeApp(config);

var database = firebase.database();

updatePatient();
openGraph("remittens");

var perscriptions;
var current;
var oldodds = 0;

$("#messageInput").on('keypress',function(e) {
    if(e.which == 13) {
        var val = $("#messageInput").val();
        var date = Math.floor(Date.now()/1000);
        writeData("messages/0", {message: val, date: date});
        $("#messageInput").val("");
    }
});

$("#pInput, #dInput").on('keypress',function(e) {
    if(e.which == 13) {
        addPerscription();
    }
});

function sendTemp() {
    var date = Math.floor(Date.now()/1000);
    writeData("messages/0", {message: "You should be active for at least 30 minutes a day.", date: date});
    setTimeout(function() {$('#message').addClass("no-display");}, 500);
}

function autoMessage(odds) {
    if (odds < 0.3) {
        $('#message').addClass("no-display");
    } else {
        $('#message').removeClass("no-display");
    }
}

function writeData(reference, data) {
    firebase.database().ref(reference).set(data);
}

function readData(reference) {
    var ref = firebase.database().ref(reference);
    ref.on('value', function(data) {
        if (reference == "patient") {
            updatePatientVals(data.val());
        } else if (reference == current) {
            if (reference == "remittens")
                drawRemittens(data.val());
            else
                drawGeneral(data.val());
        } else {
            readData(current);
        }
    });
}

function addPerscription() {
    var p = $("#pInput").val();
    var d = $("#dInput").val();
    perscriptions[perscriptions.length] = {medicine: p, dosage: d};
    perscriptions.length++;
    writeData("patient/medications", perscriptions);
    var p = $("#pInput").val("");
    var d = $("#dInput").val("");
}

function openGraph(name) {
    current = name;
    readData(name);
    $(".nav-link").removeClass("active");
    $(".nav-link." + name).addClass("active");
}

function updatePatient() {
    readData("patient");
}

function updatePatientVals(patient) {
    $('#sex').text(patient.sex);
    $('#age').text(patient.age);
    json.Inputs.input1.Values[0][6] = "" + (patient.age/100);
    json.Inputs.input1.Values[0][5] = "" + patient.white;
    $('#blood').text(patient.blood);
    $('#weight').text(patient.weight + " LBS");
    $('#name').text(patient.name);
    var odds = parseFloat(patient.odds)/2 + 0.2;
    oldodds = odds*100;
    $('#progress').text(Math.round(odds*100) + "%");
    $('#progress').attr("aria-valuenow", odds*100);
    $('#progress').attr("style", "width:" + odds*100 + "%; background-color:rgb(" + odds*512 + "," + (1-odds)*512 + ",0); color: " + ((odds >= 0.25 && odds < 0.6) ? "black;" : "white;"));

    var historyTable = $("#historyTable");
    historyTable.html("<thead><tr><th>Visit</th><th>Date</th></tr></thead>");
    for (var i = 0; i < patient.visits.length; i++) {
        var visit = patient.visits[i];
        historyTable.html(historyTable.html() + "<tr><td>" + visit.issue + "</td><td>" + visit.date + "</td></tr>");
    }

    var medTable = $("#medTable");
    perscriptions = patient.medications;
    medTable.html("<thead><tr><th>Medication</th><th>Dosage</th></tr></thead>");
    for (var i = 0; i < patient.medications.length; i++) {
        var med = patient.medications[i];
        medTable.html(medTable.html() + "<tr><td>" + med.medicine + "</td><td>" + med.dosage + "</td></tr>");
    }
    openGraph("remittens");
    autoMessage(odds);
}

function drawRemittens(temp) {
    var input = {
        independent: temp.x,
        dependent: temp.y,
        scale: true,
        min: 0,
        max: 100
    }
    console.log(input);
    input.dependent[input.dependent.length-1] = oldodds;
    console.log(input);
    drawGraph(input);
}

function drawGeneral(temp) {
    var input = {
        independent: temp.x,
        dependent: temp.y,
        scale: false
    }
    drawGraph(input);
}


function drawGraph(input) {
    var independent = input.independent;
    var dependent = input.dependent;

    var ctx = document.getElementById("myChart");
    if (input.scale) {
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: independent,
                datasets: [{
                    data: dependent,
                    lineTension: 0,
                    backgroundColor: 'transparent',
                    borderColor: 'rgb(206, 48, 74)',
                    borderWidth: 4,
                    pointBackgroundColor: 'rgb(206, 48, 74)'
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            min: input.min,
                            max: input.max
                        }
                    }]
                },
                legend: {
                    display: false,
                }
            }
        });
    } else {
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: independent,
                datasets: [{
                    data: dependent,
                    lineTension: 0,
                    backgroundColor: 'transparent',
                    borderColor: 'rgb(206, 48, 74)',
                    borderWidth: 4,
                    pointBackgroundColor: 'rgb(206, 48, 74)'
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        display: true,
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                legend: {
                    display: false,
                }
            }
        });
    }

}

var input = {
    x: [],
    y: [],
}

var patient = {
    name: "Jim Jom",
    age: 18,
    weight: 170,
    blood: "O-",
    odds: 0.5,
    sex: "Male",
    visits: [
        {date: "2019-02-16", issue:"Crohns Disease"},
        {date: "2019-02-16", issue:"Frequent Urination"},
        {date: "2019-02-16", issue:"Lupus"}
    ],
    medications: [
        {medicine: "Synthroid", dosage: "100 mcg"},
        {medicine: "Benadryl", dosage: "take like 10 or 12"},
        {medicine: "Delasone", dosage: "30 mg"},
    ]
}

for (var i = 0; i < 30; i++) {
    var today = Date.now();

    var dateString = "02/16/2019";
    var day = new Date(dateString);
    day.setDate(day.getDate() - 30 + i);

    var dd = day.getDate();
    var mm = day.getMonth() + 1;
    var yyyy = day.getFullYear();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    day = yyyy + '-' + mm + '-' + dd;

    input.x.push(day.toString());
    input.y.push(Math.random() * 35 + i);
}
//writeData("patient", patient);

var json = {
        "Inputs": {
          "input1": {
            "ColumnNames": [
              "race-AfricanAmerican",
              "race-Asian",
              "race-Caucasian",
              "race-Hispanic",
              "gender-Female",
              "gender-Male",
              "age",
              "admission_type_id-1",
              "admission_type_id-2",
              "admission_type_id-3",
              "admission_type_id-4",
              "admission_type_id-5",
              "admission_type_id-6",
              "admission_type_id-7",
              "admission_type_id-8",
              "discharge_disposition_id-1",
              "discharge_disposition_id-2",
              "discharge_disposition_id-3",
              "discharge_disposition_id-4",
              "discharge_disposition_id-5",
              "discharge_disposition_id-6",
              "discharge_disposition_id-7",
              "discharge_disposition_id-8",
              "discharge_disposition_id-9",
              "discharge_disposition_id-10",
              "discharge_disposition_id-11",
              "discharge_disposition_id-12",
              "discharge_disposition_id-13",
              "discharge_disposition_id-14",
              "discharge_disposition_id-15",
              "discharge_disposition_id-16",
              "discharge_disposition_id-17",
              "discharge_disposition_id-18",
              "discharge_disposition_id-19",
              "discharge_disposition_id-20",
              "discharge_disposition_id-22",
              "discharge_disposition_id-23",
              "discharge_disposition_id-24",
              "discharge_disposition_id-25",
              "discharge_disposition_id-27",
              "discharge_disposition_id-28",
              "admission_source_id-1",
              "admission_source_id-2",
              "admission_source_id-3",
              "admission_source_id-4",
              "admission_source_id-5",
              "admission_source_id-6",
              "admission_source_id-7",
              "admission_source_id-8",
              "admission_source_id-9",
              "admission_source_id-10",
              "admission_source_id-11",
              "admission_source_id-13",
              "admission_source_id-14",
              "admission_source_id-17",
              "admission_source_id-20",
              "admission_source_id-22",
              "admission_source_id-25",
              "time_in_hospital",
              "num_lab_procedures",
              "num_procedures",
              "num_medications",
              "number_outpatient",
              "number_emergency",
              "number_inpatient",
              "number_diagnoses",
              "metformin-Down",
              "metformin-No",
              "metformin-Steady",
              "metformin-Up",
              "repaglinide-Down",
              "repaglinide-No",
              "repaglinide-Steady",
              "repaglinide-Up",
              "nateglinide-Down",
              "nateglinide-No",
              "nateglinide-Steady",
              "nateglinide-Up",
              "chlorpropamide-Down",
              "chlorpropamide-No",
              "chlorpropamide-Steady",
              "chlorpropamide-Up",
              "glimepiride-Down",
              "glimepiride-No",
              "glimepiride-Steady",
              "glimepiride-Up",
              "acetohexamide-No",
              "acetohexamide-Steady",
              "glipizide-Down",
              "glipizide-No",
              "glipizide-Steady",
              "glipizide-Up",
              "glyburide-Down",
              "glyburide-No",
              "glyburide-Steady",
              "glyburide-Up",
              "tolbutamide-No",
              "tolbutamide-Steady",
              "pioglitazone-Down",
              "pioglitazone-No",
              "pioglitazone-Steady",
              "pioglitazone-Up",
              "rosiglitazone-Down",
              "rosiglitazone-No",
              "rosiglitazone-Steady",
              "rosiglitazone-Up",
              "acarbose-No",
              "acarbose-Steady",
              "acarbose-Up",
              "miglitol-Down",
              "miglitol-No",
              "miglitol-Steady",
              "miglitol-Up",
              "troglitazone-No",
              "troglitazone-Steady",
              "tolazamide-No",
              "tolazamide-Steady",
              "examide-No",
              "citoglipton-No",
              "insulin-Down",
              "insulin-No",
              "insulin-Steady",
              "insulin-Up",
              "glyburide-metformin-Down",
              "glyburide-metformin-No",
              "glyburide-metformin-Steady",
              "glyburide-metformin-Up",
              "glipizide-metformin-No",
              "glipizide-metformin-Steady",
              "glimepiride-pioglitazone-No",
              "metformin-rosiglitazone-No",
              "metformin-pioglitazone-No",
              "metformin-pioglitazone-Steady",
              "diabetesMed"
            ],
            "Values": [
              [
                "0",
                "0",
                "0",
                "0",
                "0",
                "0.5",
                "0.57",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0"
              ],
              [
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0"
              ]
            ]
          }
        },
        "GlobalParameters": {}
      };

  setInterval(function(){
    $.ajax({
             type: "POST",
             url: "https://careml.herokuapp.com/api/",
             data: json,
             success: function( data, textStatus, jQxhr ){
                writeData("patient/odds", JSON.parse(data).Results.output1.value.Values[0][1]);
            },
             error: function() {
                 console.log("failure");
             },
         });
 
 }, 2000);
