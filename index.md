---
title: Benchmarks | Parse
permalink: index.html
layout: docs

---

<div class="container padding-top-40 padding-bottom-50" data-nav-waypoint>
  <div class="copy-block">
    <p class="margin-top-10">
      <a href="https://github.com/parse-community/benchmark">Parse Benchmark</a> is a continuous integration tool that runs benchmarks on every commit to <a href="https://github.com/parse-community/parse-dashboard">Parse server</a>.
    </p>
    <p style="text-align:left" class="margin-top-10">
      Benchmarks include:
      <a href="#request-second">Request / Second</a>,
      <a href="#average-latency">Average Latency</a>,
      <a href="#maximum-latency">Maximum Latency</a>,
      <a href="#average-thoughput-mb">Average Throughput</a>, and 
      <a href="#maximum-thoughput-mb">Maximum Throughput</a> tests.
    </p>
  </div>
  <div class="posts">
    <article class="margin-top-40 padding-bottom-40 post">
      <h3 class="h3 h3--blue margin-bottom-10" style="text-align:center">
        Request / Second
      </h3>
      <canvas id="req_per_second" width="1600" height="800"></canvas>
    </article>
    <article class="margin-top-40 padding-bottom-40 post">
      <h3 class="h3 h3--blue margin-bottom-10" style="text-align:center">
        Average Latency
      </h3>
      <canvas id="avg_latency" width="1600" height="800"></canvas>
    </article>
    <article class="margin-top-40 padding-bottom-40 post">
      <h3 class="h3 h3--blue margin-bottom-10" style="text-align:center">
        Maximum Latency
      </h3>
      <canvas id="max_latency" width="1600" height="800"></canvas>
    </article>
    <article class="margin-top-40 padding-bottom-40 post">
      <h3 class="h3 h3--blue margin-bottom-10" style="text-align:center">
        Average Thoughput / Mb
      </h3>
      <canvas id="avg_throughput" width="1600" height="800"></canvas>
    </article>
    <article class="margin-top-40 padding-bottom-40 post">
      <h3 class="h3 h3--blue margin-bottom-10" style="text-align:center">
        Maximum Thoughput / Mb
      </h3>
      <canvas id="max_throughput" width="1600" height="800"></canvas>
    </article>
  </div>
</div>
