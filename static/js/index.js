var pmWeek = 0;
var thisDate;
var reservNo;

function getTimeTable(err) {
    $.ajax({
        url: '/loadResv',
        type: 'post',
        dataType: 'json',
        data: {
            pmw: pmWeek
        },
        success: function(data) {
            console.log(data);
            $('#table td').not('.closed').not('.closed div').removeClass('reserved');
            $('#table td').not('.closed').not('.closed div').html('');
            var dArray = data;
            setWeek(new Date(dArray[dArray.length - 1]));
            for (var i = 1; i < dArray.length - 1; i++) {
                console.log(data[i]);
                fillTT(data[i]);
            }
            $('th').css('padding', '5px 0 5px 0');
        },
        error: function() {
            console.log("Error Occurred in AJAX");
        }
    });
}

function setWeek(fDay) {
    weekDay = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    thisDate = new Array();
    $('.Month').html('<h2>' + fDay.getFullYear() + '/' + (fDay.getMonth() + 1 < 10 ? '0' + (fDay.getMonth() + 1) : (fDay.getMonth() + 1)) + '</h2>');
    for (var i = 0; i < 5; i++) {
        $('#w' + i).html(weekDay[i] + '<br>' + (fDay.getMonth() + 1) + '/' + fDay.getDate());
        thisDate.push((fDay.getMonth() + 1) + '-' + fDay.getDate());
        fDay.setDate(fDay.getDate() + 1);
    }

}

function fillTT(Obj) {
    var resvList, tmpTime, tmpDate;
    if (Obj.date == '' || typeof(Obj.date) == 'undefined') return;
    tmpDate = new Date(Obj.date);
    $('#' + Obj.time + ' .week' + tmpDate.getDay()).addClass('reserved');
    console.log('#' + Obj.time + ' .week' + tmpDate.getDay() + '--' + Obj.uid);
    $('#' + Obj.time + ' .week' + tmpDate.getDay()).html('<div class="resDiv" name="' + Obj.date + '$' + Obj.time + '">' + 'reserved' + '<br>' + Obj.uid.slice(-4) + '</div>');
    return;
}

function chkPW(pw, resvname) {
    var json = new Object();
    json.pw = pw;
    json.resvname = resvname;
    
    $.ajax({
        url: "/chkResv",
        type: 'post',
        dataType: 'json',
        data: json,
        success: function(data) {
            if (!data.result) {
                alert('잘못된 패스워드 입니다');
            } else {
                json = data;
                $('#rname').val(json.name);
                $('#rnum').val(json.num);
                $('#rtime').val(json.time);
                
                location.replace('/readResv')
            }
        },
        error: function() {
            console.log("Error Occurred in AJAX");
        }
    });
}

function delReserve(pw) {
    var json = new Object();
    json.pw = pw;
    json.reservNo = reservNo;
    console.log(json.reservNo + " - " + json.pw);
    $.ajax({
        url: "/delreserv",
        type: 'post',
        dataType: 'json',
        data: json,
        success: function(data) {
            console.log(data.result);
            if (data.result == 'Wrong') {
                alert('잘못된 패스워드 입니다');
                console.log('Wrong pass');
            } else {
                console.log('Right password on index.js');
                location.replace('/');
            }
        },
        error: function() {
            console.log("Error Occurred in AJAX");
        }
    });
}

function validPhone(pn) {
    var regEx = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    if (!pn.match(regEx)) return false; // Invalid format
    return true;
}

function validuid(uid) {
    if (!uid.startsWith(20)) return false;
    if (uid.length !== 10) return false;
    if (isNaN(1 * uid)) return false;
    return true;
}

$(document).ready(function() {
    $.datepicker.setDefaults({
        closeText: "닫기",
        prevText: "이전달",
        nextText: "다음달",
        currentText: "오늘",
        monthNames: ["1월", "2월", "3월", "4월", "5월", "6월",
            "7월", "8월", "9월", "10월", "11월", "12월"
        ],
        monthNamesShort: ["1월", "2월", "3월", "4월", "5월", "6월",
            "7월", "8월", "9월", "10월", "11월", "12월"
        ],
        dayNames: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
        dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
        dayNamesMin: ["일", "월", "화", "수", "목", "금", "토"],
        weekHeader: "주",
        dateFormat: "yy/mm/dd",
        firstDay: 0,
        isRTL: false,
        showMonthAfterYear: true,
        yearSuffix: "년"
    })

    $("#date").datepicker({
        minDate: 0,
        /* to use in wix */
        onSelect: function(selected, event) {
            console.log('a' + selected);
            /*
             * wix-send-messages from html component
             * https://support.wix.com/en/article/working-with-the-html-component-in-wix-code
             */
            window.parent.postMessage(selected, "*");
        }
    })
    $('.chkTime').on('change', function(evt) {
        console.log('hi ' + $('.chkTime:checked').length);
        if ($('.chkTime:checked').length >= 5) {
            this.checked = false;
        }
    });
})

$(document).on('pageshow', '#main-page', function() {
    //pmWeek = 0;
    getTimeTable();
});
$(document).on('click', '#lweek', function() {
    pmWeek++;
    getTimeTable();
});
$(document).on('click', '#nweek', function() {
    pmWeek--;
    console.log('nweek');
    getTimeTable();
});

$(document).on('click', '#write', function() {
    var json = new Object();
    var time = new Array();
    json.name = $('#name').val();
    json.depart = $('#depart').val();
    json.uid = $('#uid').val();
    json.phone = $('#phone').val();
    json.date = $('#date').val();
    json.num = $('#num').val(); //$('input[type=radio]:checked').val();
    json.pw = $('#pw').val();

    $(".chkTime:checked").each(function() {
        time.push($(this).val());
    });

    json.times = time;

    if (!validPhone(json.phone) || !validuid(json.uid)) {
        alert('정확한 정보를 입력해 주세요');
        return;
    }

    $.ajax({
        url: "/cmtResv",
        type: 'post',
        data: json,
        dataType: 'text',
        success: function(data) {
            if (data.status) {
                alert('예약 시간이 중복되었습니다. [' + data + ']');
                return;
            }
            $('#name').val('');
            $('#depart').val('');
            $('#uid').val('');
            $('#phone').val('');
            $('#date').val('');
            $('.chkTime').prop('checked', false).checkboxradio('refresh');

            $('#pw').val('');
            console.log('successfully sent reservation data');
            location.replace('#main-page');
        },
        error: function() {
            console.log("Error Occurred in AJAX");
        }
    });
});

$(document).on('click', '.resDiv', function() {
    location.replace("/chkResv/" + encodeURIComponent($(this).attr('name')));
});

$(document).on('click', '#pwchk', function() {
    chkPW($('#read_pw').val(), $('#resvname').val());
})

$(document).on('click', '#remov', function() {
    delReserve($('#read_pw').val());
})

$(document).on('keydown', '#read_pw', function() {
    if (window.event.keyCode == 13) {
        chkPW($('#read_pw').val());
    }
});