/* Récuperation url serveur */

async function GetUrl()
{
    const answer = await fetch("url.json");
    const json = await answer.json();
    const url = await json.url;
    return(url);
}