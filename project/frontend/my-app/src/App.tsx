import { useState, useRef } from 'react'
import { v4 as uuid } from "uuid";

// text for typing
const raceText = "The quick brown fox jumps over the lazy dog."

function App() {

  // unique id for this browser tab (used to identify player on backend)
  const myIdRef = useRef(uuid())
  const myId = myIdRef.current

  // text the user typed
  const [typed , setTyped] = useState("");

  // reference to active websocket
  const [wsRef , setWsRef] = useState<WebSocket | null>(null);

  // all players map: {id: {name, progress}}
  const [players , setPlayers] = useState<Record<string,{name:string,progress:number}>>({});

  // name input for user
  const [name , setName] = useState("");

  // is this tab connected to websocket?
  const [connected , setConnected] = useState(false);

  // ordered list of finished players
  const [finishedList , setFinishedList] = useState<string[]>([]);

  // should we show results screen?
  const [resultsMode , setResultsMode] = useState(false);

  // did THIS client already finish? (to not send finished twice)
  const [iFinished , setIFinished] = useState(false);


  // connect to websocket + send initial name+id
  function connectWS() {
    const ws = new WebSocket("ws://127.0.0.1:8080/ws");
    setWsRef(ws);

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ id: myId, name })); // tell backend who we are
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (!data.id) return; // ignore invalid packets

      // update specific player in players map
      setPlayers(prev => ({
        ...prev,
        [data.id]: {
          name: data.name ?? prev[data.id]?.name ?? "Unknown",
          progress: data.progress ?? prev[data.id]?.progress ?? 0
        }
      }));

      // someone finished -> switch to results
      if (data.finished) {
        setFinishedList(prev => [...prev , (data.name ?? "Unknown")]);
        setResultsMode(true);
      }
    };
  }

  // on every keypress -> update progress + maybe send finished
  function calculate_length_race_message(v: string) {
    setTyped(v);

    // calculate percent
    const progress = Math.min(100, Math.max(0, Math.floor((v.length / raceText.length) * 100)));

    if (!wsRef || wsRef.readyState !== WebSocket.OPEN) return;

    // send progress to server
    wsRef.send(JSON.stringify({ id: myId, progress }));

    // if we hit 100% -> send finished flag once
    if (progress === 100 && !iFinished) {
      wsRef.send(JSON.stringify({ id: myId, finished:true, name }));
      setIFinished(true);
    }
  }

  // restart client state + close WS
  function resetGame() {
    setTyped("");
    setPlayers({});
    setName("");
    setConnected(false);
    setFinishedList([]);
    setResultsMode(false);
    setIFinished(false);
    if (wsRef) wsRef.close();
    setWsRef(null);
  }

  // HOME SCREEN (enter name)
  if (!connected) {
    return (
      <div style={styles.wrapper}>
        <h1 style={styles.title}>Type Racer</h1>

        <div style={styles.card}>
          <input
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
          />

          <button onClick={connectWS} style={styles.button}>
            JOIN
          </button>
        </div>

        <style>{css}</style>
      </div>
    );
  }

  // RESULTS SCREEN (after game ends)
  if (resultsMode) {

  function rankEmoji(i:number) {
    if (i === 0) return "👑";   // gold
    if (i === 1) return "🥈";   // silver
    if (i === 2) return "🥉";   // bronze
    return "🏁";                // default
  }

  return (
    <div style={styles.wrapper}>
      
      <div style={styles.gameBox}>

        <h1 style={styles.title}>RESULTS</h1>

        <div style={{marginTop:30, marginBottom:40}}>
          {finishedList.map((nm,i)=>(
            <div 
              key={i} 
              style={{
                fontSize:"24px",
                marginBottom:"14px",
                opacity:0.95,
                textAlign:"center",
                display:"flex",
                justifyContent:"center",
                gap:"12px",
                alignItems:"center",
                textShadow:"0 0 12px rgba(255,255,255,0.4)"
              }}
            >
              <div style={{minWidth:50, textAlign:"right"}}>
                {i+1})
              </div>
              <div style={{fontWeight:700}}>
                {nm}
              </div>
              <div style={{fontSize:"28px"}}>
                {rankEmoji(i)}
              </div>
            </div>
          ))}
        </div>

        <button onClick={resetGame} style={styles.button}>NEW RACE</button>

      </div>

      <style>{css}</style>
    </div>
  );
}

  // GAME SCREEN (typing)
  return (
    <div style={styles.wrapper}>
        
      <div style={styles.gameBox}>
        <h1 style={styles.title}>Type Racer</h1>

        <p style={styles.raceText}>{raceText}</p>

        <input
          style={styles.gameInput}
          value={typed}
          onChange={(e) => calculate_length_race_message(e.target.value)}
          placeholder="start typing..."
        />

        <div style={{marginTop:"40px"}}>
          {Object.entries(players).map(([id,p])=>(
            <div key={id} style={styles.playerRow}>
              <span style={styles.playerName}>{p.name}: {p.progress}%</span>
              <div style={styles.progressBg}>
                <div style={{...styles.progressFill,width:`${p.progress}%`}} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
}

// styling object
const styles = {
  wrapper:{
    width:"100vw",
    height:"100vh",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    color:"white",
  },
  title:{
    fontSize:"48px",
    fontWeight:"900",
    marginBottom:"30px",
    textShadow:"0 0 12px rgba(0,200,255,0.4)"
  },
  card:{
    display:"flex",
    gap:"20px",
    padding:"28px 38px",
    background:"rgba(255,255,255,0.05)",
    borderRadius:"16px",
    backdropFilter:"blur(9px)",
    boxShadow:"0 0 25px rgba(0,150,255,0.3)"
  },
  input:{
    padding:"14px 20px",
    fontSize:"18px",
    border:"2px solid rgba(0,200,255,0.7)",
    borderRadius:"12px",
    background:"rgba(255,255,255,0.08)",
    color:"white",
    width:"200px",
    outline:"none"
  },
  button:{
    padding:"14px 24px",
    fontSize:"18px",
    borderRadius:"12px",
    border:"none",
    background:"#00b7ff",
    color:"white",
    cursor:"pointer",
    fontWeight:"700",
    transition:"0.2s"
  },
  gameBox:{
    padding:"50px 70px",
    backdropFilter:"blur(15px)",
    background:"rgba(255,255,255,0.06)",
    borderRadius:"20px",
    boxShadow:"0 0 30px rgba(0,150,255,0.25)"
  },
  raceText:{
    marginBottom:"20px",
    fontSize:"18px",
    opacity:0.9
  },
  gameInput:{
    width:"600px",
    padding:"14px 20px",
    fontSize:"20px",
    border:"2px solid rgba(0,200,255,0.7)",
    borderRadius:"12px",
    background:"rgba(255,255,255,0.08)",
    color:"white",
    outline:"none"
  },
  playerRow:{ marginBottom:"16px" },
  playerName:{ fontSize:"16px" },
  progressBg:{
    width:"600px",
    height:"10px",
    background:"rgba(255,255,255,0.15)",
    borderRadius:"10px",
    marginTop:"6px"
  },
  progressFill:{
    height:"100%",
    borderRadius:"10px",
    background:"#00b7ff",
    transition:"width 0.2s"
  }
}

// global css
const css = `
body {
  margin:0;
  padding:0;
  background:#0a0c12;
  color:white;
  font-family: sans-serif;
}

button:hover {
  transform: scale(1.05);
}
`

export default App
