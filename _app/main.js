const COLORS = [
  '#4dc9f6',
  '#f67019',
  '#f53794',
  '#537bc4',
  '#acc236',
  '#166a8f',
  '#00a950',
  '#58595b',
  '#8549ba'
];

$(function() {
  $.get('../assets/data.txt', function(txt) {
    const data = txt.split('\n').filter(line => line !== '').map(line => JSON.parse(line));
    console.log(data);
    histogram('req_per_second', data);
    histogram('avg_latency', data);
    histogram('max_latency', data);
    histogram('avg_throughput', data);
    histogram('max_throughput', data);
  }); 
});

function histogram(field, data) {
  const ctx = document.getElementById(field).getContext('2d');
  const benchmark = {};
  const commits = [];
  data.forEach((input) => {
    const test = input[field];
    commits.push(input.sha1.substring(0, 7));
    for (const [key, value] of Object.entries(test)) {
      if (!(key in benchmark)) {
        benchmark[key] = [];
      }
      benchmark[key].push(value);
    }
  });
  let i = 0;
  const datasets = [];
  for (const [key, value] of Object.entries(benchmark)) {
    const dataset = {
      label: key,
      data: value,
      borderColor: COLORS[i],
      borderWidth: 1,
      fill: -1,
    };
    datasets.push(dataset);
    i++;
  }
  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: commits,
      datasets,
    },
    options: {
      title:{
        display:false,
      },
      tooltips: {
        mode: 'index',
        position: 'nearest',
        intersect: true,
      },
      hover: {
        mode: 'nearest',
        intersect: true,
      },
      scales: {
        xAxes: [{
          display: false,
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
          },
        }]
      },
      events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
      onClick: function(event, points) {
        if (points && points.length) {
          window.location.href = `https://github.com/parse-community/parse-server/commit/${commits[points[0]._index]}`;
        }
      }
    }
  });
}
