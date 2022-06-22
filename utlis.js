
class TimeSpan{
    #milliseconds

    constructor(milliseconds){

        this.#milliseconds = milliseconds - 0;

    }

    get milliseconds(){
        return this.#milliseconds;
    }

    AddMilliseconds(milliseconds){

        this.#milliseconds += (milliseconds - 0)

    }

    get seconds(){
        return Math.floor( this.#milliseconds / 1000);
    }

    get minutes(){
        return Math.floor(this.seconds / 60);
    }

    get hours(){
        return Math.floor(this.minutes / 60);
    }
}



module.exports.TimeSpan = TimeSpan;

module.exports.formatMoney = function (number, decPlaces, decSep, thouSep) {
    decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
        decSep = typeof decSep === "undefined" ? "." : decSep;
    thouSep = typeof thouSep === "undefined" ? "," : thouSep;
    var sign = number < 0 ? "-" : "";
    var i = String(parseInt(number = Math.abs(Number(number) || 0).toFixed(decPlaces)));
    var j = (j = i.length) > 3 ? j % 3 : 0;

    return sign +
        (j ? i.substring(0, j) + thouSep : "") +
        i.substring(j).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
        (decPlaces ? decSep + Math.abs(number - i).toFixed(decPlaces).slice(2) : "");
}



