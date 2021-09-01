// width and height
var margin = {top: 20, right: 60, bottom: 20, left: 40},
    width = 1200 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

duration = 60 // 설명: 속도 조절 파라미터. 클수록 느림

// main content holder
var svg = d3.select("#graph")
    .append("svg")
    .style("background", "#fff")
    .style("color", "#fff")
    .attr("width", width + margin.left + margin.right )
    .attr("height", height + margin.top + margin.bottom + 100 )
    .attr("class","graph-svg-component")
    .attr("fill", "currentColor")
    .attr("class","shadow")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .append("g")
    .attr("transform","translate(" + (margin.left + 50)+ "," + (margin.top + 40) + ")");


// background grey
svg
    .append("rect")
      .attr("x",0)
      .attr("y",35)
      .attr("height", height-30)
      .attr("width", width-100)
      .style("fill","#e5e5e5")
      //.style("fill", "url(#linear-gradient)")
      //.style("stroke", "black")
      .style("opacity", 0.01)

// // add channel logo
var myimage = svg.append('image')
    .attr('xlink:href', 'logo/skt_bi.png')
    .attr('width', 150)
    .attr('height', 150)
    .attr('opacity',0.5)
myimage. attr('x', width-120) // 설명: SKT로고 박히는 위치. -230에서 -100으로 조정
myimage. attr('y', height-75)

// clip paths
svg.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x",10)
    .attr("y",35)
    .attr("width", width)
    .attr("height", height-30);

svg.append("defs")
    .append("clipPath")
    .attr("id", "yaxisclip")
    .append("rect")
    .attr("x",-90)
    .attr("y",30)
    .attr("width", width)
    .attr("height", height);

svg.append("defs")
    .append("clipPath")
    .attr("id", "xaxisclip")
    .append("rect")
    .attr("x",0)
    .attr("y",-(height-30))
    .attr("width", width-90)
    .attr("height", height+100);

// title of the chart
svg.append("text")
    .attr("class","title")
    .attr("x", (margin.left + width - margin.right) / 2)
    .attr("y", margin.top - 40)
    .attr("dy", 10)
    .attr("text-anchor", "middle")
    .style("fill","black")
    .call(text => text.append("tspan").attr("font-size","17px").attr("fill-opacity", 0.8).text("← \xa0"))
    .call(text => text.append("tspan").attr("font-size","21px").attr("font-weight", "bold").text("\xa0Popular Outdoor Activities in Korea\xa0"))
    .call(text => text.append("tspan").attr("font-size","17px").attr("fill-opacity", 0.8).text("\xa0 →"));


// time format
var format = d3.timeFormat("%d-%b-%Y");
var parseTime = d3.timeParse("%d-%b-%Y");
var monthFormat = d3.timeFormat("%B %Y")

var color = d3.scaleOrdinal(d3.schemeTableau10)

