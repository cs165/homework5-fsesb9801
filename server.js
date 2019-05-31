const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1w6c_7Nl2dWbiumNXHNwRN2cuCSed2i70QF7chv_jVuY';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

async function onGet(req, res) {
	const result = await sheet.getRows();
	const rows = result.rows;

	// TODO(you): Finish onGet.
	col_title=rows[0]
	cols=col_title.length
	jsString='{'
	jsArr='['
	for(i=1;i<rows.length;i++,jsString='{')
	{
		if(i!==1)
			jsArr+=','
		let row=rows[i]
		for(col=0;col<cols;col++)
		{
			if(col!==0)
				jsString+=','
			jsString+=('"'+col_title[col]+'":"'+row[col]+'"')
		}
		jsString+='}'
		jsArr+=jsString
	}
	jsArr+=']'
	console.log('get')
	returnjson=JSON.parse(jsArr)
	
	res.json(returnjson);
}
app.get('/api', onGet);

async function onPost(req, res) {
	const messageBody = req.body;

	// TODO(you): Implement onPost.
	result = await sheet.getRows();
	rows = result.rows;
	col_title=rows[0];
	keys=Object.keys(messageBody)
	vals=Object.values(messageBody)
	rowData=[]
	returnjson=''
	if(col_title.length==keys.length)
	{
		for(let i=0,l=col_title.length;i<l;i++)
		{
			col_title[i]=col_title[i].toLowerCase()
			keys[i]=keys[i].toLowerCase()
		}
		for(let i=0,l=col_title.length;i<l;i++)
		{
			col_key=col_title[i]
			vIndex=keys.findIndex(e=>{return e===col_key})
			if(vIndex!==-1)
				rowData.push(vals[vIndex])
			else
			{
				returnjson='{"response":"error:mismatched key(s)"}'
				returnjson=JSON.parse(returnjson)
				res.json(returnjson)
				return
			}
		}
		if(returnjson.length===0)
			sheet.appendRow(rowData).then(()=>{
				console.log('append row:['+rowData+']')
				returnjson='{"response":"success"}'
				returnjson=JSON.parse(returnjson)
				res.json(returnjson)
				}).catch(function(reason){
					returnjson='{"response":"error:'+reason+'"}'
					returnjson=JSON.parse(returnjson)
					res.json(returnjson)
					})
	}
	else
	{
		returnjson='{"response":"error:key length not equal"}'
		returnjson=JSON.parse(returnjson)
		res.json(returnjson)
	}
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
	const column	= req.params.column;
	const value	= req.params.value;
	const messageBody = req.body;

	// TODO(you): Implement onPatch.

	res.json( { status: 'unimplemented'} );
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
	const column = req.params.column;
	const value	= req.params.value;

	// TODO(you): Implement onDelete.
	result = await sheet.getRows();
	rows = result.rows;
	col_title=rows[0];
	for(let i=0,l=col_title.length;i<l;i++)
		col_title[i]=col_title[i].toLowerCase()
	cIndex=col_title.findIndex(e=>{return column.toLowerCase()===e})
	rIndex=-1
	for(let i=1,l=rows.length;i<l;i++)
	{
		if(rows[i][cIndex]===value)
		{
			rIndex=i
			break
		}
	}
	if(rIndex===-1)
	{
		returnjson='{"response": "success,but nothing changed."}'
		returnjson=JSON.parse(returnjson)
		res.json(returnjson)
	}
	else
		sheet.deleteRow(rIndex).then(()=>{
			console.log('delete row:'+rIndex)
			returnjson='{"response":"success"}'
			returnjson=JSON.parse(returnjson)
			res.json(returnjson)
			}).catch(reason=>{
				returnjson='{"response":"error:'+reason+'"}'
				returnjson=JSON.parse(returnjson)
				res.json(returnjson)
				})
}
app.delete('/api/:column/:value', onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
	console.log(`Server listening on port ${port}!`);
});
