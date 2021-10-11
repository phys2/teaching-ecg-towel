const ELECTRODEOFFSET = { x: 13, y: 69 };
const SOURCEOFFSET = { x: 23, y: 71 };

const VOLTAGESCALINGFACTOR = 30000;

$(function () {
    resizeCanvas();

    $(window).on('resize', function () {
        resizeCanvas();
        updateOscillo();
        updateCanvas();
    });

    interact('.source, .electrode').draggable({
        listeners: {
            start(event) {

            },
            move(event) {
                var target = event.target;
                var x = $(event.target).position().left + event.dx;
                var y = $(event.target).position().top + event.dy;
                $(event.target).css({ top: y, left: x, position: 'absolute' });
                updateCanvas();
                updateVoltage();
                updateOscillo();
            },
            end(event) {
                updateCanvas();
                updateVoltage();
                updateOscillo();
            }
        }
    })

    $(document).on('input', '#voltageRange', function () {
        $('.tooltip-inner').html($("#voltageRange").val());
        document.getElementById('voltageRange').setAttribute('data-bs-original-title', $("#voltageRange").val());
        updateOscillo();

    });
    $('input[name=powerButton]').change(function () {
        updateOscillo();
    });
    $('input[name=currentRadioGroup]').change(function () {
        updateOscillo();
    });

    var exampleEl = document.getElementById('voltageRange');
    var tooltip = new bootstrap.Tooltip(exampleEl, {
        title: $("#voltageRange").val(),
        placement: 'right'
    });

    $(document).ready(function () {
        updateCanvas();
        updateVoltage();
        updateOscillo();
    });

    $('.abltSelect').click(function () {
        var selectedStr = $(this).attr('id');

        var clickedSelector = parseInt(selectedStr.charAt(selectedStr.length - 2));
        var clickedAblt = parseInt(selectedStr.charAt(selectedStr.length - 1));

        var otherSelector = 1 - clickedSelector;

        var activeAblt = parseInt($("#abltSelector" + otherSelector.toString()).attr("data-selected"));
        if (activeAblt == clickedAblt) {
            changeSelectedAblt(otherSelector, (clickedAblt + 1) % 3);

        }
        changeSelectedAblt(clickedSelector, clickedAblt);
    });
});

function changeSelectedAblt(a, b) {
    var selector = "#abltSelector" + a.toString();
    var select = "#abltSelect" + a.toString() + b.toString();
    $(selector).html($(select).html());
    $(selector).attr("data-selected", b.toString());
}

