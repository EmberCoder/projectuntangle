import { useEffect, useState } from 'react';
import './breathingexercises.css';
import NavBar from './components/NavBar/NavBar';

const exercises = [
  {
    name: 'Box Breathing',
    description: 'A steady breathing pattern to help you feel calm.',
    phases: [
      { name: 'Breathe in', duration: 4, shape: 'inhale' },
      { name: 'Hold', duration: 4, shape: 'hold' },
      { name: 'Breathe out', duration: 4, shape: 'exhale' },
      { name: 'Hold', duration: 4, shape: 'rest' },
    ],
  },
  {
    name: 'Relaxing Breath',
    description: 'Breathe out a little longer than you breathe in.',
    phases: [
      { name: 'Breathe in', duration: 4, shape: 'inhale' },
      { name: 'Hold', duration: 2, shape: 'hold' },
      { name: 'Breathe out', duration: 6, shape: 'exhale' },
    ],
  },
  {
    name: 'Gentle Breathing',
    description: 'Follow a slow, comfortable breathing rhythm.',
    phases: [
      { name: 'Breathe in', duration: 3, shape: 'inhale' },
      { name: 'Hold', duration: 2, shape: 'hold' },
      { name: 'Breathe out', duration: 4, shape: 'exhale' },
    ],
  },
];

function BreathingExercises() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(
    exercises[0].phases[0].duration
  );
  const [isRunning, setIsRunning] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);

  const exercise = exercises[exerciseIndex];
  const phase = exercise.phases[phaseIndex];

  useEffect(() => {
    if (!isRunning) return;

    const timer = setTimeout(() => {
      if (secondsLeft > 1) {
        setSecondsLeft((seconds) => seconds - 1);
      } else {
        const nextPhaseIndex =
          (phaseIndex + 1) % exercise.phases.length;

        if (nextPhaseIndex === 0) {
          setCompletedCycles((cycles) => cycles + 1);
        }

        setPhaseIndex(nextPhaseIndex);
        setSecondsLeft(exercise.phases[nextPhaseIndex].duration);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isRunning, secondsLeft, phaseIndex, exercise]);

  const startExercise = () => {
    setIsRunning(true);
  };

  const pauseExercise = () => {
    setIsRunning(false);
  };

  const resetExercise = () => {
    setIsRunning(false);
    setPhaseIndex(0);
    setSecondsLeft(exercise.phases[0].duration);
    setCompletedCycles(0);
  };

  const generateNewExercise = () => {
    const nextIndex = (exerciseIndex + 1) % exercises.length;

    setIsRunning(false);
    setExerciseIndex(nextIndex);
    setPhaseIndex(0);
    setSecondsLeft(exercises[nextIndex].phases[0].duration);
    setCompletedCycles(0);
  };

  return (
    <div className="breathingPage">
      {/* HEADER */}
      <div className="breathingHeader">
        <h1 className="breathingTitle">Breathing Exercises</h1>

        <div className="breathingHeaderButtons">
          <button
            className="breathingHeaderButton"
            aria-label="Settings"
            onClick={() => alert('Settings coming soon!')}
          >
            ⚙
          </button>

          <button
            className="breathingHeaderButton profileButton"
            aria-label="Profile"
            onClick={() => alert('Profile coming soon!')}
          >
            ♙
          </button>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <main className="breathingContent">
        <h2 className="breathingQuestion">
          Would you like to try?
        </h2>

        {/* EXERCISE CARD */}
        <section className="breathingCard">
          <h3 className="breathingExerciseName">
            {exercise.name}
          </h3>

          <p className="breathingDescription">
            {exercise.description}
          </p>

          {/* ANIMATED BREATHING GUIDE */}
          <div
            className={`breathingVisual ${
              isRunning ? phase.shape : 'idle'
            }`}
            aria-label={
              isRunning
                ? `${phase.name}, ${secondsLeft} seconds remaining`
                : 'Breathing animation paused'
            }
          >
            <div className="breathingShape">
              <span className="breathingCountdown">
                {isRunning ? secondsLeft : '♡'}
              </span>
            </div>
          </div>

          <div className="breathingInstructions" aria-live="polite">
            {isRunning ? (
              <>
                <span className="breathingPhase">{phase.name}</span>
                <span className="breathingSeconds">
                  {secondsLeft} seconds
                </span>
              </>
            ) : (
              <span>
                {completedCycles > 0
                  ? `${completedCycles} ${
                      completedCycles === 1 ? 'cycle' : 'cycles'
                    } completed`
                  : 'Press Start when you are ready'}
              </span>
            )}
          </div>

          {/* CONTROLS */}
          <div className="breathingControls">
            {!isRunning ? (
              <button
                className="breathingMainButton"
                onClick={startExercise}
              >
                {completedCycles > 0 || phaseIndex > 0
                  ? 'Resume'
                  : 'Start'}
              </button>
            ) : (
              <button
                className="breathingMainButton"
                onClick={pauseExercise}
              >
                Pause
              </button>
            )}

            <button
              className="breathingSecondaryButton"
              onClick={resetExercise}
            >
              Reset
            </button>
          </div>
        </section>

        {/* NEW EXERCISE BUTTON */}
        <button
          className="breathingGenerateButton"
          onClick={generateNewExercise}
        >
          Generate a new one
        </button>

        <p className="breathingHint">
          Go at your own pace. You can pause whenever you need to.
        </p>
      </main>

      <NavBar />
    </div>
  );
}

export default BreathingExercises;