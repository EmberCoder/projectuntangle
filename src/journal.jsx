import { onAuthStateChanged } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import BackButton from './components/Login/BackButton';
import NavBar from './components/NavBar/NavBar';
import ProfileButton from './components/ProfileButton.jsx';
import { auth, db } from './firebase';
import './journal.css';

function Journal() {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(auth.currentUser));
  const [journalMode, setJournalMode] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [entries, setEntries] = useState([]);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [user, setUser] = useState(null);

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
    let unsubscribeEntries = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(Boolean(currentUser));

      if (unsubscribeEntries) {
        unsubscribeEntries();
        unsubscribeEntries = null;
      }

      if (!currentUser) {
        setEntries([]);
        return;
      }

      const q = query(
        collection(db, 'users', currentUser.uid, 'journalEntries'),
        orderBy('createdAt', 'desc')
      );

      unsubscribeEntries = onSnapshot(q, (snapshot) => {
        const userEntries = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));

        setEntries(userEntries);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeEntries) {
        unsubscribeEntries();
      }
    };
  }, []);

  const openPromptJournal = () => {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setCurrentPrompt(prompts[randomIndex]);
    setJournalText('');
    setJournalMode('prompt');
  };

  const saveEntry = async () => {
    if (journalText.trim() === '') {
      return;
    }

    if (!user) {
      alert('Please sign in to save your journal entry.');
      return;
    }

    await addDoc(collection(db, 'users', user.uid, 'journalEntries'), {
      text: journalText,
      prompt: journalMode === 'prompt' ? currentPrompt : null,
      createdAt: serverTimestamp(),
    });

    setJournalText('');
    setCurrentPrompt('');
    setJournalMode(null);
  };

  const startEditingEntry = (entry) => {
    setEditingEntryId(entry.id);
    setJournalText(entry.text);
    setJournalMode('edit');
  };

  const saveEditedEntry = async () => {
    if (journalText.trim() === '') {
      return;
    }

    if (!user) {
      alert('Please sign in to edit your journal entry.');
      return;
    }

    await updateDoc(doc(db, 'users', user.uid, 'journalEntries', editingEntryId), {
      text: journalText,
      updatedAt: serverTimestamp(),
    });

    setJournalText('');
    setEditingEntryId(null);
    setJournalMode('previous');
  };

  const deleteEntry = async (entryId) => {
    const confirmed = window.confirm('Are you sure you want to delete this journal entry?');

    if (!confirmed) {
      return;
    }

    if (!user) {
      alert('Please sign in to delete your journal entry.');
      return;
    }

    await deleteDoc(doc(db, 'users', user.uid, 'journalEntries', entryId));
  };

  const cancelJournal = () => {
    setJournalText('');
    setEditingEntryId(null);
    setCurrentPrompt('');
    setJournalMode(null);
  };

  const getEntryDate = (entry) => {
    if (entry.createdAt && typeof entry.createdAt.toDate === 'function') {
      return entry.createdAt.toDate();
    }

    if (entry.date) {
      return new Date(entry.date);
    }

    return new Date();
  };

  return (
    <div className="journalPage">
      {isLoggedIn ? <ProfileButton /> : <BackButton />}

      <h1 className="journalTitle" style={{ margin: 0, lineHeight: 1, textAlign: 'center', marginTop: '6rem', marginBottom: '1rem' }}>
        Journal
      </h1>

      {!user && (
        <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
          Please sign in to save and view journal entries.
        </p>
      )}

      {journalMode === null && (
        <div className="journalHome">
          <div className="journalBook">
            <div className="journalBookTitle">Your Journal</div>

            <button
              className="journalOptionButton"
              onClick={() => {
                setJournalText('');
                setJournalMode('free');
              }}
              disabled={!user}
            >
              Free Journal
            </button>

            <button
              className="journalOptionButton"
              onClick={openPromptJournal}
              disabled={!user}
            >
              Prompts
            </button>
          </div>

          <button
            className="previousEntriesButton"
            onClick={() => setJournalMode('previous')}
            disabled={!user}
          >
            View Previous Entries
          </button>
        </div>
      )}

      {journalMode === 'free' && (
        <div className="journalSection">
          <h2>Free Journal</h2>

          <p>Write whatever is on your mind.</p>

          <textarea
            className="journalTextArea"
            value={journalText}
            onChange={(event) => setJournalText(event.target.value)}
            placeholder="Start writing..."
          />

          <div className="journalActionButtons">
            <button onClick={saveEntry}>Save Entry</button>
            <button onClick={cancelJournal}>Cancel</button>
          </div>
        </div>
      )}

      {journalMode === 'prompt' && (
        <div className="journalSection">
          <h2>Journal Prompt</h2>

          <div className="journalPrompt">{currentPrompt}</div>

          <textarea
            className="journalTextArea"
            value={journalText}
            onChange={(event) => setJournalText(event.target.value)}
            placeholder="Write your response..."
          />

          <div className="journalActionButtons">
            <button onClick={saveEntry}>Save Entry</button>
            <button onClick={cancelJournal}>Cancel</button>
          </div>
        </div>
      )}

      {journalMode === 'previous' && (
        <div className="journalSection previousEntriesSection">
          <h2>Previous Entries</h2>

          {entries.length === 0 ? (
            <p>You don't have any saved entries yet.</p>
          ) : (
            [...entries].reverse().map((entry) => {
              const dateValue = getEntryDate(entry);

              return (
                <div className="previousEntry" key={entry.id}>
                  <div className="previousEntryDate">
                    <div>
                      {dateValue.toLocaleDateString([], {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>

                    <div className="previousEntryTime">
                      {dateValue.toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {entry.prompt && (
                    <div className="previousEntryPrompt">Prompt: {entry.prompt}</div>
                  )}

                  <div className="previousEntryText">{entry.text}</div>

                  <div className="previousEntryButtons">
                    <button onClick={() => startEditingEntry(entry)}>Edit</button>
                    <button onClick={() => deleteEntry(entry.id)}>Delete</button>
                  </div>
                </div>
              );
            })
          )}

          <button onClick={() => setJournalMode(null)}>Close Journal</button>
        </div>
      )}

      {journalMode === 'edit' && (
        <div className="journalSection">
          <h2>Edit Entry</h2>

          <textarea
            className="journalTextArea"
            value={journalText}
            onChange={(event) => setJournalText(event.target.value)}
          />

          <div className="journalActionButtons">
            <button onClick={saveEditedEntry}>Save Changes</button>
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
