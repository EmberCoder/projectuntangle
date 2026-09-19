
import { useEffect, useState } from 'react';
import './journal.css';
import NavBar from './components/NavBar/NavBar';

function Journal() {
 
  const [journalMode, setJournalMode] = useState(null);

  const [journalText, setJournalText] = useState('');

  const [entries, setEntries] = useState([]);

  const [editingEntryId, setEditingEntryId] = useState(null);

  const [currentPrompt, setCurrentPrompt] = useState('');

  const prompts = [
    'What is something that made you smile today?',
    'What is something you are looking forward to?',
    'What is something you are proud of yourself for?',
    'What is something that has been on your mind lately?',
    'Describe a moment when you felt calm or peaceful.',
    'What is one thing you would like to improve about your day?',
    'Write about something you are grateful for.',
    'What is a goal you would like to work toward?',
    'Describe a place, real or imagined, that lets you feel completely yourself. Describe your happy place.',
    'What feels completely within my control today?',
    'What are three reasons I should give myself grace today?',
    'What makes me feel excited to get up in the morning?',
    'How can I maintain balance in my life?',
    'What values are important to me? How did I honor those values in my actions today?',
    'If my feelings were a weather report today, what is the weather like? Cloudy? Stormy? Sunny?',
  ];



  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');

    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);


  const openPromptJournal = () => {
    const randomIndex = Math.floor(
      Math.random() * prompts.length
    );

    setCurrentPrompt(prompts[randomIndex]);
    setJournalText('');
    setJournalMode('prompt');
  };


  const saveEntry = () => {
    if (journalText.trim() === '') {
      return;
    }

    const newEntry = {
      id: Date.now(),
      text: journalText,
      prompt: journalMode === 'prompt'
        ? currentPrompt
        : null,
      date: new Date().toISOString(),
    };

    const updatedEntries = [...entries, newEntry];

    setEntries(updatedEntries);

    localStorage.setItem(
      'journalEntries',
      JSON.stringify(updatedEntries)
    );

    setJournalText('');
    setCurrentPrompt('');
    setJournalMode(null);
  };


  const startEditingEntry = (entry) => {
    setEditingEntryId(entry.id);
    setJournalText(entry.text);
    setJournalMode('edit');
  };

 

  const saveEditedEntry = () => {
    if (journalText.trim() === '') {
      return;
    }

    const updatedEntries = entries.map((entry) =>
      entry.id === editingEntryId
        ? {
            ...entry,
            text: journalText,
          }
        : entry
    );

    setEntries(updatedEntries);

    localStorage.setItem(
      'journalEntries',
      JSON.stringify(updatedEntries)
    );

    setJournalText('');
    setEditingEntryId(null);
    setJournalMode('previous');
  };



  const deleteEntry = (entryId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this journal entry?'
    );

    if (!confirmed) {
      return;
    }

    const updatedEntries = entries.filter(
      (entry) => entry.id !== entryId
    );

    setEntries(updatedEntries);

    localStorage.setItem(
      'journalEntries',
      JSON.stringify(updatedEntries)
    );
  };

 

  const cancelJournal = () => {
    setJournalText('');
    setEditingEntryId(null);
    setCurrentPrompt('');
    setJournalMode(null);
  };

  return (
    <div className="journalPage">

  

      <div className="journalHeader">

        <button className="journalHeaderButton">
          ⚙
        </button>

        <button className="journalHeaderButton">
          ◯
        </button>

      </div>



      <h1 className="journalTitle">
        Journal
      </h1>



      {journalMode === null && (

        <div className="journalHome">

          <div className="journalBook">

            <div className="journalBookTitle">
              Your Journal
            </div>

     

            <button
              className="journalOptionButton"
              onClick={() => {
                setJournalText('');
                setJournalMode('free');
              }}
            >
              Free Journal
            </button>

           

            <button
              className="journalOptionButton"
              onClick={openPromptJournal}
            >
              Prompts
            </button>

          </div>

         

          <button
            className="previousEntriesButton"
            onClick={() => setJournalMode('previous')}
          >
            View Previous Entries
          </button>

        </div>

      )}

  

      {journalMode === 'free' && (

        <div className="journalSection">

          <h2>
            Free Journal
          </h2>

          <p>
            Write whatever is on your mind.
          </p>

          <textarea
            className="journalTextArea"
            value={journalText}
            onChange={(event) =>
              setJournalText(event.target.value)
            }
            placeholder="Start writing..."
          />

          <div className="journalActionButtons">

            <button onClick={saveEntry}>
              Save Entry
            </button>

            <button onClick={cancelJournal}>
              Cancel
            </button>

          </div>

        </div>

      )}

 

      {journalMode === 'prompt' && (

        <div className="journalSection">

          <h2>
            Journal Prompt
          </h2>

          <div className="journalPrompt">
            {currentPrompt}
          </div>

          <textarea
            className="journalTextArea"
            value={journalText}
            onChange={(event) =>
              setJournalText(event.target.value)
            }
            placeholder="Write your response..."
          />

          <div className="journalActionButtons">

            <button onClick={saveEntry}>
              Save Entry
            </button>

            <button onClick={cancelJournal}>
              Cancel
            </button>

          </div>

        </div>

      )}



      {journalMode === 'previous' && (

        <div className="journalSection previousEntriesSection">

          <h2>
            Previous Entries
          </h2>

          {entries.length === 0 ? (

            <p>
              You don't have any saved entries yet.
            </p>

          ) : (

            [...entries].reverse().map((entry) => (

              <div
                className="previousEntry"
                key={entry.id}
              >

                <div className="previousEntryDate">

                  <div>
                    {new Date(entry.date).toLocaleDateString([], {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>

                  <div className="previousEntryTime">
                    {new Date(entry.date).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>

                </div>

                {entry.prompt && (
                  <div className="previousEntryPrompt">
                    Prompt: {entry.prompt}
                  </div>
                )}

                <div className="previousEntryText">
                  {entry.text}
                </div>

                <div className="previousEntryButtons">

                  <button
                    onClick={() =>
                      startEditingEntry(entry)
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteEntry(entry.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))

          )}

          <button
            onClick={() => setJournalMode(null)}
          >
            Close Journal
          </button>

        </div>

      )}

    

      {journalMode === 'edit' && (

        <div className="journalSection">

          <h2>
            Edit Entry
          </h2>

          <textarea
            className="journalTextArea"
            value={journalText}
            onChange={(event) =>
              setJournalText(event.target.value)
            }
          />

          <div className="journalActionButtons">

            <button onClick={saveEditedEntry}>
              Save Changes
            </button>

            <button
              onClick={() => {
                setJournalText('');
                setEditingEntryId(null);
                setJournalMode('previous');
              }}
            >
              Cancel
            </button>

          </div>

        </div>

      )}

      <NavBar />

    </div>
  );
}

export default Journal;
