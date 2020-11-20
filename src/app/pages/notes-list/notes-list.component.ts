import { NotesService } from './../../shared/notes.service';
import { Note } from './../../shared/note.model';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
  animations: [
    trigger('itemAnim', [
      transition('void => *', [
        style({
          height: 0,
          opacity: 0,
          transform: 'scale(0.85)',
          'margin-bottom': 0,

          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 0,
        }),
        animate(
          '58ms',
          style({
            height: '*',
            'margin-bottom': '*',

            paddingTop: '*',
            paddingBottom: '*',
            paddingRight: '*',
            paddingLeft: '*',
          })
        ),
        animate(70),
      ]),

      transition('* => void', [
        //first scale up
        animate(
          '50ms',
          style({
            transition: 'scale(1.05)',
          })
        ),
        //then scale to to normal when time to fade out
        animate(
          '50ms',
          style({
            transition: 'scale(1)',
            opacity: 0.75,
          })
        ),
        //scale out and fade out completly
        animate(
          '120ms ease-out',
          style({
            transform: 'scale(0.68)',
            opacity: 0,
          })
        ),
        // animate the spacing which includes height margin and padding
        animate(
          '150ms ease-out',
          style({
            height: 0,
            'margin-bottom': 0,

            paddingTop: 0,
            paddingBottom: 0,
            paddingRight: 0,
            paddingLeft: 0,
          })
        ),
      ]),
    ]),
    trigger('listAnim', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({
              opacity: 0,
              height: 0,
            }),
            stagger(100, [animate('0.2s ease')]),
          ],
          {
            optional: true,
          }
        ),
      ]),
    ]),
  ],
})
export class NotesListComponent implements OnInit {
  notes: Note[] = new Array<Note>();

  filteredNotes: Note[] = new Array<Note>();

  @ViewChild('filterInput') filterElementRef: ElementRef<HTMLInputElement>;

  constructor(private notesService: NotesService) {}

  ngOnInit(): void {
    this.notes = this.notesService.getAll();
    // this.filteredNotes = this.notesService.getAll();
    this.filter('')
  }

  deleteNote(note: Note) {
    let noteId = this.notesService.getId(note);
    this.notesService.delete(noteId);
    this.filter(this.filterElementRef.nativeElement.value)
  }

  filter(query: string) {
    query = query.toLowerCase().trim();
    let allResults: Note[] = new Array<Note>();
    // split up the search query in individual parts
    let terms: string[] = query.split(' ');
    // remove duplicate search terms
    terms = this.removeDuplicate(terms);

    terms.forEach(term => {
      let results: Note[] = this.releventNotes(term);
      //append the results to allResults 
      allResults = [...allResults, ...results];

      //allresults contains duplicate values so we must remove duplicates

      let uniqueResults = this.removeDuplicate(allResults);

      this.filteredNotes = uniqueResults;

      this.sortByRelevancy(allResults)
    })
  }

  removeDuplicate(arr: Array<any>): Array<any> {
    let uniqueResults: Set<any> = new Set<any>();

    // loop through the input array and add the items to set

    arr.forEach((e) => uniqueResults.add(e));

    return Array.from(uniqueResults);
  }


  releventNotes( query: string): Array<Note>{
    query = query.toLowerCase().trim();

    let releventNotes = this.notes.filter(note => {
      if(note.title && note.title.toLowerCase().trim().includes(query)){
        return true;
      }
      if(note.body && note.body.toLowerCase().trim().includes(query)){
        return true;
      }
      return false;
    })

    return releventNotes;
  }

  sortByRelevancy(searchResults: Note[]) {
    // This method will calculate the relevancy of a note based on the number of times it appears in
    // the search results

    let noteCountObj: Object = {}; // format - key:value => NoteId:number (note object id : count)

    searchResults.forEach(note => {
      let noteId = this.notesService.getId(note);

      if (noteCountObj[noteId]) {
        noteCountObj[noteId] += 1;
      } else {
        noteCountObj[noteId] = 1;
      }
    })

    this.filteredNotes = this.filteredNotes.sort((a: Note, b: Note) => {

      let aId = this.notesService.getId(a)
      let bId = this.notesService.getId(b)

      let aCount = noteCountObj[aId];
      let bCount = noteCountObj[bId];

      return bCount - aCount;
    })
    
  }
  generateNoteURL(note: Note){
    let noteId = this.notesService.getId(note)
    return noteId;

  }
}
