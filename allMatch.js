let request=require("request");
let cheerio=require("cheerio");
let matchFile=require("./match.js");

// let url="https://www.espncricinfo.com/scores/series/8039/season/2015/icc-cricket-world-cup?view=results";
function allMatcheHandler(url)
{
    request(url,cb);
}
function cb(error,header,body)
{
    if(error==null && header.statusCode==200)
    {
        console.log("all matches html recieved");
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
    let allMatches=$(".col-md-8.col-16");
    // match-cta-container  
    for(let i=0;i<allMatches.length;i++)
    {
        let match=$(allMatches[i]).find(".match-cta-container a");
        let scoreCard=match[0];
        let link=$(scoreCard).attr("href");
        let cLink="https://www.espncricinfo.com/" + link;
        // console.log(cLink);
        matchFile.matchHandler(cLink);
    }
}

module.exports.allMatcheHandler=allMatcheHandler;