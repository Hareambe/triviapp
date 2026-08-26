import http from 'http';

const videoTriviaBoard = {
  title: "Pop Culture & Music Clips (Video Board)",
  description: "A multimedia Jeopardy board featuring YouTube music, movie trailers, and iconic sound clips with timestamp support!",
  gridWidth: 4,
  gridHeight: 4,
  dataJson: JSON.stringify({
    categories: [
      {
        name: "Iconic Music Videos",
        questions: [
          {
            value: 200,
            prompt: "What 1982 music video by Michael Jackson famously features dancing zombies in a graveyard?",
            answer: "Thriller",
            mediaUrl: "https://www.youtube.com/watch?v=sOnqjkJTMaA",
            isDailyDouble: false
          },
          {
            value: 400,
            prompt: "Identify the iconic 1985 synth-pop hit from this music video by Norwegian band A-ha:",
            answer: "Take On Me",
            mediaUrl: "https://www.youtube.com/watch?v=djV11X492xU",
            isDailyDouble: false
          },
          {
            value: 600,
            prompt: "Which British singer hit #1 globally with this 1987 dance-pop hit?",
            answer: "Rick Astley (Never Gonna Give You Up)",
            mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            isDailyDouble: true
          },
          {
            value: 800,
            prompt: "What 1991 grunge anthem by Nirvana featured cheerleaders with anarchy symbols in a gymnasium?",
            answer: "Smells Like Teen Spirit",
            mediaUrl: "https://www.youtube.com/watch?v=hTWKbfoikeg",
            isDailyDouble: false
          }
        ]
      },
      {
        name: "Movie Soundtracks",
        questions: [
          {
            value: 200,
            prompt: "Which legendary film composer wrote this epic Imperial March theme from Star Wars?",
            answer: "John Williams",
            mediaUrl: "https://www.youtube.com/watch?v=-bzWSJG93P8",
            isDailyDouble: false
          },
          {
            value: 400,
            prompt: "Which 1994 Disney animated film features this opening chant composed by Lebo M and Hans Zimmer?",
            answer: "The Lion King (Circle of Life)",
            mediaUrl: "https://www.youtube.com/watch?v=GibiNy4d4gc",
            isDailyDouble: false
          },
          {
            value: 600,
            prompt: "What classic 1985 sci-fi film starring Michael J. Fox features this triumphant brass overture?",
            answer: "Back to the Future (Alan Silvestri)",
            mediaUrl: "https://www.youtube.com/watch?v=e8TZbze72Bc",
            isDailyDouble: false
          },
          {
            value: 800,
            prompt: "Identify the 2014 space-travel movie that features this organ soundtrack 'No Time for Caution' by Hans Zimmer:",
            answer: "Interstellar",
            mediaUrl: "https://www.youtube.com/watch?v=m3zvVGJrJA8",
            isDailyDouble: false
          }
        ]
      },
      {
        name: "Gaming Soundtracks",
        questions: [
          {
            value: 200,
            prompt: "Which beloved 1985 Nintendo franchise features this overworld theme composed by Koji Kondo?",
            answer: "Super Mario Bros.",
            mediaUrl: "https://www.youtube.com/watch?v=NTa6Xbzfq1U",
            isDailyDouble: false
          },
          {
            value: 400,
            prompt: "What classic puzzle game has this Russian folk tune 'Korobeiniki' as its iconic theme music?",
            answer: "Tetris",
            mediaUrl: "https://www.youtube.com/watch?v=W61hI02bFeg",
            isDailyDouble: false
          },
          {
            value: 600,
            prompt: "Which high-fantasy adventure game series features this 'Song of Storms' melody?",
            answer: "The Legend of Zelda: Ocarina of Time",
            mediaUrl: "https://www.youtube.com/watch?v=yp3UeCguVVI",
            isDailyDouble: true
          },
          {
            value: 800,
            prompt: "What 2015 indie RPG features this high-energy boss theme 'Megalovania' composed by Toby Fox?",
            answer: "Undertale",
            mediaUrl: "https://www.youtube.com/watch?v=wDgQdr8ZkTw",
            isDailyDouble: false
          }
        ]
      },
      {
        name: "Famous Movie Scenes",
        questions: [
          {
            value: 200,
            prompt: "What 1975 thriller directed by Steven Spielberg used this ominous two-note cello motif?",
            answer: "Jaws",
            mediaUrl: "https://www.youtube.com/watch?v=lV8i-pSVMaQ",
            isDailyDouble: false
          },
          {
            value: 400,
            prompt: "What 1999 sci-fi movie introduced 'bullet time' visual effects in this rooftop sequence?",
            answer: "The Matrix",
            mediaUrl: "https://www.youtube.com/watch?v=KNrSNcaYiZg",
            isDailyDouble: false
          },
          {
            value: 600,
            prompt: "In The Lord of the Rings: The Fellowship of the Ring, what iconic line does Gandalf shout on the bridge of Khazad-dûm?",
            answer: "You shall not pass!",
            mediaUrl: "https://www.youtube.com/watch?v=3xYXUeSmb-Y",
            isDailyDouble: false
          },
          {
            value: 800,
            prompt: "In 2001: A Space Odyssey, what is the name of the rogue computer that says 'I'm sorry Dave, I'm afraid I can't do that'?",
            answer: "HAL 9000",
            mediaUrl: "https://www.youtube.com/watch?v=ARJ8cAGm6JE",
            isDailyDouble: false
          }
        ]
      }
    ]
  })
};

const postBoard = (board) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(board);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5032,
        path: '/api/boards',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(body));
          } else {
            reject(new Error(`Failed to post board "${board.title}": ${res.statusCode} ${body}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

async function seed() {
  console.log("Seeding Video Trivia Board...");
  try {
    const result = await postBoard(videoTriviaBoard);
    console.log(`✓ Created Video Board: "${result.title}" (ID: ${result.id})`);
  } catch (err) {
    console.error("Error seeding video board:", err.message);
  }
}

seed();