function updateOscillo() {
    //draw grid
    var canvas = document.getElementById("oscilloCanvas");
    var ctx = canvas.getContext("2d");
    var height = canvas.height;
    var width = canvas.width;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = "1";


    ctx.beginPath();
    ctx.font = "12px Arial";
    ctx.fillText("\u0394x : ms, \u0394y : mV", width - 110, height - 12);
    ctx.stroke();

    ctx.beginPath();
    var yStep = height / 6;
    var xStep = width / 20;
    ctx.font = "14px Arial";
    var nameArray = ["A \u2192 B", "A \u2192 C", "B \u2192 C"];
    for (let i = 1; i < 4; i++) {
        var y = (i * 2 - 1) * yStep;
        var yUp = y - 4;
        var yDown = y + 4;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        for (let z = 1; z < 20; z++) {
            var x = z * xStep;
            ctx.moveTo(x, yUp);
            ctx.lineTo(x, yDown);
        }
        ctx.fillText("Ablt. " + nameArray[i - 1], 10, y + 17);
    }
    ctx.stroke();


    //draw input
    if ($("input[name='powerButton']:checked").val() == "on") {
        var selectedCurrent = $("input[name='currentRadioGroup']:checked").val();
        var electrodes = [$("#electrode1"), $("#electrode2"), $("#electrode3"), $("#electrode2"), $("#electrode3"), $("#electrode1")];
        var colors = ["#6f42c1", "#fd7e14", "#20c997"];

        if (selectedCurrent == "dc") {
            var sourceVoltage = $("#voltageRange").val();

            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.lineWidth = "2";
                ctx.strokeStyle = colors[i];

                var x1 = electrodes[i * 2].position().left;
                var x2 = electrodes[i * 2 + 1].position().left;

                var y1 = electrodes[i * 2].position().top;
                var y2 = electrodes[i * 2 + 1].position().top;

                var xp = $("#plus").position().left;
                var yp = $("#plus").position().top;

                var xm = $("#minus").position().left;
                var ym = $("#minus").position().top;

                var r1 = Math.sqrt((x1 - xp) * (x1 - xp) + (y1 - yp) * (y1 - yp));
                var r2 = Math.sqrt((x2 - xp) * (x2 - xp) + (y2 - yp) * (y2 - yp));

                var r3 = Math.sqrt((x1 - xm) * (x1 - xm) + (y1 - ym) * (y1 - ym));
                var r4 = Math.sqrt((x2 - xm) * (x2 - xm) + (y2 - ym) * (y2 - ym));

                var tension = 1 / r1 - 1 / r2 - 1 / r3 + 1 / r4;
                var amplitude = sourceVoltage * tension * VOLTAGESCALINGFACTOR;
                var signalY = ((i + 1) * 2 - 1) * yStep - amplitude;
                ctx.moveTo(0, signalY);
                ctx.lineTo(width, signalY);
                ctx.stroke()
            }
        } else if (selectedCurrent == "sinus") {
            var sourceVoltage = $("#voltageRange").val();

            for (let i = 0; i < 3; i++) {
                var scale = 20;

                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = colors[i];

                var x1 = electrodes[i * 2].position().left;
                var x2 = electrodes[i * 2 + 1].position().left;

                var y1 = electrodes[i * 2].position().top;
                var y2 = electrodes[i * 2 + 1].position().top;

                var xp = $("#plus").position().left;
                var yp = $("#plus").position().top;

                var xm = $("#minus").position().left;
                var ym = $("#minus").position().top;

                var r1 = Math.sqrt((x1 - xp) * (x1 - xp) + (y1 - yp) * (y1 - yp));
                var r2 = Math.sqrt((x2 - xp) * (x2 - xp) + (y2 - yp) * (y2 - yp));

                var r3 = Math.sqrt((x1 - xm) * (x1 - xm) + (y1 - ym) * (y1 - ym));
                var r4 = Math.sqrt((x2 - xm) * (x2 - xm) + (y2 - ym) * (y2 - ym));

                var tension = 1 / r1 - 1 / r2 - 1 / r3 + 1 / r4;

                var amplitude = sourceVoltage * tension * VOLTAGESCALINGFACTOR;

                var x = 0;
                var y = 0;
                var frequency = 20;
                ctx.moveTo(x, ((i + 1) * 2 - 1) * yStep);
                while (x < width) {
                    y = ((i + 1) * 2 - 1) * yStep - sourceVoltage * amplitude * Math.sin(x / frequency);
                    ctx.lineTo(x, y);
                    x = x + 1;
                }
                ctx.stroke();
            }
        } else if (selectedCurrent == "square") {
            var sourceVoltage = $("#voltageRange").val();
            for (let i = 0; i < 3; i++) {
                var scale = 20;

                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = colors[i];

                var x1 = electrodes[i * 2].position().left;
                var x2 = electrodes[i * 2 + 1].position().left;

                var y1 = electrodes[i * 2].position().top;
                var y2 = electrodes[i * 2 + 1].position().top;

                var xp = $("#plus").position().left;
                var yp = $("#plus").position().top;

                var xm = $("#minus").position().left;
                var ym = $("#minus").position().top;

                var r1 = Math.sqrt((x1 - xp) * (x1 - xp) + (y1 - yp) * (y1 - yp));
                var r2 = Math.sqrt((x2 - xp) * (x2 - xp) + (y2 - yp) * (y2 - yp));

                var r3 = Math.sqrt((x1 - xm) * (x1 - xm) + (y1 - ym) * (y1 - ym));
                var r4 = Math.sqrt((x2 - xm) * (x2 - xm) + (y2 - ym) * (y2 - ym));

                var tension = 1 / r1 - 1 / r2 - 1 / r3 + 1 / r4;

                var amplitude = sourceVoltage * tension * VOLTAGESCALINGFACTOR;

                var x = 0;
                var y = ((i + 1) * 2 - 1) * yStep;
                var step = 40;
                ctx.moveTo(x, y);
                while (x < width) {
                    ctx.lineTo(x + step, y);
                    ctx.lineTo(x + step, y - amplitude);
                    ctx.lineTo(x + 2 * step, y - amplitude);
                    ctx.lineTo(x + 2 * step, y);
                    x = x + 2 * step;
                }
                ctx.lineTo(x + step, y);
                ctx.lineTo(x + step, y - amplitude);
                ctx.lineTo(x + 2 * step, y - amplitude);
                ctx.lineTo(x + 2 * step, y);
                ctx.stroke();
            }
        }


    }

}

