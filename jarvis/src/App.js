import { useState, useRef } from "react";

function App() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("Idle 💤");

  const isProcessingRef = useRef(false);

  // 🔊 Speak function
  const speak = (text) => {
    setStatus("Speaking 🔊");
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/https?:\/\/\S+/g, "");

    const utter = new SpeechSynthesisUtterance(cleanText);

    utter.onend = () => setStatus("Idle 💤");

    window.speechSynthesis.speak(utter);
  };

  // 🤖 AI call (IMPORTANT: backend URL fixed)
  const askAI = async (msg) => {
    if (!msg || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setStatus("Thinking 🤔");

    try {
      const res = await fetch(
        "https://jarvis-ai-3-glbp.onrender.com/ask",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: msg }),
        }
      );

      const data = await res.json();

      const answer = (data.answer || "No response").replace(
        /https?:\/\/\S+/g,
        ""
      );

      setResponse(answer);
      speak(answer);
    } catch (err) {
      console.log(err);
      setResponse("Error connecting to AI");
      speak("AI error occurred");
    }

    setTimeout(() => {
      isProcessingRef.current = false;
    }, 800);
  };

  // 🎤 Voice recognition
  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onstart = () => setStatus("Listening 🎤");

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      setInput(text);
      handleCommand(text);
    };

    recognition.onerror = () => setStatus("Mic Error ❌");

    recognition.start();
  };

  // 🧠 Commands
  const handleCommand = (text) => {
    window.speechSynthesis.cancel();

    if (text.includes("open google")) {
      setStatus("Opening Google 🌐");
      speak("Opening Google");
      window.location.href = "https://www.google.com";
      return;
    }

    if (text.includes("open youtube")) {
      setStatus("Opening YouTube 🎬");
      speak("Opening YouTube");
      window.location.href = "https://www.youtube.com";
      return;
    }

    if (text.includes("search")) {
      const q = text.replace("search", "").trim();
      setStatus("Searching 🔍");
      speak("Searching " + q);
      window.location.href =
        "https://www.google.com/search?q=" + q;
      return;
    }

    if (text.includes("play")) {
      const q = text.replace("play", "").trim();
      setStatus("Playing 🎵");
      speak("Playing " + q);
      window.location.href =
        "https://www.youtube.com/results?search_query=" + q;
      return;
    }

    if (text.includes("time")) {
      const time = new Date().toLocaleTimeString();
      const reply = "The current time is " + time;

      setStatus("Speaking 🕒");
      setResponse(reply);
      speak(reply);
      return;
    }

    askAI(text);
  };

  const isListening = status.includes("Listening");
  const isSpeaking = status.includes("Speaking");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-blue-950 text-white p-3 sm:p-6">

      <div
        className={`w-full max-w-2xl p-4 sm:p-6 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 
        ${isSpeaking ? "shadow-blue-500/40 scale-[1.01]" : ""}
        ${isListening ? "ring-2 ring-green-400/60" : ""}
        bg-white/10`}
      >

        {/* TITLE */}
        <h1 className="text-xl sm:text-3xl font-bold text-center mb-2">
          🤖 Jarvis AI
        </h1>

        <p className="text-center text-gray-300 text-sm sm:text-base mb-4">
          Smart Voice Assistant
        </p>

        {/* STATUS */}
        <div className="text-center mb-4">
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs sm:text-sm">
            {status}
          </span>
        </div>

        {/* INPUT */}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-xl bg-black/40 border border-white/20 outline-none focus:border-blue-400"
        />

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">

          <button
            onClick={() => askAI(input)}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 p-2 sm:p-3 rounded-xl font-semibold"
          >
            🤖 Ask AI
          </button>

          <button
            onClick={startVoice}
            className={`w-full p-2 sm:p-3 rounded-xl font-semibold transition-all
            ${isListening ? "bg-green-500 animate-pulse" : "bg-green-600 hover:bg-green-700"}`}
          >
            🎤 Voice
          </button>

        </div>

        {/* RESPONSE */}
        <div className="mt-6 bg-black/30 border border-white/10 p-3 sm:p-4 rounded-xl min-h-[120px]">
          <h3 className="text-gray-300 mb-2">Reply:</h3>
          <p className="text-white break-words">
            {response || "Waiting for your command..."}
          </p>
        </div>

      </div>
    </div>
  );
}

export default App;