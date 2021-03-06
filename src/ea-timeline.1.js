import * as d3 from 'd3'

export default function timeline ({ elementSelector = '#ea-timeline', data = [], marginLeft = 100, marginRight = 10, marginTop = 30, marginBottom = 30, timelineHeight = 40, spacing = 2, paddingOuter = 0, paddingInner = 0 } = {}) {
  const element = d3.select(elementSelector)

  if (element.empty()) {
    throw new Error('DOM element not found')
  }
  // var svg = element
  //   .append('svg')
  //   .attr('width', 300)
  //   .attr('height', 300)

  // var g = svg.selectAll('g .groups')
  //   .data(data)
  //   .enter()
  //   .append('g')
  //    .attr('class', 'groups')

  // var rects = g.selectAll('rect')
  //   .data(function (d, i , j) { console.log('Data: ' + JSON.stringify(d), '\nIndex: ' + JSON.stringify(i), '\nNode: ' + JSON.stringify(j)); return d})
  //   .enter()
  //   .append('rect')

  let focusExtent = [d3.timeHour.offset(new Date(), -1 * 24), d3.timeHour.offset(new Date(), 0)]
  let width = parseInt(element.style('width'), 10) || 600

  let x = d3.scaleTime()
    .domain(focusExtent)
    .range([0, width - marginLeft - marginRight])
  const xAxisTop = d3.axisTop(x)

  const xAxisBottom = d3.axisBottom(x).tickFormat(d3.timeFormat('%H:%M'))

  // let svg = element.append('svg')
  //   .style('width', (width + marginLeft + marginRight) + 'px')

  let svg = element.append('svg')
    .attr('width', '100%')
    .attr('height', '100%')

  const timelines = svg.append('g')
    .attr('transform', 'translate(' + [marginLeft, marginTop] + ')')

  timelines.append('g').attr('class', 'x axis top')
    .call(xAxisTop)

  timelines.append('g')
    .attr('class', 'x axis bottom')
    .call(xAxisBottom)

  svg.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + [marginLeft, marginTop] + ')')

  // UPDATE
  const update = (data) => {
    const y = d3.scaleBand()
      .paddingOuter(paddingOuter)
      .paddingInner(paddingInner)
      .domain(data.map((d) => d.key))
      .range([0, data.length * timelineHeight])
      .round(true)

    const yAxis = d3.axisLeft()
    yAxis.scale(y)
    svg.select('.y.axis')
      .call(yAxis)
      .selectAll('.tick text')
      // .call(wrap, marginLeft)

    // TODO xAxisi missing
    // set height based on data
    const height = y.range()[1]
    svg.attr('height', (height + marginTop + marginBottom) + 'px')

    // svg.select('.context').attr('transform', () => {
    //   return 'translate(' + [margin.left, height + margin.top + focusMargin] + ')'
    // })

    svg.select('.x.axis.bottom').attr('transform', () => {
      return 'translate(' + [0, height] + ')'
    })

    // context.select('.x.axis.context.bottom').attr('transform', () => {
    //   return 'translate(0,' + contextHeight + ')'
    // })

    let bars = timelines.selectAll('.bar')
      .data(data, (d) => d.key)

    bars.enter()
      .append('g')
      .attr('transform', (d, i) => {
        return 'translate(' + [0, y(d.key)] + ')'
      })
      .attr('class', 'bar')
      .append('rect')
      .attr('class', 'timeline-background')
      .attr('height', y.bandwidth())
      .attr('width', width - marginLeft - marginRight)

    bars.attr('transform', (d) => 'translate(' + [0, y(d.key)] + ')')

    var funct = bars.selectAll('rect')
      .data((d) => {
        return (d.values) ? d.values : []
      })

    funct.enter().append('rect')
    // .on('mouseover', tip.show)
    // .on('mouseout', tip.hide)
    // .on('contextmenu', d3.contextMenu(function (data) {
    //   let menu = []
    //   if (data.docLink) {
    //     menu.push({
    //       title: '<core-icon icon="help" self-center></core-icon>Documentation',
    //       action: function (elm, d, i) {
    //         console.log('Item #1 clicked!')
    //         window.location.href = d.docLink
    //       }
    //     })
    //   }
    //   return menu
    // }))

    funct.attr('transform', (d) => {
      return 'translate(' + x(d.startTime) + ',0)'
    })
      .attr('class', (d) => {
        let cls = 'function'
        if (!d.endTime) {
          cls += ' running'
        }
        if (d.status) {
          cls += ' status' + d.status
        }

        return cls
      })
      .attr('height', y.bandwidth())
      .attr('width', function (d) {
        return calculateWidth(d, x)
      })

    funct.exit().remove()

    bars.exit().remove()

    // let contextbars = context.selectAll('.bar')
    //   .data(data, (d) => {
    //     return d.key;})

    // contextbars.enter()
    //   .insert('g', ':first-child')
    //   .attr('class', 'bar')
    // contextbars.attr('transform', (d, i) => {
    //   let barHeight = contextHeight / data.length
    //   return 'translate(0,' + i * barHeight + ')'
    // })

    // let contextFunct = contextbars.selectAll('rect.function')
    //   .data((d) => {
    //     return (d.values) ? d.values : []
    //   })

    // contextFunct.enter().append('rect')

    // contextFunct.attr('transform', (d) => {
    //   return 'translate(' + xBrush(d.startTime) + ',0)'
    // })
    //   .attr('class', (d) => {
    //     let cls = 'function'
    //     if (!d.endTime) {
    //       cls += ' running'
    //     }
    //     if (d.status) {
    //       cls += ' status' + d.status
    //     }
    //     return cls
    //   })
    //   .attr('height', contextHeight / data.length)
    //   .attr('width', (d) => {
    //     return calculateWidth(d, xBrush)
    //   })

  // contextbars.exit().remove()
  // contextFunct.exit().remove()
  }

  let resize = function resize () {
    // update width
    width = parseInt(element.style('width'), 10)
    // width = width - margin.left - margin.right

    // resize the chart
    x.range([0, width - marginLeft - marginRight])
    // xBrush.range([0, width])
    // this.brush.clear()

    // d3.select(chart.node().parentNode)
    //   // .style('height', (this.y.rangeExtent()[1] + this.margin.top + this.margin.bottom + 300) + 'px')
    //   .style('width', (width + margin.left + margin.right) + 'px')

    // chart.selectAll('rect.background')
    //   .attr('width', width)

    // chart.selectAll('rect.function')
    //   .attr('transform', (d) => {
    //     return 'translate(' + x(d.startTime) + ',0)';})
    //   .attr('width', (d) => {
    //     return calculateWidth(d, x)
    //   })

    // context.selectAll('rect.function')
    //   .attr('transform', (d) => {
    //     return 'translate(' + xBrush(d.startTime) + ',0)';})
    //   .attr('width', (d) => {
    //     return calculateWidth(d, xBrush)
    //   })
    // update axes
    timelines.select('.x.axis.top').call(xAxisTop)
    timelines.select('.x.axis.bottom').call(xAxisBottom)
  // context.select('.x.axis.context.bottom').call(xAxisBrush.orient('bottom'))
  // context.select('.x.brush').call(brush.extent(focusExtent))
  }
  var calculateWidth = function (d, xa) {
    var width = 0
    if (!d.endTime) {
      width = xa(new Date()) - xa(d.startTime)
    } else if (d.startTime) {
      width = xa(d.endTime) - xa(d.startTime)
    } if (width > 0 && width < 1) {
      width = 1
    }
    return width
  }

  return Object.freeze({resize, update})

  // let element = spec.element
  // let data = spec.data
  // let spacing = 2
  // let focusMargin = 35
  // let _mainBarHeight = 40
  // let blinkAnimationDuration = 1000

  // let focusExtent = [d3.time.hour.offset(new Date(), -1 * 24), d3.time.hour.offset(new Date(), 0)]
  // let contextExtent = [d3.time.day.offset(new Date(), -5), new Date()]

  // let margin = { top: 30, right: 20, bottom: 30, left: 100 }
  // let width = parseInt(element.style('width'), 10) - margin.left - margin.right
  // if (!width) {
  //   width = 100
  // }
  // let height = 200 // placeholder
  // let contextHeight = spec.config.contextHeight; // original value = 100
  // let contextVisibility = spec.config.contextVisibility
  // // var barHeight = 40

  // let percent = d3.format('%')

  // // scales and axes
  // let x = d3.time.scale()
  //   .clamp(true)
  //   .domain(focusExtent)
  //   .range([0, width])

  // let xBrush = d3.time.scale()
  //   .clamp(true)
  //   .domain(contextExtent)
  //   .range([0, width])

  // let brush = d3.svg.brush()
  //   .x(xBrush)
  //   .extent(focusExtent)
  //   .on('brush', () => {
  //     if (!brush.empty()) {
  //       var extent = brush.extent()
  //       var now = new Date()
  //       if (extent[1] > now) {
  //         extent[1] = now
  //       }
  //       focusExtent = extent
  //       x.domain(extent)
  //       moveTimescale()
  //     }
  //   })

  // let y = d3.scale.ordinal()
  // let yAxis = d3.svg.axis()

  // let xAxis = d3.svg.axis()
  //   .scale(x)

  // let xAxis2 = d3.svg.axis()
  //   .scale(x)
  //   .ticks(d3.time.hours, 8)
  // // .tickFormat(d3.time.format("%H:%M"))
  // let xAxisBrush = d3.svg.axis()
  //   .scale(xBrush)

  // // render the chart
  // // create the chart
  // let svg = element.append('svg')
  //   .style('width', (width + margin.left + margin.right) + 'px')

  // // add the focus to the svg
  // let chart = svg.append('g')
  //   .attr('class', 'focus')
  //   .attr('transform', 'translate(' + [margin.left, margin.top] + ')')
  // // add top and bottom axes
  // chart.append('g')
  //   .attr('class', 'x axis top')

  // chart.append('g')
  //   .attr('class', 'x axis bottom')
  //   .attr('transform', 'translate(0,' + height + ')')

  // // add y axes
  // chart.append('g')
  //   .attr('class', 'y axis')
  //   .attr('transform', 'translate(' + (-1 * spacing) + ',' + spacing + ')')

  // let resizeHandlePath = function resizeHandlePath (d) {
  //   var e = +(d === 'e'),
  //     x = e ? 1 : -1,
  //     y = contextHeight / 3
  //   return 'M' + (.5 * x) + ',' + y
  //     + 'A6,6 0 0 ' + e + ' ' + (6.5 * x) + ',' + (y + 6)
  //     + 'V' + (2 * y - 6)
  //     + 'A6,6 0 0 ' + e + ' ' + (.5 * x) + ',' + (2 * y)
  //     + 'Z'
  //     + 'M' + (2.5 * x) + ',' + (y + 8)
  //     + 'V' + (2 * y - 8)
  //     + 'M' + (4.5 * x) + ',' + (y + 8)
  //     + 'V' + (2 * y - 8)
  // }

  // // add the context to the svg
  // // render the brush
  // // add top and bottom axes
  // let context = svg.append('g')
  //   .attr('class', 'context')
  //   .attr('transform', 'translate(' + [margin.left, 0] + ')')
  //   .attr('style', 'visibility:' + contextVisibility + ';')

  // context.append('g')
  //   .attr('class', 'x axis context bottom')
  //   .attr('transform', 'translate(0,' + height + ')')

  // context.append('g')
  //   .attr('class', 'x brush')
  //   .call(brush)
  //   .selectAll('rect')
  //   .attr('y', -6)
  //   .attr('height', contextHeight + 5)

  // context.select('.resize.e').append('path').attr('d', resizeHandlePath)
  // context.select('.resize.w').append('path').attr('d', resizeHandlePath)

  // let tip = d3.tip()
  //   .attr('class', 'd3-tip')
  //   .offset([-10, 0])
  //   .html(function (d) {
  //     var tooltip = '<strong class="value">' + d.name
  //       // + '</strong><br> <span>' + moment(d.startTime).calendar() + ' &ndash; ' + moment(d.endTime).calendar() + '</span>'
  //       + '</span><br> <span>' + moment(d.startTime).format('h:mm:ss a') + ' &ndash; ' + moment(d.endTime).format('h:mm:ss a')
  //       + '<br> (' + moment.duration(moment(d.endTime).diff(d.startTime)).format('d[d] h [hrs], m [min], s [sec]') + ')</span>'
  //     return tooltip
  //   })

  // chart.call(tip)
  // var calculateWidth = function (d, xa) {
  //   var width = 0
  //   if (!d.endTime) {
  //     width = xa(new Date()) - xa(d.startTime)
  //   } else if (d.startTime) {
  //     width = xa(d.endTime) - xa(d.startTime)
  //   } if (width > 0 && width < 1) {
  //     width = 1
  //   }
  //   return width
  // }

  // // UPDATE
  // var update = function (d) {
  //   let data = d
  //   var height

  //   y.domain(data.map(function (d) { return d.key; }))
  //     .rangeBands([0, data.length * _mainBarHeight])
  //   yAxis.scale(y)
  //   chart.select('.y.axis').call(yAxis.orient('left'))
  //   // TODO xAxisi missing
  //   // set height based on data
  //   height = y.rangeExtent()[1]
  //   d3.select(chart.node().parentNode)
  //     .style('height', (height + margin.top + focusMargin + contextHeight + margin.bottom) + 'px')

  //   svg.select('.context').attr('transform', () => {
  //     return 'translate(' + [margin.left, height + margin.top + focusMargin] + ')'
  //   })

  //   chart.select('.x.axis.bottom').attr('transform', () => {
  //     return 'translate(0,' + (height + 2 * spacing) + ')'
  //   })

  //   context.select('.x.axis.context.bottom').attr('transform', () => {
  //     return 'translate(0,' + contextHeight + ')'
  //   })

  //   let bars = chart.selectAll('.bar')
  //     .data(data, (d) => {
  //       return d.key;})

  //   bars.enter()
  //     .append('g')
  //     .attr('class', 'bar')
  //     .append('rect')
  //     .attr('class', 'background')
  //     .attr('height', y.rangeBand())
  //     .attr('width', width)

  //   bars.attr('transform', (d, i) => {
  //     let index = d3.map(data, (d) => {
  //       return d.key;}).keys().indexOf(d.key)
  //     return 'translate(0,' + (index * _mainBarHeight + spacing) + ')'
  //   })

  //   let funct = bars.selectAll('rect.function')
  //     .data((d) => {
  //       return (d.values) ? d.values : []
  //     })

  //   funct.enter().append('rect')
  //     .on('mouseover', tip.show)
  //     .on('mouseout', tip.hide)
  //     .on('contextmenu', d3.contextMenu(function (data) {
  //       let menu = []
  //       if (data.docLink) {
  //         menu.push({
  //           title: '<core-icon icon="help" self-center></core-icon>Documentation',
  //           action: function (elm, d, i) {
  //             console.log('Item #1 clicked!')
  //             window.location.href = d.docLink
  //           }
  //         })
  //       }
  //       return menu
  //     }))

  //   funct.attr('transform', (d) => {
  //     return 'translate(' + x(d.startTime) + ',0)'
  //   })
  //     .attr('class', (d) => {
  //       let cls = 'function'
  //       if (!d.endTime) {
  //         cls += ' running'
  //       }
  //       if (d.status) {
  //         cls += ' status' + d.status
  //       }

  //       return cls
  //     })
  //     .attr('height', y.rangeBand())
  //     .attr('width', function (d) {
  //       return calculateWidth(d, x)
  //     })

  //   funct.exit().remove()

  //   bars.exit().remove()

  //   let contextbars = context.selectAll('.bar')
  //     .data(data, (d) => {
  //       return d.key;})

  //   contextbars.enter()
  //     .insert('g', ':first-child')
  //     .attr('class', 'bar')
  //   contextbars.attr('transform', (d, i) => {
  //     let barHeight = contextHeight / data.length
  //     return 'translate(0,' + i * barHeight + ')'
  //   })

  //   let contextFunct = contextbars.selectAll('rect.function')
  //     .data((d) => {
  //       return (d.values) ? d.values : []
  //     })

  //   contextFunct.enter().append('rect')

  //   contextFunct.attr('transform', (d) => {
  //     return 'translate(' + xBrush(d.startTime) + ',0)'
  //   })
  //     .attr('class', (d) => {
  //       let cls = 'function'
  //       if (!d.endTime) {
  //         cls += ' running'
  //       }
  //       if (d.status) {
  //         cls += ' status' + d.status
  //       }
  //       return cls
  //     })
  //     .attr('height', contextHeight / data.length)
  //     .attr('width', (d) => {
  //       return calculateWidth(d, xBrush)
  //     })

  //   contextbars.exit().remove()
  //   contextFunct.exit().remove()
  // }

  // update(data)

  // var moveTimescale = function moveTimescale () {
  //   // prevent moving into the future
  //   let moveByInMilli = (new Date()).getTime() - contextExtent[1].getTime()
  //   focusExtent[0] = new Date(focusExtent[0].getTime() + moveByInMilli)
  //   focusExtent[1] = new Date(focusExtent[1].getTime() + moveByInMilli)
  //   contextExtent[0] = new Date(contextExtent[0].getTime() + moveByInMilli)
  //   contextExtent[1] = new Date(contextExtent[1].getTime() + moveByInMilli)

  //   x.domain(focusExtent)
  //   xBrush.domain(contextExtent)

  //   chart.selectAll('rect.function')
  //     .attr('transform', (d) => {
  //       return 'translate(' + x(d.startTime) + ',0)';})
  //     .attr('width', (d) => {
  //       return calculateWidth(d, x)
  //     })

  //   context.selectAll('rect.function')
  //     .attr('transform', (d) => {
  //       return 'translate(' + xBrush(d.startTime) + ',0)';})
  //     .attr('width', (d) => {
  //       return calculateWidth(d, xBrush)
  //     })

  //   drawAxes()
  // }

  // function drawAxes () {
  //   chart.select('.x.axis.top').call(xAxis.orient('top'))
  //   chart.select('.x.axis.bottom').call(xAxis2.orient('bottom'))
  //   context.select('.x.axis.context.bottom').call(xAxisBrush.orient('bottom'))
  //   context.select('.x.brush').call(brush.extent(focusExtent))
  // }

  // function animateBlink (duration) {
  //   let runningTasks = d3.selectAll('.running')
  //   if (!runningTasks.empty()) {
  //     runningTasks.transition().duration(blinkAnimationDuration).delay(0)
  //       .style('opacity', runningTasks.style('opacity') === '0.9' ? '.1' : '0.9')
  //   }
  // }

  // // update x axes
  // drawAxes()

  // let resize = function resize () {
  //   // update width
  //   width = parseInt(element.style('width'), 10)
  //   width = width - margin.left - margin.right

  //   // resize the chart
  //   x.range([0, width])
  //   xBrush.range([0, width])
  //   // this.brush.clear()

  //   d3.select(chart.node().parentNode)
  //     // .style('height', (this.y.rangeExtent()[1] + this.margin.top + this.margin.bottom + 300) + 'px')
  //     .style('width', (width + margin.left + margin.right) + 'px')

  //   chart.selectAll('rect.background')
  //     .attr('width', width)

  //   chart.selectAll('rect.function')
  //     .attr('transform', (d) => {
  //       return 'translate(' + x(d.startTime) + ',0)';})
  //     .attr('width', (d) => {
  //       return calculateWidth(d, x)
  //     })

  //   context.selectAll('rect.function')
  //     .attr('transform', (d) => {
  //       return 'translate(' + xBrush(d.startTime) + ',0)';})
  //     .attr('width', (d) => {
  //       return calculateWidth(d, xBrush)
  //     })
  //   // update axes
  //   chart.select('.x.axis.top').call(xAxis.orient('top'))
  //   chart.select('.x.axis.bottom').call(xAxis2.orient('bottom'))
  //   context.select('.x.axis.context.bottom').call(xAxisBrush.orient('bottom'))
  //   context.select('.x.brush').call(brush.extent(focusExtent))
  // }

  // var intervalID = window.setInterval(() => {
  //   moveTimescale();}, 1000)

  // var intervalID2 = window.setInterval(() => {
  //   animateBlink(blinkAnimationDuration);}, blinkAnimationDuration)

// return Object.freeze({
//   resize,
// update})
}

function wrap (text, width) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr('y'),
      dy = parseFloat(text.attr('dy')),
      tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em')
    while (word = words.pop()) {
      line.push(word)
      tspan.text(line.join(' '))
      if (tspan.node().getComputedTextLength() > width) {
        line.pop()
        tspan.text(line.join(' '))
        line = [word]
        tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word)
      }
    }
  })
}
