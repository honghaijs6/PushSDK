'use strict'

const MyTime = {


        unixTime(){
          const strDate = this.full();
          return  this.timestamp(strDate);
        },

        unixTimeFull(){
          const strDate = this.getFulls();
          return this.timestamp(strDate);

        },

        timestamp:function(strDate){
            strDate = strDate.replace(/-/g,'/');

            return (new Date(strDate))/1000;

        },
        timeConverter:function(UNIX_timestamp){
            var a = new Date(UNIX_timestamp * 1000);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var year = a.getFullYear();
            var month = a.getMonth() + 1 ;
            var date = a.getDate();
            var hour = a.getHours();
            var min = a.getMinutes();
            var sec = a.getSeconds();

            var time = year+'-'+month+'-'+date+' '+hour+':'+min+':'+sec;

            return time;

        },

        getCurent:{
            year:function(){
                var currentDate = new Date();
                return currentDate.getFullYear();

            },
            month:function(){
                var currentDate = new Date();
                var month = currentDate.getMonth() + 1;
                month = month < 10 ? '0'+month:month;

                return month;

            },
            week:function(){
                var now = new Date();
                var num =  now.getWeek();
                num = num < 10 ? '0'+num:num;

                return num;

            },
            date:function(){
                var currentDate = new Date();
                var day = currentDate.getDate();
                return day;
            },
            time:function(){
                var today = new Date();
                var h = today.getHours();
                h = parseInt(h) < 10 ? '0'+h:h;
                var m = today.getMinutes();
                m = parseInt(m)<10 ? '0'+m:m;

                var msgTime = h + ":" + m ;
                return msgTime;


            }
        },

        headMonthEn:function(){
            var currentDate = new Date();
            var day = '01';
            var month = currentDate.getMonth() + 1;
            month = month<10 ? '0'+month :month;

            var year = currentDate.getFullYear();
            return year+'-'+month+'-'+day;
        },
        curDateEn:function(){

            var currentDate = new Date();
            var day = currentDate.getDate();
            day = day<10 ? '0'+day :day;

            var month = currentDate.getMonth() + 1;
            month = month<10 ? '0'+month :month;


            var year = currentDate.getFullYear();
            return year+'-'+month+'-'+day;


        },
        endMonthFor:function(month){

            var inputMonth = month;
            var currentDate = new Date();
            month = parseInt(month) - 1;


            var year = currentDate.getFullYear();
            var lastDay = new Date(year, month + 1, 0);



            inputMonth = inputMonth<10 ? '0'+inputMonth :inputMonth;
            return lastDay.getDate()+'-'+inputMonth+'-'+year;
        },
        headMonthFor:function(month){
            var currentDate = new Date();
            var day = '01';
            month = month<10 ? '0'+month :month;
            var year = currentDate.getFullYear();
            return day+'-'+month+'-'+year;

        },
        headerMonth:function(){

            var currentDate = new Date();
            var day = '01';
            var month = currentDate.getMonth() + 1;
            month = month<10 ? '0'+month :month;

            var year = currentDate.getFullYear();
            return day+'-'+month+'-'+year;


        },
        curDateVi:function(){
            var currentDate = new Date();
            var day = currentDate.getDate();
            day = parseInt(day) < 10 ? '0'+day:day;

            var month = currentDate.getMonth() + 1;
            month = parseInt(month) < 10 ? '0'+month:month;

            var year = currentDate.getFullYear();
            return day+'-'+month+'-'+year;
        },
        curDate:function(){
            var currentDate = new Date();
            var day = currentDate.getDate();
            var month = currentDate.getMonth() + 1;

            day = day<10 ? '0'+day :day;
            month = month<10 ? '0'+month :month;



            var year = currentDate.getFullYear();
            return day+'-'+month+'-'+year;
        },

        getBetween:function(date,month){

            var today = new Date();
            var curDate = today.getDate();

            var thisMonth = typeof month === 'undefined' ? today.getMonth() + 1 : month;
            thisMonth = parseInt(curDate)>=15 ? thisMonth  : parseInt(thisMonth) - 1;
            thisMonth = thisMonth === 0 ? 12 : thisMonth;


            var thisYear = today.getFullYear();
            var nextMonth = parseInt(thisMonth) + 1 > 12 ? 1: parseInt(thisMonth) + 1;



            var nextYear = parseInt(thisMonth) + 1 > 12 ? parseInt(thisYear) + 1 : thisYear;

            thisMonth = thisMonth < 10 ? '0'+thisMonth : thisMonth;
            nextMonth = nextMonth < 10 ? '0'+nextMonth : nextMonth;

            return  {
                from: thisYear+'-'+thisMonth+'-'+date+' 00:00:00',
                to:nextYear+'-'+nextMonth+'-'+date+' 00:00:00'
            };


        },

        getFulls(){
          var today = new Date();
          var dd = today.getDate();
          var mm = today.getMonth()+1;
          var yyyy = today.getFullYear();

          var hh= today.getHours();
          var mins = today.getMinutes();
          var ss = today.getSeconds();

          var miliSec = today.getMilliseconds();


          if(dd<10) {dd='0'+dd;}
          if(mm<10) {mm='0'+mm;}

          if(hh<10) {hh='0'+hh;}
          if(mins<10) {mins='0'+mins;}
          if(ss<10) {ss='0'+ss;}
          if(miliSec<10) {miliSec='0'+miliSec;}




          return yyyy+'-'+mm+'-'+dd+' '+hh+':'+mins+':'+ss + miliSec;

        },
        full:function(){
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1;
            var yyyy = today.getFullYear();

            var hh= today.getHours();
            var mins = today.getMinutes();
            var ss = today.getSeconds();

            if(dd<10) {dd='0'+dd;}
            if(mm<10) {mm='0'+mm;}

            if(hh<10) {hh='0'+hh;}
            if(mins<10) {mins='0'+mins;}
            if(ss<10) {ss='0'+ss;}

            return yyyy+'-'+mm+'-'+dd+' '+hh+':'+mins+':'+ss;
        }
}

module.exports = MyTime;
