let request=require("request");
let fs=require("fs");
let cheerio=require("cheerio");
let path=require("path");
let xlsx=require("xlsx");


function matchHandler(url)
{
    request(url,cb);
}

// let url="https://www.espncricinfo.com/series/8039/scorecard/656495/australia-vs-new-zealand-final-icc-cricket-world-cup-2014-15";

function cb(error,header,body)
{
    if(error==null && header.statusCode==200)
    {
        console.log("html recieved");
        // console.log(body);
        fs.writeFileSync("index.html",body);
        parseHtml(body);
    }
    else if(header.statusCode==404)
    {
        console.log("page not found");
    }
    else
    {
        console.log(error);
    }
}

function parseHtml(body)
{
    let $=cheerio.load(body);
    let venueElm=$(".desc.text-truncate");
    let venue=venueElm.text();

    let resElm=$(".summary span");
    let res=resElm.text();

    let bothInnings =$(".card.content-block.match-scorecard-table .Collapsible");
    for(let i=0;i<bothInnings.length;i++)
    {
        let teamNameElm=$(bothInnings[i]).find("h5");
        let teamName=teamNameElm.text().split("Innings")[0].trim();
        console.log(teamName);

        let allRows=$(bothInnings[i]).find(".table.batsman tbody tr");
        for(let j=0;j<allRows.length;j++)
        {
            let allCols=$(allRows[j]).find("td");
            let isPlayer=$(allCols[0]).hasClass("batsman-cell");
            // if(allCols.length>1)
            // {}
            if(isPlayer)
            {
                let pName=$(allCols[0]).text();
                let pRuns=$(allCols[2]).text();
                let pBalls=$(allCols[3]).text();
                let pSixes=$(allCols[5]).text();
                let pFours=$(allCols[6]).text();
                let pSr=$(allCols[7]).text();

                console.log(pName+" "+pRuns+" "+pBalls+" "+pSixes+" "+pFours+" "+pSr);

                processPlayer(res,venue,teamName,pName,pRuns,pBalls,pSixes,pFours,pSr);
            }
        }
        console.log("###################");
        // fs.writeFileSync("table "+i+".html",elem);
    }
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
}

function excelReader(filePath, name) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    // workbook 
    let wt = xlsx.readFile(filePath);
    let excelData = wt.Sheets[name];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}

function excelWriter(filePath, json, name) {
    // console.log(xlsx.readFile(filePath));
    var newWB = xlsx.utils.book_new();
    // console.log(json);
    var newWS = xlsx.utils.json_to_sheet(json)
    xlsx.utils.book_append_sheet(newWB, newWS, name)//workbook name as param
    xlsx.writeFile(newWB, filePath);
}

function processPlayer(res,venue,teamName,pName,pRuns,pBalls,pSixes,pFours,pSr)
{
    let isTeamName=fs.existsSync(teamName);
    if(!isTeamName)
    {
        fs.mkdirSync(teamName);
    }

    let playerFile=path.join(teamName,pName+".xlsx");
    let fileData = excelReader(playerFile, pName);
    let json=fileData;
    
    if(fileData==null)
        json=[];

    let player={
        Name:pName,
        Runs:pRuns,
        Balls:pBalls,
        Sixes:pSixes,
        Fours:pFours,
        Strike_Rate:pSr,
        team:teamName,
        venue,
        Result:res
    };
    json.push(player);

    excelWriter(playerFile ,json ,pName);
}


module.exports.matchHandler=matchHandler;