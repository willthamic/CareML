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

$("#messageInput").on('keypress',function(e) {
    if(e.which == 13) {
        var val = $("#messageInput").val();
        var date = Math.floor(Date.now()/1000);
        writeData("messages/0", {message: val, date: date});
        $("#messageInput").val("");
    }
});

function writeData(reference, data) {
    firebase.database().ref(reference).set(data);
}

function readData(reference) {
    var ref = firebase.database().ref(reference);
    ref.on('value', function(data) {
        if (reference == "remittens")
            drawRemittens(data.val());
        else if (reference == "patient")
            updatePatientVals(data.val());
        else
            drawGeneral(data.val());
    });
}

function openGraph(name) {
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
    $('#blood').text(patient.blood);
    $('#weight').text(patient.weight + " LBS");
    $('#name').text(patient.name);
    var odds = patient.odds;
    $('#progress').text(Math.round(patient.odds*100) + "%");
    $('#progress').attr("aria-valuenow", odds*100);
    $('#progress').attr("style", "width:" + odds*100 + "%; background-color:rgb(" + odds*512 + "," + (1-odds)*512 + ",0); color: " + ((odds >= 0.25 && odds < 0.6) ? "black;" : "white;"));

    var historyTable = $("#historyTable");
    historyTable.html("<thead><tr><th>Visit</th><th>Date</th></tr></thead>");
    for (var i = 0; i < patient.visits.length; i++) {
        var visit = patient.visits[i];
        historyTable.html(historyTable.html() + "<tr><td>" + visit.issue + "</td><td>" + visit.date + "</td></tr>");
    }

    var medTable = $("#medTable");
    medTable.html("<thead><tr><th>Medication</th><th>Dosage</th></tr></thead>");
    for (var i = 0; i < patient.medications.length; i++) {
        var med = patient.medications[i];
        medTable.html(medTable.html() + "<tr><td>" + med.medicine + "</td><td>" + med.dosage + "</td></tr>");
    }
}

function drawRemittens(temp) {
    var input = {
        independent: temp.x,
        dependent: temp.y,
        scale: true,
        min: 0,
        max: 100
    }
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
    console.log(input);
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
                    borderColor: '#F44336',
                    borderWidth: 4,
                    pointBackgroundColor: '#F44336'
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
    input.y.push(Math.random() * 20 + 50);
}
//writeData("sleep", input);