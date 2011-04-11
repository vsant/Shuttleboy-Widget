/* Copyright (C) 2011
   Vivek Sant
   vsant@hcs.harvard.edu */

verCurr = "1.6";

function toGar(arr)   { prettyPrint("d1", "to Garden",     arr); }
function toMem(arr)   { prettyPrint("d2", "to MemHall",    arr); }
function toMat(arr)   { prettyPrint("d3", "to Mather",     arr); }
function fromBoy(arr) { prettyPrint("d4", "from Boylston", arr); }
function fromMem(arr) { prettyPrint("d5", "from MemHall",  arr); }
function fromMat(arr) { prettyPrint("d6", "from Mather",   arr); }

function $(id)
{
  return document.getElementById(id);
}

function checkVer(data)
{
  $("ver").innerHTML = (data != verCurr) ? "<a href='#' onClick=\"widget.openURL('http://www.hcs.harvard.edu/vsant/shuttleboy/update.html');\">Download Update</a>" : "";
}

function load()
{
  new AppleGlassButton($("done"), "Done", doneClicked);   
  new AppleInfoButton($("infoButton"), $("front"), "white", "white", showbackside);
  refreshPage();
}

function showbackside(event)
{
  if (window.widget)
    widget.prepareForTransition("ToBack");

  unrefreshPage();

  $("front").style.display="none";
  $("behind").style.display="block";

  if (window.widget)
    setTimeout ('widget.performTransition();', 0);
}

function doneClicked()
{
  if (window.widget)
    widget.prepareForTransition("ToFront");
  $("front").style.display="block";
  $("behind").style.display="none";
  flipitback();
}

function flipitback()
{ 
  if (window.widget)
    setTimeout("widget.performTransition();", 0);
  refreshPage();
}

function appendToDiv(divID, content, overwrite)
{
  $(divID).innerHTML += content;
  if (overwrite == 1)
    $(divID).innerHTML = content;
}

function prettyPrint(divID, title, arr)
{
  // Start by overwriting, not appending
  appendToDiv(divID, "<p class='subtitle'>" + title + "</p>\n", 1);
  if (arr.length == 0)
    appendToDiv(divID, "<br/><br/><br/><center>No shuttles in<br/>next 24 hrs</center>");
  for (var i in arr)
  {
    if (i == 10) break;

    dt = arr[i]["departs"];
    split_date = dt.split("T");
    ymd = split_date[0].split("-");
    hms = split_date[1].split(":");
    d = new Date(ymd[0], ymd[1] - 1, ymd[2], hms[0], hms[1], hms[2]);

    e = new Date();
    time_till = Math.floor((d.getTime() - e.getTime())/1000);

    // If leaving w/in 15m, write it in white
    clr = (time_till <= 15*60) ? 'white' : '';
    
    if (time_till <= 60) 
      appendToDiv(divID, "<span class='" + clr + "'>NOW<\/span>");
    else
    {   
      // Just some pretty printing of time_till
      t_d = Math.floor(time_till / (3600*24));
      time_till -= 3600*24*t_d;
      t_h = Math.floor(time_till / 3600);
      time_till -= 3600*t_h;
      t_m = Math.floor(time_till / 60);

      if (t_d)
        till = t_d + Math.round((t_h+t_m/60)/24 * 10)/10 + " days";
      else if (t_h)
        till = t_h + Math.round(t_m/60 * 10)/10 + " hrs";
      else
        till = t_m + " min";

      ampm = " am";
      if (hms[0] == 0) 
        hms[0] = 12;
      if (hms[0] >= 12)
        ampm = " pm";
      if (hms[0] > 12)
        hms[0] -= 12;

      // Turn 01 -> 1 w/parseInt (specify base, else it uses base 8 b/c of preceding '0')
      /* Build an entire <span>...</span> tag b/c inserting it in pieces will
         cause it to not be eval'ed by the browser's CSS parser. */
      appendToDiv(divID, "<span class='" + clr + "'>" + till + " (" + parseInt(hms[0], 10) + ':' + hms[1] + ampm + ")<\/span>");
    }
    appendToDiv(divID,"<br/>\n");
  }
}

function refreshPage()
{
  var urls = ["http://shuttleboy.cs50.net/api/1.2/trips?output=jsonp&a=Quad&b=Mass+Ave+Garden+St&callback=toGar",
              "http://shuttleboy.cs50.net/api/1.2/trips?output=jsonp&a=Quad&b=Memorial+Hall&callback=toMem",
              "http://shuttleboy.cs50.net/api/1.2/trips?output=jsonp&a=Quad&b=Mather+House&callback=toMat",
              "http://shuttleboy.cs50.net/api/1.2/trips?output=jsonp&a=Boylston+Gate&b=Quad&callback=fromBoy",
              "http://shuttleboy.cs50.net/api/1.2/trips?output=jsonp&a=Memorial+Hall&b=Quad&callback=fromMem",
              "http://shuttleboy.cs50.net/api/1.2/trips?output=jsonp&a=Mather+House&b=Quad&callback=fromMat",
              "http://www.hcs.harvard.edu/vsant/shuttleboy/version.js?verCurr="+verCurr];

  head = document.getElementsByTagName("head")[0];

  // Remove old script elements so they don't keep increasing page size
  while (head.firstChild != head.lastChild)
    head.removeChild(head.lastChild)
  
  for (var i in urls) 
  {
    var e = document.createElement("script");
    // Add a unique identifier to each query to prevent caching
    e.src = urls[i] + "&nonce=" + (new Date()).getTime();
    e.type = "text/javascript";
    head.appendChild(e);
  }

  // Refresh on the minute
  var currDate = new Date();
  var s = (60 - currDate.getSeconds()) * 1000;
  timer = setTimeout("refreshPage()", s);
}

function unrefreshPage()
{
  clearTimeout(timer);
}

if (window.widget)
{
  widget.onshow = refreshPage;
  widget.onhide = unrefreshPage;
}
