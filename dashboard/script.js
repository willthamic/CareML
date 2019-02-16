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

function writeData(reference, data) {
    firebase.database().ref(reference).set(data);
}

function readData(reference) {
    return firebase.database().ref(reference).once();
}

console.log(firebase.database().ref("patient").once('value'));


//drawGraph(input);

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
                    borderColor: '#F44336',
                    borderWidth: 4,
                    pointBackgroundColor: '#F44336'
                }]
            },
            options: {
                title: {
                    display: true,
                    text: "Heroin's per second"
                },
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
                title: {
                    display: true,
                    text: "Heroin's per second"
                },
                scales: {
                    yAxes: [{}]
                },
                legend: {
                    display: false,
                }
            }
        });
    }

}

// for (var i = 0; i < 30; i++) {
//     var today = Date.now();

//     var dateString = "02/16/2019";
//     var day = new Date(dateString);
//     day.setDate(day.getDate() - 30 + i);

//     var dd = day.getDate();
//     var mm = day.getMonth() + 1;
//     var yyyy = day.getFullYear();

//     if (dd < 10) dd = '0' + dd;
//     if (mm < 10) mm = '0' + mm;
//     day = yyyy + '-' + mm + '-' + dd;

//     input.independent.push(day.toString());
//     input.dependent.push(Math.random() * 20 + 20 + 0.05 * i * i);
// }