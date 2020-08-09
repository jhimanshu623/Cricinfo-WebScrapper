let request=require("request");
let cheerio=require("cheerio");
let allMatcheHandler=require("./allMatch");

let url="https://www.espncricinfo.com/series/_/id/8039/season/2015/icc-cricket-world-cup";

request(url,cb);
function cb(error,header,body)
{
    if(error==null && header.statusCode==200)
    {
        console.log("main html recieved");
        parseHtml(body);
    }
    else if(header.statusCode==404)
    {
        console.error("Page not found");
    }
    else
    {
        console.error(error);
    }
}

function parseHtml(body)
{
    let $=cheerio.load(body);
    let allMatch=$("a[data-hover='View All Results']");
    let link=allMatch.attr("href");
    let cLink="https://www.espncricinfo.com/" + link;
    allMatcheHandler.allMatcheHandler(cLink);
}