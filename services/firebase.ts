import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  runTransaction, 
  collection, 
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { GameState } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyD8Ve_52OAvG5M_oFcmx8KSwrGzAVi7DK8",
  authDomain: "studio-3685830526-b7f03.firebaseapp.com",
  projectId: "studio-3685830526-b7f03",
  storageBucket: "studio-3685830526-b7f03.firebasestorage.app",
  messagingSenderId: "229874315342",
  appId: "1:229874315342:web:ed0f1fdffe8faaf9c1d31f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to generate a 4-character room code
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
};

export const checkRoomExists = async (roomId: string) => {
    try {
        const roomRef = doc(db, 'rooms', roomId);
        const roomSnap = await getDoc(roomRef);
        return roomSnap.exists();
    } catch (e) {
        return false;
    }
};

export const createRoom = async () => {
    const roomId = generateRoomCode();
    const roomRef = doc(db, 'rooms', roomId);
    
    await setDoc(roomRef, {
        gameState: GameState.IDLE,
        createdAt: serverTimestamp(),
        winner: null,
        hostId: Math.random().toString(36) // Simple session ID for host ownership logic if needed later
    });

    return roomId;
};

export const joinRoom = async (roomId: string, playerName: string) => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
        throw new Error("Room not found");
    }

    // Create a player ID
    const playerId = Math.random().toString(36).substring(2, 10);
    const playerRef = doc(db, 'rooms', roomId, 'players', playerId);

    await setDoc(playerRef, {
        id: playerId,
        name: playerName,
        connectedAt: serverTimestamp(),
        rtt: 0 // Initial placeholder
    });

    return playerId;
};

// New function to update RTT specifically
export const updatePlayerRtt = async (roomId: string, playerId: string, rtt: number) => {
    const playerRef = doc(db, 'rooms', roomId, 'players', playerId);
    await updateDoc(playerRef, { rtt });
};

// Lightweight ping: just read the room doc to measure read latency
export const measurePing = async (roomId: string) => {
    const start = performance.now();
    const roomRef = doc(db, 'rooms', roomId);
    await getDoc(roomRef); // Simple read
    const end = performance.now();
    return Math.round(end - start);
};

export const subscribeToRoom = (roomId: string, onUpdate: (data: any) => void) => {
    const roomRef = doc(db, 'rooms', roomId);
    return onSnapshot(roomRef, (doc) => {
        if (doc.exists()) {
            onUpdate(doc.data());
        } else {
            onUpdate(null);
        }
    });
};

export const subscribeToPlayers = (roomId: string, onUpdate: (players: any[]) => void) => {
    const playersRef = collection(db, 'rooms', roomId, 'players');
    // We could order by connectedAt
    const q = query(playersRef); 
    
    return onSnapshot(q, (snapshot) => {
        const players = snapshot.docs.map(doc => doc.data());
        onUpdate(players);
    });
};

export const updateGameState = async (roomId: string, newState: GameState) => {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
        gameState: newState,
        // If resetting to OPEN or IDLE, clear winner
        ...(newState !== GameState.BUZZED ? { winner: null } : {})
    });
};

export const handleBuzz = async (roomId: string, player: { id: string, name: string }) => {
    const roomRef = doc(db, 'rooms', roomId);

    try {
        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(roomRef);
            if (!sfDoc.exists()) throw "Room does not exist!";

            const data = sfDoc.data();

            // CRITICAL: Only allow buzz if state is OPEN and there is no winner yet
            if (data.gameState === GameState.OPEN && !data.winner) {
                transaction.update(roomRef, {
                    gameState: GameState.BUZZED,
                    winner: {
                        id: player.id,
                        name: player.name,
                        time: serverTimestamp() // Uses Google Cloud server time for fairness
                    }
                });
            } else {
                throw "Too late or game not open";
            }
        });
        return true; // You won!
    } catch (e) {
        // Transaction failed or condition not met (someone else buzzed first)
        return false;
    }
};

export const removePlayer = async (roomId: string, playerId: string) => {
    await deleteDoc(doc(db, 'rooms', roomId, 'players', playerId));
};