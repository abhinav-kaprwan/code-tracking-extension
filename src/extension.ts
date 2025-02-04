import * as vscode from 'vscode';
import axios from 'axios';

let fileTimeMap:{[fileName:string]:number}={};
let activeFile: string| null = null;
let startTime:number = Date.now();

const backendURL =""

// function to track time spent on file whenever file switched
function logFileSwitch(filename:string){
	//calculate time spent on active file
	let endTime = Date.now();
	let timeSpent = (endTime - startTime)/1000;
	// update time spent

	if(activeFile){
		fileTimeMap[activeFile] +=timeSpent;
	} else{
		fileTimeMap[filename] = timeSpent;
	}
	activeFile= filename;
	startTime = Date.now();
}
 function sendDataToBackend(){
	axios.post(backendURL, {
		data: fileTimeMap
	})
	.then((response)=>{
		console.log("Data sent succesfully",response.data)
	})
	.catch((e)=>{
		console.log("Error sending data",e)
	})
 }
//To track changes in text document
vscode.workspace.onDidChangeTextDocument((event)=>{
	if(event.document.fileName ==activeFile){
		//update time for active file
		let TimeSpentOnFile = (Date.now() - startTime)/1000;
		fileTimeMap[activeFile] = TimeSpentOnFile; //Real time tracking
	}
})

// function to track file change(cursor moves to another file)
vscode.window.onDidChangeTextEditorSelection((event)=>{
	if(event.textEditor.document.fileName !== activeFile){
		logFileSwitch(event.textEditor.document.fileName);
	}
})

// will send periodically data to backend
setInterval(()=>{
	sendDataToBackend();
},5*60*1000)

//activate
export function activate(context:vscode.ExtensionContext){

	vscode.window.onDidChangeActiveTextEditor((editor)=>{
		if (editor) {
            logFileSwitch(editor.document.fileName);
        }
	})
	let disposable = vscode.commands.registerCommand('extension.sendDataToBackend',()=>{
		sendDataToBackend();
	})
	context.subscriptions.push(disposable);
}

//deactive
export function deactivate(){
	sendDataToBackend();
}