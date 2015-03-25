{
    "translatorID": "e5f4800a-ca7b-11e4-a31a-a08869770ac9",
    "label": "Simple Org-Mode Notes Export",
    "creator": "Phil Chrapka",
    "target": "org",
    "minVersion": "2.1.9",
    "maxVersion": "",
    "priority": 50,
    "displayOptions": {
        "exportNotes": true
    },
    "inRepository": false,
    "translatorType": 2,
    "browserSupport": "g",
    "lastUpdated": "2015-03-14 2:51:00"
}

/*
Org-Mode Export Translator
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

function parseNote(note) {
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

function doExport() {
    Zotero.setCharacterSet("utf-8");
    
    var orgmodeString = "";
    
    var item;

    while(item = Zotero.nextItem()) {
    
        var itemString = "* Notes: "+item.title+newLineChar;
    
    /** NOTES **/
        if(Zotero.getOption("exportNotes")) {
        
        // Find pdf attachment key
        var key = null;
        for(var i in item.attachments) {
            if(item.attachments[i].mimeType === 'application/pdf') {
            key = item.attachments[i].key;
            }
        }
        if(key){
            var lib = item.libraryID===null ? 0 : item.libraryID;
            var href = 'zotero://open-pdf/'+lib+'_'+key;
        }
        
        // Get the bibtex ID
        var patt = /(?:bibtex:)(\S+)/i;
        var match = patt.exec(item.extra);
        var bibtexid = null;
        if(match) {
            bibtexid = match[1];
        }
        
        for(var i in item.notes) {

            // Parse paragraphs in note
            var par = parseNote(item.notes[i]);
            for (var j=0; j < par.length; j++) {
            if(par[j].textContent === '&nbsp;') {
                continue;
            }
            
            // Set up headline
            itemString += "** "+par[j].textContent.substring(0,headlineChar);
            
            // Date created
            itemString += newLineChar+"["+item.notes[i].dateAdded+"]";
            // Title of source
            itemString += newSection+"Title: "+item.title;
            // Link to pdf with bibtexid as description
            if(href) {
                itemString += newLineChar+"[["+href+"]["
            // TODO Links don't seem to work from inside emacs
                if(bibtexid) {
                itemString += bibtexid+"]]";
                } else {
                itemString += "Link to pdf]]";
                }
            }

            // Note
            // TODO Missing href from text, try innerHTML
            itemString += newSection+par[j].textContent;
            
            itemString += newSection;
            
            }
        }
        }        
    
    orgmodeString += itemString;
        
    }
    
    Zotero.write(orgmodeString);
}
