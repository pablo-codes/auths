const fs = require('fs')

const printcon = (msg) => {
    if (process.env.NODE_ENV === 'production') { 
        const current = new Date();
        const format = current.toLocaleString('en-US')
        fs.appendFileSync('./stderr.log', `\n\n[${format}] : ${msg}`)     
    }else{
        console.log(msg)
    }
    
}
module.exports = {printcon}