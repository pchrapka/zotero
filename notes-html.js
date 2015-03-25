{
    "translatorID": "5d9f7d22-d318-11e4-93ad-a08869770ac9",
    "label": "Simple Notes Export",
    "creator": "Phil Chrapka",
    "target": "html",
    "minVersion": "2.1.9",
    "maxVersion": "",
    "priority": 50,
    "displayOptions": {
        "exportNotes": true
    },
    "inRepository": false,
    "translatorType": 2,
    "browserSupport": "g",
    "lastUpdated": "2015-03-25 13:57:00"
}

/*
Simple Notes Translator
Copyright (C) 2015 Phil Chrapka

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

/*

format
* [note content or first 30-40 characters]
date created 

note

link to source with id as description
title of source


*/

var newLineChar = "\n"; //from spec
var newSection = newLineChar+newLineChar;
var headlineChar = 80;

function addEntry() {
// For each entry in a note
}

function getParagraphs(note) {
    // Parse entries in each note
    var parser = new DOMParser();
    // Put the text in a div
    var text = "<div>"+note.note+"<br/></div>";
    // Replace new lines
    text = text.replace(/\r?\n/g, "");
    // Replace the ampersand
    text = text.replace(/\&/g, "&amp;");
    // Parse the xml
    var doc = parser.parseFromString(text, 'text/xml');
    
    // Get each paragraph
    par = doc.getElementsByTagName('p');
    return par
}

function addHTMLHeader(string) {
    string+="<!DOCTYPE html>"+newLineChar;
    string+="<html><head>"+newLineChar;
    string+="</head>"+newLineChar;
    string+="<body>"+newLineChar;
    return string
}

function addHTMLFooter(string) {
    string+="</body>"+newLineChar;
    string+="</html>"+newLineChar;
    return string
}

function addH1(string, item) {
    string+="<h1>Notes: "+item.title+newLineChar+"</h1>";
    return string
}

function getBibtex(item) {
    // Get the bibtex ID
    var patt = /(?:bibtex: )(\S+)/i;
    var match = patt.exec(item.extra);
    var bibtexid = null;
    if(match) {
	bibtexid = match[1];
    }
    return bibtexid;
}

function addNoteHeader(string, par) {
    // Get everything until a break or a hyperlink
    var patt = /(.*?)(?=\(<a|<br|$)/i;
    var match = patt.exec(par.innerHTML);
    // Add as h2
    string+="<h2>"+match[0]+"</h2>"+newLineChar;
    return string;
}

function formatLink(href, title) {
    var string="";
    if(href) {
	string+="<a href='"+href+"'>";
	if(title) {
	    string += title+"</a>";
	} else {
	    string += "Link to pdf</a>";
	}
    }
    return string
}

function skipPar(par) {
    status = false;
    // Skip empty paragraphs
    if(par.textContent === '&nbsp;') {
	status = true;
    }else if(par.textContent.lastIndexOf('Extracted', 0) === 0){
	status = true;
    }

    return status;
}

function doExport() {
    Zotero.setCharacterSet("utf-8");
    
    var outString = "";
    outString = addHTMLHeader(outString);
    
    var item;

    while(item = Zotero.nextItem()) {
    
	var itemString = "";
	itemString = addH1(itemString, item)+newLineChar;
    
	/** NOTES **/
        if(Zotero.getOption("exportNotes")) {
        
            // Find pdf attachment key
            var key = null;
	    var pdf = null;
            for(var i in item.attachments) {
		if(item.attachments[i].mimeType === 'application/pdf') {
		    key = item.attachments[i].key;
		    pdf = item.attachments[i].localPath;
		}
            }
	    var href = null;
            if(key){
		var lib = item.libraryID===null ? 0 : item.libraryID;
		href = 'zotero://open-pdf/'+lib+'_'+key;
            }
            
            // Get the bibtex ID
            var bibtexid = getBibtex(item);
            
            for(var i in item.notes) {
		
		// Parse paragraphs in note
		var par = getParagraphs(item.notes[i]);
		for (var j=0; j < par.length; j++) {
		    var doSkip = skipPar(par[j]);
		    if(doSkip) {
			continue;
		    }
		    
		    // Add header
		    itemString = addNoteHeader(itemString, par[j]);
		    
		    // Date created
		    itemString += newLineChar+"<p>["+item.notes[i].dateAdded+"]</p>";
		    // Title of source
		    itemString += newSection+"<p>Title: "+item.title+"</p>";

		    // Link to pdf with bibtexid as description
		    if(href) {
			// TODO Links don't seem to work from inside emacs
			itemString += newLineChar+"<p>Zotero: ";
			itemString += formatLink(href, bibtexid)+"</p>";
		    }
		    if(pdf) {
			// TODO Links don't seem to work from inside emacs
			itemString += newLineChar+"<p>Local pdf: ";
			itemString += formatLink(pdf, bibtexid)+"</p>";
		    }
		    
		    // Note
		    itemString += newSection+par[j].innerHTML;
		    
		    itemString += newSection;
		    
		}
            }        
	}
	
	outString += itemString;
        
    }

    outString = addHTMLFooter(outString);
    Zotero.write(outString);
}