function toggleSourceVisibility() {
    if ($('.source').css('visibility') == 'hidden')
        $('.source').css('visibility', 'visible');
    else
        $('.source').css('visibility', 'hidden');
}

function placeRandomly() {
    var x1 = $("#minus").position().left + SOURCEOFFSET.x;
    var y1 = $("#minus").position().top + SOURCEOFFSET.y;

    var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    var p = randn_bm() * plusOrMinus * 160;
    plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    var q = randn_bm() * plusOrMinus * 160;

    $("#plus").animate({
        left: x1 + p - SOURCEOFFSET.x, top: y1 + q - SOURCEOFFSET.y,
    }, {
        duration: 1000,
        step: function () {
            updateCanvas();
            updateOscillo();
        }, done: function () {
            updateVoltage();
        }
    });
}

function randn_bm() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm() // resample between 0 and 1
    return num
}

function resizeCanvas() {
    var canvas = document.getElementById("mainCanvas");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas = document.getElementById("oscilloCanvas");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

function placeSource(sourceToPlace, sourceToStay) {
    var x2 = $("#electrode2").position().left + ELECTRODEOFFSET.x;
    var y2 = $("#electrode2").position().top + ELECTRODEOFFSET.y;

    var x4 = $("#electrode3").position().left + ELECTRODEOFFSET.x;
    var y4 = $("#electrode3").position().top + ELECTRODEOFFSET.y;

    var x5 = $("#electrode1").position().left + ELECTRODEOFFSET.x;
    var y5 = $("#electrode1").position().top + ELECTRODEOFFSET.y;

    if ((x2 == x4 && y2 == y4) || (x4 == x5 && y4 == y5) || (x2 == x5 && y2 == y5)) {
        $('#mainModalTitle').html('Fehler');
        $('#mainModalBody').html('Die Ableitungselektroden dürfen nicht &uuml;bereinander gestapelt werden. Platziere die Ableitungselektroden neu!');
        var myModal = new bootstrap.Modal(document.getElementById('mainModal'), {
            keyboard: false
        });
        myModal.show();
    } else if (x2 == x5 && x4 == x5) {
        $('#mainModalTitle').html('Fehler');
        $('#mainModalBody').html('Die Ableitungen d&uuml;rfen nicht parallel zueinander sein. Platziere die Ableitungselektroden neu!');
        var myModal = new bootstrap.Modal(document.getElementById('mainModal'), {
            keyboard: false
        });
        myModal.show();
    } else {
        var p1 = (y5 - y2) / (x5 - x2);
        var p2 = (y5 - y4) / (x5 - x4);
        if (p1 == p2) {
            $('#mainModalTitle').html('Fehler');
            $('#mainModalBody').html('Die Ableitungen d&uuml;rfen nicht parallel zueinander sein. Platziere die Ableitungselektroden neu!');
            var myModal = new bootstrap.Modal(document.getElementById('mainModal'), {
                keyboard: false
            });
            myModal.show();
        } else {

            var ablt1 = parseInt($("#abltSelector0").attr("data-selected"));
            var ablt2 = parseInt($("#abltSelector1").attr("data-selected"));


            var electrodes = [$("#electrode1"), $("#electrode2"), $("#electrode3"), $("#electrode2"), $("#electrode3"), $("#electrode1")];

            var electrode1_1 = electrodes[ablt1 * 2];
            var electrode1_2 = electrodes[ablt1 * 2 + 1];
            var electrode2_1 = electrodes[ablt2 * 2];
            var electrode2_2 = electrodes[ablt2 * 2 + 1];

            var xa = electrode1_1.position().left + ELECTRODEOFFSET.x;
            var xb = electrode2_1.position().left + ELECTRODEOFFSET.x;

            var ya = electrode1_1.position().top + ELECTRODEOFFSET.y;
            var yb = electrode2_1.position().top + ELECTRODEOFFSET.y;


            var derivative = parseFloat($('#derivative1').val()) * 10;
            var newProjectionPoint1 = getNewProjectionPoint(electrode1_1, electrode1_2, sourceToStay, derivative);

            derivative = parseFloat($('#derivative2').val()) * 10;
            var newProjectionPoint2 = getNewProjectionPoint(electrode2_1, electrode2_2, sourceToStay, derivative);

            var x1 = newProjectionPoint1.x;
            var y1 = newProjectionPoint1.y;

            var x3 = newProjectionPoint2.x;
            var y3 = newProjectionPoint2.y;

            //

            var intersectionPoint = new Object();

            if (x1 == xa) {
                //x3!=xb (sonst parallel) und y1!=ya (sonst 2 electroden an gleicher Stelle)
                intersectionPoint.y = y1;
                if (y3 == yb) {
                    intersectionPoint.x = x3;
                } else {
                    var m2 = (yb - y3) / (xb - x3);
                    var a2 = -1 / m2;
                    intersectionPoint.x = (y1 - y3) / a2 + x3;
                }
            } else if (x3 == xb) {
                //x1!=xa (sonst parallel) und y3!=yb (sonst 2 electroden an gleicher Stelle)
                intersectionPoint.y = y3;
                if (y1 == ya) {
                    intersectionPoint.x = x1;
                } else {
                    var m1 = (ya - y1) / (xa - x1);
                    var a1 = -1 / m1;
                    intersectionPoint.x = (y3 - y1) / a1 + x1;
                }
            } else if (y1 == ya) {
                intersectionPoint.x = x1;
                //x1!=xa , y3!=yb, x3!=xb ist sicher
                var m2 = (yb - y3) / (xb - x3);
                var a2 = -1 / m2;
                intersectionPoint.y = a2 * (intersectionPoint.x - x3) + y3;

            } else if (y3 == yb) {
                //x1!=xa , y1!=ya, x3!=xb ist sicher
                intersectionPoint.x = x3;
                var m1 = (ya - y1) / (xa - x1);
                var a1 = -1 / m1;
                intersectionPoint.y = a1 * (intersectionPoint.x - x1) + y1;
            }
            else {
                var m1 = (ya - y1) / (xa - x1);
                var m2 = (yb - y3) / (xb - x3);
                //m1 und m2 sind hier sicher verschieden, weil wenn die 2 geraden parralel wären, wären die 3 Elektroden auf der gleichen Geraden
                var a1 = -1 / m1;
                var a2 = -1 / m2;
                intersectionPoint.x = (a1 * x1 - a2 * x3 + y3 - y1) / (a1 - a2);
                intersectionPoint.y = a1 * (intersectionPoint.x - x1) + y1;
            }
            sourceToPlace.animate({
                left: intersectionPoint.x - SOURCEOFFSET.x, top: intersectionPoint.y - SOURCEOFFSET.y,
            }, {
                duration: 1000,
                step: function () {
                    updateCanvas();
                    updateOscillo();
                }, done: function () {
                    updateVoltage();
                }
            });
        }
    }
}

function getNewProjectionPoint(electrode1, electrode2, source, derivative) {
    var minusProjectionPoint = getProjectionPoint(electrode1, electrode2, source);
    var x1 = minusProjectionPoint.x;
    var y1 = minusProjectionPoint.y;

    var x2, y2;

    x2 = electrode1.position().left + ELECTRODEOFFSET.x;
    y2 = electrode1.position().top + ELECTRODEOFFSET.y;

    //calculate the dot product  only to adjust direction 
    x3 = electrode2.position().left + ELECTRODEOFFSET.x;
    y3 = electrode2.position().top + ELECTRODEOFFSET.y;
    var dotProduct = (x2 - x1) * (x2 - x3) + (y2 - y1) * (y2 - y3);
    var factor; //1 oder -1
    if (dotProduct < 0) {
        factor = -1;
    } else {
        factor = 1;
    }
    if (source.is($("#plus"))) {
        factor *= -1;
    }
    var l = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    var p = derivative * (x2 - x1) / l;
    var q = derivative * (y2 - y1) / l;

    var newProjectionPoint = new Object();
    newProjectionPoint.x = x1 + factor * p;
    newProjectionPoint.y = y1 + factor * q;

    return newProjectionPoint;
}



function updateVoltage() {

    $("#text1").val((getProjectionVectorMagnitude($("#electrode1"), $("#electrode2")) / 10).toFixed(1));
    $("#text2").val((getProjectionVectorMagnitude($("#electrode3"), $("#electrode2")) / 10).toFixed(1));
    $("#text3").val((getProjectionVectorMagnitude($("#electrode3"), $("#electrode1")) / 10).toFixed(1));
}

function getProjectionVectorMagnitude(electrode1, electrode2) {
    var plusProjectionPoint = getProjectionPoint(electrode1, electrode2, $("#plus"));
    var minusProjectionPoint = getProjectionPoint(electrode1, electrode2, $("#minus"));
    var x1 = plusProjectionPoint.x;
    var x2 = minusProjectionPoint.x;
    var x3 = electrode2.position().left; //offset kann man sich hier sparen
    var x4 = electrode1.position().left;
    var y1 = plusProjectionPoint.y;
    var y2 = minusProjectionPoint.y;
    var y3 = electrode2.position().top;
    var y4 = electrode1.position().top;
    var a = x1 - x2;
    var b = y1 - y2;
    var length = Math.sqrt(a * a + b * b);
    var dotProduct = a * (x4 - x3) + b * (y4 - y3);
    var f = dotProduct < 0 ? -1 : 1;
    var voltage = f * length;
    return voltage;
}

function updateCanvas() {
    var canvas = document.getElementById("mainCanvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "black";
    ctx.lineWidth = "1";

    ctx.beginPath();

    var scaleXstart = 35;
    var scaleY = canvas.height - 24;
    ctx.moveTo(scaleXstart, scaleY);
    ctx.lineTo(scaleXstart + 200, scaleY);

    for (let i = 0; i < 21; i++) {
        if (i % 10 == 0) {
            ctx.moveTo(scaleXstart + i * 10, scaleY - 6);
            ctx.lineTo(scaleXstart + i * 10, scaleY + 6);
        } else {
            ctx.moveTo(scaleXstart + i * 10, scaleY - 4);
            ctx.lineTo(scaleXstart + i * 10, scaleY + 4);
        }
    }
    ctx.stroke();
    ctx.font = "12px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("0", scaleXstart - 4, scaleY + 18);
    ctx.fillText("10", scaleXstart + 92, scaleY + 18);
    ctx.fillText("20 mm", scaleXstart + 193, scaleY + 18);



    if ($("#guidelines").prop("checked")) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = "1";
        ctx.beginPath();
        drawPassingLine(ctx, $("#electrode1"), $("#electrode2"));
        drawPassingLine(ctx, $("#electrode2"), $("#electrode3"));
        drawPassingLine(ctx, $("#electrode1"), $("#electrode3"));

        drawProjectionLine(ctx, $("#minus"), $("#electrode1"), $("#electrode2"), "#3d8bfd");
        drawProjectionLine(ctx, $("#minus"), $("#electrode2"), $("#electrode3"), "#3d8bfd");
        drawProjectionLine(ctx, $("#minus"), $("#electrode1"), $("#electrode3"), "#3d8bfde");
        drawProjectionLine(ctx, $("#plus"), $("#electrode1"), $("#electrode2"), "#e35d6a");
        drawProjectionLine(ctx, $("#plus"), $("#electrode2"), $("#electrode3"), "#e35d6a");
        drawProjectionLine(ctx, $("#plus"), $("#electrode1"), $("#electrode3"), "#e35d6a");

    }
    if ($("#projections").prop("checked")) {
        drawProjection(ctx, $("#plus"), $("#minus"), $("#electrode1"), $("#electrode2"), "#6f42c1");
        drawProjection(ctx, $("#plus"), $("#minus"), $("#electrode2"), $("#electrode3"), "#fd7e14");
        drawProjection(ctx, $("#plus"), $("#minus"), $("#electrode1"), $("#electrode3"), "#20c997");
    }
    if ($("#vector").prop("checked")) {
        ctx.lineWidth = "3";
        ctx.strokeStyle = "black";
        var plusPosition = new Object();
        plusPosition.x = $("#plus").position().left + SOURCEOFFSET.x;
        plusPosition.y = $("#plus").position().top + SOURCEOFFSET.y;
        var minusPosition = new Object();
        minusPosition.x = $("#minus").position().left + SOURCEOFFSET.x;
        minusPosition.y = $("#minus").position().top + SOURCEOFFSET.y;
        ctx.beginPath();
        ctx.moveTo(minusPosition.x, minusPosition.y);
        ctx.lineTo(plusPosition.x, plusPosition.y);
        ctx.stroke(); // Draw it
        drawArrowhead(ctx, minusPosition, plusPosition, 12, "black")
    }
    if ($("#cabrera").prop("checked")) {
        ctx.lineWidth = "1";
        ctx.strokeStyle = "black";
        var minusPosition = new Object();
        minusPosition.x = $("#minus").position().left + SOURCEOFFSET.x;
        minusPosition.y = $("#minus").position().top + SOURCEOFFSET.y;
        ctx.beginPath();
        ctx.arc(minusPosition.x, minusPosition.y, 150, 0, Math.PI * 2, false);
        ctx.moveTo(minusPosition.x - 150, minusPosition.y);
        ctx.lineTo(minusPosition.x, minusPosition.y);
        ctx.stroke();
        ctx.font = "12px Arial";
        ctx.fillStyle = "black";
        ctx.lineWidth = "1";
        for (let i = -1; i < 5; i++) {
            ctx.beginPath();

            var theta = i * Math.PI / 6;
            var rotatedX = (minusPosition.x + 150 - minusPosition.x) * Math.cos(theta) + minusPosition.x;
            var rotatedY = (minusPosition.x + 150 - minusPosition.x) * Math.sin(theta) + minusPosition.y;
            ctx.moveTo(minusPosition.x, minusPosition.y);
            ctx.lineTo(rotatedX, rotatedY);
            ctx.stroke();

            var rotatedX = (minusPosition.x + 160 - minusPosition.x) * Math.cos(theta) + minusPosition.x;
            var rotatedY = (minusPosition.x + 160 - minusPosition.x) * Math.sin(theta) + minusPosition.y + 4;
            var angle = (i * 30).toString();
            ctx.fillText(angle + " \u00B0", rotatedX, rotatedY);
        }
    }
}

function clearCanvas() {
    var canvas = document.getElementById("mainCanvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getProjectionPoint(electrode1, electrode2, point) {
    var x1 = electrode1.position().left + ELECTRODEOFFSET.x;
    var y1 = electrode1.position().top + ELECTRODEOFFSET.y;
    var x2 = electrode2.position().left + ELECTRODEOFFSET.x;
    var y2 = electrode2.position().top + ELECTRODEOFFSET.y;
    var x3 = point.position().left + SOURCEOFFSET.x;
    var y3 = point.position().top + SOURCEOFFSET.y;
    var projectionPoint = new Object();
    if (x2 == x1) {
        projectionPoint.x = x1;
        projectionPoint.y = y3;
    } else if (y2 == y1) {
        projectionPoint.x = x3;
        projectionPoint.y = y1;
    } else {
        var a = (y2 - y1) / (x2 - x1);
        projectionPoint.x = (y3 - y1 + a * x1 + (1 / a) * x3) / (a + 1 / a);
        projectionPoint.y = a * (projectionPoint.x - x1) + y1;
    }
    return projectionPoint;
}

function drawPassingLine(ctx, electrode1, electrode2) {
    var x1 = electrode1.position().left + ELECTRODEOFFSET.x;
    var y1 = electrode1.position().top + ELECTRODEOFFSET.y;
    var x2 = electrode2.position().left + ELECTRODEOFFSET.x;
    var y2 = electrode2.position().top + ELECTRODEOFFSET.y;
    var x3, x4, y3, y4;
    if (x1 == x2) {
        x3 = x1;
        x4 = x1;
        y3 = 0;
        y4 = ctx.canvas.clientHeight;
    } else {
        x3 = 0;
        x4 = ctx.canvas.clientWidth;
        y3 = (x3 - x1) * (y2 - y1) / (x2 - x1) + y1;
        y4 = (x4 - x1) * (y2 - y1) / (x2 - x1) + y1;
    }
    ctx.strokeStyle = "black";
    ctx.moveTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.stroke();
}

function drawProjectionLine(ctx, source, electrode1, electrode2, color) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.lineWidth = "1.5";
    var x2 = source.position().left + SOURCEOFFSET.x;
    var y2 = source.position().top + SOURCEOFFSET.y;

    var minusProjectionPoint = getProjectionPoint(electrode1, electrode2, source);

    var x1 = minusProjectionPoint.x;
    var y1 = minusProjectionPoint.y;

    ctx.moveTo(x2, y2);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    var l = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    var p = (x2 - x1) / l;
    var q = (y2 - y1) / l;

    var xc = x1 + 8 * (p + q);
    var yc = y1 + 8 * (q - p);

    ctx.beginPath();

    ctx.arc(xc, yc, 1.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = color;
    var alpha;
    if (x2 == x1) {
        if (y2 < y1) {
            alpha = - Math.PI / 2;
        } else {
            alpha = Math.PI / 2;
        }
    } else {
        alpha = Math.atan((y2 - y1) / (x2 - x1));
        if (x1 > x2) { alpha = alpha + Math.PI }
    }
    var beta = alpha - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(x1, y1, 20, alpha, beta, true);

    ctx.stroke();
}

function drawProjection(ctx, source1, source2, electrode1, electrode2, color) {
    ctx.beginPath();
    ctx.lineWidth = "3";
    ctx.strokeStyle = color;
    var plusProjectionPoint = getProjectionPoint(electrode1, electrode2, source1);
    var minusProjectionPoint = getProjectionPoint(electrode1, electrode2, source2);
    if (distanceBetween(minusProjectionPoint, plusProjectionPoint) >= 0.3) {
        ctx.moveTo(minusProjectionPoint.x, minusProjectionPoint.y);
        ctx.lineTo(plusProjectionPoint.x, plusProjectionPoint.y)
        ctx.stroke();
        drawArrowhead(ctx, minusProjectionPoint, plusProjectionPoint, 10, color);
    }
}

function distanceBetween(point1, point2) {
    var a = point1.x - point2.x;
    var b = point1.y - point2.y;
    return Math.sqrt(a * a + b * b);
}

function drawArrowhead(context, from, to, radius, color) {
    var l = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2); //vector Length
    var p = -(radius - 2) * (to.x - from.x) / l;
    var q = -(radius - 2) * (to.y - from.y) / l;
    var x_center = to.x + p;
    var y_center = to.y + q;
    var angle;
    var x;
    var y;
    context.strokeStyle = color;
    context.fillStyle = color;
    context.beginPath();
    angle = Math.atan2(to.y - from.y, to.x - from.x)
    x = radius * Math.cos(angle) + x_center;
    y = radius * Math.sin(angle) + y_center;
    context.moveTo(x, y);
    angle += (1.0 / 3.0) * (2 * Math.PI)
    x = radius * Math.cos(angle) + x_center;
    y = radius * Math.sin(angle) + y_center;
    context.lineTo(x, y);
    angle += (1.0 / 3.0) * (2 * Math.PI)
    x = radius * Math.cos(angle) + x_center;
    y = radius * Math.sin(angle) + y_center;
    context.lineTo(x, y);
    context.closePath();
    context.fill();
}