function RacingLine(filenm) {

  d3.json(filenm).then(function(data){

     // create array of dict for colors and and icons: 설명: 여기 추가하면 자동으로 늘어남
     // 설명: color:[시작색, 중간색, 끝색] //flag: 이미지파일
     var case_types = [{'id':'Camping',"title":"Camping","color":["#dff2c7","#8db856","#588a19"],"flag":"camping.png"},
                      {'id':'Golf',"title":"Golf","color":["#a5e6cc","#7accab","#489677"],"flag":"golf.png"},
                      {'id':'Fishing',"title":"Fishing","color":["#A7BFE8","#0575E6","#021B79"],"flag":"fishing.png"},
                      {'id':'Skiing',"title":"Skiing","color":["#d7f9fc","#abe5eb","#6fc8d1"],"flag":"skiing.png"},
                      {'id':'ThemeParks',"title":"ThemeParks","color":["#fff3cc","#ffc500","#c21500"],"flag":"themeparks.png"},
                      {'id':'MountainClimbing',"title":"MountainClimbing","color":["#e9fce1","#14db2b","#077514"],"flag":"mountain.png"}]

      //create chunk
      Object.defineProperty(Array.prototype, 'chunk', {
          value: function(chunkSize) {
              var R = [];
              for (var i = 0; i < this.length; i += 1)
                  R.push(this.slice(i, i + chunkSize));
              return R;
          }
      });


      color.domain(d3.keys(data[0]).filter(function(key) {
          return key !== "date";
      }));

      // extract coloumn names
      var names =  d3.keys(data[0]).filter(function(key){
          return key !== "date";
      });
      console.log("col name:",names);

      // create chunked data
      final = data.chunk(28) // 설명: 이 숫자가 늘어나면 속도가 느려지고 길이가 길어지고 애니메이션이 짧아짐 (데이터 자르는 길이)
      console.log("after chunk :",final);


      // format dataset to be input in the line creation function
      final = final.map(function(d){

          countries  =  names.map(function(name){
              return{
                  name: name,
                  value: d.map(function(t){
                      return{
                          date: new Date(t.date),
                          cases:!isNaN(t[name])? +t[name]:0

                      };
                  })
              }
          });

          return countries;
      })
      console.log("after formating data for input : ",final);


      // create color gradients
      for(i in names){
          //add gradient
          console.log(names[i]);
          console.log("color index:",case_types.find(e=>e.id===names[i]).title);
          var linearGradient = svg.append("defs")
          .append("linearGradient")
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("id", "linear-gradient-"+case_types.find(e=>e.id===names[i]).id);

          //.attr("gradientTransform", "rotate(45)");
          linearGradient.append("stop")
          .attr("offset", "5%")
          .attr("stop-color", case_types.find(e=>e.id===names[i]).color[0]);

          linearGradient.append("stop")
          .attr("offset", "15%")
          .attr("stop-color",case_types.find(e=>e.id===names[i]).color[1]);

          linearGradient.append("stop")
          .attr("offset", "35%")
          .attr("stop-color",case_types.find(e=>e.id===names[i]).color[2]);

      }


      // initialize the line :
      line = d3.line()
          .curve(d3.curveBasis)
          .x(function(d){
              //console.log("line x:",x(new Date(d.date)));
              return x(d.date);
          })
          .y(function(d){
              //console.log("line y:",y(d.cases));
              if (d.cases > 0){
                  return y(d.cases);
              }else{
                  return y(-2)
              }

      });

     // Initialise a X axis:
      x = d3.scaleTime()
          .range([0, width - 100])
      var xAxis = d3.axisBottom()
                  .scale(x)
                  .ticks(d3.timeWeek.every(1)) // 설명: X축에 표기 몇주마다 할지
                  //.tickFormat(d3.timeFormat("%d %b"))
                  //.tickFormat(d3.time.week)
                  .tickFormat(function(d, i) {
                      return "Week" + "-"+ d3.timeFormat("%W")(d) +" | "+ d3.timeFormat("%d %B")(d)
                  })
                  .tickSizeInner(-height)
                  .tickPadding(10) // 설명: X축 텍스트가 X축에서 아래로 몇 틱이나 이동할지

      svg.append("g")
          .attr("transform", `translate(10,${height})`)
          .attr("class","x axis")
          .attr("clip-path", "url(#xaxisclip)")
          .call(xAxis);

      // Initialize an Y axis
      y = d3.scaleLinear().domain([0,1])
              .range([margin.top+10, height-70]); // 설명: 모르겠다. 원래는 [height, 4*margin.top]이었는데 위치를 바꿨더니 1등이 위로가고 5가 아래로갔음. heigh-100 하니까 맨 아래 밑에 공간도 생김
      var yAxis = d3.axisLeft()
                  .scale(y)
                  .ticks(0) // 설명: 0을 제외한 틱의 개수. 걍 0으로 해서 X축 없애버렸음.
                  .tickFormat(d3.format("d")) // 설명: 3.5, 4.5 이런 소수점은 안보이게 Integer로 제한
                  //.tickSizeInner(-(width-100));
      svg.append("g")
          .attr("transform", `translate(10,70)`) //설명: Y축의 길이를 결정해주는 듯. (좌우로 어디에 위치할지, 위아래로 어디에 위치할지). 원래는 (10,0)이었는데 아래로 늘어트리려고 (10, 50)으로 변경
          .attr("class","y axis")
          .attr("clip-path", "url(#yaxisclip)")


      var t = final[0][0].value
      var month = monthFormat(t[t.length-1].date)
      var weekOfMonth = (0 | t[t.length-1].date.getDate() / 7)+1;


      let monthTxt =  svg.append("text")
          .attr("x",  (width)/2-50)
          .attr("y", height+50)
          .attr("dy", 10)
          .attr("text-anchor", "middle")
          .style("fill","black")
          .attr("font-weight", "bold")
          .attr("fill-opacity",0.0)
          .attr("font-size","16px")
          .text("← \xa0 "+month+" \xa0 →" );


      var intervalId = null;

      console.log(final[final.length-1][0].value.length);
      if (final[final.length-1][0].value.length < 14){
          final = final.slice(0,final.length-13)
      }

      console.log("final after remove last data:",final);

      var index = 0;
      //update[index];


      // update axis through out the loop in interval
      function updateAxis(){
          //update x axis
          svg.selectAll(".x.axis")
          .transition()
              .ease(d3.easeLinear)
              .duration(duration)
              .call(xAxis);


          // update y axis
          svg.selectAll(".y.axis")
              .transition()
              .ease(d3.easeCubic)
              .duration(1000)
              .call(yAxis);
      }

      // update line through out the loop in interval
      function makeLine(data){

          // generate line paths
          var lines = svg.selectAll(".line").data(data).attr("class","line");

          // transition from previous paths to new paths
          lines
          .transition()
          //.ease(d3.easeLinear)
          .duration(duration)
          .attr("stroke-width", 10.0) // 설명: 선 두께 (5.0에서 10.0으로 변경)
          //.attr("stroke-opacity", 1)
          .attr("stroke-opacity", function(d){
              if(d.value[d.value.length-1].cases>0){
                  return 1;
              }else{
                  return 0;
              }
          })
          .attr("d",d=> line(d.value))
          // .style("stroke", (d,i) =>
          //     color(d.name)
          // );
          .attr("stroke", (d,i) =>  "url(#linear-gradient-"+d.name+")" );
          //.attr("stroke", (d,i) =>  color(d.name) );

          // enter any new data
          lines
          .enter()
          .append("path")
          .attr("class","line")
          .attr("fill","none")
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("clip-path", "url(#clip)")
          .attr("stroke-width", 5.0)
          //.attr("stroke-opacity", 1)
          .attr("stroke-opacity", function(d){
              if(d.value[d.value.length-1].cases>0){
                  return 1;
              }else{
                  return 0;
              }
          })
          .transition()
          .ease(d3.easeLinear)
          .duration(duration)
          .attr("d",d=> line(d.value))
          // .style("stroke", (d,i) =>
          //     color(d.name)
          // )
          .attr("stroke", (d,i) =>  "url(#linear-gradient-"+d.name+")" );
          //.attr("stroke", (d,i) =>  color(d.name));

          // exit
          lines
          .exit()
          .transition()
          .ease(d3.easeLinear)
          .duration(duration)
          .remove();
      }

      // update tip circle through out the loop in interval
      function makeTipCircle(data){
          // add circle. generetare new circles
          circles = svg.selectAll(".circle").data(data)

          //transition from previous circles to new
          circles
          .enter()
          .append("circle")
          .attr("class","circle")
          .attr("fill", "white")
          .attr("clip-path", "url(#clip)")
          .attr("stroke", "black")
          .attr("stroke-width", 7.0)
          .attr("opacity",function(d){
              if(d.value[d.value.length-1].cases>0){
                  return 1;
              }else{
                  return 0;
              }
          })
          .attr("stroke-opacity", function(d,i){
              if(d.value[d.value.length-1].cases>0){
                  return 1;
              }else{
                  return 0;
              }
          })
          .attr("cx", d=> x(d.value[d.value.length-1].date))
          .attr("cy",function(d){

              if (d.value[d.value.length-1].cases > 0){
                  return y(d.value[d.value.length-1].cases);
              }else{
                  return y(-2)
              }
          })
          .attr("r",17)
          .transition()
          .ease(d3.easeLinear)
          .duration(duration)



          //enter new circles
          circles
          .transition()
          .ease(d3.easeLinear)
          .duration(duration)
          .attr("cx", d=> x(d.value[d.value.length-1].date))
          .attr("cy",function(d){
              if (d.value[d.value.length-1].cases > 0){
                  return y(d.value[d.value.length-1].cases);
              }else{
                  return y(-2)
              }
          })
          .attr("r",17)
          .attr("fill", "white")
          .attr("stroke", "black")
          .attr("stroke-width", 7.0)
          .attr("opacity",function(d){
              if(d.value[d.value.length-1].cases>0){
                  return 1;
              }else{
                  return 0;
              }
          })
          .attr("stroke-opacity", function(d,i){
              if(d.value[d.value.length-1].cases>0){
                  return 1;
              }else{
                  return 0;
              }
          })


          //remove and exit
          circles
          .exit()
          .transition()
          .ease(d3.easeLinear)
          .duration(duration)
          .attr("cx", d=> x(d.value[d.value.length-1].date))
          .attr("cy",function(d){
              if (d.value[d.value.length-1].cases > 0){
                  return y(d.value[d.value.length-1].cases);
              }else{
                  return y(-2)
              }
          })
          .attr("r",17)
          .remove()
      }

      // update lables through out the loop in interval
      function makeLabels(data){
           //generate name labels
           names = svg.selectAll(".lineLable").data(data);

           //transition from previous name labels to new name labels
           names
           .enter()
           .append("text")
           .attr("class","lineLable")
           .attr("font-size","21px")
           .attr("clip-path", "url(#clip)")
           .style("fill",(d,i)=>case_types.find(e=>e.id === d.name).color[2])
           .attr("opacity",function(d){
              if(d.value[d.value.length-1].cases>0){
                  return 1;
              }else{
                  return 0;
              }
           })
           .transition()
           .ease(d3.easeLinear)
           .attr("x",function(d)
           {
               return x(d.value[d.value.length-1].date)+30;
           })
           .style('text-anchor', 'start')
           .text(d => case_types.find(e=>e.id === d.name).title)
           .attr("y",function(d){

              if (d.value[d.value.length-1].cases > 0){
                  return y(d.value[d.value.length-1].cases) - 5;
              }else{
                  return y(-2)
              }
           })


           // add new name labels
           names
           .transition()
           .ease(d3.easeLinear)
           .duration(duration)
           .attr("x",function(d)
           {
               return x(d.value[d.value.length-1].date)+30;
           })
           .attr("y",function(d){

              if (d.value[d.value.length-1].cases > 0){
                  return y(d.value[d.value.length-1].cases) - 5;
              }else{
                  return y(-2)
              }

           })
           .attr("opacity",function(d){
              if(d.value[d.value.length-1].cases>0){
                  return 1;
              }else{
                  return 0;
              }
           })
           .attr("font-size","21px")
           .style("fill",(d,i)=>case_types.find(e=>e.id === d.name).color[2])
           .style('text-anchor', 'start')
           .text(d => case_types.find(e=>e.id === d.name).title)


           // exit name labels
           names.exit()
           .transition()
           .ease(d3.easeLinear)
           .duration(duration)
           .style('text-anchor', 'start')
           .remove();



           //generate labels
           labels = svg.selectAll(".label").data(data);

           //transition from previous labels to new labels
           labels
           .enter()
           .append("text")
           .attr("class","label")
           .attr("font-size","18px")
           .attr("clip-path", "url(#clip)")
           .style("fill",(d,i)=>case_types.find(e=>e.id === d.name).color[2])
           .attr("opacity",function(d){
              if(d.value[d.value.length-1].cases>0){
                  return 1;
              }else{
                  return 0;
              }
           })
           .transition()
           .ease(d3.easeLinear)
           .attr("x",function(d)
           {
               return x(d.value[d.value.length-1].date)+30;
           })
           .style('text-anchor', 'start')
           .text(d => d3.format(',.0f')(d.value[d.value.length-1].cases))
           .attr("y",function(d){

              if (d.value[d.value.length-1].cases > 0){
                  return y(d.value[d.value.length-1].cases)+15;
              }else{
                  return y(-2)
              }
           })


           // add new labels
           labels
           .transition()
           .ease(d3.easeLinear)
           .duration(duration)
           .attr("x",function(d)
           {
               return x(d.value[d.value.length-1].date)+30;
           })
           .attr("y",function(d){

              if (d.value[d.value.length-1].cases > 0){
                  return y(d.value[d.value.length-1].cases)+15;
              }else{
                  return y(-2)
              }

           })
           .attr("opacity",function(d){
              if(d.value[d.value.length-1].cases>0){
                  return 1;
              }else{
                  return 0;
              }
           })
           .attr("font-size","18px")
           .style("fill",(d,i)=>case_types.find(e=>e.id === d.name).color[2])
           .style('text-anchor', 'start')
           //.text(d => d3.format(',.0f')(d.value[d.value.length-1].cases))
           .tween("text", function(d) {
               if (d.value[d.value.length-1].cases !== 0) {
                  let i = d3.interpolateRound(d.value[d.value.length-2].cases, d.value[d.value.length-1].cases);
                  return function(t) {
                      this.textContent = d3.format(',')(i(t));
                   };
               }

            });


           // exit labels
           labels.exit()
           .transition()
           .ease(d3.easeCubic)
           .duration(duration)
           .style('text-anchor', 'start')
           .remove();

      }

      // update icons through out the loop in interval
      function makeImages(data){
          //select all images
          images = svg.selectAll(".image").data(data)

          images
          .enter()
          .append("image")
          .attr("class","image")
          .attr("clip-path", "url(#clip)")
          .attr('xlink:href', d=> "continents/"+case_types.find(e=>e.id === d.name).flag)
          .attr("width", 40)
          .attr("height", 40)
          .attr("opacity",function(d){
              if(d.value[d.value.length-1].cases>0){
                  return 1;
              }else{
                  return 0;
              }
          })
          .attr("y", function (d) {
              if (d.value[d.value.length-1].cases > 0){
                  return y(d.value[d.value.length-1].cases)-20;
              }else{
                  return y(-2)-15;
              }

          })
          .attr("x", function (d) { return x(d.value[d.value.length-1].date)-20; })
          .attr("preserveAspectRatio", "none")
          .transition()
          .ease(d3.easeLinear)
          .duration(duration);

           //enter new circles
           images
           .transition()
           .ease(d3.easeLinear)
           .duration(duration)
           .attr('xlink:href', d=> "continents/"+case_types.find(e=>e.id === d.name).flag)
           .attr("width", 40)
           .attr("height", 40)
           .attr("opacity",function(d){
              if(d.value[d.value.length-1].cases>0){
                  return 1;
              }else{
                  return 0;
              }
           })
           .attr("x", d=> x(d.value[d.value.length-1].date)-20)
           .attr("y", function (d) {
              if (d.value[d.value.length-1].cases > 0){
                  return y(d.value[d.value.length-1].cases)-20;
              }else{
                  return y(-2)-15;
              }
            })
           .attr("preserveAspectRatio", "none");

           //remove and exit
          images.exit()
          .transition()
          .ease(d3.easeLinear)
          .duration(duration)

          .remove()
      }

      var yaxismaxlimit = 0;

      // function to update the line in each frame
      function update(){

          if (index < final.length){

              data = final[index];
              //console.log("index: ",index)
              //console.log("data_now: ",data);

              var length = data[0].value.length;
              //console.log("length:",length);

              // Create the X axis:
              var param = data[0].value
              date_start = new Date(param[0].date)
              date_end = new Date(param[param.length-1].date)
              date_end = new Date(new Date(date_end).setDate(new Date(date_end).getDate() + 6))

              //console.log("dates: ",date_start,date_end);
              x.domain([date_start, date_end]);

              // Create the Y axis:
              max_cases_value_of_each_country = data.map(o => Math.max(...o.value.map(v=>v.cases)))
              var maxOfValue = Math.max(...max_cases_value_of_each_country.map(o => o))
              var minOfValue = Math.min(...max_cases_value_of_each_country.map(o => o));
              if (maxOfValue < 5){
                  maxOfValue = 5 // 설명 : y축의 맥스값이 10보다 작으면 10으로하고 아니면 실제값으로 한다. 였는데 이걸 5로 바꿨다.
              }

              if (maxOfValue > yaxismaxlimit){
                  yaxismaxlimit = maxOfValue;
              }

              y.domain([0, maxOfValue]).nice();

              updateAxis(x,y);

              makeLine(data)

              makeTipCircle(data)

              makeImages(data)

              makeLabels(data)

              var weekOfMonth = (0 | data[0].value[data[0].value.length-1].date.getDate() / 7)+1;
              var month = monthFormat(data[0].value[data[0].value.length-1].date)
              monthTxt
              .transition()
              .ease(d3.easeCubic)
              .duration(duration*2.5)  // 설명: y축 아래 월,년이 까매지는 속도. 원래 2500이었는데 duration*2.5로 바꿈
              .attr("fill-opacity",0.7)
              .text("← \xa0 "+month+" \xa0 →" );

              index = index + 1;

          }else{
              // clear inetrval at the end
              clearInterval(intervalId);
          }



      }
      // start the interval method
      intervalId = setInterval(update,duration);

  })
}
;

//RacingLine(20)
