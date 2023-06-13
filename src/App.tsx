import {
  ChangeEvent,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import clsx from "clsx";
// import reactLogo from './assets/react.svg'

import kick from "./assets/kick.mp3";
import snare from "./assets/snare.mp3";
import clap from "./assets/clap.mp3";
import hiHat from "./assets/hi-hat.mp3";

import { flushSync } from "react-dom";
import { useLocalStorage } from "./hooks";
// 1f5jqvtm
const letters = [
  "12345678",
  "asdfghjk",
  "qwertyui",
  "zxcvbnm,",
  '!"#¤%&/(',
  "ASDFGHJK",
  "QWERTYUI",
  "ZXCVBNM;",
].join("");
const boardElements = letters.split("");
const boardWidth = 16;

export default function App() {
  const [savedBeats, setSavedBeats] = useLocalStorage<
    {
      name: string;
      pattern: Record<number, boolean>;
    }[]
  >("beats", []);
  const [bpm, setBpm] = useState(() => {
    const bpm = new URL(window.location.toString()).searchParams.get("bpm");
    return bpm ? Number(bpm) : 200;
  });
  const deferredBpm = useDeferredValue(bpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCol, setCurrentCol] = useState(0);
  const [board, setBoard] = useState<Record<number, boolean>>(() => {
    const pattern = new URL(window.location.toString()).searchParams.get(
      "pattern"
    );
    return pattern ? initBoardFromParams(pattern) : {};
  });

  const sounds = useMemo(() => {
    const sounds = [
      {
        name: "Kick",
        audio: new Audio(kick),
        credit: "https://cymatics.fm/blogs/production/free-drum-kits",
        offset: 0,
      },
      {
        name: "Snare",
        audio: new Audio(snare),
        credit: "https://cymatics.fm/blogs/production/free-drum-kits",
        offset: 0,
      },
      {
        name: "Hi Hat",
        audio: new Audio(hiHat),
        credit: "https://samplefocus.com/tag/hip-hop",
        offset: 0.08,
      },
      {
        name: "Clap",
        audio: new Audio(clap),
        credit: "https://samplefocus.com/tag/hip-hop",
        offset: 0,
      },
    ];

    sounds.forEach((sound) => {
      sound.audio.preload = "auto";
    });
    return sounds;
  }, []);

  const boardHeight = useMemo(() => sounds.length, [sounds]);

  const [volumes, setVolumes] = useState(() => {
    const volumes = new URL(window.location.toString()).searchParams.get(
      "volumes"
    );
    if (volumes) {
      return volumes.split(",").map((volume) => Number(volume));
    }
    return sounds.map(() => 0.5);
  });

  useEffect(() => {
    function keyUpListener(e: KeyboardEvent) {
      if (e.key === " ") {
        flushSync(() => {
          setCurrentCol(0);
          setIsPlaying((prev) => !prev);
        });
        return;
      }

      const idx = letters.indexOf(e.key);
      if (idx === -1) return;
      const value = board[idx];
      setBoard((prev) => ({
        ...prev,
        [idx]: !prev[idx],
      }));
      if (value) return;
    }
    window.addEventListener("keyup", keyUpListener);
    return () => {
      window.removeEventListener("keyup", keyUpListener);
    };
  });

  useEffect(() => {
    if (!isPlaying) return;
    let canceled = false;
    const interval = setInterval(() => {
      if (canceled) return;
      let col = 0;
      flushSync(() => {
        setCurrentCol((prev) => {
          col = prev;
          return (prev + 1) % boardWidth;
        });
      });

      sounds.forEach((sound, idx) => {
        sound.audio.pause();
        sound.audio.currentTime = sound.offset;
      });
      for (let i = col; i < boardWidth * boardHeight; i = i + boardWidth) {
        const soundIndex = i;
        // For each sound, check if it's on in the current column
        const value = board[soundIndex];
        if (value) {
          sounds[Math.floor(i / boardWidth)].audio.play();
        }
      }
    }, (60 / (bpm * 2)) * 1000);
    return () => {
      canceled = true;
      clearInterval(interval);
    };
  }, [isPlaying, board, bpm]);

  useEffect(() => {
    const url = new URL(window.location.toString());
    url.searchParams.set(
      "pattern",
      boardElements.map((key, idx) => (board[idx] ? key : "")).join("")
    );
    window.history.replaceState({}, "", url.toString());
  }, [board]);

  useEffect(() => {
    sounds.forEach((sound, idx) => {
      sound.audio.volume = volumes[idx];
    });
  }, [volumes]);

  useEffect(() => {
    const url = new URL(window.location.toString());
    url.searchParams.set(
      "volumes",
      volumes.map((volume) => String(volume)).join(",")
    );
    window.history.replaceState({}, "", url.toString());
  }, [volumes]);

  useEffect(() => {
    const url = new URL(window.location.toString());
    url.searchParams.set("bpm", String(deferredBpm));
    window.history.replaceState({}, "", url.toString());
  }, [deferredBpm]);
  return (
    <div className=" h-screen w-screen bg-gradient-to-l from-emerald-500 to-emerald-700 ">
      <div className="flex gap-2 p-2">
        <button
          className="rounded bg-emerald-900 p-2"
          onClick={() => setIsPlaying((prev) => !prev)}
        >
          ⏯️
        </button>
        <input
          className="p-2"
          type="number"
          value={bpm}
          min={1}
          max={300}
          onChange={(e) => {
            e.stopPropagation();
            setBpm(Number(e.target.value));
          }}
        />
        <button
          className="rounded bg-emerald-900 p-2 text-white"
          onClick={() => {
            const name = prompt(
              "Name of beat?",
              `Untitled ${savedBeats.length + 1}`
            );
            if (!name) return;
            setSavedBeats((prev) => [...prev, { name, pattern: board }]);
            setBoard({});
          }}
        >
          Save beat
        </button>
        <button
          className="rounded bg-emerald-900 p-2 text-white"
          onClick={() => {
            setBoard({});
          }}
        >
          Reset
        </button>
      </div>
      <div className="grid grid-cols-[auto,1fr]">
        <div className="grid-ros-4 grid place-items-stretch gap-2 p-2">
          {sounds.map((sound, idx) => (
            <div key={idx} className="grid gap-2">
              <div className="grid grid-cols-[1fr,auto,auto,auto,auto] items-center gap-2">
                <button
                  onClick={() => {
                    sound.audio.currentTime = 0;
                    sound.audio.play();
                  }}
                  className="rounded bg-emerald-900 p-2"
                  title={`Credit: ${sound.credit}`}
                >
                  🔊 {sound.name}
                </button>
                <div className="w-8" title="Volume">
                  {volumes[idx]}
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volumes[idx]}
                  onInput={(e: ChangeEvent<HTMLInputElement>) => {
                    setVolumes((prev) => {
                      const next = [...prev];
                      next[idx] = Number(e.target.value);
                      return next;
                    });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div
          className="grid gap-2 p-2"
          style={{
            aspectRatio: `${boardWidth}/${boardHeight}`,
            gridTemplateColumns: `repeat(${boardWidth}, 1fr)`,
            gridTemplateRows: `repeat(${boardHeight}, 1fr)`,
          }}
        >
          {boardElements.map((key, idx) => (
            <button
              key={key}
              className={clsx(
                "grid place-items-center rounded border border-slate-800 bg-emerald-500 font-bold text-black/70 transition-colors active:opacity-80",
                {
                  "bg-red-500":
                    board[idx] ||
                    (isPlaying && idx % boardWidth === currentCol),
                }
              )}
              onClick={() => {
                setBoard((prev) => ({
                  ...prev,
                  [idx]: !prev[idx],
                }));
              }}
            >
              {key}
            </button>
          ))}
        </div>
        <div>
          <h2>Saved beats</h2>
          <ul>
            {savedBeats.map((beat, idx) => (
              <li key={idx}>
                <button
                  onClick={() => {
                    setBoard(beat.pattern);
                  }}
                >
                  Load {beat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
function initBoardFromParams(pattern: string): Record<number, boolean> {
  const board: Record<number, boolean> = {};
  letters.split("").forEach((letter, idx) => {
    board[idx] = pattern.includes(letter);
  });
  return board;
}
